// A path or file name: no whitespace, quote, colon, or `=`, so a grep-style
// `path:line:` prefix and a `NAME=value` line each end a token. A drive letter
// counts only when a slash follows it.
const PATH_TOKEN = /(?:[A-Za-z]:(?=[\\/]))?[\w.~@%+\-\\/]+/g
const ENVIRONMENT_EXPRESSION = /(?:process|import\.meta|Deno|Bun)\.env$/i
const TEMPLATE_NAME = /\.(?:example|sample|template|dist)$/i

/**
 * Whether a file's base name makes it a secrets file: `.mcp.json`,
 * `.claude.json`, a name that starts with `.env` (`.env`, `.env.local`,
 * `.envrc`, `.env-backup`), or a name that ends with `.env`, in any letter
 * case. A template, whose name ends in `.example`, `.sample`, `.template`, or
 * `.dist`, is not one.
 */
export function isSecretsFileName(name: string): boolean {
	const lower = name.toLowerCase()
	const isNamedLikeOne = lower === '.mcp.json' || lower === '.claude.json' || lower.startsWith('.env') || lower.endsWith('.env')

	return isNamedLikeOne && !TEMPLATE_NAME.test(lower)
}

/**
 * Whether `text` names a secrets file by any path in it. A code expression that
 * reads the environment is not one: `process.env` and its kin, and a
 * `<name>.env` that the text goes on to index or call. (A following `.` never
 * ends a token, since `.` belongs to it.)
 */
export function namesSecretsFile(text: string): boolean {
	for (const match of text.matchAll(PATH_TOKEN)) {
		const token = match[0]
		const base = token.split(/[\\/]/).at(-1) ?? ''
		const next = text[(match.index ?? 0) + token.length]
		const isIndexedOrCalled = next === '[' || next === '('
		const isEnvironmentExpression = ENVIRONMENT_EXPRESSION.test(base)

		if (isSecretsFileName(base) && !isEnvironmentExpression && !isIndexedOrCalled) {
			return true
		}
	}

	return false
}
