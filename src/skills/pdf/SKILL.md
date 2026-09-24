---
name: pdf
description: Read and extract text, tables, and metadata from PDF files using the Python sandbox.
allowed_tools:
  - execute_code
  - view_image
---

Use `execute_code` to process PDF files. All libraries below are pre-installed.

## Extract text and tables

```python
import pdfplumber

with pdfplumber.open("/path/to/file.pdf") as pdf:
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        if text:
            print(f"--- Page {i + 1} ---")
            print(text)
        for table in page.extract_tables():
            print(table)
```

## Extract tables into a DataFrame

```python
import pdfplumber
import pandas as pd

dfs = []
with pdfplumber.open("/path/to/file.pdf") as pdf:
    for page in pdf.pages:
        for table in page.extract_tables():
            if table and len(table) > 1:
                dfs.append(pd.DataFrame(table[1:], columns=table[0]))

combined = pd.concat(dfs, ignore_index=True) if dfs else pd.DataFrame()
print(combined.to_string())
```

## Read metadata

```python
from pypdf import PdfReader

reader = PdfReader("/path/to/file.pdf")
print(f"Pages: {len(reader.pages)}")
print(reader.metadata)
```

## Render a page as an image to view it visually

Use `pypdfium2` to render a page to PNG (no external dependencies), save it, then call `view_image` with that path.

```python
import pypdfium2 as pdfium

pdf = pdfium.PdfDocument("/path/to/file.pdf")
page = pdf[0]  # first page (0-indexed)
bitmap = page.render(scale=2)  # scale=2 gives 144 dpi
bitmap.to_pil().save("page1.png", "PNG")
# Then call: view_image(path="page1.png")
```

For scanned PDFs where text extraction returns nothing, render each page as an image with
`view_image` and read them visually — there is no OCR library available in the sandbox.
