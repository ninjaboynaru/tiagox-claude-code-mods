# agent-config-skills

A set of high level Claude Code skills to write structured and consistent agent instructions.

This README follows the [Standard Readme](https://github.com/RichardLitt/standard-readme) specification.

## Install

Install the package as a plugin from the [tiagox-claude-code-mods](https://github.com/ninjaboynaru/tiagox-claude-code-mods) marketplace:

```sh
claude plugin marketplace add ninjaboynaru/tiagox-claude-code-mods
claude plugin install agent-config-skills@tiagox-claude-code-mods
```

Or copy the folders under `skills/` into the `.claude/skills/` folder of your project, or into `~/.claude/skills/` to make them available in every project.

```sh
git clone https://github.com/ninjaboynaru/tiagox-claude-code-mods.git
cp -r tiagox-claude-code-mods/plugins/agent-config-skills/skills/* ~/.claude/skills/
```

The skills cite each other by name, so keep the folder names as they are or change them uniformly.

### Dependencies

`author-skills` and `sop-skill-review` depend on Anthropic's `skill-creator` skill, which is not in this package. Install it by following the directions at [anthropics/skills](https://github.com/anthropics/skills).

## Usage

Invoke a skill in Claude Code by its name:

```text
/sop-code-review
```

### Write Your Own Standards

1. Load `author-standards` and ask Claude to create a standards skill for your subject or add a standards section to an existing skill or document.
2. Add rules over time as you discover them or create all your rules at once if you know them all now.
	- Ensure every rule adheres to the `author-standards` skill and has good and bad examples, and clauses.
3. Optionally, create an `sop-review` like skill for your new standards by copying `sop-code-review` or `sop-writing-review` and modifying them to your use case.

## Content Types

This package defines five types of content for agent configuration:

- **Skill**: A set of instructions or guidance to give agents specialized knowledge and abilities.
	- Every other content type ships in this package as a skill or as a section of one.
- **Standard**: A catalog of rules that a category of work, such as code or writing, must adhere to.
	- Steers agents to perform a type of work in accordance with those rules.
- **SOP**: A standard operating procedure, which is a fixed set of numbered steps an agent follows to reach a specific goal.
	- Based off of the open source [Agent SOP](https://github.com/strands-agents/agent-sop) format.
- **Ontology**: A section that defines the terms, relationships, categories, and entities a document uses.
	- Helps agents perform work with the same shared mental model as the author and reduce the amount of rediscovery work agents must do to understand the domain.
- **Authoring**: A skill that defines how one of the content types above is structured and written.
	- Keeps every standard, SOP, and ontology in the same format, no matter which agent writes or edits it.

A standard, an SOP, or an ontology can be a whole skill or one section of a larger document.

> ⚠️ The term **ontology** is used loosely here. Formal ontologies in computer science and data science are often more extensive and rigorous than the one defined in this package. Agents generally do not need that level of rigor, except in enterprise and other complex environments.

## Skill Naming Convention

Consistent use of skill prefixes help humans quickly identify the skill we want to use.

| Prefix | What the skill holds | Example |
|--------|----------------------|---------|
| `standards-{subject}` | The standards for one subject | `standards-code` |
| `sop-{name}` | One or more SOPs | `sop-code-review` |
| `author-{type}` | Guidance on how to write one content type | `author-sop` |
| `cmd-{category}` | A command, which is a skill that only a human can invoke | `cmd-git-commit` |
| `skill-{category}` | Anything else | `skill-tools-postman` |

## Skills

| Skill | What it holds | Dependencies |
|-------|---------------|------------|
| `author-ontology` | Guidance on how to author an ontology document or an Ontology section within a document | None |
| `author-skills` | Rules for naming and structuring skills and commands, which add to Anthropic's `skill-creator` skill | `skill-creator:skill-creator` (not in this package), `author-ontology`, `author-standards`, `author-sop` |
| `author-sop` | Guidance on how to author an SOP document or an SOP section within a document | `author-ontology` |
| `author-standards` | Guidance on how to author a standards document or a standards section within a document | None |
| `sop-agent-orchestrator` | A procedure for executing a task by splitting it into subtasks for subagents, with a fixed method for briefing each subagent and for passing results between the subagents and the orchestrator | None |
| `sop-code-review` | Procedures for performing a code review that checks code against `standards-code`, in a light and a heavy variant | `standards-code` |
| `sop-skill-review` | Procedures for performing a skill review that checks a skill against the authoring skills, in a light and a heavy variant | `skill-creator:skill-creator` (not in this package), `author-skills`, `author-standards`, `author-sop`, `author-ontology` |
| `sop-writing-review` | Procedures for performing a writing review that checks writing against `standards-writing`, in a light and a heavy variant | `standards-writing` |
| `standards-code` | 46 rules for code, in five documents that cover correctness, security, design, documentation, and package layout | `standards-writing`, `author-standards` |
| `standards-writing` | 39 rules for prose and technical writing that is plain, concise, and free of the habits that mark text as AI-generated | `author-standards` |

## Review Types

Each review skill is broken down into separate review procedures that differ in how thorough they are, such as light, heavy, and extensive.

- **Light**: The agent checks its own work against the standards in one pass. Each review skill runs this procedure unless you ask for another.
- **Heavy**: The agent starts a separate reviewer subagent for each rule, so it costs far more than a light review.

## License

[MIT](../../LICENSE) © Thiago Pereira

The `author-sop` skill is adapted from the `agent-sop-author` skill in [strands-agents/agent-sop](https://github.com/strands-agents/agent-sop), which is licensed under the Apache License 2.0. That folder keeps the Apache license and the original copyright notice (see `skills/author-sop/LICENSE` and `skills/author-sop/NOTICE`).
