export type ContextReading = {
	usedTokens: number | null
	windowTokens: number
	bufferTokens: number
}

export type LimitReading = {
	kind: string
	percentUsed: number
}

export type AgentConfig = {
	model: string
	effort: string | null
}

declare module 'claude-code' {
	interface PluginState {
		'session-config-line': {
			context: ContextReading
			model: string
			effort: string
			limits: LimitReading[]
			agent: StateFamily<AgentConfig>
		}
	}
}
