import type { StateDollar } from 'claude-code'

const at = { plugin: 'prompt-timestamp', key: 'at' } as const

export async function rememberRowTime($: StateDollar, id: string, ms: number): Promise<void> {
	await $.state.set({ ...at, id }, ms)
}

export async function rowTimeOf($: StateDollar, id: string): Promise<number | null> {
	const { value } = await $.state.get({ ...at, id })

	return value ?? null
}
