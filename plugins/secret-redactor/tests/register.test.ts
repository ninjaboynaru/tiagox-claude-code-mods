import type { ApiContentBlock, ToolCallArgs } from 'claude-code'
import { describe, expect, mock, test, tier, type Engine } from 'claude-code/testing'

import { REDACTED } from '../hooks/redact.js'
import { bash, read, shownAfter, storedResultOf, toolResultRowOf, worldOn, type World } from './fixtures.js'

tier('user')

// Every value below is made up.
const R = REDACTED
const envFile = read('/work/project/.env')
const mcpFile = read('/work/project/.mcp.json')

/** Shows each text as the result of reading `input`, and checks that it comes back as its expected text. */
async function expectShown($: Engine, world: World, input: ToolCallArgs, cases: [text: string, expected: string][]): Promise<void> {
	for (const [text, expected] of cases) {
		expect(await shownAfter($, world, input, text), text).toBe(expected)
	}
}

/** Puts a Read tool line number, a tab-separated `cat -n` one, or nothing before each line. */
const numbered = (text: string, separator: string) =>
	text
		.split('\n')
		.map((line, position) => `${String(position + 1).padStart(6)}${separator}${line}`)
		.join('\n')

describe('a dotenv line', () => {
	test('has the value of a matching key replaced, whatever its length, and keeps the rest of the line', async ($, on) => {
		await expectShown($, worldOn(on), envFile, [
			['API_KEY=x', `API_KEY=${R}`],
			['API_KEY=true', `API_KEY=${R}`],
			['API_KEY=fake-long-key-0001', `API_KEY=${R}`],
			['export API_TOKEN=a', `export API_TOKEN=${R}`],
			['declare -x DB_PASSWORD=pw', `declare -x DB_PASSWORD=${R}`],
			['  DB_USERNAME = admin', `  DB_USERNAME = ${R}`],
			['api_key=a', `api_key=${R}`],
			['DB_PASS=a', `DB_PASS=${R}`],
			['SMTP_PASS_FILE=a', `SMTP_PASS_FILE=${R}`],
			['PLAIN_PASSWORD=a # trailing comment', `PLAIN_PASSWORD=${R} # trailing comment`],
		])
	})

	test('has a quoted value replaced inside its quotes, down to one character', async ($, on) => {
		await expectShown($, worldOn(on), envFile, [
			['API_KEY="a"', `API_KEY="${R}"`],
			["API_KEY='a'", `API_KEY='${R}'`],
			['DB_PASSWORD="two words"', `DB_PASSWORD="${R}"`],
			['DB_PASSWORD="a \\" b"', `DB_PASSWORD="${R}"`],
			['API_KEY="abc" # trailing comment', `API_KEY="${R}" # trailing comment`],
			['API_KEY="abc', `API_KEY="${R}`],
		])
	})

	test('is left alone when its key has no key word, its value is blank or an expansion, or it is a comment', async ($, on) => {
		const unchanged = [
			'DB_PORT=5432',
			'LOG_LEVEL=debug',
			'NODE_ENV=production-mode',
			'BYPASS_CACHE=1',
			'PASSPORT_NUMBER=1',
			'# API_KEY=abc',
			'API_KEY=',
			'API_KEY=   ',
			'API_KEY=""',
			'API_TOKEN=${MY_TOKEN}',
			'API_TOKEN="Bearer ${MY_TOKEN:-none}"',
			'',
		]

		await expectShown($, worldOn(on), envFile, unchanged.map((line): [string, string] => [line, line]))
	})

	test('keeps the line ending of each line', async ($, on) => {
		await expectShown($, worldOn(on), envFile, [['API_KEY=a\r\nDB_PORT=5432\r\nDB_PASSWORD=b\r\n', `API_KEY=${R}\r\nDB_PORT=5432\r\nDB_PASSWORD=${R}\r\n`]])
	})

	test('has its value replaced under the Read tool and cat -n line numbers', async ($, on) => {
		const world = worldOn(on)
		const lines = ['# settings', 'DB_PORT=5432', 'API_KEY=a', 'export DB_PASSWORD="b"', 'API_TOKEN=c # note']
		const expected = ['# settings', 'DB_PORT=5432', `API_KEY=${R}`, `export DB_PASSWORD="${R}"`, `API_TOKEN=${R} # note`]

		expect(await shownAfter($, world, envFile, numbered(lines.join('\n'), '→'))).toBe(numbered(expected.join('\n'), '→'))
		expect(await shownAfter($, world, bash('cat -n .env'), numbered(lines.join('\n'), '\t'))).toBe(numbered(expected.join('\n'), '\t'))
	})

	test('has its value replaced under a grep path and line number, and a grep line of another file is left alone', async ($, on) => {
		const world = worldOn(on)
		const lines = [
			'/work/project/app/.env:3:API_KEY=a',
			'src/.env.local-7-DB_PORT=5432',
			'src/.env.local:8:SECRET_TOKEN=b',
			'app/.env:DB_PASSWORD=c',
			'C:\\work\\win\\.env:2:LOGIN_PASSWORD=d',
			'12:OTHER_API_KEY=e',
			'/work/project/src/config.ts:4:API_KEY=f',
			'docs/notes.txt:9:DB_PASSWORD=g',
		]
		const expected = [
			`/work/project/app/.env:3:API_KEY=${R}`,
			'src/.env.local-7-DB_PORT=5432',
			`src/.env.local:8:SECRET_TOKEN=${R}`,
			`app/.env:DB_PASSWORD=${R}`,
			`C:\\work\\win\\.env:2:LOGIN_PASSWORD=${R}`,
			`12:OTHER_API_KEY=${R}`,
			'/work/project/src/config.ts:4:API_KEY=f',
			'docs/notes.txt:9:DB_PASSWORD=g',
		]

		const shown = await shownAfter($, world, bash('grep -rn "KEY|PASSWORD" .env app src docs'), lines.join('\n'))

		expect(shown).toBe(expected.join('\n'))
	})

	test('has its value replaced behind a diff mark', async ($, on) => {
		const world = worldOn(on)
		const lines = ['+API_KEY=a', '-API_KEY=b', '< DB_PASSWORD=c', '> DB_PASSWORD=d', '+DB_PORT=5432', ' DB_PORT=5432']
		const expected = [`+API_KEY=${R}`, `-API_KEY=${R}`, `< DB_PASSWORD=${R}`, `> DB_PASSWORD=${R}`, '+DB_PORT=5432', ' DB_PORT=5432']

		expect(await shownAfter($, world, bash('git diff .env'), lines.join('\n'))).toBe(expected.join('\n'))
	})
})

