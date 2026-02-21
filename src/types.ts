export interface MatchingBracket {
	bracket: string
	/** The offset must point the beginning of the bracket */
	offset: number
}

export enum HighlighterMode {
	Near = "near",
	Always = "always",
	Never = "never",
}

export type BracketStringType = "parentheses" | "braces" | "squareBrackets"
