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

export function drawWithGutter($: EngineInterface, e: RowInput, row: RenderElement, label: string | null, color: string): RenderElement {
	if (label === null) return row

	const { Box, Text } = $.ui.resolve(e)
	const isContinuationBlock = e.component === 'AssistantMessage' && !e.props.isFirstOfReply
	const rowTopMargin = isContinuationBlock ? 0 : 1

	return (
		<Box flexDirection="column">
			<Box marginTop={rowTopMargin}>
				<Text color={color}>
					{label}
				</Text>
			</Box>
			<Box marginTop={-rowTopMargin}>{row}</Box>
		</Box>
	)
}
