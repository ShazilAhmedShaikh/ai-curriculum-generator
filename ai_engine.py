
from google import genai
import os
from dotenv import load_dotenv

# Yeh line aapki .env file se GEMINI_API_KEY ko load karegi
load_dotenv()

# Naya Client setup
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

print("==== DEBUG: Meri API Key yeh hai ->", os.getenv("GEMINI_API_KEY"))


def generate_curriculum_step(syllabus_content, lesson_num, history=""):
    prompt = f"""
    Syllabus Content: {syllabus_content}

    Previous Lessons Summary: {history}

    Task: Generate Lesson Plan for Lesson #{lesson_num}.
    Include:
    1. Lesson Title & Learning Outcomes.
    2. Detailed Theory.
    3. Practical Lab Exercise (Step-by-step).
    4. 5 Multiple Choice Questions (MCQs).

    Consistency Rule: If this is Lesson 10, make sure it builds on Lesson 1-9.
    Output Format: Markdown.
    """

    # Naye SDK ka tareeqa
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    return response.text
