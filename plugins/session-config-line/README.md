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

The bar is 20 cells wide. The used part is blue (`#3b6ea5`), the free part is light blue (`#c8d6e5`), and the last part, in dark red (`#8b1a1a`), runs from the point where auto-compaction starts to the end of the context window. The free space between the blue and the red is what is left before auto-compaction, and when auto-compact is off there is no red part.

### Context window of a custom model

Claude Code assumes a context window for a model ID it does not recognize, such as a model served through an LLM gateway, and the bar and the percentage are drawn against that assumed window. To draw them against the model's real window, end the model's `label` in the [`modelPicker`](https://code.claude.com/docs/en/settings-reference#modelpicker) setting with the window in square brackets, in thousands (`k`) or millions (`m`) of tokens:

```json
{
	"modelPicker": {
		"options": [{ "model": "my-gateway-model", "label": "My Gateway Model [500k]" }]
	}
}
```

The plugin reads the label of the row whose `model` is the session's model ID. `[500k]`, `[1m]`, and `[1.5m]` are valid, in either letter case. When the model has no row, the label has no suffix, or the suffix is malformed, such as `[500]` or `[big]`, the plugin uses the window Claude Code reports.

The suffix changes only what this plugin draws. Claude Code still compacts the conversation at its own window, so the red part of the bar starts at the same token count as before.

### Text after the bar

After the bar come four values, separated by dots:

- The percentage of the context window in use.
- The model ID.
- The effort level.
- The weekly usage limit.

The effort level appears after the first message of a session, because Claude Code only reports it with each request.

The usage limits belong to the Claude plan, so the row leaves them out while the session model's ID does not start with `claude-`, such as a model served through an LLM gateway.

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
