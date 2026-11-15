---
name: sop-writing-review
description: 'Procedures for reviewing writing against a set of writing standards. Use this skill when you need to verify that technical writing, prose writing, or communication with humans, which means messages to the user and messages or emails to other people, adheres to the writing standards. Also use it when asked to review, check, audit, or fix the quality or conciseness of writing, when asked for a light or heavy writing review, and when rewriting a response the user said was too long, too verbose, confusing, or in some other way wrong.'
metadata:
  license: MIT
  package: agent-config-skills
  dependency-skills: agent-config-skills:standards-writing
---

# Writing Review

Procedures for checking technical writing, prose writing, and communication with humans against the Writing Standards in `standards-writing`. Load that skill first and read it completely before you run either procedure.

## Procedures

- [Light Writing Review Procedure](procedures/lightWritingReviewProcedure.md)
- [Heavy Writing Review Procedure](procedures/heavyWritingReviewProcedure.md)

Default to the Light Writing Review Procedure.
Run the Heavy Writing Review Procedure only when you are explicitly told to.

## When this skill is loaded without instructions

If the user loads this skill without any further instructions or guidance, assume the user is telling you that your previous response or responses were verbose, confusing, difficult to read, or in some other way violated the Writing Standards. Correct your previous response, and make sure all of your future responses adhere to the Writing Standards.