describe('a JSON pair', () => {
	const config = [
		'{ "mcpServers": { "x": {',
		'  "headers": { "Authorization": "Bearer a" },',
		'  "env": { "GEMINI_API_KEY": "g", "DEBUG": "verbose", "DB_PASSWORD": "", "A_TOKEN": "${A_TOKEN}", "B_KEY": "a\\"b" } } } }',
	].join('\n')
	const expected = [
		'{ "mcpServers": { "x": {',
		`  "headers": { "Authorization": "${R}" },`,
		`  "env": { "GEMINI_API_KEY": "${R}", "DEBUG": "verbose", "DB_PASSWORD": "", "A_TOKEN": "\${A_TOKEN}", "B_KEY": "${R}" } } } }`,
	].join('\n')

	test('has the value of a matching key replaced, and the other pairs are left alone', async ($, on) => {
		expect(await shownAfter($, worldOn(on), mcpFile, config)).toBe(expected)
	})

	test('has its value replaced under line numbers too', async ($, on) => {
		const world = worldOn(on)

		expect(await shownAfter($, world, mcpFile, numbered(config, '→'))).toBe(numbered(expected, '→'))
		expect(await shownAfter($, world, mcpFile, numbered(config, '\t'))).toBe(numbered(expected, '\t'))
	})

	test('has a one-character value replaced', async ($, on) => {
		expect(await shownAfter($, worldOn(on), mcpFile, '"API_KEY": "a",\n"PORT": "8"')).toBe(`"API_KEY": "${R}",\n"PORT": "8"`)
	})
})

