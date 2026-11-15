import type { SessionContextBreakdown } from 'claude-code'
import { describe, expect, test, tier } from 'claude-code/testing'

import { engineRowOf } from './engine-row.js'

tier('user')

const BREAKDOWN = {
	isAutoCompactEnabled: true,
	categories: [{ name: 'Autocompact buffer', tokens: 33_000, color: 'inactive', isDeferred: false, kind: 'buffer' }],
} as SessionContextBreakdown

describe('the prompt hint', () => {
	test('draws one row of bar, percentage and session parts, then the engine hint line', async ($, on) => {
		on('ui.render', engineRowOf)
		on('session.start', () => ({ cwd: '/' }))
		on('session.model', () => ({ value: 'claude-fable-5-2' }))
		on('session.usage', () => ({
			value: {
				startedAt: 0,
				context: { tokens: 100_000, window: 200_000, percent: 50, breakdown: BREAKDOWN },
				rateLimits: [{ kind: 'seven_day', percentUsed: 52 }],
			},
		}))
		await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

		const ui = await $.ui.mount({
			plugin: 'session-config-line',
			surface: 'terminal',
			component: 'PromptHint',
			props: { isDraft: false, isWorking: false, hint: '? for shortcuts' },
		})
		const texts = await ui.findAll({ type: 'Text' })

		expect(texts.map((text) => text.text)).toEqual([
			'▬'.repeat(10),
			'▬'.repeat(7),
			'▬'.repeat(3),
			' 50% · claude-fable-5-2 · Weekly Usage: 52%',
			'engine',
		])
		expect(texts.slice(0, 3).map((text) => text.props.color)).toEqual(['#3b6ea5', '#c8d6e5', '#8b1a1a'])
		expect(texts[3]?.props.dimColor).toBe(true)
	})
})
