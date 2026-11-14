import type { On } from 'claude-code'

import { dateLineOf, machineZone } from './date-line.js'
import { drawWithGutter, recordedGutterLabelOf, savedGutterLabelOfText } from './gutter.js'
import { hasResponseStamp, responseStampLineOf, stampLastTextBlock, withoutResponseStamp } from './response-stamp.js'
import { rememberRowTime } from './row-times.js'

export function register(on: On): void {
	on('prompt.submit', async ($, e, next) => {
		const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
		const line = dateLineOf(await $.clock.now(), zone)

		return next({ ...e, context: [...(e.context ?? []), line] })
	})

	on('session.append', { door: 'prompt' }, async ($, e, next) => {
		if (e.agentId === undefined) await rememberRowTime($, e.uuid, await $.clock.now())

		return next(e)
	}).catch(($, e, next) => next(e))

	on('session.append', { door: 'response' }, async ($, e, next) => {
		if (e.agentId !== undefined) return next(e)

		const nowMs = await $.clock.now()
		const stampedContent = stampLastTextBlock(e.message.content, responseStampLineOf(nowMs, machineZone()))
		if (stampedContent === null) return next(e)

		await rememberRowTime($, e.uuid, nowMs)

		return next({ ...e, message: { ...e.message, content: stampedContent } })
	}).catch(($, e, next) => next(e))

	on('ui.render', { component: 'UserMessage', surface: 'terminal' }, async ($, e, next) => {
		const label = await recordedGutterLabelOf($, e.requestId)

		return drawWithGutter($, e, await next(e), label)
	})

	on('ui.render', { component: 'AssistantMessage', surface: 'terminal' }, async ($, e, next) => {
		const label = (await recordedGutterLabelOf($, e.requestId)) ?? (await savedGutterLabelOfText($, e.props.text))
		const canHideStampLine = label !== null && hasResponseStamp(e.props.text)
		const row = canHideStampLine
			? await next({ ...e, props: { ...e.props, text: withoutResponseStamp(e.props.text) } })
			: await next(e)

		return drawWithGutter($, e, row, label)
	})
}
