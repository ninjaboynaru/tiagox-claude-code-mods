import { isSecretsFileName, namesSecretsFile } from './files.js'

export const REDACTED = '$REDACTED_SECRET_VALUE$'

// `pass` counts only as a whole word, set off by `_` or `-` or the ends of the name, so `BYPASS_CACHE` and `PASSPORT_NUMBER` do not match.
const SECRET_KEY = /authorization|token|key|username|password|passwd|secret|credential|(?:^|[_-])pass(?:$|[_-])/i
const EXPANSION = /\$\{[^}]*\}/

// What a tool puts before a line of a file: the Read tool's `   12→`, `cat -n`'s
// `   12<tab>`, and grep's `path:12:`, `path-12-`, `12:`, and `path:`. The group
// holds the path of a grep line that has a line number.
const LINE_PREFIX = /^(?:\s*\d+[\u2192\t]|((?:[A-Za-z]:)?[^\s:=]*?)[:-]\d+[:-]|\d+[:-]|(?:[A-Za-z]:)?[^\s:=]+:)/
// What a diff puts before a line of a file: `+` or `-` in a unified diff, `<` or `>` in a plain one.
const DIFF_MARK = /^[+\-<>] ?/

// The groups are everything up to the value (with its key name inside), the key name, and the right-hand side.
const DOTENV_LINE = /^(\s*(?:export\s+|declare\s+-x\s+)?([A-Za-z_][\w.-]*)\s*=)(.*)$/
const QUOTED_VALUE = /^"((?:[^"\\]|\\.)*)"|^'([^']*)'/
// The value of an unquoted right-hand side, and what follows it: a ` #comment` or trailing spaces.
const UNQUOTED_VALUE = /^(.*?)(\s+#.*|\s*)$/

const JSON_PAIR = /("([^"\\]+)"\s*:\s*")((?:[^"\\]|\\.)*)"/g
const JSON_STRING = /"((?:[^"\\]|\\.)*)"/g
// An `args` list: its opening, and its body, which holds the strings and whatever sits between them, such as line numbers.
const ARGS_ARRAY = /("args"\s*:\s*\[)((?:[^\]"]|"(?:[^"\\]|\\.)*")*)\]/g
const HEADER_ARG = /^([A-Za-z][A-Za-z0-9_-]*):\s*(\S[\s\S]*)$/
const FLAG_WITH_VALUE = /^(-[^\s=]+)\s+(\S[\s\S]*)$/

// A grep line's own path, before its line number or its colon.
const GREP_PATH_PREFIX = /^((?:[A-Za-z]:)?[^\s:=]*?)(?:[:-]\d+[:-]|:)/
const DIFF_COMMAND = /^diff /
const DIFF_OLD_FILE = /^--- \S/
const DIFF_NEW_FILE = /^\+\+\+ \S/

const URL_TEXT = /[A-Za-z][A-Za-z0-9+.-]*:\/\/[^\s"']+/g
const URL_PASSWORD = /^([A-Za-z][A-Za-z0-9+.-]*:\/\/[^\s/:@]*:)([^\s/@]+)(?=@)/
const QUERY_PARAMETER = /([?&]([^=&#\s]+)=)([^&#\s]*)/g

/**
 * `text` with the value of each secret position replaced by `REDACTED`, in
 * place: the dotenv lines and JSON pairs whose name has a key word, the secret
 * elements of an `args` list, the URL query parameters whose name has a key
 * word, and the password of `scheme://user:password@host`.
 */
export function redactedText(text: string): string {
	const withLinesRedacted = text.replace(/^.*$/gm, redactedLine)

	return withLinesRedacted.replace(ARGS_ARRAY, redactedArgsArray)
}

/**
 * `text` with only the lines that belong to a secrets file redacted: a grep
 * line whose own path is a secrets file, and the lines of a diff section whose
 * header names one. Every other line is left alone.
 */
export function redactedSecretsFileLines(text: string): string {
	let isInSecretsFileSection = false

	return text.replace(/^.*$/gm, line => {
		if (DIFF_COMMAND.test(line) || DIFF_OLD_FILE.test(line)) {
			isInSecretsFileSection = namesSecretsFile(line)

			return line
		}

		if (DIFF_NEW_FILE.test(line)) {
			isInSecretsFileSection = isInSecretsFileSection || namesSecretsFile(line)

			return line
		}

		const [, grepPath = ''] = GREP_PATH_PREFIX.exec(line) ?? []
		const grepBaseName = grepPath.split(/[\\/]/).at(-1) ?? ''
		const isSecretsFileLine = isInSecretsFileSection || isSecretsFileName(grepBaseName)

		return isSecretsFileLine ? redactedLine(line) : line
	})
}

/**
 * The value itself unless it is blank or holds a `${VAR}` expansion, which
 * is a reference and not the secret.
 */
function redactedValue(value: string): string {
	const isBlank = value.trim() === ''
	const hasExpansion = EXPANSION.test(value)

	return isBlank || hasExpansion ? value : REDACTED
}

/**
 * One line, with a line-number, `path:line:`, or diff-mark prefix allowed. A
 * grep line from a file that is not a secrets file is left alone.
 */
function redactedLine(line: string): string {
	const [, grepPath] = LINE_PREFIX.exec(line) ?? []
	const grepBaseName = grepPath?.split(/[\\/]/).at(-1)

	if (grepBaseName && !isSecretsFileName(grepBaseName)) {
		return line
	}

	const body = line.replace(LINE_PREFIX, '').replace(DIFF_MARK, '')
	const prefix = line.slice(0, line.length - body.length)
	const withDotenvRedacted = prefix + redactedDotenvLine(body)
	const withPairsRedacted = withDotenvRedacted.replace(JSON_PAIR, (pair, beforeValue: string, name: string, value: string) =>
		SECRET_KEY.test(name) ? `${beforeValue}${redactedValue(value)}"` : pair,
	)

	return withPairsRedacted.replace(URL_TEXT, redactedUrl)
}

function redactedDotenvLine(line: string): string {
	const [, beforeValue = '', name = '', rightSide = ''] = DOTENV_LINE.exec(line) ?? []

	if (!SECRET_KEY.test(name)) {
		return line
	}

	return beforeValue + redactedDotenvValue(rightSide)
}

/**
 * The right-hand side of a dotenv line with its value replaced: the text inside
 * matching quotes, or for an unquoted value the text before a ` #comment`.
 */
function redactedDotenvValue(rightSide: string): string {
	const value = rightSide.trimStart()
	const leadingSpace = rightSide.slice(0, rightSide.length - value.length)
	const quote = value.slice(0, 1)
	const isQuoted = quote === '"' || quote === "'"
	const quoted = QUOTED_VALUE.exec(value)

	if (quoted) {
		const inside = quoted[1] ?? quoted[2] ?? ''
		const afterClosingQuote = value.slice(quoted[0].length)

		return `${leadingSpace}${quote}${redactedValue(inside)}${quote}${afterClosingQuote}`
	}

	if (isQuoted) {
		// A quoted value that runs over several lines: its first line has no closing quote.
		return `${leadingSpace}${quote}${redactedValue(value.slice(1))}`
	}

	const [, unquoted = '', afterValue = ''] = UNQUOTED_VALUE.exec(value) ?? []

	return `${leadingSpace}${redactedValue(unquoted)}${afterValue}`
}

/** One URL, with its password and the value of each query parameter whose name has a key word replaced. */
function redactedUrl(url: string): string {
	const withPasswordRedacted = url.replace(URL_PASSWORD, (_, beforePassword: string, password: string) => `${beforePassword}${redactedValue(password)}`)

	return withPasswordRedacted.replace(QUERY_PARAMETER, (parameter, beforeValue: string, name: string, value: string) =>
		SECRET_KEY.test(name) ? `${beforeValue}${redactedValue(value)}` : parameter,
	)
}

function redactedArgsArray(_: string, opening: string, body: string): string {
	const args = [...body.matchAll(JSON_STRING)].map(([, arg = '']) => arg)
	const redactedArgs = redactedArgsOf(args)
	let nextPosition = 0
	const redactedBody = body.replace(JSON_STRING, () => `"${redactedArgs[nextPosition++] ?? ''}"`)

	return `${opening}${redactedBody}]`
}

/**
 * The `args` of a server with the secret values replaced: the element after a
 * flag whose name matches (`--api-key`, `VALUE`), or the text after the flag in
 * the same element (`--api-key VALUE`), the text after the colon of a
 * `name: value` header element whose name matches (`Authorization: Bearer
 * <credential>`, with or without the space), and the part after the first `=`
 * of a `name=value` or `--name=value` element whose name matches, or the
 * header after `--name=` when the header's name matches.
 */
function redactedArgsOf(args: readonly string[]): string[] {
	return args.map((arg, position) => {
		const previousArg = args[position - 1]
		const isValueOfFlag = previousArg !== undefined && isFlagWithSeparateValue(previousArg)

		if (isValueOfFlag) {
			return redactedValue(arg)
		}

		const secret = secretValueIn(arg)

		if (secret === undefined) {
			return arg
		}

		// The value always runs to the end of the element.
		return arg.slice(0, arg.length - secret.length) + redactedValue(secret)
	})
}

/** A flag whose name matches and that carries no value of its own, so the next element is the value. */
function isFlagWithSeparateValue(arg: string): boolean {
	const hasOwnValue = arg.includes('=') || FLAG_WITH_VALUE.test(arg)

	return arg.startsWith('-') && !hasOwnValue && SECRET_KEY.test(arg)
}

/** The secret at the end of one `args` element that holds its own value, if its name matches. */
function secretValueIn(arg: string): string | undefined {
	const header = HEADER_ARG.exec(arg)

	if (header) {
		return SECRET_KEY.test(header[1] ?? '') ? header[2] : undefined
	}

	const flagWithValue = FLAG_WITH_VALUE.exec(arg)

	if (flagWithValue) {
		return SECRET_KEY.test(flagWithValue[1] ?? '') ? flagWithValue[2] : undefined
	}

	const equals = arg.indexOf('=')

	if (equals === -1) {
		return undefined
	}

	const name = arg.slice(0, equals)
	const value = arg.slice(equals + 1)

	if (SECRET_KEY.test(name)) {
		return value
	}

	const embeddedHeader = name.startsWith('-') ? HEADER_ARG.exec(value) : null

	return embeddedHeader && SECRET_KEY.test(embeddedHeader[1] ?? '') ? embeddedHeader[2] : undefined
}
