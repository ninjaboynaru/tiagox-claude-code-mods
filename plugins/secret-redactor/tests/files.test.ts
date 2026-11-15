import { describe, expect, test, tier } from 'claude-code/testing'

import { isSecretsFileName, namesSecretsFile } from '../hooks/files.js'

tier('user')

describe('which file names make a secrets file', () => {
	test('.mcp.json, .claude.json, .env, .env.*, and *.env count, in any letter case', () => {
		const names = ['.mcp.json', '.MCP.JSON', '.claude.json', '.Claude.JSON', '.env', '.ENV', '.env.local', '.envrc', '.env-backup', 'prod.env', 'Prod.ENV']

		for (const name of names) {
			expect(isSecretsFileName(name), name).toBe(true)
		}
	})

	test('templates do not count', () => {
		for (const name of ['.env.example', '.env.sample', '.env.template', '.env.dist', 'prod.env.EXAMPLE']) {
			expect(isSecretsFileName(name), name).toBe(false)
		}
	})

	test('names that only resemble them do not count', () => {
		for (const name of ['environment.txt', 'env.json', 'env', 'mcp.json', 'claude.json', '.mcp.json.bak', 'notes.txt', '']) {
			expect(isSecretsFileName(name), name).toBe(false)
		}
	})
})

describe('text that names a secrets file', () => {
	test('a command, a path, and a grep line each name one', () => {
		for (const text of [
			'cat prod.env',
			'config/prod.env',
			'cd sub && cat .env',
			'/work/project/.env.local',
			'C:\\work\\tools\\.mcp.json',
			'/home/test/.claude.json',
			'src/.env:3:API_KEY=x',
		]) {
			expect(namesSecretsFile(text), text).toBe(true)
		}
	})

	test('code that reads the environment names none', () => {
		for (const code of [
			'process.env',
			'Object.keys(process.env)',
			'process.env[name]',
			'process.env.API_KEY',
			'getValue(process.env.DB_USERNAME)',
			'import.meta.env',
			'Deno.env.get("X")',
			'Bun.env',
			'src/lib/process.env',
			'settings.env[key]',
			'config.env(key)',
		]) {
			expect(namesSecretsFile(code), code).toBe(false)
		}
	})

	test('templates and look-alike names name none', () => {
		for (const text of ['cat .env.example', 'environment.txt', 'env.json', 'cat notes.txt']) {
			expect(namesSecretsFile(text), text).toBe(false)
		}
	})
})
