import type { SavedStamp } from './stamp-line.js'

export function gutterLabelOf(ms: number, nowMs: number, zone: string): string {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone: zone,
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hourCycle: 'h23',
		timeZoneName: 'short',
	}).formatToParts(ms)
	const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value ?? ''
	const clock = `${part('hour')}:${part('minute')}:${part('second')} ${part('timeZoneName')}`

	if (dayKeyOf(ms, zone) === dayKeyOf(nowMs, zone)) return clock

	return `${part('month')} ${part('day')} ${clock}`
}

export function savedGutterLabelOf(saved: SavedStamp, nowMs: number, zone: string): string {
	const clock = `${saved.clock} ${saved.zoneName}`
	const today = new Intl.DateTimeFormat('en-US', { timeZone: zone, month: 'short', day: 'numeric', year: 'numeric' })
		.formatToParts(nowMs)
	const todayPart = (type: Intl.DateTimeFormatPartTypes) => today.find(p => p.type === type)?.value ?? ''
	const isSavedToday =
		saved.month === todayPart('month') && saved.day === Number(todayPart('day')) && saved.year === Number(todayPart('year'))

	if (isSavedToday) return clock

	return `${saved.month} ${saved.day} ${clock}`
}

function dayKeyOf(ms: number, zone: string): string {
	return new Intl.DateTimeFormat('en-CA', { timeZone: zone, dateStyle: 'short' }).format(ms)
}
