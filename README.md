# tiagox-claude-code-mods

My personal Claude Code plugin marketplace.

This README follows the [Standard Readme](https://github.com/RichardLitt/standard-readme) specification.

## Install

Add the marketplace to Claude Code:

```sh
claude plugin marketplace add ninjaboynaru/tiagox-claude-code-mods
```

## Usage

Install a plugin from the marketplace:

```sh
claude plugin install <plugin>@tiagox-claude-code-mods
```

## Plugins

| Plugin | What it does |
| --- | --- |
| [prompt-timestamp](plugins/prompt-timestamp) | Adds a date line to every prompt, a timestamp beside every terminal message, and a timestamp to every Claude response. |
| [session-config-line](plugins/session-config-line) | Shows a context usage bar, the model, the effort level, and the usage limits above the prompt hint line. |
| [secret-redactor](plugins/secret-redactor) | Hides the secrets in your MCP server configuration and .env files from the agent by redacting them from tool results. |
| [agent-config-skills](plugins/agent-config-skills) | A set of high level Claude Code skills to write structured and consistent agent instructions. |

## Layout

- `.claude-plugin/marketplace.json`: The catalog, which lists each plugin by name and says where its files are.
- `plugins/`: One folder per plugin, each with its own `.claude-plugin/plugin.json`.

## License

[MIT](LICENSE) © Thiago Pereira
