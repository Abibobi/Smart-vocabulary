import heapq
import datetime
from typing import Dict, List
import schemas

class UserSession:
    """
    Manages the in-memory data for a single user's review session.
    """
    def __init__(self, words: List[schemas.Word]):
        # The Hash Table for O(1) lookups
        self.word_db: Dict[int, schemas.Word] = {word.id: word for word in words}
        
        # The Priority Queue for SRS scheduling. We store tuples of (next_review_date, word_id).
        self.review_queue = []
        for word in words:
            if word.next_review_due <= datetime.date.today():
                heapq.heappush(self.review_queue, (word.next_review_due, word.id))

    def get_next_word(self) -> schemas.Word | None:
        """Pops the next due word from the queue."""
        if not self.review_queue:
            return None
        
        _ , word_id = heapq.heappop(self.review_queue)
        return self.word_db.get(word_id)

    def update_word_review(self, word: schemas.Word, was_correct: bool):
        """Calculates the next review date and pushes the word back into the queue."""
        # A simple SRS algorithm:
        # If correct, double the interval (up to a max). If wrong, reset it.
        if was_correct:
            # Difficulty acts as a multiplier. More difficult words get reviewed sooner.
            interval_days = (2 ** (8 - word.difficulty))
            if word.difficulty > 1:
                word.difficulty -= 1 # Word gets easier
        else:
            interval_days = 1 # Reset review to tomorrow
            if word.difficulty < 10:
                word.difficulty += 1 # Word gets harder

        word.next_review_due = datetime.date.today() + datetime.timedelta(days=interval_days)
        
        # We don't push it back into the queue for today's session
        # but the main word_db is updated for the next session.
        self.word_db[word.id] = word


# A simple in-memory dictionary to hold active sessions.
# Key: user_id, Value: UserSession object
active_sessions: Dict[int, UserSession] = {}
