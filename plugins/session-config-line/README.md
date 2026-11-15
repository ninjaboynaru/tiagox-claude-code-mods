# session-config-line

Shows a context usage bar, the model, the effort level, and the usage limits above the prompt hint line.

This README follows the [Standard Readme](https://github.com/RichardLitt/standard-readme) specification.

## Install

Add the marketplace to Claude Code, then install the plugin from it:

```sh
claude plugin marketplace add ninjaboynaru/tiagox-claude-code-mods
claude plugin install session-config-line@tiagox-claude-code-mods
```

## Usage

The plugin has no settings and no commands. Once it is installed, it draws one row in the terminal, above the hint line under the prompt box, with one blank row above it:

```text
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ 15% · claude-sonnet-5-5 · medium · Weekly Usage: 52%
```

### Context bar

The bar is 20 cells wide. The used part is blue (`#3b6ea5`), the free part is light blue (`#c8d6e5`), and the last part, in dark red (`#8b1a1a`), is the auto-compact buffer. When auto-compact is off, there is no red part.

### Text after the bar

After the bar come four values, separated by dots:

- The percentage of the context window in use.
- The model ID.
- The effort level.
- The weekly usage limit.

The effort level appears after the first message of a session, because Claude Code only reports it with each request.

Claude Code does not expose a per-model usage limit, such as the Fable limit, to mods, so the row shows only the weekly limit.

### Subagent row

While you view a subagent's transcript, a second dim row appears above the prompt with that subagent's model and effort level, such as `claude-sonnet-5-5 · high`. It has no bar or percentage, because Claude Code does not expose a subagent's context usage to mods. The row appears once the subagent has made its first request, and it is gone in the main view.

Other surfaces, such as the desktop app, draw nothing.

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

## License

[MIT](../../LICENSE) © Thiago Pereira
