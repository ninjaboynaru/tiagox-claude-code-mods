import type { SessionContextBreakdown } from 'claude-code'
import { describe, expect, test, tier } from 'claude-code/testing'

import { engineRowOf } from './engine-row.js'

tier('user')

const BREAKDOWN = {
	isAutoCompactEnabled: true,
	autoCompactThreshold: 167_000,
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

describe('the usage limits', () => {
	test('are left out while the session model is not a Claude model', async ($, on) => {
		on('ui.render', engineRowOf)
		on('session.start', () => ({ cwd: '/' }))
		on('session.model', () => ({ value: 'moonshotai/Kimi-K3.1-Pro' }))
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

		expect(texts[3]?.text).toBe(' 50% · moonshotai/Kimi-K3.1-Pro')
	})
})

describe('the context window', () => {
	test('comes from the model picker label of the session model when the label ends with one', async ($, on) => {
		on('ui.render', engineRowOf)
		on('session.start', () => ({ cwd: '/' }))
		on('session.model', () => ({ value: 'z-ai/glm-5.3' }))
		on('settings.read', () => ({ value: { modelPicker: { options: [{ model: 'z-ai/glm-5.3', label: 'GLM 5.3 [500k]' }] } } }))
		on('session.usage', () => ({
			value: {
				startedAt: 0,
				context: { tokens: 100_000, window: 1_000_000, percent: 10, breakdown: BREAKDOWN },
				rateLimits: [],
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

		expect(texts.map((text) => text.text)).toEqual(['▬'.repeat(4), '▬'.repeat(3), '▬'.repeat(13), ' 20% · z-ai/glm-5.3', 'engine'])
	})
})

describe('the band above the prompt', () => {
	test('draws a subagent model and effort only while that subagent is in view', async ($, on) => {
		on('ui.render', engineRowOf)
		on('turn.step', async function* () {
			return { turnId: 't1', index: 0, answer: '', toolUses: [], stopReason: 'end_turn', usage: null }
		})
		for await (const _chunk of $.turn.step({
			turnId: 't1',
			index: 0,
			model: 'claude-sonnet-5-5',
			effort: 'high',
			messageCount: 1,
			agentId: 'agent-1',
		})) {
			// The stream is read to its end so the mod's hook runs.
		}
		const band = {
			plugin: 'session-config-line',
			surface: 'terminal',
			component: 'AbovePrompt',
		} as const
		const bandProps = { hasSurvey: false, isCollapsed: false, isWorking: false, maxRows: 10, bodyColumns: 80, scroll: { offset: 0, bodyRows: 9 } }

		const inView = await $.ui.mount({ ...band, props: { ...bandProps, view: { agentId: 'agent-1' } } })
		const mainView = await $.ui.mount({ ...band, props: { ...bandProps, view: {} } })

		expect((await inView.findAll({ type: 'Text' })).map((text) => text.text)).toEqual(['engine', 'claude-sonnet-5-5 · high'])
		expect((await mainView.findAll({ type: 'Text' })).map((text) => text.text)).toEqual(['engine'])
	})
})
