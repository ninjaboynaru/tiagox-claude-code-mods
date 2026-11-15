import type { RenderPropsOf } from 'claude-code'
import { describe, expect, mock, test, tier } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'

import { machineZone } from '../hooks/date-line.js'
import { ASSISTANT_GUTTER_COLOR, USER_GUTTER_COLOR } from '../hooks/gutter.js'
import { gutterLabelOf } from '../hooks/gutter-label.js'
import { engineRowOf } from './engine-row.js'
import { GUTTER_TODAY_PATTERN, INSTANT, promptRowOf, responseRowOf, textBlock } from './fixtures.js'

tier('user')

const USER_PROPS: RenderPropsOf['UserMessage'] = { text: 'hello', origin: { kind: 'composer' }, isExpanded: false }
const ASSISTANT_PROPS: RenderPropsOf['AssistantMessage'] = { text: 'Done.', isFirstOfReply: true }
const SAVED_STAMP_LINE = '[Response time: Fri Nov 13 2026 09:15:30 CST]'
const SAVED_SENT_LINE = '[Sent time: Fri Nov 13 2026 09:15:30 CST]'

describe('the gutter', () => {
	test('a user row shows the time its prompt was appended', async ($, on) => {
		mock.clock(on, { now: INSTANT })
		on('ui.render', engineRowOf)
		await $.session.append(promptRowOf('p1', 'hello'))

		const ui = await $.ui.mount({
			plugin: 'prompt-timestamp',
			surface: 'terminal',
			component: 'UserMessage',
			requestId: 'p1',
			props: USER_PROPS,
		})

		expect((await ui.find({ type: 'Text', text: GUTTER_TODAY_PATTERN }))?.text).toBe(
			gutterLabelOf(INSTANT, INSTANT, machineZone()),
		)
		expect((await ui.find({ type: 'Text', text: /engine/ }))?.text).toBe('engine')
	})

	test('an assistant row shows its time and hides the stamp line from the engine row', async ($, on) => {
		mock.clock(on, { now: INSTANT })
		const seenTexts: string[] = []
		on('ui.render', ($, e) => {
			if (e.component === 'AssistantMessage') seenTexts.push(e.props.text)

			return engineRowOf($, e)
		})
		await $.session.append(responseRowOf('r1', [textBlock('Done.')]))

		const ui = await $.ui.mount({
			plugin: 'prompt-timestamp',
			surface: 'terminal',
			component: 'AssistantMessage',
			requestId: 'r1',
			props: { ...ASSISTANT_PROPS, text: `Done.\n\n${SAVED_STAMP_LINE}` },
		})

		expect((await ui.find({ type: 'Text', text: GUTTER_TODAY_PATTERN }))?.text).toBe(
			gutterLabelOf(INSTANT, INSTANT, machineZone()),
		)
		expect(seenTexts.at(-1)).toBe('Done.')
	})
})

describe('the gutter color', () => {
	test('a user row stamp is blue and an assistant row stamp is red', async ($, on) => {
		mock.clock(on, { now: INSTANT })
		on('ui.render', engineRowOf)
		await $.session.append(promptRowOf('p1', 'hello'))
		await $.session.append(responseRowOf('r1', [textBlock('Done.')]))

		const userUi = await $.ui.mount({
			plugin: 'prompt-timestamp',
			surface: 'terminal',
			component: 'UserMessage',
			requestId: 'p1',
			props: USER_PROPS,
		})
		const assistantUi = await $.ui.mount({
			plugin: 'prompt-timestamp',
			surface: 'terminal',
			component: 'AssistantMessage',
			requestId: 'r1',
			props: ASSISTANT_PROPS,
		})

		expect((await userUi.find({ type: 'Text', text: GUTTER_TODAY_PATTERN }))?.props.color).toBe(USER_GUTTER_COLOR)
		expect((await assistantUi.find({ type: 'Text', text: GUTTER_TODAY_PATTERN }))?.props.color).toBe(ASSISTANT_GUTTER_COLOR)
	})
})

describe('a row with no recorded time, as when a session is resumed', () => {
	const mountSavedRow = ($: Engine, text: string, requestId: string) =>
		$.ui.mount({
			plugin: 'prompt-timestamp',
			surface: 'terminal',
			component: 'AssistantMessage',
			requestId,
			props: { ...ASSISTANT_PROPS, text },
		})

	test('shows the saved clock time and zone as written, with the date for an earlier day', async ($, on) => {
		mock.clock(on, { now: Date.UTC(2026, 10, 14, 12, 0, 0) })
		on('ui.render', engineRowOf)

		const ui = await mountSavedRow($, `Done.\n\n${SAVED_STAMP_LINE}`, 'saved')

		expect((await ui.find({ type: 'Text', text: /09:15:30/ }))?.text).toBe('Nov 13 09:15:30 CST')
	})

	test('draws a blank gutter and leaves the text alone when the saved line is malformed', async ($, on) => {
		mock.clock(on, { now: INSTANT })
		on('ui.render', engineRowOf)
		const malformedLines = [
			'[Response time: Fri Nov 13 2026 09:15:30]',
			'[Response time: Fri Nov 99 2026 09:15:30 CST]',
			'[Response time: Fri Nov 13 2026 25:15:30 CST]',
			'[Response time: Fri Nov 13 2026 09:15:30 CST] and more',
		]

		for (const malformedLine of malformedLines) {
			const ui = await mountSavedRow($, `Done.\n\n${malformedLine}`, malformedLine)

			expect(await ui.find({ type: 'Text', text: /\d{2}:\d{2}:\d{2}/ })).toBeUndefined()
			expect((await ui.find({ type: 'Text', text: /engine/ }))?.text).toBe('engine')
		}
	})

	test('a user row shows the saved sent time and hides the line from the engine row', async ($, on) => {
		mock.clock(on, { now: Date.UTC(2026, 10, 14, 12, 0, 0) })
		const seenTexts: string[] = []
		on('ui.render', ($, e) => {
			if (e.component === 'UserMessage') seenTexts.push(e.props.text)

			return engineRowOf($, e)
		})

		const ui = await $.ui.mount({
			plugin: 'prompt-timestamp',
			surface: 'terminal',
			component: 'UserMessage',
			requestId: 'saved-user',
			props: { ...USER_PROPS, text: `hello\n\n${SAVED_SENT_LINE}` },
		})

		expect((await ui.find({ type: 'Text', text: /09:15:30/ }))?.text).toBe('Nov 13 09:15:30 CST')
		expect(seenTexts.at(-1)).toBe('hello')
	})
})
