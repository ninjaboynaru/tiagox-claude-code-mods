---
name: author-standards
description: Creates, updates, and maintains standards, which are rules that a kind of work such as code or writing must adhere to, along with the skills and standards documents that hold them. Use this skill whenever writing, editing, reorganizing, or reviewing a standards skill, a standards document, or any rule, clause, example, or guiding philosophy inside one, even if the user only says "add a rule", "add a standard", "give that rule an example", or "make this a standard".
metadata:
  license: MIT
  package: agent-config-skills
---

# Standards Author

A standard is a rule that a kind of work, such as code or writing, must adhere to. An agent loads the standards for a subject before it does that work, and a review checks the work against them. This skill says how to structure a skill that holds standards, how to write a standards document, and which rules to follow when writing and maintaining any standard.

## Ontology

These are the concepts, categories, entities, terms, and relationships used in this skill:

- **Standards skill**: A skill whose purpose is to hold the standards for one subject. Its name starts with `standards-`, such as `standards-code`.

- **Standards document**: One set of standards that covers a single area, such as code design. It is either a file under a skill's `standards/` folder or the `## Standards` section of a standards skill's `SKILL.md` (see Where Standards Go). Each document holds numbered rules and may open with a guiding philosophy.

- **Guiding philosophy**: The section at the top of a standards document that states the outlook its rules come from. It explains and does not command.

- **Principle**: One numbered idea inside a guiding philosophy. A principle is the reason behind one or more rules.

- **Internal standard**: Any requirement in a standards document that must be met. A rule and each of its clauses are internal standards. Unless otherwise stated, "standard" on its own means an internal standard.

- **External standard**: A requirement that comes from outside the standards documents, such as the conventions of a language or a publication's style guide.

- **Rule**: A numbered standard inside a standards document, such as Rule 1. A rule opens with prose that states it at a high level and holds one or more clauses.

- **Clause**: A lettered part of a rule that holds one sub-rule, such as Rule 2 clause B. A clause may hold prose, examples, or both.

- **Example**: A numbered pair of blocks under a clause, with the bad version first and the good version after it.

- **Caption**: The sentence in parentheses beside an example's label that says why the example is bad or good.

- **Exception**: A case where a standard does not apply, or where an external standard overrules an internal standard.

- **Maintenance rule**: A rule about how the standards themselves are written and kept up, as opposed to how the work they govern is done.

## Structure of a Standards Skill

1. Give `SKILL.md` these sections in this order:
	- An opening paragraph that says what the standards cover.
	- `## Standards`, which holds or links the standards (see Where Standards Go) and tells the reader to load this skill if and only if they need to write or edit the standards.
	- `## Ontology`, which defines the terms the skill uses.
	- `## Exceptions`, which says when a standard does not apply and when an external standard overrules it.
2. Put supporting material in `references/`.
3. Keep procedures out of a standards skill. Put the procedures that check work against the standards in an SOP skill.

## Where Standards Go

Place each standards document by the kind of skill that holds it and by how many standards documents that skill holds:

| Skill | Standards documents | Where each one goes |
|-------|---------------------|---------------------|
| Standards skill | One | In the `## Standards` section of `SKILL.md` |
| Standards skill | Two or more | In its own file in the skill's `standards/` folder |
| Skill with another purpose | Any number | In its own file in the skill's `standards/` folder |

1. Write one standards document per area.
2. Give each file in `standards/` a camelCase name such as `codeDesignStandards.md`, and link each one from the `## Standards` section of `SKILL.md`.
3. When a standards document goes in `SKILL.md`, write it inside the `## Standards` section. Use the `## Standards` heading as its top heading, and make every other heading one level deeper than Structure of a Standards Document shows, so that a rule sits under `### Rule 1` and a clause under `#### Clause A`.
4. Give a skill with another purpose a `## Standards` section that links its standards documents and tells the reader when to load this skill, as a standards skill does.

## Structure of a Standards Document

Write each standards document in this order:

1. A top heading, followed by one sentence that says what the standards in the document govern.
2. `## Guiding Philosophy`, when the document has one, with each principle under a heading such as `### Principle 1: Code Readability`.
3. The numbered rules, each under a heading such as `## Rule 1: Use explicit names`.
4. The lettered clauses of each rule, each under a heading such as `### Clause A: Prefer the longer name that removes ambiguity`.
5. The examples of each clause, each written as a label and caption followed by a fenced block whose lines are indented with one tab.

## Standard Maintenance Rules

Follow these rules when writing and maintaining any standard.

- **Commanding tone**: Write every rule, clause, and maintenance rule as a command, either in the imperative or with "must". Give the command where a description of an ideal state would otherwise go. An Exceptions section may describe.
	- Bad: "Every rule has at least one clause." (This describes a state of things and commands nothing.)
	- Good: "Every rule must have at least one clause." (This commands with "must".)
	- Good: "Give every rule at least one clause." (This commands in the imperative.)

- **Guiding philosophy limits**: Give a standards document at most one guiding philosophy, and give that guiding philosophy at most four principles.

- **Numbering**: Number every rule and letter every clause in sequence. When a rule or clause is added, removed, or moved, renumber the ones after it and update every reference to them, both in the standards and in any skill or document that cites them.

- **Rule titles**: Write every rule title and clause title as a command in sentence case, with no period at the end.

- **Rule openings**: Open every rule with simple, concise prose in complete English sentences that states the rule at a high level and summarizes all of it. A rule whose whole content is a single paragraph may open directly with its first clause.

- **Prose placement**: Put prose in the most appropriate place. Put prose that applies to the whole rule under the rule heading, and put prose that applies to one clause under that clause.

- **Clauses**: Every rule must have at least one clause, and every sub-rule must live in its own clause. Give a rule with a single sub-rule one clause that holds the rule's guidance and examples. Name that clause after the rule, or give it its own name.

- **Clause format**: Write each clause as a markdown heading one level below its parent rule's heading, lettered in order. Cite a clause as Rule X clause Y from outside its rule, or as clause Y from within it.

- **Example placement**: Place each example under the clause it illustrates.

- **Example pairing**: Write every example as a pair that shares one number, with the bad version first and the good version directly after it, labeled `**Example 1 - Bad**` and `**Example 1 - Good**`. Every bad example must have a good one, and every good example must have a bad one.

- **Example captions**: Give every bad and good example a brief caption, written as a complete English sentence, that explains at a high level why the example is bad or good, such as ``(The name `activeCount` does not say what is being counted)``.

- **Example subjects**: Build every example on a neutral, generic subject, such as an online store or a weather service. Never take an example from the user's real work, data, or code.

- **Example truth**: Every example must be objectively true. Anything an example takes from the real world, such as a library API, a command, a fact, a name, a date, or a source, must exist and be what the example shows, having been verified against the real thing. Where an example needs an invented person or organization, use an obviously generic stand-in, such as Senator Smith.

- **Example compliance**: Every good example must follow all of the standards in its skill, not only the one it illustrates. Every bad example must follow all of them except the one whose violation it demonstrates. This keeps a reader from learning bad behavior from an example while trying to learn the right one.

- **Maintenance rule ownership**: Keep the Standard Maintenance Rules in this skill alone. Have every skill that holds standards name this skill in its `## Standards` section.
