import type { EngineInterface, RenderElement, RenderInputOf } from 'claude-code'

import { machineZone } from './date-line.js'
import { gutterLabelOf, savedGutterLabelOf } from './gutter-label.js'
import { rowTimeOf } from './row-times.js'
import { savedStampOf, type StampLabel } from './stamp-line.js'

type RowInput = RenderInputOf<'UserMessage', 'terminal'> | RenderInputOf<'AssistantMessage', 'terminal'>

export const USER_GUTTER_COLOR = '#a6c8f4'
export const ASSISTANT_GUTTER_COLOR = '#f4a6a6'

export async function recordedGutterLabelOf($: EngineInterface, rowId: string): Promise<string | null> {
	const rowTimeMs = await rowTimeOf($, rowId)
	if (rowTimeMs === null) return null

	return gutterLabelOf(rowTimeMs, await $.clock.now(), machineZone())
}

export async function savedGutterLabelOfText($: EngineInterface, label: StampLabel, text: string): Promise<string | null> {
	const saved = savedStampOf(label, text)
	if (saved === null) return null

	return savedGutterLabelOf(saved, await $.clock.now(), machineZone())
}

export async function drawWithGutter($: EngineInterface, e: RowInput, row: RenderElement, label: string | null, color: string): Promise<RenderElement> {
	const { Box, Text } = $.ui.resolve(e)
	const nowMs = await $.clock.now()
	const blankLabel = gutterLabelOf(nowMs, nowMs, machineZone())
	const shownLabel = label ?? ''
	const columnCount = Math.max(blankLabel.length, shownLabel.length) + 1
	const isContinuationBlock = e.component === 'AssistantMessage' && !e.props.isFirstOfReply

	return (
		<Box flexDirection="row">
			<Box width={columnCount} flexShrink={0} marginTop={isContinuationBlock ? 0 : 1}>
				<Text color={color}>{shownLabel}</Text>
			</Box>
			{row}
		</Box>
	)
}
