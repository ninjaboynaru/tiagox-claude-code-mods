import type { ApiContentBlock, On } from 'claude-code'

import { namesSecretsFile } from './files.js'
import { redactedSecretsFileLines, redactedText } from './redact.js'

type TextRedactor = (text: string) => string

export function register(on: On): void {
	// The ids of the tool calls whose input names a secrets file, until their results arrive.
	const callsNamingSecretsFile = new Set<string>()

	on('tool.call', async ($, e, next) => {
		if (namesSecretsFile(stringsDeep(e).join('\n'))) {
			callsNamingSecretsFile.add(e.tool_use_id)
		}

		return next(e)
	}).catch(($, e, next) => next(e))

	on('session.append', { door: 'tool-result' }, async ($, e, next) => {
		const blocks = e.message.content
		const toolUseIds = blocks.flatMap(block => (block.type === 'tool_result' && typeof block.tool_use_id === 'string' ? [block.tool_use_id] : []))
		const isNamedByCall = toolUseIds.some(toolUseId => callsNamingSecretsFile.has(toolUseId))
		const isNamedByResult = namesSecretsFile(stringsDeep(blocks).join('\n'))

		for (const toolUseId of toolUseIds) {
			callsNamingSecretsFile.delete(toolUseId)
		}

		if (!isNamedByCall && !isNamedByResult) {
			return next(e)
		}

		// A call that names the file shows the whole result of it. A result that only mentions one is redacted only where it shows one.
		const redact = isNamedByCall ? redactedText : redactedSecretsFileLines
		const redactedBlocks = blocks.map(block => redactedBlock(block, redact))

		return next({ ...e, message: { ...e.message, content: redactedBlocks } })
	}).catch(($, e, next) => next(e))
}

/** The block with the text it shows the agent redacted: a text block's text, and a tool_result's content. */
function redactedBlock(block: ApiContentBlock, redact: TextRedactor): ApiContentBlock {
	if (block.type === 'text' && typeof block.text === 'string') {
		return { ...block, text: redact(block.text) }
	}

	if (block.type === 'tool_result') {
		return { ...block, content: redactedContent(block.content, redact) }
	}

	return block
}

function redactedContent(content: unknown, redact: TextRedactor): unknown {
	if (typeof content === 'string') {
		return redact(content)
	}

	if (Array.isArray(content)) {
		return content.map(item => (isApiContentBlock(item) ? redactedBlock(item, redact) : item))
	}

	return content
}

function isApiContentBlock(value: unknown): value is ApiContentBlock {
	return isPlainObject(value) && typeof value.type === 'string'
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	if (value === null || typeof value !== 'object') {
		return false
	}

	const prototype: unknown = Object.getPrototypeOf(value)

	return prototype === Object.prototype || prototype === null
}

function stringsDeep(value: unknown): string[] {
	if (typeof value === 'string') {
		return [value]
	}

	if (Array.isArray(value)) {
		return value.flatMap(stringsDeep)
	}

	if (isPlainObject(value)) {
		return Object.values(value).flatMap(stringsDeep)
	}

	return []
}
