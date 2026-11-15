import type { LimitReading } from '../types/index.js'

export type SessionLineParts = {
	model: string | undefined
	effort: string | undefined
	limits: LimitReading[]
}

function limitLabelOf(kind: string): string | null {
	if (kind === 'seven_day') return 'Weekly Usage:'
	if (kind.startsWith('seven_day_')) return kind.slice('seven_day_'.length).replaceAll('_', ' ')

	return null
}

export function sessionLineOf({ model, effort, limits }: SessionLineParts): string {
	const limitParts = limits.flatMap(({ kind, percentUsed }) => {
		const label = limitLabelOf(kind)

		return label === null ? [] : [{ kind, text: `${label} ${Math.round(percentUsed)}%` }]
	})
	const weekFirst = [...limitParts.filter(part => part.kind === 'seven_day'), ...limitParts.filter(part => part.kind !== 'seven_day')]
	const parts = [model, effort, ...weekFirst.map(part => part.text)]

	return parts.filter(part => part !== undefined && part !== '').join(' · ')
}
