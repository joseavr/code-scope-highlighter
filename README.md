<p align="center">
  <img src="./code-scope-highlighter.gif" alt=" Language" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/languages/top/lamula21/scope-highlighter" alt=" Language" />
  <img src="https://img.shields.io/github/stars/lamula21/scope-highlighter" alt=" Stars" />
  <img src="https://img.shields.io/github/issues-pr/lamula21/scope-highlighter" alt=" Pull Requests" />
  <img src="https://img.shields.io/github/issues/lamula21/scope-highlighter" alt=" Issues" />
  <img src="https://img.shields.io/github/contributors/lamula21/scope-highlighter" alt=" Contributors" />
</p>


# Code Scope Highlighter - A Highlighter Extension for Better Readability

A customizable scope highlighter, inspired by Dr Racket IDE.

## ✨ Features
- **Universal highlighting:** ScopeHighlighter works on any language!
- **Dynamic Highlighting:** Instantly see the scope of matching brackets with vibrant colors.
- **HTML Tag Support:** Highlight nested HTML tags with intelligent cursor positioning:
  - Place cursor on `<` of start tag to highlight: start tag + content + end tag
  - Place cursor on `>` of any tag to highlight: content inside the tag
- **Customizable Colors:** Personalize your highlight colors for brackets, braces, and parentheses.
- **Flexible Modes:** Choose from "near", "always", or "never" highlight modes to suit your coding style.
- **Indentation-based scope:** For languages like Python and Ruby, fall back to indentation-based scope highlighting when no bracket pairs are detected.

## 🌟 Why ScopeHighlighter?
- **Boost Productivity:** Quickly understand the structure of your code, making it easier to debug and develop.
- **Enhanced Readability:** No more squinting at matching brackets; ScopeHighlighter makes it clear and straightforward.
- **Seamless Integration:** Works effortlessly and fast within the VS Code ecosystem, either on desktop or the browser, thanks to the bundler `esbuild`.

## ⚙️ Extension Settings

The following settings are configured for the scope-highlighter extension:

### `codeScopeHighlighter.matchBrackets` - Match Brackets

For color picker: https://vuetifyjs.com/en/components/color-pickers/

- **Default**: `near`
- **Description**: Choose when the scope highlight should be active:
    - `near` for when the cursor is near the bracket,
    - `always` to always highlight,
    - `never` to never highlight.

### `codeScopeHighlighter.scopeColor` - Scope Color
- **Default**: `#4d4d4d30`
- **Description**: Color for highlighting the entire scope of matching brackets. (Hex format)

### `codeScopeHighlighter.bracketColor` - Bracket Color
- **Default**: `#4d4d4d30`
- **Description**: Color for highlighting the matching brackets. (Hex format)

### `codeScopeHighlighter.allowHighlightIndentation` - Allow Indentation Scope Highlighting
- **Default**: `false`
- **Description**: When enabled, fall back to indentation-based scope highlighting when no bracket pairs are detected. Useful for languages like Python and Ruby that use indentation for blocks.

### `codeScopeHighlighter.highlightIndentationLangIds` - Languages for Indentation Highlighting
- **Default**: `["python", "ruby"]`
- **Description**: Language IDs for which indentation scope highlighting is enabled when `allowHighlightIndentation` is on. Use [VS Code language identifiers](https://code.visualstudio.com/docs/languages/identifiers) (e.g. `python`, `ruby`, `yaml`).


## 🗺️ Roadmap 

- [x] **Bracket Specific Settings:** Implement highlighting for specific matching bracket symbols.
- [x] **Language Specific Settings:** Implement highlighting for specific programming languages (Python, Ruby).
- [ ] **HTML support:** Implement highlighting for nested html tags.


## 📄 License

This project is licensed under the **MIT** - see the [MIT](https://github.com/xavimondev/easyreadme/blob/main/LICENSE) file for details.

## For Devs

- Run `npm watch`
- Start Debugging right away with `F5` or Command Pallete `Debug: Start Debugging`
