import type { EngineInterface, RenderElement, RenderInputOf } from 'claude-code'

import { machineZone } from './date-line.js'
import { gutterLabelOf, savedGutterLabelOf } from './gutter-label.js'
import { savedStampOf } from './response-stamp.js'
import { rowTimeOf } from './row-times.js'

type RowInput = RenderInputOf<'UserMessage', 'terminal'> | RenderInputOf<'AssistantMessage', 'terminal'>

export async function recordedGutterLabelOf($: EngineInterface, rowId: string): Promise<string | null> {
	const rowTimeMs = await rowTimeOf($, rowId)
	if (rowTimeMs === null) return null

	return gutterLabelOf(rowTimeMs, await $.clock.now(), machineZone())
}

export async function savedGutterLabelOfText($: EngineInterface, text: string): Promise<string | null> {
	const saved = savedStampOf(text)
	if (saved === null) return null

	return savedGutterLabelOf(saved, await $.clock.now(), machineZone())
}

export async function drawWithGutter($: EngineInterface, e: RowInput, row: RenderElement, label: string | null): Promise<RenderElement> {
	const { Box, Text } = $.ui.resolve(e)
	const nowMs = await $.clock.now()
	const blankLabel = gutterLabelOf(nowMs, nowMs, machineZone())
	const shownLabel = label ?? ''
	const columnCount = Math.max(blankLabel.length, shownLabel.length) + 1
	const isContinuationBlock = e.component === 'AssistantMessage' && !e.props.isFirstOfReply

	return (
		<Box flexDirection="row">
			<Box width={columnCount} flexShrink={0} marginTop={isContinuationBlock ? 0 : 1}>
				<Text dimColor>{shownLabel}</Text>
			</Box>
			{row}
		</Box>
	)
}
