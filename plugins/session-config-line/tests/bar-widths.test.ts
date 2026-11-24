import { describe, expect, test, tier } from 'claude-code/testing'

import { barWidthsOf, compactPercentOf, percentTextOf, percentUsedOf, windowLabelOf } from '../hooks/bar-widths.js'

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

describe('windowLabelOf', () => {
	test('writes the window in thousands below one million and in millions from there', async () => {
		expect(windowLabelOf(200_000)).toBe('[200k]')
		expect(windowLabelOf(500_000)).toBe('[500k]')
		expect(windowLabelOf(1_000_000)).toBe('[1m]')
		expect(windowLabelOf(1_500_000)).toBe('[1.5m]')
		expect(windowLabelOf(2_000_000)).toBe('[2m]')
	})

	test('reads a power-of-two window just above a whole million as that million', async () => {
		expect(windowLabelOf(1_048_576)).toBe('[1m]')
		expect(windowLabelOf(2_097_152)).toBe('[2m]')
	})

	test('gives no label for a window of zero', async () => {
		expect(windowLabelOf(0)).toBe('')
	})
})

describe('compactPercentOf', () => {
	test('gives the point in the window where auto-compaction starts', async () => {
		expect(compactPercentOf(200_000, 33_000)).toBe(84)
		expect(compactPercentOf(1_000_000, 400_000)).toBe(60)
	})

	test('gives no point while auto-compact is off or the window is unknown', async () => {
		expect(compactPercentOf(200_000, 0)).toBeNull()
		expect(compactPercentOf(0, 33_000)).toBeNull()
	})
})

describe('percentTextOf', () => {
	test('writes the used and auto-compact percentages before the window size', async () => {
		expect(percentTextOf(120_000, 1_000_000, 400_000)).toBe('12%/60% [1m]')
	})

	test('writes only the used percentage while auto-compact is off', async () => {
		expect(percentTextOf(120_000, 1_000_000, 0)).toBe('12% [1m]')
	})
})