describe('the args of an MCP server', () => {
	const args = [
		'-y',
		'fake-mcp',
		'--api-key',
		'k',
		'--auth-token=t',
		'LOGIN_PASSWORD=p',
		'--client-secret s',
		'Authorization: Bearer a',
		'Authorization:Bearer a',
		'--header=Authorization: Bearer a',
		'--port',
		'8080',
		'--region',
		'eu-central-1',
		'region=us-east-1',
		'--header=Accept: text/plain',
		'--password',
		'${DB_PASSWORD}',
		'--secret',
		'',
		'--last',
	]
	const redactedArgs = [
		'-y',
		'fake-mcp',
		'--api-key',
		R,
		`--auth-token=${R}`,
		`LOGIN_PASSWORD=${R}`,
		`--client-secret ${R}`,
		`Authorization: ${R}`,
		`Authorization:${R}`,
		`--header=Authorization: ${R}`,
		'--port',
		'8080',
		'--region',
		'eu-central-1',
		'region=us-east-1',
		'--header=Accept: text/plain',
		'--password',
		'${DB_PASSWORD}',
		'--secret',
		'',
		'--last',
	]
	const jsonOf = (list: string[]) => JSON.stringify({ mcpServers: { one: { command: 'npx', args: list } } }, null, 2)

	test('have each secret value replaced in place, on separate lines, and the other elements left alone', async ($, on) => {
		expect(await shownAfter($, worldOn(on), mcpFile, jsonOf(args))).toBe(jsonOf(redactedArgs))
	})

	test('have each secret value replaced under the Read tool line numbers', async ($, on) => {
		const world = worldOn(on)

		expect(await shownAfter($, world, mcpFile, numbered(jsonOf(args), '→'))).toBe(numbered(jsonOf(redactedArgs), '→'))
		expect(await shownAfter($, world, mcpFile, numbered(jsonOf(args), '\t'))).toBe(numbered(jsonOf(redactedArgs), '\t'))
	})

	test('have a short value after a flag replaced on the next line, and only that line', async ($, on) => {
		const shown = await shownAfter($, worldOn(on), mcpFile, '"args": [\n  "--token",\n  "a",\n  "b"\n]')

		expect(shown).toBe(`"args": [\n  "--token",\n  "${R}",\n  "b"\n]`)
	})

	test('are found in a compact configuration', async ($, on) => {
		const shown = await shownAfter($, worldOn(on), mcpFile, '{"args":["--api-key","a","--port","8080"],"env":{"A_KEY":"b"}}')

		expect(shown).toBe(`{"args":["--api-key","${R}","--port","8080"],"env":{"A_KEY":"${R}"}}`)
	})
})

describe('a .claude.json shown by Read', () => {
	test('has the secrets of every project and of the top level replaced', async ($, on) => {
		const config = {
			mcpServers: { top: { command: 'npx', args: ['--token', 'a'], env: { TOP_KEY: 'b' } } },
			projects: { '/work/project': { mcpServers: { local: { url: 'https://u:p@host/v1', args: ['--region', 'eu'], headers: { Authorization: 'Bearer c' } } } } },
		}
		const expected = {
			mcpServers: { top: { command: 'npx', args: ['--token', R], env: { TOP_KEY: R } } },
			projects: { '/work/project': { mcpServers: { local: { url: `https://u:${R}@host/v1`, args: ['--region', 'eu'], headers: { Authorization: R } } } } },
		}
		const json = (value: unknown) => JSON.stringify(value, null, 2)

		const shown = await shownAfter($, worldOn(on), read('/home/test/.claude.json'), numbered(json(config), '→'))

		expect(shown).toBe(numbered(json(expected), '→'))
	})
})

describe('a URL', () => {
	test('has the password and the matching query parameters replaced, on any line', async ($, on) => {
		await expectShown($, worldOn(on), envFile, [
			['DATABASE_URL=postgres://user:pw@host/db', `DATABASE_URL=postgres://user:${R}@host/db`],
			['DATABASE_URL="postgres://user:p@host/db"', `DATABASE_URL="postgres://user:${R}@host/db"`],
			['CALLBACK=https://example.test/cb?api_key=k&region=us-east-1', `CALLBACK=https://example.test/cb?api_key=${R}&region=us-east-1`],
			['CALLBACK=https://example.test/cb?region=us-east-1&token=t#frag', `CALLBACK=https://example.test/cb?region=us-east-1&token=${R}#frag`],
			['DB_PASSWORD=postgres://user:pw@host/db', `DB_PASSWORD=${R}`],
			['  "url": "https://user:pw@api.example.test/v1?token=t",', `  "url": "https://user:${R}@api.example.test/v1?token=${R}",`],
		])
	})

	test('is left alone when it has no password and no matching query parameter', async ($, on) => {
		const unchanged = [
			'HOMEPAGE=https://example.test/home',
			'REMOTE=https://user@host/repo',
			'PUBLIC_URL=https://example.test?region=us-east-1',
			'PORT_URL=http://host:8080/path',
			'  "url": "https://api.example.test/v1?token=${TOKEN}",',
			'DATABASE_URL=postgres://user:${DB_PASSWORD}@host/db',
		]

		await expectShown($, worldOn(on), envFile, unchanged.map((line): [string, string] => [line, line]))
	})
})

