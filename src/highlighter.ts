import * as vscode from "vscode"
import util from "./util"
import { computeIndentationScope } from "./indentation-scope"
import { HighlighterMode, MatchingBracket } from "./types"

class Highlighter {
	scoperRangeDecorationType: vscode.TextEditorDecorationType
	scoperEndDecorationType: vscode.TextEditorDecorationType
	userConfigHighlightingMode: HighlighterMode

	constructor() {
		this.scoperRangeDecorationType = util.setRangeStyle()
		this.scoperEndDecorationType = util.setEndStyle()
		this.userConfigHighlightingMode = vscode.workspace
			.getConfiguration("codeScopeHighlighter")
			.get<HighlighterMode>("matchBrackets", HighlighterMode.Near)
	}

	updateConfig() {
		if (vscode.window.activeTextEditor) {
			vscode.window.activeTextEditor.setDecorations(
				this.scoperRangeDecorationType,
				[]
			)
			vscode.window.activeTextEditor.setDecorations(
				this.scoperEndDecorationType,
				[]
			)
		}
		this.scoperRangeDecorationType.dispose()
		this.scoperEndDecorationType.dispose()

		this.scoperRangeDecorationType = util.setRangeStyle()
		this.scoperEndDecorationType = util.setEndStyle()

		util.updateConfig()
	}

	onChange() {
		this.scoperRangeDecorationType.dispose()
		this.scoperEndDecorationType.dispose()

		this.scoperRangeDecorationType = util.setRangeStyle()
		this.scoperEndDecorationType = util.setEndStyle()

		const editor = vscode.window.activeTextEditor

		if (!editor) {
			return
		}

		const offset = editor.document.offsetAt(editor.selection.active)
		const text = editor.document.getText()

		let leftbracket: MatchingBracket
		let rightbracket: MatchingBracket

		//
		// Triple """ or ``` - cursor after closing
		// 
		// """..."""
		//          ^
		//
		if (util.isCloseTripleQuote(text, offset - 1)) {
			leftbracket = util.findLeftOpenTripleBracket(text, offset - 4, '"""')
			rightbracket = { bracket: '"""', offset: offset - 3 }
		} else if (util.isCloseTripleBacktick(text, offset - 1)) {
			leftbracket = util.findLeftOpenTripleBracket(text, offset - 4, "```")
			rightbracket = { bracket: "```", offset: offset - 3 }
		}

		//
		// Triple """ or ``` - cursor at opening
		//
		// """..."""
		// ^
		else if (util.isOpenTripleQuote(text, offset)) {
			leftbracket = { bracket: '"""', offset: offset }
			rightbracket = util.findRightCloseTripleBracket(text, offset + 3, '"""')
		} else if (util.isOpenTripleBacktick(text, offset)) {
			leftbracket = { bracket: "```", offset: offset }
			rightbracket = util.findRightCloseTripleBracket(text, offset + 3, "```")
		}


		//
		// String delimiter, single char - cursor after closing
		// "..."
		//      ^
		//
		if (util.isStringDelimiter(text, offset - 1)) {
			const delimiterChar = text[offset - 1]
			leftbracket = util.findLeftStringDelimiter(text, offset - 2, delimiterChar)
			rightbracket = { bracket: delimiterChar, offset: offset - 1 }
		}

		//
		// String delimiter, single char - cursor at opening
		// "..."
		// ^
		//
		if (util.isStringDelimiter(text, offset)) {
			const delimiterChar = text[offset]
			leftbracket = { bracket: delimiterChar, offset: offset }
			rightbracket = util.findRightStringDelimiter(text, offset + 1, delimiterChar)
		}

		// 
		// Bracket, single char - cursor after closing
		//
		// Example:
		// ^: cursor position
		// (...)
		//      ^
		//
		else if (util.isCloseBracket(text.charAt(offset - 1))) {
			const closingbracketChar = text[offset - 1]
			leftbracket = util.findLeftOpenBracket(text, offset - 2)
			rightbracket = { bracket: closingbracketChar, offset: offset - 1 }
		}

		//
		// Bracket, single char - cursor at opening
		//
		// Example:
		//  (...)
		//  ^
		//
		else if (util.isOpenBracket(text.charAt(offset))) {
			const openbracketChar = text[offset - 1]
			leftbracket = { bracket: openbracketChar, offset: offset }
			rightbracket = util.findRightCloseBracket(text, offset + 1)
		}

		//
		// Cursor inside
		//
		// Example:
		// (...)
		//	 ^
		else {
			leftbracket = util.findLeftOpenBracket(text, offset - 1)
			rightbracket = util.findRightCloseBracket(text, offset)
		}

		const shouldHighlight = util.shouldHighlight(
			this.userConfigHighlightingMode,
			offset,
			leftbracket,
			rightbracket
		)

		//
		// Set up the decorations to highlight the scope and matching brackets
		//
		const hasValidBracketPair =
			util.isMatchingBracket(leftbracket.bracket, rightbracket.bracket) &&
			shouldHighlight

		if (hasValidBracketPair) {
			const bracketLength = leftbracket.bracket.length || 1
			//
			// Start must be the first index of the inside range
			// 
			let start =
				leftbracket.offset < text.length
					? leftbracket.offset + bracketLength
					: leftbracket.offset
			// 
			// End must be the last index of the inside range + 1
			// since vscode.Range second param is exclusive
			// 
			let end = rightbracket.offset

			// 
			// Open bracket decoration
			// 
			const start_decoration = new vscode.Range(
				editor.document.positionAt(start - bracketLength),
				editor.document.positionAt(start)
			)
			//
			// Inside range decoration
			//
			const range_decoration = new vscode.Range(
				editor.document.positionAt(start),
				editor.document.positionAt(end)
			)
			//
			// Close bracket decoration
			//
			const end_decoration = new vscode.Range(
				editor.document.positionAt(end),
				editor.document.positionAt(end + bracketLength)
			)

			var rangeDecorations = []
			var endDecorations = []

			rangeDecorations.push(range_decoration)
			editor.setDecorations(this.scoperRangeDecorationType, rangeDecorations)

			endDecorations.push(start_decoration)
			endDecorations.push(end_decoration)
			editor.setDecorations(this.scoperEndDecorationType, endDecorations)
		} else if (this.shouldUseIndentationFallback(editor)) {
			const lines = text.split("\n")
			const cursorLine = editor.selection.active.line
			const tabSize = (editor.options.tabSize as number) ?? 4
			const scope = computeIndentationScope(
				lines,
				cursorLine,
				tabSize
			)

			if (scope) {
				const range_decoration = new vscode.Range(
					scope.startLine,
					0,
					scope.endLine,
					lines[scope.endLine]?.length ?? 0
				)
				editor.setDecorations(this.scoperRangeDecorationType, [
					range_decoration,
				])
			}
		}
	}

	private shouldUseIndentationFallback(editor: vscode.TextEditor): boolean {
		const config = vscode.workspace.getConfiguration("codeScopeHighlighter")
		const allowHighlightIndentation = config.get<boolean>(
			"allowHighlightIndentation",
			false
		)
		const langIds = config.get<string[]>(
			"highlightIndentationLangIds",
			["python", "ruby"]
		)
		return (
			allowHighlightIndentation &&
			langIds.includes(editor.document.languageId)
		)
	}

	dispose(): void {
		this.scoperRangeDecorationType.dispose()
		this.scoperEndDecorationType.dispose()
	}
}

const highlighter = new Highlighter()
export { highlighter, Highlighter }
