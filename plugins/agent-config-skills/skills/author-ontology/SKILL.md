---
name: author-ontology
description: Creates and updates Ontology sections, which define the terms, entities, categories, and relationships that make up the conceptual model of a skill, an agent, a procedure, a standards document, or any other document. Use this skill whenever writing, editing, or reviewing an Ontology section or a glossary of terms meant for an agent, and whenever creating a skill, an agent, or an SOP, since each of those needs an Ontology section, even if the user only says "define the terms", "add an ontology", or "add a glossary".
metadata:
  license: MIT
  package: agent-config-skills
---

# Ontology Author

An ontology defines the terms, entities, categories, and relationships that make up the conceptual model of the skill, document, or area it sits in, so that the agents and humans reading it work from a shared mental model. Any document can hold one, such as a skill, an agent, an SOP, a standards document, or a doc.

## Ontology

These are the concepts, categories, entities, terms, and relationships used in this skill:

- **Ontology section**: The section of a document, headed `## Ontology`, that holds its ontology.

- **Conceptual model**: The author's picture of the subject, meaning the things it is made of, the kinds those things fall into, and how they relate to each other.

- **Entry**: One defined term in an Ontology section, written as a bolded term followed by its definition.

## Where an Ontology Section Goes

1. Give every skill, every agent definition, and every SOP an Ontology section.
2. Add an Ontology section to any other document that uses terms of its own.

## How to Write an Ontology Section

1. Head the section `## Ontology`.
2. Open every Ontology section with one fixed sentence, ending it with the kind of document the section sits in.
	- Example in a skill: "These are the concepts, categories, entities, terms, and relationships used in this skill:"
	- Example in a procedure: "These are the concepts, categories, entities, terms, and relationships used in this procedure:"
3. Define each term as a bolded term followed by its definition.
4. Make every entry accurate, so that its definition matches how the document uses the term.
	- Bad: "**Rule**: A numbered standard. A rule opens with prose that states it at a high level." (Most rules in the document go straight to their first clause, so the entry misrepresents them.)
	- Good: "**Rule**: A numbered standard. A rule holds one or more clauses and may open with prose that states it at a high level." (The entry matches what the rules in the document look like.)
5. Use each defined term the same way everywhere in the document.

## Keep Ontologies Up to Date and Accurate

Keep every ontology up to date as the domain it describes changes.

When you change that domain, update the ontology in the same piece of work, because an entry that no longer matches its subject gives the next reader the wrong conceptual model. Or a domain of work with new concepts and terms needs an updated ontology.
