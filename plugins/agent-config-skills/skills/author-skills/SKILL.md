---
name: author-skills
description: 'Guidance on how to create, name, and structure an LLM agent skill or command. Covers skill naming, metadata, description, content and sections, source attribution, formatting, and skill types. Use this skill whenever you create, edit, rename, or review a skill or a command, name or rename a skill or command, or modify a skill or command.'
metadata:
  license: MIT
  package: agent-config-skills
  dependency-skills: skill-creator:skill-creator, agent-config-skills:author-ontology, agent-config-skills:author-standards, agent-config-skills:author-sop
---

# Skill Author

Anthropic's official `skill-creator` skill is the first level of rules for writing a skill. It covers everything about a skill, such as its intent, its description and body, and the organization and format of its folder and the other files in it. This skill adds a second level on top of it, which covers how a skill is named, what every skill must hold, and how the skills for standards and SOPs are laid out.

Load `skill-creator` before you write or edit any skill, and follow it along with the rules below. If `skill-creator` is not available, stop, tell the user, and ask what to do.

Run the parts of `skill-creator` that go beyond writing a skill only when the user explicitly asks for them. Those parts are its test cases, evals, benchmarks, blind comparisons, description optimization, and packaging.

Where `skill-creator` disagrees with this skill, `author-standards`, `author-sop`, or `author-ontology`, follow the other skill, because each of those adds to `skill-creator` for one kind of content. An SOP, for example, states its constraints with MUST, SHOULD, and MAY as `author-sop` requires, though `skill-creator` advises against that wording. This holds for a skill that is an SOP and for an SOP inside any other skill.

## Ontology

These are the concepts, categories, entities, terms, and relationships used in this skill:

- **Skill**: A folder whose `SKILL.md` gives an agent instructions for one kind of task.

- **Command**: A skill that only a human can invoke.

- **Prefix**: The first part of a skill's name, which says what kind of content the skill holds.

- **Standards skill**: A skill that holds standards, which are rules that a kind of work, such as code or writing, must adhere to.

- **SOP skill**: A skill that holds one or more SOPs.

- **SOP**: A standard operating procedure, also called a procedure, which is a formal, discrete set of steps that forms a workflow an agent follows to accomplish a goal.

- **Authoring skill**: A skill that says how one kind of content is written, such as this one.

## Naming

Name a skill by what it holds, with one of these prefixes:

| Prefix | What the skill holds | Example |
|--------|----------------------|---------|
| `standards-{subject}` | The standards for one subject | `standards-code` |
| `sop-{name}` | One or more SOPs | `sop-code-review` |
| `author-{type}` | How one kind of content is written | `author-sop` |
| `cmd-{category}` | A command | `cmd-git-commit` |
| `skill-{category}` | Anything else | `skill-tools-postman` |

Choose a `{category}` that groups related skills together, so that a human scanning the list of skills sees them side by side.

## Skill Types

Follow the rules below for the type of skill you are writing.

### Commands

Start the name of a command skill with `cmd-{category}`, and set the skill so that only a human can invoke it. The setting depends on the agent harness:

- **Claude Code**: Put `disable-model-invocation: true` in the frontmatter of `SKILL.md`.
- **Any other harness**: Use that harness's equivalent setting.

### Standards Skills

A standards skill holds the standards for one subject, which are the rules that a kind of work, such as code or writing, must adhere to.

The `author-standards` skill contains instructions for how to write standards, the structure of a standards document, and the rules for maintaining standards. Load it and follow it when you write or edit a standards skill or write or edit a skill that contains standards.

### SOP Skills

An SOP skill holds one or more SOPs. An SOP is a standard operating procedure, and SOPs are sometimes referred to simply as procedures.

The `author-sop` skill owns the format of an SOP. Load it and follow it when you write or edit an SOP skill, or a skill that contains SOPs, along with these rules:

1. Put a skill's only SOP directly in `SKILL.md`.
2. When a skill holds several SOPs, store each SOP in its own companion document in a folder inside the skill, and link to each one under a `## Procedures` section in `SKILL.md`. Say there which SOP is the default.

## Ontology Section

Give every skill a `## Ontology` section, written as the `author-ontology` skill sets out. The section gives the agent the same meaning for each term that the author had, so the agent does not have to work the terms out again and operates from the same mental model as the original author.

## Frontmatter Metadata

Put the entries below under the `metadata` field of a skill's frontmatter.

### Source Attribution

When a skill is copied or adapted from an external source, add these two entries, so that a later reader can find the original, compare the two, and check its license:

- `metadata.source`: The URL the content came from.
- `metadata.sourceRelationship`: `copy` when the content is an exact copy of the source, or `modified` when it has been changed from the source.

### Package and License

- `metadata.package`: The name of the package the skill is published in. Add it when the skill belongs to a package.
- `metadata.license`: The license the skill is released under, written as its short identifier, such as `MIT` or `Apache-2.0`.

### Skill Dependencies

When a skill tells the agent to load or follow another skill, name that skill in a `metadata.dependency-skills` entry. No agent harness reads this entry. It is a record that tells a person or an agent which other skills to get along with this one. Leave the entry out when the skill depends on no other skill.

Write the entry as one line of skill names separated by commas. Write each skill as `plugin-name:skill-name`, where the plugin name is the plugin or package the skill comes from, so that the reader knows where to get it. This is also the name Claude Code gives a skill that it loads from a plugin. Write a skill that belongs to no plugin or package by its name alone.

```yaml
metadata:
  dependency-skills: skill-creator:skill-creator, agent-config-skills:author-ontology
```

List only skills this skill depends on in this entry, not non-skill dependencies.
