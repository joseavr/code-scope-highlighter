import * as vscode from "vscode"
import { HighlighterMode, MatchingBracket } from "./types"

const TRIPLE_QUOTE = '"""'
const TRIPLE_BACKTICK = "```"

let openingBrackets: string[] = []
let closingBrackets: string[] = []

function updateConfig() {
	const activeEditor = vscode.window.activeTextEditor

	if (activeEditor) {
		openingBrackets = ["(", "{", "["]
		closingBrackets = [")", "}", "]"]
	}
}

function isMatchingBracket(open: string, close: string) {
	switch (open) {
		case TRIPLE_QUOTE:
			return close === TRIPLE_QUOTE
		case TRIPLE_BACKTICK:
			return close === TRIPLE_BACKTICK
		case "(":
			return close === ")"
		case "{":
			return close === "}"
		case "[":
			return close === "]"
		case `"`:
			return close === `"`
		case `'`:
			return close === `'`
		case "`":
			return close === "`"
		default:
			return false
	}
}

function isOpenBracket(char: string) {
	return openingBrackets.includes(char)
}

function isCloseBracket(char: string) {
	return closingBrackets.includes(char)
}

function isStringDelimiter(text: string, offset: number) {
	const char = text.charAt(offset)
	return char === `"` || char === `'` || char === "`"
}

function isCloseTripleQuote(text: string, offset: number): boolean {
	return (
		offset >= 3 &&
		text.charAt(offset) === '"' &&
		text.charAt(offset - 1) === '"' &&
		text.charAt(offset - 2) === '"'
	)
}

function isOpenTripleQuote(text: string, offset: number): boolean {
	return (
		offset + 2 < text.length &&
		text.charAt(offset) === '"' &&
		text.charAt(offset + 1) === '"' &&
		text.charAt(offset + 2) === '"'
	)
}

function isCloseTripleBacktick(text: string, offset: number): boolean {
	return (
		offset >= 3 &&
		text.charAt(offset) === "`" &&
		text.charAt(offset - 1) === "`" &&
		text.charAt(offset - 2) === "`"
	)
}

function isOpenTripleBacktick(text: string, offset: number): boolean {
	return (
		offset + 2 < text.length &&
		text.charAt(offset) === "`" &&
		text.charAt(offset + 1) === "`" &&
		text.charAt(offset + 2) === "`"
	)
}


/** 
 * Finds to the left, the nearest open bracket.
 * 
 * Scans starting from the cursor position `index` to the beginning of the `text`
 * 
 * @param text text from current editor tab
 * @param index current position of the cursor in the text
 */
function findLeftOpenBracket(text: string, index: number): MatchingBracket {
	const bracketStack = []
	let openbracketIndex = 0
	let openbracket = ""

	for (let i = index; i >= 0; i--) {
		let char = text.charAt(i)
		if (isOpenBracket(char)) {
			if (bracketStack.length === 0) {
				openbracket = char
				openbracketIndex = i
				break
			} else {
				let top = bracketStack.pop()!
				if (!isMatchingBracket(char, top)) {
					throw "Unmatched bracket pair"
				}
			}
		} else if (isCloseBracket(char)) {
			bracketStack.push(char)
		}
	}

	return { bracket: openbracket, offset: openbracketIndex }
}


function findRightStringDelimiter(text: string, startIndex: number, delimiterChar: string) {


	for (let i = startIndex; i < text.length; i++) {
		if (
			i + 1 < text.length &&
			text.charAt(i) === delimiterChar
		) {
			return { bracket: delimiterChar, offset: i }
		}
	}

	// not found
	return { bracket: "", offset: 0 }

}

function findLeftStringDelimiter(text: string, startIndex: number, delimiterChar: string) {


	for (let i = startIndex; i >= 0; i--) {
		if (
			text.length > i + 2 &&
			text.charAt(i) === delimiterChar
		) {
			return { bracket: delimiterChar, offset: i }
		}
	}

	// not found
	return { bracket: "", offset: 0 }

}

