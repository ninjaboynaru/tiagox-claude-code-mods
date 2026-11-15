import type { ApiContentBlock } from 'claude-code'

import { clockStampOf } from './date-line.js'

export type StampLabel = 'Response time' | 'Sent time'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function trailingStampPatternOf(label: StampLabel): RegExp {
	return new RegExp(
		String.raw`(?:^|\n)[ \t]*\[${label}: [A-Z][a-z]{2} ([A-Z][a-z]{2}) (\d{1,2}) (\d{4}) (\d{2}):(\d{2}):(\d{2}) ([A-Za-z0-9+:-]{1,10})\]\s*$`,
	)
}

const TRAILING_STAMP_PATTERNS: Record<StampLabel, RegExp> = {
	'Response time': trailingStampPatternOf('Response time'),
	'Sent time': trailingStampPatternOf('Sent time'),
}

export type SavedStamp = {
	month: string
	day: number
	year: number
	clock: string
	zoneName: string
}

export function stampLineOf(label: StampLabel, ms: number, zone: string): string {
	return `[${label}: ${clockStampOf(ms, zone)}]`
}

export function hasStamp(label: StampLabel, text: string): boolean {
	return TRAILING_STAMP_PATTERNS[label].test(text)
}

export function withoutStamp(label: StampLabel, text: string): string {
	return text.replace(TRAILING_STAMP_PATTERNS[label], '').trimEnd()
}

export function withStamp(label: StampLabel, text: string, stampLine: string): string {
	const unstamped = withoutStamp(label, text)
	if (unstamped === '') return stampLine

	return `${unstamped}\n\n${stampLine}`
}

export function savedStampOf(label: StampLabel, text: string): SavedStamp | null {
	const match = TRAILING_STAMP_PATTERNS[label].exec(text)
	if (match === null) return null

	const [, month = '', dayText = '', yearText = '', hourText = '', minuteText = '', secondText = '', zoneName = ''] = match
	const day = Number(dayText)
	const isRealMonth = MONTH_NAMES.includes(month)
	const isRealDay = day >= 1 && day <= 31
	const isRealClock = Number(hourText) <= 23 && Number(minuteText) <= 59 && Number(secondText) <= 59
	if (!isRealMonth || !isRealDay || !isRealClock) return null

	return { month, day, year: Number(yearText), clock: `${hourText}:${minuteText}:${secondText}`, zoneName }
}

export function stampLastTextBlock(content: ApiContentBlock[], label: StampLabel, stampLine: string): ApiContentBlock[] | null {
	const lastTextIndex = content.findLastIndex(block => block.type === 'text')
	const lastTextBlock = content[lastTextIndex]
	if (lastTextBlock === undefined || typeof lastTextBlock.text !== 'string') return null

	const stampedText = withStamp(label, lastTextBlock.text, stampLine)

	return content.map((block, index) => (index === lastTextIndex ? { ...block, text: stampedText } : block))
}
