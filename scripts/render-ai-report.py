"""Render the editable AI report with reportlab; requires reportlab and pypdf."""

from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer
from pypdf import PdfReader


root = Path(__file__).resolve().parents[1]
destination = root / 'output' / 'pdf' / 'AI-Usage-Report.pdf'
destination.parent.mkdir(parents=True, exist_ok=True)
styles = {
    'title': ParagraphStyle('title', fontName='Helvetica-Bold', fontSize=23,
                            leading=27, textColor=colors.HexColor('#32265b'), spaceAfter=8),
    'heading': ParagraphStyle('heading', fontName='Helvetica-Bold', fontSize=11,
                              leading=14, textColor=colors.HexColor('#51418a'),
                              spaceBefore=10, spaceAfter=4),
    'body': ParagraphStyle('body', fontName='Helvetica', fontSize=9.5,
                           leading=13, textColor=colors.HexColor('#242536'), spaceAfter=6),
}
story = []
for block in (root / 'docs' / 'AI-USAGE-REPORT.md').read_text(encoding='utf-8').split('\n\n'):
    block = block.strip()
    if not block:
        continue
    kind = 'title' if block.startswith('# ') else 'heading' if block.startswith('## ') else 'body'
    if kind != 'body':
        block = block.split(' ', 1)[1]
    story.append(Paragraph(escape(block).replace('\n', '<br/>'), styles[kind]))


def footer(canvas, document):
    canvas.setStrokeColor(colors.HexColor('#d7d0ea'))
    canvas.line(42, 38, A4[0] - 42, 38)
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(colors.HexColor('#595568'))
    canvas.drawString(42, 25, 'SMART TASK  /  Responsible AI disclosure')
    canvas.drawRightString(A4[0] - 42, 25, str(document.page))


SimpleDocTemplate(str(destination), pagesize=A4, rightMargin=42, leftMargin=42,
                  topMargin=36, bottomMargin=50, title='Smart Task - AI Usage Report',
                  author='Smart Task project').build(story, onFirstPage=footer, onLaterPages=footer)
pages = len(PdfReader(destination).pages)
if pages != 1:
    raise SystemExit(f'Expected one page, found {pages}; adjust layout before delivery.')
print('AI report generated and reopened: 1 page.')
