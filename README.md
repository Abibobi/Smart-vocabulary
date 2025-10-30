# Smart Vocabulary Builder 🧠✨

A full-stack, AI-powered web application designed to make vocabulary learning more efficient, personalized, and interactive. This project leverages a FastAPI backend, a React frontend, and the Google Gemini API to create a smart learning tool that goes beyond simple flashcards.

### Live Demo 🚀

* **Frontend (Vercel):** `https://smart-vocab-api.onrender.com`
* **Backend API (Render):** `https://smart-vocabulary.vercel.app/`

---



### ## 🌟 Core Features

* **Secure User Authentication:** Full registration and login system using JWT (JSON Web Tokens) for secure, persistent user sessions.
* **AI-Powered "Add Word" Consultation:** Instead of just saving a word, the AI provides a rich, multi-part explanation, including:
    * A clear **definition**.
    * A contextual **example sentence**.
    * A creative **mnemonic** to aid memory.
* **Dynamic Content Regeneration:** If a user isn't satisfied with an example, they can click a button to have the AI generate a new, different one.
* **"Listen & Practice" Pronunciation:** A complete pronunciation tool that uses browser-native APIs to:
    * **Listen:** Play a clear, audible pronunciation of the word (Text-to-Speech).
    * **Practice:** Record the user's voice and provide instant feedback on their accuracy (Speech-to-Text).
* **Intelligent Spaced Repetition (SRS):** A core review system (powered by a backend priority queue) that schedules words for review at scientifically-backed intervals, maximizing long-term retention.
* **AI Word Suggestions:** A proactive feature that suggests new, relevant vocabulary to the user based on the words they've already learned.
* **Modern, Responsive UI:** A clean, beautiful, and mobile-friendly interface built with Tailwind CSS and Lucide React icons.

### ## 🛠️ Tech Stack & Architecture

This project is a decoupled, full-stack application.



#### **Backend**
* **Framework:** **FastAPI** (Python)
* **Database:** **SQLAlchemy** (ORM) with **PostgreSQL** (for production)
* **Authentication:** **python-jose** for JWT
* **Server:** **Uvicorn** & **Gunicorn**

#### **Frontend**
* **Library:** **React.js**
* **Build Tool:** **Vite**
* **Styling:** **Tailwind CSS**
* **Icons:** **Lucide React**
* **API Client:** **Axios**

#### **AI & Services**
* **Generative AI:** **Google Gemini API**
* **Pronunciation:** **Web Speech API** (Browser-native TTS & STT)

---

### ## 🏁 Getting Started (Local Setup)

To run this project locally, you will need to set up both the backend and the frontend.

#### **Prerequisites**
* [Python 3.9+](https://www.python.org/)
* [Node.js 18+](https://nodejs.org/)
* [Git](https://git-scm.com/)

---

### **1. Backend Setup**

```bash
# 1. Clone the repository
git clone [https://github.com/your-username/smart-vocabulary-builder.git](https://github.com/your-username/smart-vocabulary-builder.git)
cd smart-vocabulary-builder/backend

# 2. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create your .env file
# (Create a new file named .env in the /backend folder)
# Add your Gemini API key to it:
GOOGLE_API_KEY="your_secret_gemini_api_key"

# 5. Run the server
uvicorn main:app --reload

```
### **2. Frontend setup**

```bash
# 1. Open a new terminal and navigate to the frontend
cd ../frontend

# 2. Install dependencies
npm install

# 3. Create your .env file
# (Create a new file named .env in the /frontend folder)
# Add the URL of your local backend:
VITE_API_URL="[http://127.0.0.1:8000](http://127.0.0.1:8000)"

# 4. Run the development server
npm run dev
```
### ## 🔮 Future Scope

This project has a strong foundation for many exciting features:

* **Gamification:** Implement daily streaks, XP (Experience Points), and leaderboards to motivate users and enhance engagement.
* **Multilingual Support:** Expand the application to allow users to learn vocabulary in other languages, making it accessible to a broader audience.
* **Advanced AI Quizzes:** Introduce more dynamic review sessions by asking the AI to generate varied question types, such as multiple-choice or fill-in-the-blank exercises.
* **Dedicated Mobile App:** Develop native applications for iOS and Android using a framework like React Native, providing a seamless learning experience on mobile devices.
