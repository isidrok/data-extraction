---
name: xlsx
description: Read and extract data from Excel / XLSX files using the Python sandbox.
allowed_tools:
  - execute_code
  - view_image
---

Use `execute_code` to process Excel files. All libraries below are pre-installed.

## Quick overview with markitdown

Returns each sheet as a markdown table — good for a fast summary before deeper analysis.

```python
from markitdown import MarkItDown

md = MarkItDown()
result = md.convert("/path/to/file.xlsx")
print(result.text_content)
```

## Read all sheets with pandas

```python
import pandas as pd

sheets = pd.read_excel("/path/to/file.xlsx", sheet_name=None)
for name, df in sheets.items():
    print(f"=== {name} ({df.shape[0]} rows × {df.shape[1]} cols) ===")
    print(df.to_string())
    print()
```

## Read a specific sheet

```python
import pandas as pd

df = pd.read_excel("/path/to/file.xlsx", sheet_name="Sheet1")
print(df.head(20).to_string())
print(df.dtypes)
```

## List sheet names

```python
import pandas as pd

xl = pd.ExcelFile("/path/to/file.xlsx")
print(xl.sheet_names)
```

## Inspect formulas and cached values (openpyxl)

```python
from openpyxl import load_workbook

# Formula strings
wb = load_workbook("/path/to/file.xlsx")
for row in wb.active.iter_rows(values_only=False):
    for cell in row:
        if cell.value:
            print(cell.coordinate, cell.value)

# Cached values only — do NOT save this workbook, formulas are stripped
wb_data = load_workbook("/path/to/file.xlsx", data_only=True)
```

After saving a chart or image to the sandbox, use `view_image` to inspect it.
