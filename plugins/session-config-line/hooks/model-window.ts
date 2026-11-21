import type { ContextReading } from '../types/index.js'

const WINDOW_SUFFIX_PATTERN = /\[(\d+(?:\.\d+)?)([km])\]$/i
const TOKENS_PER_UNIT = { k: 1_000, m: 1_000_000 } as const
const ASSUMED_WINDOW_TOKENS = 1_000_000

type LabeledModelPickerRow = {
	model: string
	label: string
}

function isLabeledModelPickerRow(row: unknown): row is LabeledModelPickerRow {
	if (typeof row !== 'object' || row === null) return false

	return 'model' in row && typeof row.model === 'string' && 'label' in row && typeof row.label === 'string'
}

export function windowTokensOfLabel(label: string): number | null {
	const suffix = WINDOW_SUFFIX_PATTERN.exec(label.trim())
	const amount = suffix?.[1]
	const unit = suffix?.[2]?.toLowerCase()
	if (amount === undefined || (unit !== 'k' && unit !== 'm')) return null

	const tokens = Math.round(Number(amount) * TOKENS_PER_UNIT[unit])

	return tokens > 0 ? tokens : null
}

export function labeledWindowTokensOf(modelPicker: unknown, model: string): number | null {
	if (typeof modelPicker !== 'object' || modelPicker === null || !('options' in modelPicker)) return null
	if (!Array.isArray(modelPicker.options)) return null

	const rows: unknown[] = modelPicker.options
	const modelRow = rows.filter(isLabeledModelPickerRow).find(row => row.model.toLowerCase() === model.toLowerCase())
	if (modelRow === undefined) return null

	return windowTokensOfLabel(modelRow.label)
}

export function contextWithLabeledWindowOf(context: ContextReading, labeledWindowTokens: number | null): ContextReading {
	const isReportedWindowKnown = context.windowTokens > 0
	if (labeledWindowTokens === null && isReportedWindowKnown) return context

	const windowTokens = labeledWindowTokens ?? ASSUMED_WINDOW_TOKENS
	const hasCompactPart = context.compactTokens > 0
	const compactStartTokens = context.windowTokens - context.compactTokens
	const compactTokens = hasCompactPart ? Math.max(0, windowTokens - compactStartTokens) : 0

	return { usedTokens: context.usedTokens, windowTokens, compactTokens }
}
