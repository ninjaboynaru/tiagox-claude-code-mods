---
name: standards-code
description: "List of standards for writing code that is correct, secure, and well designed, and for code comments, code documentation, code package documentation such as README.md and doc files, and organizing a package's files, folders and conventions. Use this skill when writing new code, editing existing code, refactoring, or reviewing code."
metadata:
  license: MIT
  package: agent-config-skills
  dependency-skills: agent-config-skills:standards-writing, agent-config-skills:author-standards
---

# Code Standards

General standards for writing code that is correct, secure, and well designed, writing code comments, writing code documentation, code package documentation, and organizing a package's files and folders. Apply this to any code base and language unless an external standard overrules these standards.

## Standards

- [Code Correctness Standards](standards/codeCorrectnessStandards.md)
- [Code Security Standards](standards/codeSecurityStandards.md)
- [Code Design Standards](standards/codeDesignStandards.md)
- [Code Documentation Standards](standards/codeDocumentationStandards.md)
- [Code Package Standards](standards/codePackageStandards.md)

Load `author-standards` if and only if you need to write or edit these standards.

## Ontology

These are the concepts, categories, entities, terms, and relationships used in this skill:

- **Standards document**: One file under `standards/` that covers a single area, such as code correctness, code design, code documentation, or package structure. Each document holds a guiding philosophy followed by numbered rules.

- **Guiding philosophy**: The section at the top of a standards document that states the outlook its rules come from.

- **Principle**: One numbered idea inside a guiding philosophy, such as Don't Repeat Yourself. A principle is the reason behind one or more rules.

- **Internal standard**: Any requirement in these documents that must be met. A rule and each of its clauses are internal standards. Unless otherwise stated, "standard" on its own means an internal standard.

- **External standard**: A requirement that comes from outside these documents. It covers the configuration of a linter, formatter, or other tool in the package or one of its imports, the package's explicit conventions and rules, and the conventions of its language.

- **Rule**: A numbered standard inside a standards document, such as Rule 1. A rule holds one or more clauses and may open with prose that states it at a high level.

- **Clause**: A lettered part of a rule that holds one sub-rule, such as Rule 2 clause B. A clause may hold prose, examples, or both.

- **Example**: A numbered pair of code blocks under a clause, with the bad version first and the good version after it.

- **Caption**: The sentence in parentheses beside an example's label that says why the example is bad or good.

- **Exception**: A case where an external standard overrules an internal standard (see Exceptions).

- **Package**: The codebase or project the code belongs to, with its own files, folders, tooling, and conventions.

## Exceptions

An external standard is a requirement that comes from outside these documents. It covers the configuration of a linter, formatter, or other tool in the package or one of its imports, the package's explicit conventions and rules, and the conventions of its language. An external standard overrules these standards where the two conflict. When an external standard requires something a standard forbids, or forbids something a standard requires, follow the external standard.

The overrule reaches only the specific requirement in conflict. Every other standard stays in full force, and so does the rest of a standard that is only partly overruled.

Meet the external standard with the smallest change that satisfies it.
