import type { EngineInterface, RenderInput } from 'claude-code'

export function engineRowOf($: EngineInterface, e: RenderInput) {
	const { Text } = $.ui.resolve(e)

	return <Text>engine</Text>
}
