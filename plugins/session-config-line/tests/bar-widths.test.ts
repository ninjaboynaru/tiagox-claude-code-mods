import { describe, expect, test, tier } from 'claude-code/testing'

import { barWidthsOf, percentUsedOf } from '../hooks/bar-widths.js'

tier('user')

describe('barWidthsOf', () => {
	test('splits the bar into used, free, and auto-compact cells that add up to 20', async () => {
		expect(barWidthsOf(100_000, 200_000, 33_000)).toEqual({ used: 10, free: 7, compact: 3 })
		expect(barWidthsOf(100_000, 200_000, 1_000)).toEqual({ used: 10, free: 9, compact: 1 })
		expect(barWidthsOf(100_000, 200_000, 0)).toEqual({ used: 10, free: 10, compact: 0 })
	})

	test('a used part reaching into the auto-compact part covers it and leaves the rest red', async () => {
		expect(barWidthsOf(170_000, 200_000, 40_000)).toEqual({ used: 17, free: 0, compact: 3 })
	})

	test('no token count yet draws no used part and shows 0%', async () => {
		expect(barWidthsOf(null, 200_000, 33_000)).toEqual({ used: 0, free: 17, compact: 3 })
		expect(percentUsedOf(null, 200_000)).toBe(0)
	})
})
