export function machineZone(): string {
	return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function clockStampOf(ms: number, zone: string): string {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone: zone,
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hourCycle: 'h23',
		timeZoneName: 'short',
	}).formatToParts(ms)
	const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value ?? ''

	return `${part('weekday')} ${part('month')} ${part('day')} ${part('year')} ${part('hour')}:${part('minute')}:${part('second')} ${part('timeZoneName')}`
}

export function dateLineOf(ms: number, zone: string): string {
	return `Current date and time: ${clockStampOf(ms, zone)} | Timezone: ${zone} (${offsetOf(ms, zone)})`
}

function offsetOf(ms: number, zone: string): string {
	const name = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'longOffset' })
		.formatToParts(ms)
		.find(p => p.type === 'timeZoneName')?.value ?? 'GMT'

	return name === 'GMT' ? 'UTC+00:00' : name.replace('GMT', 'UTC')
}