describe('a result that is not about a secrets file', () => {
	test('is passed through untouched, though it holds the same text as a secret', async ($, on) => {
		const world = worldOn(on)

		await shownAfter($, world, envFile, 'API_KEY=fake-notes-secret-0002')

		const notes = 'note: fake-notes-secret-0002\nAPI_KEY=fake-notes-secret-0002\n"api_key": "fake-notes-secret-0002"'
		expect(await shownAfter($, world, read('/work/project/notes.txt'), notes)).toBe(notes)
	})

	test('is passed through untouched for a JavaScript file that reads the environment', async ($, on) => {
		const code = ['const name = getValue(process.env.DB_USERNAME)', 'const mode = import.meta.env', 'const key = Object.keys(process.env)', 'API_KEY=a'].join('\n')

		expect(await shownAfter($, worldOn(on), read('/work/project/app.js'), code)).toBe(code)
	})

	test('is passed through untouched for the output of a program that prints a secret', async ($, on) => {
		const output = 'connecting with API_KEY=fake-printed-secret-0003 and "token": "fake-printed-secret-0003"'

		expect(await shownAfter($, worldOn(on), bash('node print-config.js'), output)).toBe(output)
	})

	test('is passed through untouched for a template file', async ($, on) => {
		const world = worldOn(on)
		const template = 'API_KEY=changeme\nDB_PASSWORD=your-password-here'

		expect(await shownAfter($, world, read('/work/project/.env.example'), template)).toBe(template)
		expect(await shownAfter($, world, bash('cat .env.sample'), template)).toBe(template)
	})
})

describe('a result that only mentions a secrets file', () => {
	test('is passed through untouched when it is the text of a code file', async ($, on) => {
		const setup = ['# copy .env.example to .env first', 'token = get_token()', 'API_KEY=abc', '"api_key": "abc"', 'url = "https://u:pw@host/db?token=t"'].join('\n')

		expect(await shownAfter($, worldOn(on), read('/work/project/setup.py'), setup)).toBe(setup)
	})

	test('has only the grep lines of a secrets file redacted', async ($, on) => {
		const lines = [
			'./.env:3:API_KEY=x',
			'./src/a.py:7:token = get_token()',
			'C:\\work\\.env:API_KEY=x',
			'sub/.mcp.json-12-  "API_KEY": "x"',
			'API_KEY=x',
		]
		const expected = [`./.env:3:API_KEY=${R}`, './src/a.py:7:token = get_token()', `C:\\work\\.env:API_KEY=${R}`, `sub/.mcp.json-12-  "API_KEY": "${R}"`, 'API_KEY=x']

		expect(await shownAfter($, worldOn(on), bash('grep -rn TOKEN .'), lines.join('\n'))).toBe(expected.join('\n'))
	})

	test('has only the grep lines of a secrets file redacted, with Windows paths from the Grep tool', async ($, on) => {
		const lines = [
			'C:\\work\\project\\.env:3:API_KEY=a',
			'C:\\work\\project\\src\\app.py:9:API_KEY=b',
			'C:\\work\\project\\.env:SECRET_TOKEN=c',
			'C:\\work\\project\\src\\app.py:12:token = get_token()',
			'C:\\work\\project\\.mcp.json-12-  "API_KEY": "d"',
		]
		const expected = [
			`C:\\work\\project\\.env:3:API_KEY=${R}`,
			'C:\\work\\project\\src\\app.py:9:API_KEY=b',
			`C:\\work\\project\\.env:SECRET_TOKEN=${R}`,
			'C:\\work\\project\\src\\app.py:12:token = get_token()',
			`C:\\work\\project\\.mcp.json-12-  "API_KEY": "${R}"`,
		]

		const shown = await shownAfter($, worldOn(on), { tool: 'Grep', pattern: 'KEY|TOKEN', path: 'C:\\work\\project' }, lines.join('\n'))

		expect(shown).toBe(expected.join('\n'))
	})

	test('has only the diff section of a secrets file redacted', async ($, on) => {
		const diff = [
			'diff --git a/src/app.py b/src/app.py',
			'--- a/src/app.py',
			'+++ b/src/app.py',
			'@@ -1,2 +1,2 @@',
			'-token = get_token()',
			'+token = get_token(1)',
			'diff --git a/config/.env b/config/.env',
			'--- a/config/.env',
			'+++ b/config/.env',
			'@@ -1,3 +1,3 @@',
			'-API_KEY=a',
			'+API_KEY=b',
			' DB_PORT=5432',
			'diff --git a/README.md b/README.md',
			'--- a/README.md',
			'+++ b/README.md',
			'+API_KEY=c',
			'--- a/.mcp.json',
			'+++ /dev/null',
			'-  "API_KEY": "d"',
		]
		const expected = [...diff]
		expected[10] = `-API_KEY=${R}`
		expected[11] = `+API_KEY=${R}`
		expected[19] = `-  "API_KEY": "${R}"`

		expect(await shownAfter($, worldOn(on), bash('git diff'), diff.join('\n'))).toBe(expected.join('\n'))
	})
})

