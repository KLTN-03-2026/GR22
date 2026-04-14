from fpdf import FPDF
import os

class CV(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 16)
        self.cell(0, 10, 'NGUYEN VAN A', ln=True, align='C')
        self.set_font('helvetica', '', 10)
        self.cell(0, 5, 'Email: test@example.com | Phone: 0901 234 567', ln=True, align='C')
        self.ln(10)

    def section_title(self, title):
        self.set_font('helvetica', 'B', 12)
        self.set_fill_color(240, 240, 240)
        self.cell(0, 8, title, ln=True, fill=True)
        self.ln(2)

    def content_body(self, text):
        self.set_font('helvetica', '', 10)
        self.multi_cell(0, 6, text)
        self.ln(4)

def create_pdf():
    pdf = CV()
    pdf.add_page()

    pdf.section_title('PROFESSIONAL SUMMARY')
    pdf.content_body(
        'Software Engineer with over 3 years of experience in full-stack development. '
        'Expertise in React, Node.js, and Python. Passionate about building scalable '
        'and efficient applications with AI integration.'
    )

    pdf.section_title('TECHNICAL SKILLS')
    pdf.content_body(
        '- Programming: JavaScript, Python, C++\n'
        '- Frontend: React.js, Tailwind CSS\n'
        '- Backend: Node.js, FastAPI, SQL\n'
        '- Tools: Git, Docker, AWS'
    )

    pdf.section_title('WORK EXPERIENCE')
    pdf.set_font('helvetica', 'B', 10)
    pdf.cell(0, 5, 'ABC Technology Corp - Software Engineer (Jan 2022 - Present)', ln=True)
    pdf.content_body(
        '- Led the development of a smart recruitment platform.\n'
        '- Reduced frontend load times by 40% through code optimization.\n'
        '- Implemented AI-driven CV parsing using LLMs.'
    )

    pdf.section_title('EDUCATION')
    pdf.set_font('helvetica', 'B', 10)
    pdf.cell(0, 5, 'Hanoi University of Science and Technology', ln=True)
    pdf.content_body('B.S. in Software Engineering | GPA: 3.6/4.0 | 2018 - 2022')

    pdf.section_title('PROJECTS')
    pdf.set_font('helvetica', 'B', 10)
    pdf.cell(0, 5, 'AI CV Analyst', ln=True)
    pdf.content_body(
        'A full-stack project utilizing React, Node.js, and FastAPI for automated CV analysis.'
    )

    file_path = "CV_NguyenVanA.pdf"
    pdf.output(file_path)
    return file_path

if __name__ == "__main__":
    path = create_pdf()
    print(f"PDF CV created successfully at: {os.path.abspath(path)}")
