export const BAR_CELLS = 20

export type BarWidths = {
	used: number
	free: number
	compact: number
}

export function barWidthsOf(usedTokens: number | null, windowTokens: number, bufferTokens: number): BarWidths {
	if (windowTokens <= 0) return { used: 0, free: BAR_CELLS, compact: 0 }

	const cellsOf = (tokens: number) => Math.min(BAR_CELLS, Math.max(0, Math.round((tokens / windowTokens) * BAR_CELLS)))
	const used = cellsOf(usedTokens ?? 0)
	const compactWanted = bufferTokens > 0 ? Math.max(1, cellsOf(bufferTokens)) : 0
	const compact = Math.min(compactWanted, BAR_CELLS - used)

	return { used, free: BAR_CELLS - used - compact, compact }
}

export function percentUsedOf(usedTokens: number | null, windowTokens: number): number {
	if (usedTokens === null || windowTokens <= 0) return 0

	return Math.round((usedTokens / windowTokens) * 100)
}
