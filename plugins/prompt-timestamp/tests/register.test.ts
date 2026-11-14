import { describe, expect, mock, test, tier } from 'claude-code/testing'

import { dateLineOf } from '../hooks/date-line.js'
import { CHICAGO_LINE, DATE_LINE_PATTERN, INSTANT, RESPONSE_STAMP_LINE_PATTERN, responseRowOf, textBlock } from './fixtures.js'

tier('user')

describe('dateLineOf', () => {
	test('spells the instant in the zone with a 24-hour clock and the zone offset', async () => {
		expect(dateLineOf(INSTANT, 'America/Chicago')).toBe(CHICAGO_LINE)
		expect(dateLineOf(INSTANT, 'Europe/Berlin')).toBe(
			'Current date and time: Sun Sep 20 2026 21:03:05 GMT+2 | Timezone: Europe/Berlin (UTC+02:00)',
		)
		expect(dateLineOf(INSTANT, 'UTC')).toBe(
			'Current date and time: Sun Sep 20 2026 19:03:05 UTC | Timezone: UTC (UTC+00:00)',
		)
	})

	test('a zone past midnight of the next day rolls the date', async () => {
		expect(dateLineOf(INSTANT, 'Asia/Tokyo')).toBe(
			'Current date and time: Mon Sep 21 2026 04:03:05 GMT+9 | Timezone: Asia/Tokyo (UTC+09:00)',
		)
	})
})

describe('register', () => {
	test('a submitted prompt carries the date line as context', async ($, on) => {
		mock.clock(on, { now: INSTANT })
		on('prompt.submit', ($, e) => ({ text: e.text, context: e.context }))

		const answer = await $.prompt.submit({ text: 'hello', wait: false, origin: { kind: 'sdk' } })

		expect(answer.text).toBe('hello')
		expect(answer.context).toHaveLength(1)
		expect(answer.context?.[0]).toMatch(DATE_LINE_PATTERN)
		expect(answer.context?.[0]).toContain('2026')
	})
})

describe('response stamping', () => {
	test('a response row ends with exactly one stamp line, replacing an imitated one', async ($, on) => {
		mock.clock(on, { now: INSTANT })
		const session = mock.session(on)
		const imitated = 'Done.\n\n[Response time: Mon Jan 1 2024 01:02:03 PST]'

		await $.session.append(responseRowOf('r1', [textBlock(imitated)]))

		const block = session.appended()[0]?.message.content[0]
		const lines = typeof block?.text === 'string' ? block.text.split('\n') : []
		expect(lines.filter(line => line.startsWith('[Response time:'))).toHaveLength(1)
		expect(lines.at(-1)).toMatch(RESPONSE_STAMP_LINE_PATTERN)
		expect(lines.at(-1)).toContain('2026')
		expect(lines[0]).toBe('Done.')
	})
})
