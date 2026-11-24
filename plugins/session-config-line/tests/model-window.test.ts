import { describe, expect, test, tier } from 'claude-code/testing'

import { contextWithLabeledWindowOf, labeledWindowTokensOf, windowTokensOfLabel } from '../hooks/model-window.js'

tier('user')

describe('windowTokensOfLabel', () => {
	test('reads a window written in thousands or millions at the end of the label', async () => {
		expect(windowTokensOfLabel('GLM 5.3 [500k]')).toBe(500_000)
		expect(windowTokensOfLabel('Kimi K3.1 Pro [1m]')).toBe(1_000_000)
		expect(windowTokensOfLabel('Kimi K3.1 Pro [1.5M] ')).toBe(1_500_000)
	})

	test('gives no window for a label without the suffix or with a malformed one', async () => {
		expect(windowTokensOfLabel('GLM 5.3')).toBe(null)
		expect(windowTokensOfLabel('GLM 5.3 [500]')).toBe(null)
		expect(windowTokensOfLabel('GLM 5.3 [big]')).toBe(null)
		expect(windowTokensOfLabel('GLM 5.3 [0k]')).toBe(null)
		expect(windowTokensOfLabel('GLM [500k] 5.3')).toBe(null)
	})
})

describe('labeledWindowTokensOf', () => {
	const modelPicker = {
		options: [{ model: 'z-ai/glm-5.3', label: 'GLM 5.3 [500k]' }, { model: 'no-label-model' }, 'not a row'],
	}

	test('finds the row of the session model, whatever the letter case of its ID', async () => {
		expect(labeledWindowTokensOf(modelPicker, 'Z-AI/GLM-5.3')).toBe(500_000)
	})

	test('gives no window for a model without a labeled row or for settings of another shape', async () => {
		expect(labeledWindowTokensOf(modelPicker, 'claude-fable-5-2')).toBe(null)
		expect(labeledWindowTokensOf(modelPicker, 'no-label-model')).toBe(null)
		expect(labeledWindowTokensOf(undefined, 'z-ai/glm-5.3')).toBe(null)
		expect(labeledWindowTokensOf({ options: 'none' }, 'z-ai/glm-5.3')).toBe(null)
	})
})

describe('contextWithLabeledWindowOf', () => {
	const context = { usedTokens: 100_000, windowTokens: 1_000_000, compactTokens: 33_000, bufferTokens: 20_000 }

	test('keeps the context as it is when the label gives no window', async () => {
		expect(contextWithLabeledWindowOf(context, null)).toEqual(context)
	})

	test('assumes a window of one million tokens when neither the label nor Claude Code gives one', async () => {
		const unknownWindowContext = { usedTokens: 100_000, windowTokens: 0, compactTokens: 0, bufferTokens: 0 }

		expect(contextWithLabeledWindowOf(unknownWindowContext, null)).toEqual({ usedTokens: 100_000, windowTokens: 1_000_000, compactTokens: 0, bufferTokens: 0 })
		expect(contextWithLabeledWindowOf(unknownWindowContext, 500_000)).toEqual({ usedTokens: 100_000, windowTokens: 500_000, compactTokens: 0, bufferTokens: 0 })
	})

	test('uses the labeled window, keeps the auto-compact point where it was, and fits the buffer inside the red part', async () => {
		expect(contextWithLabeledWindowOf(context, 500_000)).toEqual({ usedTokens: 100_000, windowTokens: 500_000, compactTokens: 0, bufferTokens: 0 })
		expect(contextWithLabeledWindowOf(context, 980_000)).toEqual({ usedTokens: 100_000, windowTokens: 980_000, compactTokens: 13_000, bufferTokens: 13_000 })
	})
})
