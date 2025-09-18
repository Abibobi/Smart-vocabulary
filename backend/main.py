from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError

import models, schemas, crud, security, session_manager, ai_service
from database import engine, SessionLocal
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # The origin of your React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# This tells FastAPI which URL will be used to get the token.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Dependency to get the current user from a JWT token.
    1. Decodes the token.
    2. Validates the username from the token's payload.
    3. Fetches the user from the database.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = security.jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = crud.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


@app.get("/")
def read_root():
    return {"message": "Welcome to the Smart Vocabulary Builder API!"}


@app.post("/token", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    # ... existing login code ...
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = security.create_access_token(
        data={"sub": user.username}
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/users/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # ... existing create_user code ...
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    return crud.create_user(db=db, user=user)

@app.get("/users/me/", response_model=schemas.User)
async def read_users_me(current_user: schemas.User = Depends(get_current_user)):
    """
    A protected endpoint that returns the data of the currently logged-in user.
    """
    return current_user

@app.post("/words/", response_model=schemas.Word, status_code=status.HTTP_201_CREATED)
def create_word_for_user(
    word_request: schemas.WordCreate, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Saves a new word to the user's vocabulary list after the user has 
    confirmed the definition on the frontend.
    """
    # The AI call is no longer here. We just save the confirmed data.
    return crud.create_user_word(db=db, word=word_request, user_id=current_user.id)


@app.get("/words/", response_model=list[schemas.Word])
def read_user_words(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Retrieves all vocabulary words for the currently logged-in user.
    """
    words = crud.get_user_words(db, user_id=current_user.id, skip=skip, limit=limit)
    return words

@app.get("/review/next/", response_model=schemas.Word)
def get_next_review_word(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    user_id = current_user.id
    
    if user_id not in session_manager.active_sessions:
        user_words = crud.get_user_words(db, user_id=user_id, limit=1000)
        session_manager.active_sessions[user_id] = session_manager.UserSession(words=user_words)

    session = session_manager.active_sessions[user_id]
    next_word = session.get_next_word()

    if next_word is None:
        # Clear the session when there are no more words for today
        del session_manager.active_sessions[user_id]
        raise HTTPException(status_code=404, detail="No more words due for review today.")
    
    return next_word

@app.post("/review/{word_id}", response_model=schemas.Word)
def submit_review_for_word(
    word_id: int,
    result: schemas.ReviewResult,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    user_id = current_user.id
    if user_id not in session_manager.active_sessions:
        raise HTTPException(status_code=400, detail="No active review session. Please get the next word first.")
        
    session = session_manager.active_sessions[user_id]
    word_to_update = session.word_db.get(word_id)

    if not word_to_update:
        raise HTTPException(status_code=404, detail="Word not found in current review session.")

    session.update_word_review(word_to_update, result.was_correct)
    
    updated_word_db = crud.update_word_review_status(
        db,
        word_id=word_id,
        user_id=user_id,
        new_date=word_to_update.next_review_due,
        new_difficulty=word_to_update.difficulty
    )
    
    return updated_word_db

# --- AI Endpoints ---
@app.post("/ai/generate-details/", response_model=schemas.AIWordDetailResponse)
def generate_ai_details(
    request: schemas.AIWordDetailRequest,
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Takes a word and returns an AI-generated definition and example sentence.
    """
    details = ai_service.get_ai_word_details(request.word_text)
    return details

@app.post("/ai/explain-word/", response_model=schemas.AIWordExplanation)
def explain_word_with_ai(
    request: schemas.AIWordDetailRequest,
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Takes a word and returns a comprehensive AI-generated explanation
    including a definition, example, and mnemonic. Does NOT save the word.
    """
    explanation = ai_service.get_ai_word_explanation(request.word_text)
    return explanation

# NEW ENDPOINT for regenerating explanations
@app.post("/ai/regenerate-explanation/", response_model=schemas.AIRegenerateResponse)
def regenerate_ai_explanation(request: schemas.AIRegenerateRequest, current_user: schemas.User = Depends(get_current_user)):
    alt_details = ai_service.get_alternative_explanation(
        word=request.word_text,
        previous_example=request.previous_example,
        previous_mnemonic=request.previous_mnemonic
    )
    return alt_details

@app.get("/ai/suggest-words/", response_model=schemas.AISuggestionResponse)
def suggest_words_with_ai(db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    user_words = crud.get_user_words(db, user_id=current_user.id, limit=10)
    existing_word_texts = [word.text for word in user_words]
    suggestions = ai_service.get_ai_word_suggestions(existing_words=existing_word_texts)
    return suggestions