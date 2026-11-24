import type { EngineInterface, RenderElement, RenderInputOf } from 'claude-code'

import type { ContextReading } from '../types/index.js'
import { barWidthsOf, percentTextOf } from './bar-widths.js'
import { sessionLineOf } from './session-line.js'
import { recalledAgent, recalledConfigLines } from './state.js'

const BAR_GLYPH = '▬'
const USED_COLOR = '#3b6ea5'
const FREE_COLOR = '#c8d6e5'
const BUFFER_COLOR = '#4a4a4a'
const COMPACT_COLOR = '#8b1a1a'

export async function drawWithConfigLines(
	$: EngineInterface,
	e: RenderInputOf<'PromptHint', 'terminal'>,
	hintLine: RenderElement,
): Promise<RenderElement> {
	const { Box, Text } = $.ui.resolve(e)
	const { context, ...sessionParts } = await recalledConfigLines($)
	const sessionLine = sessionLineOf(sessionParts)
	const percentText = context === undefined ? '' : percentTextOf(context.usedTokens, context.windowTokens, context.compactTokens)
	const text = [percentText, sessionLine].filter(part => part !== '').join(' · ')

	return (
		<Box flexDirection="column">
			{text !== '' && (
				<Box marginTop={1}>
					{context !== undefined && drawBar($, e, context)}
					<Text dimColor>{context === undefined ? text : ` ${text}`}</Text>
				</Box>
			)}
			{hintLine}
		</Box>
	)
}

function drawBar(
	$: EngineInterface,
	e: RenderInputOf<'PromptHint', 'terminal'>,
	context: ContextReading,
): RenderElement {
	const { Box, Text } = $.ui.resolve(e)
	const widths = barWidthsOf(context.usedTokens, context.windowTokens, context.compactTokens, context.bufferTokens)

	return (
		<Box>
			<Text color={USED_COLOR}>{BAR_GLYPH.repeat(widths.used)}</Text>
			<Text color={FREE_COLOR}>{BAR_GLYPH.repeat(widths.free)}</Text>
			<Text color={BUFFER_COLOR}>{BAR_GLYPH.repeat(widths.buffer)}</Text>
			<Text color={COMPACT_COLOR}>{BAR_GLYPH.repeat(widths.compact)}</Text>
		</Box>
	)
}

export async function drawWithAgentLine(
	$: EngineInterface,
	e: RenderInputOf<'AbovePrompt', 'terminal'>,
	below: RenderElement,
): Promise<RenderElement> {
	const { agentId } = e.props.view
	if (e.props.hasSurvey || agentId === undefined) return below

	const agent = await recalledAgent($, agentId)
	if (agent === undefined) return below

	const { Box, Text } = $.ui.resolve(e)
	const text = sessionLineOf({ model: agent.model, effort: agent.effort ?? undefined, limits: [] })

	return (
		<Box flexDirection="column">
			{below}
			<Box marginTop={1}>
				<Text dimColor>{text}</Text>
			</Box>
		</Box>
	)
}
