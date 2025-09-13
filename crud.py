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

