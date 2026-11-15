import type { ApiContentBlock, On, SessionAppendInput, ToolCallArgs } from 'claude-code'
import { mock, type Engine, type MockSession } from 'claude-code/testing'

export function toolResultRowOf(
	content: string | ApiContentBlock[],
	options: { agentId?: string; isError?: boolean; toolUseId?: string } = {},
): SessionAppendInput {
	return {
		door: 'tool-result',
		origin: { kind: 'tool', tool: 'Read' },
		uuid: 'row-1',
		...(options.agentId === undefined ? {} : { agentId: options.agentId }),
		message: {
			type: 'user',
			role: 'user',
			content: [{ type: 'tool_result', tool_use_id: options.toolUseId ?? 'toolu_1', content, is_error: options.isError ?? false }],
		},
	}
}

/** The `content` of the tool_result block of the last row stored. */
export function storedResultOf(session: MockSession): unknown {
	return session.appended().at(-1)?.message.content[0]?.content
}

/**
 * Answers every `tool.call` with an empty result, beneath the plugin, and
 * remembers the id the engine gave the last call: the id its result row names.
 */
export function toolCallsOn(on: On): { lastId: () => string } {
	let lastId = ''

	on('tool.call', ($, e) => {
		lastId = e.tool_use_id

		return { result: '' as never }
	})

	return { lastId: () => lastId }
}

export type World = { session: MockSession; calls: ReturnType<typeof toolCallsOn> }

export function worldOn(on: On): World {
	return { session: mock.session(on), calls: toolCallsOn(on) }
}

/** Runs a tool call with this input, then appends its result as the session would, and returns what was stored. */
export async function shownAfter(
	$: Engine,
	world: World,
	input: ToolCallArgs,
	content: string | ApiContentBlock[],
	options: { agentId?: string; isError?: boolean } = {},
): Promise<unknown> {
	await $.tool.call(input)
	await $.session.append(toolResultRowOf(content, { ...options, toolUseId: world.calls.lastId() }))

	return storedResultOf(world.session)
}

export const read = (file_path: string): ToolCallArgs => ({ tool: 'Read', file_path })
export const bash = (command: string): ToolCallArgs => ({ tool: 'Bash', command })
