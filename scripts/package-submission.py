"""Package only the reviewed reports and editable sources; never glob the workspace."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from pypdf import PdfReader

root = Path(__file__).resolve().parents[1]
ai = PdfReader(root / 'output/pdf/AI-Usage-Report.pdf')
assert len(ai.pages) == 1, 'AI report must be exactly one page'
text = ai.pages[0].extract_text()
for heading in ['Tools and scope', 'Three actual prompts', 'Problem solved with AI assistance',
                'An incomplete suggestion and its correction', 'Verification and candidate contribution']:
    assert heading in text, f'Missing AI report section: {heading}'
description = PdfReader(root / 'output/pdf/Project-Description.pdf')
assert 1 <= len(description.pages) <= 2
description_text = '\n'.join(page.extract_text() for page in description.pages)
for heading in ['Technologies and tools', 'Contributions and process', 'Implementation challenges', 'Running and testing']:
    assert heading in description_text, f'Missing description section: {heading}'
for content in [text, description_text]:
    assert '27 October 2026' in content and '43' in content

destination = root / 'output/submission/Bright-Mind-Submission.zip'
destination.parent.mkdir(parents=True, exist_ok=True)
files = {
    'output/pdf/AI-Usage-Report.pdf': 'AI-Usage-Report.pdf',
    'output/pdf/Project-Description.pdf': 'Project-Description.pdf',
    'docs/AI-USAGE-REPORT.md': 'editable/AI-USAGE-REPORT.md',
    'docs/PROJECT-DESCRIPTION.md': 'editable/PROJECT-DESCRIPTION.md',
}
guide = '''Smart Task & Project Management System
Bright Mind assignment submission - 27 October 2026

Repository:
https://github.com/masud-rana-pro/smart-task-project-management-system

Live application:
https://smart-task-project-management-syste-delta.vercel.app

Installation, configuration, database setup, seed, run and test instructions:
https://github.com/masud-rana-pro/smart-task-project-management-system/blob/main/README.md

API documentation:
https://smart-task-project-management-syste-delta.vercel.app/api/openapi.json

Attachments:
- Project-Description.pdf: technologies, AI use, contribution, process,
  challenges and run/test guidance.
- AI-Usage-Report.pdf: required one-page responsible-AI disclosure.
- editable/: Markdown source copies of both reports.

The repository contains frontend/backend source, schema/migrations,
sample-data instructions, API guide, tests, containers and verification.
Evaluator Admin credentials are shared privately, outside this bundle.
Public registration creates a Team Member.
'''
with ZipFile(destination, 'w', ZIP_DEFLATED) as archive:
    for source, target in files.items():
        archive.write(root / source, target)
    archive.writestr('START-HERE.txt', guide)
with ZipFile(destination) as archive:
    assert archive.testzip() is None
    assert set(archive.namelist()) == set(files.values()) | {'START-HERE.txt'}
print('Validated PDFs and five-file allowlisted submission ZIP; no environment or credential files included.')
