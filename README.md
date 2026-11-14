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
| [tiagox-agent-config](https://github.com/ninjaboynaru/tiagox-agent-config) | A set of high level Claude Code skills to write structured and consistent agent instructions. |

## Layout

- `.claude-plugin/marketplace.json`: The catalog, which lists each plugin by name and says where its files are.
- `plugins/`: One folder per plugin, each with its own `.claude-plugin/plugin.json`.

## License

[MIT](LICENSE) © Thiago Pereira
