import type { On } from 'claude-code'

import { drawWithConfigLines } from './draw.js'
import { rememberEffort, rememberModel, rememberUsage } from './state.js'

export function register(on: On): void {
	on('session.start', async ($, e, next) => {
		const result = await next(e)
		await rememberUsage($, await $.session.usage())
		await rememberModel($)

		return result
	}).catch(($, e, next) => next(e))

	on('session.measure', async ($, e, next) => {
		const result = await next(e)
		await rememberUsage($, e)

		return result
	}).catch(($, e, next) => next(e))

	on('session.compact', async ($, e, next) => {
		const result = await next(e)
		await rememberUsage($, await $.session.usage())

		return result
	}).catch(($, e, next) => next(e))

	on('classic.PostModelSwitch', async ($, e, next) => {
		await rememberModel($)

		return next(e)
	}).catch(($, e, next) => next(e))

	on('turn.step', async function* ($, e, next) {
		if (e.agentId === undefined && e.effort !== undefined) await rememberEffort($, String(e.effort))

		return yield* next(e)
	}).catch(async function* ($, e, next) {
		return yield* next(e)
	})

	on('ui.render', { component: 'PromptHint', surface: 'terminal' }, async ($, e, next) => {
		return drawWithConfigLines($, e, await next(e))
	}).catch(($, e, next) => next(e))
}
