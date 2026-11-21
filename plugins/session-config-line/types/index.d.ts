export type ContextReading = {
	usedTokens: number | null
	windowTokens: number
	compactTokens: number
}

export type LimitReading = {
	kind: string
	percentUsed: number
}

export type AgentConfig = {
	model: string
	effort: string | null
}

export type LabeledWindowReading = {
	tokens: number | null
}

declare module 'claude-code' {
	interface PluginState {
		'session-config-line': {
			context: ContextReading
			model: string
			effort: string
			limits: LimitReading[]
			labeledWindow: LabeledWindowReading
			agent: StateFamily<AgentConfig>
		}
	}
}
