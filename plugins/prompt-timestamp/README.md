# prompt-timestamp

Adds a date line to every prompt, a timestamp beside every terminal message, and a timestamp to every Claude response.

This README follows the [Standard Readme](https://github.com/RichardLitt/standard-readme) specification.

## Install

Add the marketplace to Claude Code, then install the plugin from it:

```sh
claude plugin marketplace add ninjaboynaru/tiagox-claude-code-mods
claude plugin install prompt-timestamp@tiagox-claude-code-mods
```

## Usage

The plugin has no settings and no commands. Once it is installed, it does three things.

### Date line on every prompt

Claude receives a line such as this one with every prompt you send:

```text
Current date and time: Sun Sep 20 2026 14:03:05 CDT | Timezone: America/Chicago (UTC-05:00)
```

The time is on a 24-hour clock, in the time zone the machine reports.

### Timestamp beside every terminal row

In the terminal, each prompt row and each Claude response row has a dim timestamp at its left, in the machine's time zone:

```text
14:03:05 CDT
Sep 19 22:41:09 CDT
```

The first form is for a row from today. The second form, with the month and day, is for a row from an earlier day. Other surfaces, such as the desktop app, draw their rows unchanged.

### Timestamp on every Claude response

The plugin appends a line like this one to the end of each Claude response that has text:

```text
[Response time: Sun Sep 20 2026 14:03:05 CDT]
```

The line is written into the response text that is stored in the transcript, so Claude reads it in later turns and can tell when it answered. If the response already ends with a line in this exact format, the plugin replaces it with the true one, so a response never holds more than one. Responses that only call tools, and responses from subagents, are left as they are. The terminal hides the line from the displayed response because the row's timestamp shows the same time.

## Resumed sessions

The plugin keeps each row's time in memory, so it does not survive a restart. When a session is resumed, a response row recovers its timestamp from the saved `[Response time: ...]` line, shown as written (clock time and zone abbreviation, not converted), with the month and day when it is from an earlier day. A line that does not match the format exactly is ignored, the row gets a blank timestamp, and the line stays visible.

Prompt rows of a resumed session get a blank timestamp. The saved date line is stored separately from the prompt row and Claude Code gives a row no way to find it. A prompt row also draws blank for about half a second after it is sent, until its time is recorded.

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
