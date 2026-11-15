---
name: sop-code-review
description: 'Procedures for reviewing code against a set of code standards. Use this skill when you need to verify that code, code comments, code documentation, or the files and folders of a package adhere to the code standards. Also use it when asked to review, check, audit, or fix the quality of code, and when asked for a light or heavy code review.'
metadata:
  license: MIT
  package: agent-config-skills
  dependency-skills: agent-config-skills:standards-code
---

# Code Review

Procedures for checking code, code comments, code documentation, and the files and folders of a package against the Code Standards in `standards-code`. Load that skill first and read it completely before you run either procedure.

## Procedures

- [Light Code Review Procedure](procedures/lightCodeReviewProcedure.md)
- [Heavy Code Review Procedure](procedures/heavyCodeReviewProcedure.md)

Default to the Light Code Review Procedure.
Run the Heavy Code Review Procedure only when you are explicitly told to.

## Which rules apply to which kind of review

A review is one of two kinds. A review of changes covers a diff, a branch, or a feature. A review of existing code covers code as it stands, with no change to compare it against.

Every rule in the Code Standards applies to both kinds of review, except the rules below. They apply only to a review of changes, because they judge a change against what existed before it:

- Code Correctness Standards Rule 7: Do not break behavior that other code depends on
- Code Correctness Standards Rule 8: Keep changes backward compatible with old data and old clients
