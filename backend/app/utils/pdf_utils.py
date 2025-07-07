from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import io

def generate_credentials_pdf(username: str, password: str, role: str) -> bytes:
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, 700, "User Login Credentials")
    c.setFont("Helvetica", 12)
    c.drawString(100, 670, f"Username: {username}")
    c.drawString(100, 650, f"Password: {password}")
    c.drawString(100, 630, f"Role: {role}")
    c.drawString(100, 610, "Please keep these credentials secure.")
    c.save()
    buffer.seek(0)
    return buffer.read()
