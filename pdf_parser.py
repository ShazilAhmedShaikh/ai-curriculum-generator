
import fitz
def extract_text_from_pdf(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        for page in doc:
            full_text = page.get_text()
            return full_text
    except Exception as e:
        return f"Error: {e}"




