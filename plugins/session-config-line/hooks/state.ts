import type { EngineInterface, SessionContextBreakdown, SessionUsage } from 'claude-code'

import type { AgentConfig, ContextReading, LimitReading } from '../types/index.js'
import type { SessionLineParts } from './session-line.js'

const contextRef = { plugin: 'session-config-line', key: 'context' } as const
const modelRef = { plugin: 'session-config-line', key: 'model' } as const
const effortRef = { plugin: 'session-config-line', key: 'effort' } as const
const limitsRef = { plugin: 'session-config-line', key: 'limits' } as const
const agentRef = { plugin: 'session-config-line', key: 'agent' } as const

function bufferTokensOf(breakdown: SessionContextBreakdown | undefined): number {
	if (breakdown === undefined || !breakdown.isAutoCompactEnabled) return 0

	return breakdown.categories.find(category => category.kind === 'buffer')?.tokens ?? 0
}

export async function rememberUsage($: EngineInterface, now: Pick<SessionUsage, 'context' | 'rateLimits'>): Promise<void> {
	const { context: withBreakdown } = await $.session.usage({ breakdown: 'summary' })
	const context: ContextReading = {
		usedTokens: now.context.tokens ?? null,
		windowTokens: now.context.window,
		bufferTokens: bufferTokensOf(withBreakdown.breakdown),
	}
	const limits: LimitReading[] = now.rateLimits.map(({ kind, percentUsed }) => ({ kind, percentUsed }))

	const { value: heldContext } = await $.state.get(contextRef)
	if (JSON.stringify(heldContext) !== JSON.stringify(context)) await $.state.set(contextRef, context)

	const { value: heldLimits } = await $.state.get(limitsRef)
	if (JSON.stringify(heldLimits) !== JSON.stringify(limits)) await $.state.set(limitsRef, limits)
}

export async function rememberModel($: EngineInterface): Promise<void> {
	const model = await $.session.model()
	const { value } = await $.state.get(modelRef)
	if (value !== model) await $.state.set(modelRef, model)
}

export async function rememberEffort($: EngineInterface, effort: string): Promise<void> {
	const { value } = await $.state.get(effortRef)
	if (value !== effort) await $.state.set(effortRef, effort)
}

export async function recalledConfigLines($: EngineInterface): Promise<{ context: ContextReading | undefined } & SessionLineParts> {
	const { value: context } = await $.state.get(contextRef)
	const { value: model } = await $.state.get(modelRef)
	const { value: effort } = await $.state.get(effortRef)
	const { value: limits = [] } = await $.state.get(limitsRef)

	return { context, model, effort, limits }
}

export async function rememberAgent($: EngineInterface, agentId: string, config: AgentConfig): Promise<void> {
	const { value } = await $.state.get({ ...agentRef, id: agentId })
	if (JSON.stringify(value) !== JSON.stringify(config)) await $.state.set({ ...agentRef, id: agentId }, config)
}

export async function recalledAgent($: EngineInterface, agentId: string): Promise<AgentConfig | undefined> {
	const { value } = await $.state.get({ ...agentRef, id: agentId })

	return value
}
