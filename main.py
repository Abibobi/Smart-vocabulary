from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError

import models, schemas, crud, security
from database import engine, SessionLocal

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

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
    word: schemas.WordCreate, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Adds a new word to the vocabulary list of the currently logged-in user.
    """
    return crud.create_user_word(db=db, word=word, user_id=current_user.id)

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
