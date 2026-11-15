import type { On } from 'claude-code'

import { dateLineOf, machineZone } from './date-line.js'
import {
	ASSISTANT_GUTTER_COLOR,
	drawWithGutter,
	recordedGutterLabelOf,
	savedGutterLabelOfText,
	userRowGutterColorOf,
} from './gutter.js'
import { rememberRowTime } from './row-times.js'
import { hasStamp, stampLastTextBlock, stampLineOf, withoutAnyStampLine, withoutStamp } from './stamp-line.js'

export function register(on: On): void {
	on('prompt.submit', async ($, e, next) => {
		const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
		const line = dateLineOf(await $.clock.now(), zone)

		return next({ ...e, context: [...(e.context ?? []), line] })
	})

	on('session.append', { door: 'prompt' }, async ($, e, next) => {
		if (e.agentId !== undefined) return next(e)

		const nowMs = await $.clock.now()
		await rememberRowTime($, e.uuid, nowMs)
		const stampedContent = stampLastTextBlock(e.message.content, 'Sent time', stampLineOf('Sent time', nowMs, machineZone()))
		if (stampedContent === null) return next(e)

		return next({ ...e, message: { ...e.message, content: stampedContent } })
	}).catch(($, e, next) => next(e))

	on('session.append', { door: 'response' }, async ($, e, next) => {
		if (e.agentId !== undefined) return next(e)

		const nowMs = await $.clock.now()
		const stampedContent = stampLastTextBlock(
			e.message.content,
			'Response time',
			stampLineOf('Response time', nowMs, machineZone()),
		)
		if (stampedContent === null) return next(e)

		await rememberRowTime($, e.uuid, nowMs)

		return next({ ...e, message: { ...e.message, content: stampedContent } })
	}).catch(($, e, next) => next(e))

	on('prompt.change', { origin: { kind: 'engine' } }, async ($, e, next) => {
		const stripped = withoutAnyStampLine('Sent time', e.text)
		if (stripped !== e.text.trimEnd()) await $.prompt.fill({ text: stripped, mode: 'replace' })

		return next(e)
	}).catch(($, e, next) => next(e))

	on('ui.render', { component: 'UserMessage', surface: 'terminal' }, async ($, e, next) => {
		const label = (await recordedGutterLabelOf($, e.requestId)) ?? (await savedGutterLabelOfText($, 'Sent time', e.props.text))
		const canHideStampLine = label !== null && hasStamp('Sent time', e.props.text)
		const row = canHideStampLine
			? await next({ ...e, props: { ...e.props, text: withoutStamp('Sent time', e.props.text) } })
			: await next(e)

		return drawWithGutter($, e, row, label, userRowGutterColorOf(e.props.origin))
	})

	on('ui.render', { component: 'AssistantMessage', surface: 'terminal' }, async ($, e, next) => {
		const label =
			(await recordedGutterLabelOf($, e.requestId)) ?? (await savedGutterLabelOfText($, 'Response time', e.props.text))
		const canHideStampLine = label !== null && hasStamp('Response time', e.props.text)
		const row = canHideStampLine
			? await next({ ...e, props: { ...e.props, text: withoutStamp('Response time', e.props.text) } })
			: await next(e)

		return drawWithGutter($, e, row, label, ASSISTANT_GUTTER_COLOR)
	})
}
