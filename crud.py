from sqlalchemy.orm import Session
import datetime
import models, schemas, security

# --- User CRUD ---

def get_user_by_username(db: Session, username: str):
    """
    Queries the database for a user with a specific username.
    """
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    """
    Creates a new user in the database.
    """
    # Hash the password before storing it.
    hashed_password = security.get_password_hash(user.password)
    
    # Create a new User model instance.
    db_user = models.User(username=user.username, hashed_password=hashed_password)
    
    # Add the new user to the session, commit it, and refresh to get the new ID.
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

def get_user_words(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """
    Retrieves all words for a specific user.
    """
    return db.query(models.Word).filter(models.Word.owner_id == user_id).offset(skip).limit(limit).all()

def create_user_word(db: Session, word: schemas.WordCreate, user_id: int):
    """
    Creates a new word in the database and links it to a user.
    """
    # Set the first review for one day from now
    next_review = datetime.date.today() + datetime.timedelta(days=1)
    
    db_word = models.Word(
        **word.dict(), 
        owner_id=user_id,
        next_review_due=next_review
    )
    db.add(db_word)
    db.commit()
    db.refresh(db_word)
    return db_word

def update_word_review_status(db: Session, word_id: int, user_id: int, new_date: datetime.date, new_difficulty: int):
    """Updates a word's next review date and difficulty in the database."""
    db_word = db.query(models.Word).filter(models.Word.id == word_id, models.Word.owner_id == user_id).first()
    if db_word:
        db_word.next_review_due = new_date
        db_word.difficulty = new_difficulty
        db.commit()
        db.refresh(db_word)
    return db_word