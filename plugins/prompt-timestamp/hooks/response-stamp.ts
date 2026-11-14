import type { ApiContentBlock } from 'claude-code'

import { clockStampOf } from './date-line.js'

const TRAILING_STAMP_LINE_PATTERN =
	/(?:^|\n)[ \t]*\[Response time: [A-Z][a-z]{2} ([A-Z][a-z]{2}) (\d{1,2}) (\d{4}) (\d{2}):(\d{2}):(\d{2}) ([A-Za-z0-9+:-]{1,10})\]\s*$/

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export type SavedStamp = {
	month: string
	day: number
	year: number
	clock: string
	zoneName: string
}

export function responseStampLineOf(ms: number, zone: string): string {
	return `[Response time: ${clockStampOf(ms, zone)}]`
}

export function hasResponseStamp(text: string): boolean {
	return TRAILING_STAMP_LINE_PATTERN.test(text)
}

export function withoutResponseStamp(text: string): string {
	return text.replace(TRAILING_STAMP_LINE_PATTERN, '').trimEnd()
}

export function withResponseStamp(text: string, stampLine: string): string {
	const unstamped = withoutResponseStamp(text)
	if (unstamped === '') return stampLine

	return `${unstamped}\n\n${stampLine}`
}

export function savedStampOf(text: string): SavedStamp | null {
	const match = TRAILING_STAMP_LINE_PATTERN.exec(text)
	if (match === null) return null

	const [, month = '', dayText = '', yearText = '', hourText = '', minuteText = '', secondText = '', zoneName = ''] = match
	const day = Number(dayText)
	const isRealMonth = MONTH_NAMES.includes(month)
	const isRealDay = day >= 1 && day <= 31
	const isRealClock = Number(hourText) <= 23 && Number(minuteText) <= 59 && Number(secondText) <= 59
	if (!isRealMonth || !isRealDay || !isRealClock) return null

	return { month, day, year: Number(yearText), clock: `${hourText}:${minuteText}:${secondText}`, zoneName }
}

export function stampLastTextBlock(content: ApiContentBlock[], stampLine: string): ApiContentBlock[] | null {
	const lastTextIndex = content.findLastIndex(block => block.type === 'text')
	const lastTextBlock = content[lastTextIndex]
	if (lastTextBlock === undefined || typeof lastTextBlock.text !== 'string') return null

	const stampedText = withResponseStamp(lastTextBlock.text, stampLine)

	return content.map((block, index) => (index === lastTextIndex ? { ...block, text: stampedText } : block))
}
