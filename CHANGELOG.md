# Scope Highlighter Change Log

## v0.0.1 - 2024-07-03

- Initial release

## v1.2.0

- Added support for quotes, triple quotes, backticks, triple backticks.

## v1.3.0

- **Indentation-based scope highlighting:** Fall back to indentation-based scope detection when no bracket pairs are found (useful for Python, Ruby, YAML, etc.).
- **New setting `allowHighlightIndentation`:** Master switch for indentation scope highlighting (default: off).
- **New setting `highlightIndentationLangIds`:** Language IDs that use indentation highlighting when enabled (default: `["python", "ruby"]`).

## v1.3.4

- Fix: highlighting issue on string delimiter
  - Brackets now find the correct closing bracket
- Chore: refactor for a small optimization