describe('a result that is about a secrets file', () => {
	test('is redacted when only the tool call names the file', async ($, on) => {
		expect(await shownAfter($, worldOn(on), bash('cd sub && cat prod.env'), 'ADMIN_PASSWORD=a\nDB_PORT=5432')).toBe(`ADMIN_PASSWORD=${R}\nDB_PORT=5432`)
	})

	test('is redacted when only the result text names the file', async ($, on) => {
		const session = mock.session(on)

		await $.session.append(toolResultRowOf('/srv/app/.env:3:API_KEY=a\n/srv/app/.env:4:DB_PORT=5432'))

		expect(storedResultOf(session)).toBe(`/srv/app/.env:3:API_KEY=${R}\n/srv/app/.env:4:DB_PORT=5432`)
	})

	test('does not carry over to the next result', async ($, on) => {
		const world = worldOn(on)

		await shownAfter($, world, envFile, 'API_KEY=a')

		expect(await shownAfter($, world, bash('echo hello'), 'API_KEY=a')).toBe('API_KEY=a')
	})

	test("is redacted for a subagent's result, and the row keeps its agent", async ($, on) => {
		const world = worldOn(on)

		expect(await shownAfter($, world, envFile, 'API_KEY=a', { agentId: 'agent-1' })).toBe(`API_KEY=${R}`)
		expect(world.session.appended().at(-1)?.agentId).toBe('agent-1')
	})

	test('is redacted for an error result, and the row stays an error', async ($, on) => {
		const world = worldOn(on)

		expect(await shownAfter($, world, envFile, 'failed:\nAPI_KEY=a', { isError: true })).toBe(`failed:\nAPI_KEY=${R}`)
		expect(world.session.appended().at(-1)?.message.content[0]?.is_error).toBe(true)
	})

	test('is redacted in every text block, and a block that is not text is left as it is', async ($, on) => {
		const image = { type: 'image', source: { type: 'base64', data: 'API_KEY=a' } }
		const blocks: ApiContentBlock[] = [{ type: 'text', text: 'API_KEY=a' }, { type: 'text', text: 'two is clean' }, { type: 'text', text: 'DB_PASSWORD=b' }, image]

		expect(await shownAfter($, worldOn(on), envFile, blocks)).toEqual([
			{ type: 'text', text: `API_KEY=${R}` },
			{ type: 'text', text: 'two is clean' },
			{ type: 'text', text: `DB_PASSWORD=${R}` },
			image,
		])
	})

	test('on another door is not touched', async ($, on) => {
		const session = mock.session(on)

		await $.session.append({
			door: 'prompt',
			origin: { kind: 'composer' },
			uuid: 'prompt-1',
			message: { type: 'user', role: 'user', content: [{ type: 'text', text: '.env API_KEY=a' }] },
		})

		expect(session.appended().at(-1)?.message.content[0]?.text).toBe('.env API_KEY=a')
	})
})
