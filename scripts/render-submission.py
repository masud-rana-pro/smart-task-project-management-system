"""Render both submission PDFs with the existing AI-report design."""
from pathlib import Path
from xml.sax.saxutils import escape
import runpy

from pypdf import PdfReader
from reportlab.lib.pagesizes import A4
from reportlab.platypus import Paragraph, SimpleDocTemplate

root = Path(__file__).resolve().parents[1]
# Rebuild and validate the required one-page AI report first.
report = runpy.run_path(str(root / 'scripts' / 'render-ai-report.py'))
styles = report['styles']
story = []
for block in (root / 'docs' / 'PROJECT-DESCRIPTION.md').read_text(encoding='utf-8').split('\n\n'):
    block = block.strip()
    if not block:
        continue
    kind = 'title' if block.startswith('# ') else 'heading' if block.startswith('## ') else 'body'
    if kind != 'body':
        block = block.split(' ', 1)[1]
    story.append(Paragraph(escape(block).replace('\n', '<br/>'), styles[kind]))

def footer(canvas, document):
    canvas.setFont('Helvetica', 8)
    canvas.setFillColorRGB(0.35, 0.33, 0.41)
    canvas.drawString(42, 25, 'SMART TASK  /  Project description')
    canvas.drawRightString(A4[0] - 42, 25, str(document.page))

destination = root / 'output' / 'pdf' / 'Project-Description.pdf'
SimpleDocTemplate(str(destination), pagesize=A4, rightMargin=42, leftMargin=42,
                  topMargin=36, bottomMargin=50, title='Smart Task - Project Description',
                  author='Md. Masud Rana').build(story, onFirstPage=footer, onLaterPages=footer)
pages = len(PdfReader(destination).pages)
if not 1 <= pages <= 2:
    raise SystemExit(f'Project description should fit within two pages; found {pages}.')
print(f'Project description generated and reopened: {pages} page(s).')
