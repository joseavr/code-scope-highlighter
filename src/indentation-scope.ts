/**
 * Computes indentation level in units (spaces = 1, tabs = tabSize).
 */
function getIndentLevel(line: string, tabSize: number): number {
	let level = 0
	for (let i = 0; i < line.length; i++) {
		if (line[i] === " ") {
			level += 1
		} else if (line[i] === "\t") {
			level += tabSize
		} else {
			break
		}
	}
	return level
}

/**
 * Finds the block scope based on indentation.
 * Returns { startLine, endLine } (0-based) or null if no scope.
 *
 * @param lines - Document lines
 * @param cursorLineIndex - 0-based line index of cursor
 * @param tabSize - From editor.options.tabSize (spaces per tab)
 */
export function computeIndentationScope(
	lines: string[],
	cursorLineIndex: number,
	tabSize: number
): { startLine: number; endLine: number } | null {
	if (lines.length === 0 || cursorLineIndex < 0 || cursorLineIndex >= lines.length) {
		return null
	}

	// If cursor is on empty line, use indent of nearest non-empty line
	let cursorIndent = getIndentLevel(lines[cursorLineIndex], tabSize)
	if (lines[cursorLineIndex].trim().length === 0) {
		for (let i = cursorLineIndex + 1; i < lines.length; i++) {
			if (lines[i].trim().length > 0) {
				cursorIndent = getIndentLevel(lines[i], tabSize)
				break
			}
		}
		if (cursorIndent === 0) {
			for (let i = cursorLineIndex - 1; i >= 0; i--) {
				if (lines[i].trim().length > 0) {
					cursorIndent = getIndentLevel(lines[i], tabSize)
					break
				}
			}
		}
	}

	// Find block start: nearest line above with strictly less indentation
	let blockStartLine = -1
	for (let i = cursorLineIndex - 1; i >= 0; i--) {
		const line = lines[i]
		if (line.trim().length === 0) {
			// Empty line: skip (treat as continuation of block when scanning up)
			continue
		}
		const indent = getIndentLevel(line, tabSize)
		if (indent < cursorIndent) {
			blockStartLine = i
			break
		}
	}

	if (blockStartLine === -1) {
		return null
	}

	const blockStartIndent = getIndentLevel(lines[blockStartLine], tabSize)

	// Find block end: last line with indentation > block start
	let blockEndLine = blockStartLine
	for (let i = blockStartLine + 1; i < lines.length; i++) {
		const line = lines[i]
		if (line.trim().length === 0) {
			// Empty line: include in block (continues scope)
			blockEndLine = i
			continue
		}
		const indent = getIndentLevel(line, tabSize)
		if (indent <= blockStartIndent) {
			// Same or less indent: block ends at previous line
			break
		}
		blockEndLine = i
	}

	return { startLine: blockStartLine, endLine: blockEndLine }
}
