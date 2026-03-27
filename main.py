from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import fitz  # PyMuPDF for reading PDFs
from google import genai
import os

# Environment variables load karein (.env file se)
load_dotenv()

# Gemini AI Client Setup
# Make sure you have GEMINI_API_KEY="your_api_key_here" in your .env file
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

# --- CORS SETUP (React ko allow karne ke liye) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React ka URL
    allow_credentials=True,
    allow_methods=["*"],  # Har qisam ke methods (GET, POST) allow karein
    allow_headers=["*"],
)


# --- POST ROUTE (Frontend yahan request bhej raha hai) ---
@app.post("/generate-lesson/{lesson_id}")
async def generate_lesson(lesson_id: int, file: UploadFile = File(...)):
    try:
        # 1. PDF File ko read karein
        pdf_bytes = await file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        # PDF ka saara text nikalen
        extracted_text = ""
        for page in doc:
            extracted_text += page.get_text()

        # 2. AI ke liye Prompt (Command) banayen

        prompt = f"""
                You are an expert Educational Curriculum Designer and AI Teacher Assistant. 
                Analyze the provided syllabus and create a highly detailed, professional lesson plan for Week/Lesson #{lesson_id}.

                FORMATTING RULES:
                - Use strict, professional English.
                - Add a blank line (spacing) after every paragraph and heading to make it highly readable.
                - Use **Bold Text** for important keywords, time durations, and main concepts.
                - Use clean bullet points (-) for lists.
                - Do not write large blocks of text; keep paragraphs short (2-3 lines max).

                Include the following structured sections exactly as listed, using H2 (##) for main headings:
                ## 🎯 Lesson Objectives
                (List 3-4 clear, actionable objectives)

                ## 📚 Key Topics to Cover
                (Detail the main concepts clearly)

                ## 💡 Interactive Activities
                (Explain the activity, duration, and execution clearly)

                ## 📝 Homework / Assignment
                (Give a clear, short assignment)

                ## ⏱️ Quick End-of-Class Quiz
                (Create a 5-minute quiz with 3 questions. Provide the correct answers clearly below the questions).

                Syllabus Text:
        {extracted_text}
        """

        # 3. Gemini AI ko bhejein
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )

        # 4. Result React (Frontend) ko wapis bhejein
        return {"content": response.text}

    except Exception as e:
        # Agar koi error aaye toh frontend ko bata de
        return {"error": str(e)}