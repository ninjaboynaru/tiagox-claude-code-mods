export type RowStamp = number

declare module 'claude-code' {
	interface PluginState {
		'prompt-timestamp': { at: StateFamily<RowStamp> }
	}
}
