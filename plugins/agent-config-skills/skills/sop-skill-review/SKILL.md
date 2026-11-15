---
name: sop-skill-review
description: 'Procedures for reviewing an LLM agent skill or command. Use this skill whenever you need to verify that a skill is properly written, meets the skill authoring standards and requirements, and follows best practices. Also use it when asked to review, check, audit, or fix a skill or a command, when you have just created or edited a skill, and when asked for a light or heavy skill review.'
metadata:
  license: MIT
  package: agent-config-skills
  dependency-skills: skill-creator:skill-creator, agent-config-skills:author-skills, agent-config-skills:author-standards, agent-config-skills:author-sop, agent-config-skills:author-ontology
---

# Skill Review

Procedures for checking a skill or a command against the authoring skills that say how it must be written.

## Procedures

- [Light Skill Review Procedure](procedures/lightSkillReviewProcedure.md)
- [Heavy Skill Review Procedure](procedures/heavySkillReviewProcedure.md)

Default to the Light Skill Review Procedure.
Run the Heavy Skill Review Procedure only when you are explicitly told to.

## Rules for Both Procedures

1. Check a skill against `skill-creator` by reading the skill. Run the parts of `skill-creator` that go beyond reading, which are its test cases, evals, benchmarks, blind comparisons, description optimization, and packaging, only when the user explicitly asks for them.
2. Where `skill-creator` disagrees with another authoring skill, follow the other authoring skill, and treat text that follows it as correct. An SOP, for example, states its constraints with MUST, SHOULD, and MAY as `author-sop` requires, though `skill-creator` advises against that wording. This holds for a skill that is an SOP and for an SOP inside any other skill.

## Ontology

These are the concepts, categories, entities, terms, and relationships used in this skill:

- **Skill under review**: The skill or command being checked, which is its `SKILL.md` and every other file in its folder.

- **Authoring skill**: A skill that says how one kind of content is written. A skill under review is checked against each authoring skill that matches what it holds:
	- `skill-creator` covers everything about a skill, such as its intent, its description and body, and the organization and format of its folder and the other files in it.
	- `author-skills` covers the name, the frontmatter, and the layout of every skill.
	- `author-standards` covers any standards the skill holds.
	- `author-sop` covers any SOP the skill holds.
	- `author-ontology` covers any Ontology section the skill holds.

- **Light review**: A review in which you check the skill yourself in one pass.

- **Heavy review**: A review in which a separate reviewer subagent checks each pairing of a file and an authoring skill, and a fixer subagent fixes what the reviewers found.
