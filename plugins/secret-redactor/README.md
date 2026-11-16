# secret-redactor

Hides the secrets in your MCP server configuration and .env files from the agent by redacting them from tool results.

This README follows the [Standard Readme](https://github.com/RichardLitt/standard-readme) specification.

## Install

Add the marketplace to Claude Code, then install the plugin from it:

```sh
claude plugin marketplace add ninjaboynaru/tiagox-claude-code-mods
claude plugin install secret-redactor@tiagox-claude-code-mods
```

## Usage

The plugin has no settings and no commands. When a tool result shows a secrets file, it replaces the value of each secret in that result with `$REDACTED_SECRET_VALUE$`, in place. That covers built-in tools, Bash, MCP tools, error results, and the tool results of subagents.

### What it reads

Only the tool result on its way to the agent. The plugin reads no file from disk and remembers nothing between results.

A secrets file is a file, in any folder, whose base name is `.mcp.json` or `.claude.json`, starts with `.env` (such as `.env`, `.env.local`, `.envrc`, and `.env-backup`), or ends with `.env` (such as `prod.env`), in any letter case. A name that ends in `.example`, `.sample`, `.template`, or `.dist` is a template and is not one. A file named `environment.txt` or `env.json` is not one, and neither is code that reads the environment: `process.env`, `import.meta.env`, `Deno.env`, and `Bun.env`, or a `<name>.env` that the text goes on to index or call, as in `config.env[key]`.

A tool result shows a secrets file when the tool call's input (a `file_path`, a `path`, or a Bash command) or the result text names one. Every other tool result goes through as it is, even when it holds the same text as a secret.

What is redacted depends on what names the file:

- **The tool call names it**, as in a Read of `.env` or `cat prod.env`: the whole result is redacted. It copes with the Read tool's line-number prefix, `cat -n`, a grep-style `path:line:` prefix, and the `+`, `-`, `<`, and `>` marks of a diff. A grep-style line whose prefix names a file that is not a secrets file is left alone.
- **Only the result text names it**, as in a `grep -rn TOKEN .` or a `git diff` over many files: only the lines that belong to a secrets file are redacted. That is a grep-style line whose own path is a secrets file, with or without a line number, and the lines of a diff section whose header names one, up to the next file header. Every other line is left alone, so a Python file or a README that only mentions `.env` is not changed.

### What counts as a secret

Only the value of a secret is replaced. The key, the quotes, the `=`, the flag, the line number, and the rest of the line stay as they are. A value is replaced whatever its length, down to one character. These are the secrets:

- **Dotenv line**: The value of `NAME=value`, `export NAME=value`, or `declare -x NAME=value`, quoted or unquoted, when the name has one of the key words below. A trailing ` #comment` on an unquoted value stays visible.
- **JSON pair**: The value of `"NAME": "value"`, as in the `env` and `headers` of an MCP server, when the name has one of the key words.
- **MCP `args`**: The values in an `args` list, whose elements may sit on separate lines, with line numbers between them. The rules are listed below.
- **URL**: The value of a query parameter whose name has one of the key words, as in `?api_key=<value>`, and the password part of `scheme://user:password@host`. Both are found on any line.

A name has a key word when it contains any of these words, in any letter case, has `pass` as a whole word, or has `token` together with a qualifying word (see below):

- `authorization`
- `key`
- `username`
- `password`
- `passwd`
- `secret`
- `credential`

These words cover authorization, API key, auth token, key, username, password, secret, TOTP secret, and credentials. `pass` counts only as a whole word: the entire name, or set off by `_` or `-` on each side that has more text, as in `PASS`, `DB_PASS`, `db-pass`, and `SMTP_PASS_FILE`. It does not count inside a longer word, so `BYPASS_CACHE`, `PASSPORT_NUMBER`, `COMPASS_HEADING`, and `PASSTHROUGH` stay visible.

`token` is hidden only when a qualifying word comes with it, and never when it stands alone. A word is a part of the name set off by `_`, `-`, `.`, a space, a camelCase or PascalCase boundary, a digit, or the start or end of the name. A qualifying word is any other word of the name that has at least one letter and is not one of the quantity words below, so there is no fixed list of them: `api`, `auth`, `refresh`, `access`, `github`, `bearer`, `slack`, `my`, and `value` all qualify, and so does any other.

- **Hidden**, because `token` has a qualifying word before or after it: `API_TOKEN`, `WEARABLE_API_TOKEN`, `AUTH_TOKEN`, `TOKEN_API`, `TOKEN_AUTH`, `GITHUB_TOKEN`, `MY_TOKEN`, `SESSION_TOKEN`, `TOKEN_VALUE`, `github-token`, `apiToken`, `accessToken`, `refresh_token`, `X-Auth-Token`, `--api-token`, `auth.token`, and `API_TOKEN2`. A single word that ends in `token` with letters before it, such as `APITOKEN` and `authtoken`, is hidden too, since nothing marks where its first word ends.
- **Visible**, because `token` stands alone: `TOKEN`, `token`, `Token`, `--token`, and a URL query name `token`. Digits and separators do not qualify it, so `TOKEN2`, `token1`, `TOKEN_1`, `_TOKEN`, and `TOKEN_` are visible too.
- **Visible**, because `token` is a plural: `MAX_TOKENS`, `max_tokens`, `maxTokens`, `MAX_OUTPUT_TOKENS`, and `tokensPerMinute`.
- **Visible**, because `token` only starts a longer word: `tokenizer`, `TOKENIZER`, `tokenization`, and `tokenize`.
- **Visible**, because `token` is a quantity: a name that also has one of the words in `TOKEN_QUANTITY_WORDS` (in `hooks/redact.ts`), which are `max`, `min`, `limit`, `count`, `budget`, `size`, `length`, `num`, `number`, `per`, and `rate`. Examples are `MAX_TOKEN`, `max_token_count`, `TOKEN_LIMIT`, and `tokenBudget`.

A name with another key word is hidden for that word whatever its `token` is, as in `TOKENIZER_API_KEY`, `MAX_TOKENS_SECRET`, and `MAX_TOKEN_PASSWORD`.

The `args` list has no keys, so it follows four rules for each element:

- An element of the form `name: value`, a name, a colon, optional whitespace, then a value, whose name has one of the words makes the text after the colon the secret, as in `Authorization: Bearer <credential>` and `Authorization:Bearer <credential>`. A URL or a Windows path has a name with none of the words, so it never makes a secret this way.
- An element that starts with `-` and holds a flag, whitespace, and a value, as in `--api-key VALUE`, whose flag name has one of the words makes the text after the flag the secret.
- An element of the form `name=value` or `--name=value` whose name has one of the words makes the part after the first `=` the secret. For `--name=Header: value`, the header's name decides, as in `--header=Authorization: Bearer <credential>`.
- An element that starts with `-` and whose flag name has one of the words makes the next element the secret, as in `--api-key`, `VALUE`.

### What it leaves alone

- Blank values.
- Values that contain a `${VAR}` or `${VAR:-default}` expansion, such as `Bearer ${MY_TOKEN}`, since the text in the file is a reference and not the secret.
- Entries whose key has none of the key words, such as `DB_PORT=5432`, `LOG_LEVEL=debug`, `TOKEN=abc`, `MAX_TOKENS=4096`, `TOKENIZER=cl100k`, the value after `--port` or `--region`, and `region=us-east-1`.
- A URL with no password.
- Comment lines in a dotenv file.
- Every tool result that does not show a secrets file, including a `NAME=value` line in `notes.txt` and code such as `getValue(process.env.DB_USERNAME)`.
- A line of a result that only mentions a secrets file, when the line has no secrets file path of its own.
- Files whose names only resemble a secrets file, such as `environment.txt` and `env.json`, and templates such as `.env.example`.

### Limits

- The structured record that Claude Code stores beside a tool result, which the screen draws, keeps the original text. Only what the agent reads and what the transcript stores as the result is redacted.
- Only tool results are redacted. File text that reaches the agent another way, such as an `@file` mention, is not.
- A `.env` line with a quoted value that runs over several lines is redacted only on its first line.

## Development

Run the checks from this folder:

```sh
claude plugin validate .
claude plugin test .
```

`tsconfig.json` reads the hook API declarations from `.claude-plugin/types/`, which the repository does not hold. Claude Code writes them there when an interactive session loads the plugin from this folder with `claude --plugin-dir .`. Type-check after that with:

```sh
npx -p typescript tsc -p .
```

The tests use made-up values and never read a real file.

## License

[MIT](../../LICENSE) © Thiago Pereira