/**
 * Finds to the right, the nearest close bracket.
 * 
 * Starting from the cursor position `index` to the end of the `text`
 * 
 * @param text text from current editor tab
 * @param index current position of the cursor in the text
 */
function findRightCloseBracket(text: string, index: number): MatchingBracket {
	const bracketStack = []
	let closebracketIndex = text.length
	let closebracket = ""
	for (let i = index; i < text.length; i++) {
		let char = text.charAt(i)
		if (isCloseBracket(char)) {
			if (bracketStack.length === 0) {
				closebracketIndex = i
				closebracket = char
				break
			} else {
				let top = bracketStack.pop()!
				if (!isMatchingBracket(top, char)) {
					throw "Unmatched bracket pair"
				}
			}
		} else if (isOpenBracket(char)) {
			bracketStack.push(char)
		}
	}

	return { bracket: closebracket, offset: closebracketIndex }
}

/**
 * Finds the matching opening triple bracket (""" or ```) to the left.
 * Use when cursor is after a closing triple.
 */
function findLeftOpenTripleBracket(
	text: string,
	startIndex: number,
	triple: string
): MatchingBracket {
	const char = triple.charAt(0)

	for (let i = startIndex; i >= 0; i--) {
		if (
			text.length > i + 2 &&
			text.charAt(i) === char &&
			text.charAt(i + 1) === char &&
			text.charAt(i + 2) === char
		) {
			return { bracket: triple, offset: i }
		}
	}

	// not found
	return { bracket: "", offset: 0 }
}

/**
 * Finds the matching closing triple bracket (""" or ```) to the right.
 * Use when cursor is after an opening triple.
 */
function findRightCloseTripleBracket(
	text: string,
	startIndex: number,
	triple: string
): MatchingBracket {
	const char = triple.charAt(0)

	for (let i = startIndex; i < text.length; i++) {
		if (
			text.length > i + 2 &&
			text.charAt(i) === char &&
			text.charAt(i + 1) === char &&
			text.charAt(i + 2) === char
		) {
			return { bracket: triple, offset: i }
		}
	}

	return { bracket: "", offset: text.length }
}

function shouldHighlight(
	highlighterMode: HighlighterMode,
	offset: number,
	leftMatchingBracket: { offset: number; bracket: string },
	rightMatchingBracket: { offset: number; bracket: string }
): boolean {
	switch (highlighterMode) {
		// highlight only when the cursor is next to the matching bracket
		case HighlighterMode.Near:
			const bracketLength = rightMatchingBracket.bracket.length || 1
			return (
				offset === leftMatchingBracket.offset ||
				offset === rightMatchingBracket.offset + bracketLength
			)
		case HighlighterMode.Always:
			return true
		case HighlighterMode.Never:
			return false
		default:
			return false // fallback for any unexpected values
	}
}

function setRangeStyle() {
	return vscode.window.createTextEditorDecorationType({
		light: {
			backgroundColor: "#4d4d4d30"
		},
		dark: {
			backgroundColor:
				vscode.workspace.getConfiguration("codeScopeHighlighter").scopeColor,
		},
	})
}

function setEndStyle() {
	return vscode.window.createTextEditorDecorationType({
		light: {
			backgroundColor: "#4d4d4d30"
		},
		dark: {
			backgroundColor:
				vscode.workspace.getConfiguration("codeScopeHighlighter").bracketColor,
		},
	})
}

export default {
	updateConfig,
	isMatchingBracket,
	isOpenBracket,
	isCloseBracket,
	isStringDelimiter,
	isCloseTripleQuote,
	isOpenTripleQuote,
	isCloseTripleBacktick,
	isOpenTripleBacktick,
	findLeftOpenBracket,
	findRightCloseBracket,
	findLeftOpenTripleBracket,
	findRightCloseTripleBracket,
	findLeftStringDelimiter,
	findRightStringDelimiter,
	shouldHighlight,
	setRangeStyle,
	setEndStyle,
}
