import type { ApiContentBlock, SessionAppendInput } from 'claude-code'

export const INSTANT = Date.UTC(2026, 8, 20, 19, 3, 5)
export const CHICAGO_LINE = 'Current date and time: Sun Sep 20 2026 14:03:05 CDT | Timezone: America/Chicago (UTC-05:00)'
export const DATE_LINE_PATTERN =
	/^Current date and time: [A-Z][a-z]{2} [A-Z][a-z]{2} \d{1,2} \d{4} \d{2}:\d{2}:\d{2} \S+ \| Timezone: \S+ \(UTC[+-]\d{2}:\d{2}\)$/
export const RESPONSE_STAMP_LINE_PATTERN =
	/^\[Response time: [A-Z][a-z]{2} [A-Z][a-z]{2} \d{1,2} \d{4} \d{2}:\d{2}:\d{2} \S+\]$/
export const GUTTER_TODAY_PATTERN = /^\d{2}:\d{2}:\d{2} \S+$/

export function textBlock(text: string): ApiContentBlock {
	return { type: 'text', text }
}

export function responseRowOf(uuid: string, content: ApiContentBlock[]): SessionAppendInput {
	return {
		door: 'response',
		origin: { kind: 'model', model: 'test-model' },
		uuid,
		message: { type: 'assistant', role: 'assistant', content },
	}
}

export function promptRowOf(uuid: string, text: string): SessionAppendInput {
	return {
		door: 'prompt',
		origin: { kind: 'composer' },
		uuid,
		message: { type: 'user', role: 'user', content: [textBlock(text)] },
	}
}
