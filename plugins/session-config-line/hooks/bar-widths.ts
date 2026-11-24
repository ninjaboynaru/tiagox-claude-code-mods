export const BAR_CELLS = 20

export type BarWidths = {
	used: number
	free: number
	compact: number
}

export function barWidthsOf(usedTokens: number | null, windowTokens: number, compactTokens: number): BarWidths {
	if (windowTokens <= 0) return { used: 0, free: BAR_CELLS, compact: 0 }

	const cellsOf = (tokens: number) => Math.min(BAR_CELLS, Math.max(0, Math.round((tokens / windowTokens) * BAR_CELLS)))
	const used = cellsOf(usedTokens ?? 0)
	const compactWanted = compactTokens > 0 ? Math.max(1, cellsOf(compactTokens)) : 0
	const compact = Math.min(compactWanted, BAR_CELLS - used)

	return { used, free: BAR_CELLS - used - compact, compact }
}

const TOKENS_PER_THOUSAND = 1_000
const TOKENS_PER_MILLION = 1_000_000
// Windows are often powers of two, such as 1,048,576, so a window within 5% above a whole million reads as that million.
const MILLION_ROUNDING_TOLERANCE = 0.05

export function windowLabelOf(windowTokens: number): string {
	if (windowTokens <= 0) return ''

	const millions = windowTokens / TOKENS_PER_MILLION
	const wholeMillions = Math.floor(millions)
	const isNearWholeMillion = wholeMillions >= 1 && millions - wholeMillions <= wholeMillions * MILLION_ROUNDING_TOLERANCE
	if (isNearWholeMillion) return `[${wholeMillions}m]`
	if (millions >= 1) return `[${Number(millions.toFixed(1))}m]`

	return `[${Math.round(windowTokens / TOKENS_PER_THOUSAND)}k]`
}

export function percentUsedOf(usedTokens: number | null, windowTokens: number): number {
	if (usedTokens === null || windowTokens <= 0) return 0

	return Math.round((usedTokens / windowTokens) * 100)
}

export function compactPercentOf(windowTokens: number, compactTokens: number): number | null {
	if (compactTokens <= 0 || windowTokens <= 0) return null

	return Math.round(((windowTokens - compactTokens) / windowTokens) * 100)
}

export function percentTextOf(usedTokens: number | null, windowTokens: number, compactTokens: number): string {
	const compactPercent = compactPercentOf(windowTokens, compactTokens)
	const percents = `${percentUsedOf(usedTokens, windowTokens)}%${compactPercent === null ? '' : `/${compactPercent}%`}`

	return `${percents} ${windowLabelOf(windowTokens)}`.trim()
}
