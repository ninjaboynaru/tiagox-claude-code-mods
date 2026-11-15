---
name: standards-writing
description: 'Standards for technical writing, prose, and messages to the user or to other people, so that writing reads like natural human writing, free of AI slop, in a concise, plain-language style. Use this skill before writing or editing any prose, note, log, document, message, email, or response. Also use it when the user asks for writing that is concise, simple, or free of jargon, or says a response was too long or confusing, even if they only say "shorter" or "simpler".'
metadata:
  license: MIT
  package: agent-config-skills
  dependency-skills: agent-config-skills:author-standards
---

# Writing Standards

General standards for technical writing, prose writing, and communication with humans. Apply this to all writing, including responses to the user, unless an external standard, such as a publication's style guide, overrules these standards.

## Standards

- [Writing Standards](standards/writingStandards.md)

Read the Writing Standards in full before writing or editing anything.

Load `author-standards` if and only if you need to write or edit these standards.

## Ontology

These are the concepts, categories, entities, terms, and relationships used in this skill:

- **Standards document**: One file under `standards/` that covers a single area, such as writing. Each document holds a guiding philosophy followed by numbered rules.

- **Guiding philosophy**: The section at the top of a standards document that states the outlook its rules come from. It explains and does not command.

- **Principle**: One numbered idea inside a guiding philosophy. A principle is the reason behind one or more rules.

- **Internal standard**: Any requirement in these documents that must be met. A rule and each of its clauses are internal standards. Unless otherwise stated, "standard" on its own means an internal standard.

- **External standard**: A requirement that comes from outside these documents, such as a publication's style guide, a document template, or the format a form or platform requires.

- **Rule**: A numbered standard inside a standards document, such as Rule 1. A rule opens with prose that states it at a high level and holds one or more clauses.

- **Clause**: A lettered part of a rule that holds one sub-rule, such as Rule 26 clause B. A clause may hold prose, examples, or both.

- **Example**: A numbered pair of text blocks under a clause, with the bad version first and the good version after it.

- **Caption**: The sentence in parentheses beside an example's label that says why the example is bad or good.

- **Exception**: A case where a standard does not apply (see Exceptions).

- **AI tell**: A word, phrase, punctuation pattern, or structural habit that marks text as AI-generated. The Writing Standards ban each known one in a rule.

- **AI tell maintenance rule**: A rule about how the rules that ban AI tells are written and kept up, as opposed to how prose is written (see AI Tell Maintenance Rules).

## Exceptions

Writing that is explicitly intended to be verbatim, and verbatim quotes, are exempt from these standards. Examples include journal entries, dictated notes, and quotes. Never rewrite such writing to comply unless explicitly asked to.

An external standard is a requirement that comes from outside these documents, such as a publication's style guide, a document template, or the format a form or platform requires. An external standard overrules these standards where the two conflict. When an external standard requires something a standard forbids, or forbids something a standard requires, follow the external standard.

The overrule reaches only the specific requirement in conflict. Every other standard stays in full force, and so does the rest of a standard that is only partly overruled.

Meet the external standard with the smallest change that satisfies it.

A word or phrase that a rule lists as an AI tell is exempt in these cases:

- It sits inside a direct quotation from a cited source, or inside a title, a name, or another verbatim value taken from a source.
- It sits inside code, configuration, or markup that is shown as an example.
- It carries its literal or technical meaning, which usually shows in the named entity, date, or figure beside it. The word "comprehensive" is a tell in "a comprehensive examination of the issues" and is exempt in "comprehensive coverage", which is the name of a kind of car insurance.

## AI Tell Maintenance Rules

Follow these rules when writing and maintaining a rule that bans an AI tell.

- **AI tell format**: Give the banned words, phrases, or patterns of a rule as a table or a plain list inside the clause that bans them. Where each one has a plain replacement, use a table with the columns Avoid and Use Instead.

- **AI tell duplication**: List each word, phrase, or pattern under one rule only. When it fits more than one rule, put it under the closest fit and leave it out of the others.
