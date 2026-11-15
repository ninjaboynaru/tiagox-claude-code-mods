# Heavy Code Review Procedure

## Overview

This procedure checks code against the Code Standards in `standards-code` one file and one rule at a time. Each file under review gets one reviewer subagent for each rule in each standards document, and each reviewer checks its one file against its one rule and nothing else. A verifier subagent then checks each reported violation on its own and rules it valid or invalid. A fixer subagent fixes only the valid violations, and the review runs again until a review run finds no valid violations or a loop limit is reached. Run this procedure only when you are explicitly told to.

## Ontology

These are the concepts, categories, entities, terms, and relationships used in this procedure:

- **Code Standards**: The standards documents in `standards-code` that the code is checked against. Each one holds numbered rules.

- **Review of changes**: A review that covers a diff, a branch, or a feature, in which only the changed code may be reported on.

- **Review of existing code**: A review that covers code as it stands, with no change to compare it against.

- **Reviewer**: A subagent that checks one file against one rule of the Code Standards and reports the violations it finds.

- **Verifier**: A subagent that checks one violation entry, tries to refute it, and gives a verdict on it.

- **Fixer**: The subagent that fixes the valid violations of one review run.

- **Review run**: One round in which every reviewer checks its file against its rule.

- **Verification run**: One round in which every verifier checks its one violation entry. It follows the review run it checks.

- **Fix run**: One round in which the fixer fixes the valid violations of the verification run before it.

- **Workspace**: The temporary folder that holds the review files, the violation files, the verdict files, and the verified and rejected violation files.

- **Review files**: The three files every subagent works from, which are the scope file, the intentional design decisions file, and the spec file.

- **Scope file**: The file in the workspace, `code-under-review.md`, that lists the code under review.

- **Intentional design decisions file**: The file in the workspace, `intentional-design-decisions.md`, that lists the design decisions, faults, and trade-offs that were accepted on purpose.

- **Requirement**: A statement of what the code under review needs to accomplish, from a high-level point of view.
	- Example: "When the user presses the record button, the audio is sent to the application."

- **Specification**: A statement of how a requirement is going to be accomplished, still from a generally high-level point of view.
	- Example: "The application transcribes the user's audio with an external API rather than an internal one."

- **Spec file**: The file in the workspace, `specs.md`, that lists the requirements and the specifications the code under review is supposed to meet.

- **Violation file**: The file one reviewer writes its violations to.

- **Violation entry**: One numbered violation in a violation file, under a heading such as `## Violation 2`. A violation entry is the unit a verifier checks, so each one can be addressed by its violation file and its number.

- **Combined violation file**: The file that joins every violation file of one review run. It is the complete record of what the reviewers reported.

- **Verdict**: The finding a verifier gives on its violation entry, which is either valid or invalid.

- **Valid violation**: A violation entry whose verdict is valid, which means the verifier could not refute it.

- **Rejected violation**: A violation entry whose verdict is invalid.

- **Verdict file**: The file one verifier writes its verdict to, in the review run folder, such as `review-run-1/verdict-file-03-design-rule-02-violation-2.md`. Its name is `verdict-` followed by the name of the violation file and the entry number.

- **Verified violation file**: The file `verified-violations.md` in the review run folder, which holds the valid violations only. The fixer works from it.

- **Rejected violation file**: The file `rejected-violations.md` in the review run folder, which holds the rejected violations, each with the reason for its verdict.

## Parameters

- **code** (required): The code to review, given as file paths, a folder, or a set of changes such as a diff or a branch.
- **max_loops** (optional, default: 4): The largest number of review runs to perform.

**Constraints for parameter acquisition:**
- If all required parameters are already provided, You MUST proceed to the Steps
- If any required parameters are missing, You MUST ask for them before proceeding
- When asking for parameters, You MUST request all parameters in a single prompt
- When asking for parameters, You MUST use the exact parameter names as defined

## Steps

Copy this checklist and check off each step as you complete it.

```
Heavy Code Review Progress:
- [ ] Step 1: Prepare the workspace
- [ ] Step 2: Prepare the review files
- [ ] Step 3: Run a review run
- [ ] Step 4: Run a verification run
- [ ] Step 5: Run a fix run
- [ ] Step 6: Repeat until clean or the loop limit
- [ ] Step 7: Report the result
```

### 1. Prepare the workspace

Create a temporary workspace folder that holds everything this procedure produces.

**Constraints:**

- You MUST NOT run this procedure if you are one of the subagents it starts, because each subagent would then start subagents of its own without end.
- You MUST create one uniquely named workspace folder in the system temp directory for this procedure, such as `heavy-code-review-<unique id>/`.
- You MUST create a folder inside the workspace for each review run, named `review-run-1/`, `review-run-2/`, and so on, at the time that run is needed.
- You MUST keep the three review files from Step 2, every violation file, every verdict file, and the verified and rejected violation files inside the workspace.

### 2. Prepare the review files

Decide what kind of review this is, then write three files in the workspace that every subagent works from. The scope file lists the code under review. The intentional design decisions file lists the faults and trade-offs that were accepted on purpose. The spec file lists the requirements and the specifications the code under review is supposed to meet.

**Constraints:**

- The kind of review:
	- You MUST determine whether this is a review of changes, such as a diff, a branch, or a feature, or a review of existing code as it stands, because that decides which code a reviewer may report on.
	- You MUST ask the user which kind of review this is when you are unsure.
	- You MAY decide the kind of review without asking when the request or its context makes it obvious.
- The scope file:
	- You MUST write the scope file as `code-under-review.md` in the workspace, and state at its top whether the review covers changes or existing code.
	- You MUST give the scope file an "In scope" section and an "Out of scope" section.
	- You MUST list every file under review in the "In scope" section with a number and its full path, such as `file-03`.
	- You MUST list in the "In scope" section, for a review of changes, the changes under review in each file, given as line ranges or as the command that shows the diff.
	- You MUST list in the "Out of scope" section the code and changes that are not under review, such as generated code or unrelated edits in the same file, with the reason each one is left out.
- The intentional design decisions file and the spec file:
	- You MUST write the intentional design decisions file as `intentional-design-decisions.md` in the workspace, and list in it every uncommon design decision, known fault, and known trade-off in the code under review that was made on purpose, with the reason for each one.
	- You MUST write the spec file as `specs.md` in the workspace, and give it a "Requirements" section and a "Specifications" section.
	- You MUST list in the "Requirements" section every requirement the code under review is supposed to meet, and in the "Specifications" section every specification it is supposed to meet.
	- You MUST take the design decisions, the requirements, and the specifications from the user, the request, and the package's own documents, and you MUST NOT make any up, because a reviewer treats everything in these files as fact.
	- You MUST write that none are known in a file or a section you have nothing to list in, so that a reviewer can tell an empty one apart from a missing one.
	- You MUST NOT invent a requirement to go with a specification, or a specification to go with a requirement, because the code under review can have requirements and no specifications, or specifications and no requirements, and a reviewer would judge the code against the invented one.
- You MUST NOT copy the code into the workspace, because code builds and runs only inside its package, so the subagents read and change it where it is.

### 3. Run a review run

For each file in the scope file, start one reviewer subagent for each rule in each standards document of the Code Standards. Each reviewer checks its one file against its one rule and reports what it finds.

**Constraints:**

- Which reviewers to start:
	- You MUST start one reviewer subagent for every pairing of a file and a rule, so that every file is checked against every rule in every standards document.
	- You MUST NOT start a reviewer, in a review of existing code, for a rule that the `SKILL.md` of this skill lists as applying only to a review of changes, because there is no change to judge that rule against.
	- You MUST run at most five reviewer subagents at a time, and start the next ones as earlier ones finish.
- What each reviewer reads:
	- You MUST assign each reviewer exactly one file and exactly one rule, and tell it to check that file against that rule only, because a reviewer with one file and one rule reads the file with full attention on that rule.
	- You MUST instruct each reviewer to load `standards-code` and read its assigned rule in full, along with the Exceptions section of that skill.
	- You MUST instruct each reviewer to read the scope file, the intentional design decisions file, and the spec file before it reviews.
	- You MUST tell each reviewer to read the other files in the change, and any other code in the package, that its rule cannot be checked without, such as the callers of a changed function for the rule about breaking behavior that other code depends on.
	- You MUST leave each reviewer to work out for itself which other files those are.
- What each reviewer may report:
	- You MUST tell each reviewer to report violations only in its assigned file and only in the code the scope file puts under review.
	- You MUST tell each reviewer, in a review of changes, to report violations only in the changed code and never in the existing code around it, because a fault in code the change did not touch is not what the review was asked to judge.
	- You MUST tell each reviewer not to report anything the intentional design decisions file lists, because those faults and trade-offs were accepted on purpose.
	- You MUST tell each reviewer to leave out anything an external standard of the package requires, since an external standard overrules the Code Standards.
	- You MUST tell each reviewer to judge the code against the spec file wherever its rule depends on a requirement or a specification.
- How each reviewer reports:
	- You MUST give each reviewer its own violation file inside the current review run folder, named after its file number, standards document, and rule, such as `review-run-1/file-03-design-rule-02.md`.
	- You MUST require every violation entry to give the file path and line number and to quote the code that breaks the rule.
	- You MUST require each reviewer to write every violation as its own numbered entry under a heading `## Violation 1`, `## Violation 2`, and so on, in that order, because a verifier is given one entry by its violation file and its number, and a violation that has no number of its own cannot be given to one verifier.
	- You MUST tell each reviewer to start a heading with `## Violation` for an entry only, because the tool that copies an entry out of its file in Step 4 finds the entry by that heading.
	- You MUST require a reviewer that finds nothing to write that it found no violations, with no violation entry, so that an empty result can be told apart from a reviewer that failed.
	- You MUST tell each reviewer to report violations only and never to edit the code, because reviewers editing the same files would overwrite each other and leave the fixer working from findings that no longer match the code.
	- You MUST require each reviewer to reply with only the number of violations it found, so that you know the result of the review run, and how many violation entries each violation file holds, without opening any file.
- The results of the review run:
	- You MUST combine every violation file in the current review run folder into one combined violation file in that folder, such as `review-run-1/combined-violations.md`, once all reviewers have finished.
	- You MUST build the combined file by joining the violation files with a command line tool, with each one under a heading that names its file, standards document, and rule, and you MUST NOT retype their contents, because retyping bloats your context and can drop or change an entry.
	- You MUST NOT read the violation files or the combined violation file yourself, because their contents bloat your context, unless you have an explicit and well-justified reason, such as listing the violations that remain in Step 7.

### 4. Run a verification run

If no reviewer in the current review run reported a violation, skip to Step 7.
Otherwise start one verifier subagent for each violation entry the reviewers reported. Each verifier checks whether its one violation is correct and writes its verdict to its own file.

**Constraints:**

- Which verifiers to start:
	- You MUST start one verifier subagent for every violation entry in the current review run, using the number of violations each reviewer replied with to know how many entries its violation file holds.
	- You MUST run at most five verifier subagents at a time, and start the next ones as earlier ones finish.
	- You MUST NOT judge a violation yourself in place of starting its verifier, because reading it bloats your context and replaces the independent check with your own opinion.
- What each verifier reads:
	- You MUST assign each verifier exactly one violation entry, by the path of its violation file and its entry number, and tell it to rule on that entry only, because a verifier with one entry gives it full attention.
	- You MUST instruct each verifier to read the scope file, the intentional design decisions file, and the spec file before it rules.
	- You MUST instruct each verifier to load `standards-code` and read the rule the entry names in full, with its bad and good examples, along with the Exceptions section of that skill.
	- You MUST instruct each verifier to read the code at the file path and line number the entry names and the code around it.
	- You MUST tell each verifier to read any other code its ruling depends on, such as the callers of a function, and leave it to work out for itself which code that is.
- How each verifier rules:
	- You MUST tell each verifier to try to refute the violation and to rule it valid only when it cannot, because a reviewer reads one file against one rule and can misjudge, and a verifier that only looks for support confirms every entry.
	- You MUST tell each verifier to give a verdict of valid or invalid, with a reason.
	- You MUST tell each verifier to give a verdict of invalid on any of these grounds:
		- The code does not break the rule as the rule is written.
		- The entry misreads the code or the rule.
		- The intentional design decisions file covers the code.
		- An external standard of the package requires the code as it is.
		- The fix the entry implies would change what the code does or break a specification in the spec file.
		- The entry is a matter of taste and not a breach of the rule.
		- The entry duplicates another entry. Give this verdict only when an entry that sorts earlier, by violation file name and then by entry number, reports the same fault in the same code, so that one of two duplicate entries always stays.
	- You MUST tell each verifier to search the other violation files in the current review run folder for an entry on the same code before it rules an entry a duplicate.
	- You MUST tell each verifier never to edit code, because verifiers editing the same files would overwrite each other and leave the fixer working from entries that no longer match the code.
	- You MUST tell each verifier never to add violations of its own, because finding violations is the job of the review run, and an entry no reviewer reported is an entry no verifier has checked.
- How each verifier reports:
	- You MUST give each verifier its own verdict file inside the current review run folder, named `verdict-` followed by the name of its violation file and its entry number, such as `review-run-1/verdict-file-03-design-rule-02-violation-2.md`, so that a stopped run keeps the verdicts that were finished.
	- You MUST require the first line of each verdict file to be exactly `Verdict: valid` or `Verdict: invalid`, followed by the reason for the verdict, and for an invalid verdict the ground from the list above, because you sort the entries by that first line with a command line tool and do not read the files.
	- You MUST require each verifier to reply with only its verdict, so that its reasoning does not bloat your context.
- The results of the verification run:
	- You MUST build the verified violation file as `verified-violations.md` in the current review run folder, from the valid violations only, once all verifiers have finished.
	- You MUST build the rejected violation file as `rejected-violations.md` in the same folder from the rejected violations, with the reason from each verdict file after its entry, so that what was rejected and why stays on record.
	- You MUST build both files with a command line tool, which reads the first line of each verdict file, copies the matching violation entry out of its violation file, and puts it under a heading that names its violation file and entry number. You MUST NOT retype the entries, because retyping bloats your context and can drop or change an entry.
	- You MUST NOT put a rejected violation in the verified violation file, because the fixer would then change code for a violation that is not correct.
	- You MUST NOT read the verdict files, the verified violation file, or the rejected violation file yourself, because their contents bloat your context, unless you have an explicit and well-justified reason, such as listing the violations that remain in Step 7.

### 5. Run a fix run

If no violation in the current verification run is valid, skip to Step 7.
Otherwise start one fixer subagent to fix the code where it is.

**Constraints:**

- What the fixer reads:
	- You MUST point the fixer to the three review files from Step 2 and the verified violation file in the current review run folder.
	- You MUST NOT point the fixer to the combined violation file or the rejected violation file, because they hold violations that no verifier confirmed, and the fixer would change code for them.
	- You MUST NOT parse and restate the violations yourself, because restating them can drop or change an entry.
	- You MUST instruct the fixer to load `standards-code` and, for each violation, to read the rule it names along with that rule's bad and good examples before fixing it.
- What the fixer may change:
	- You MUST tell the fixer to fix only the violations listed in the verified violation file and never to look for violations of its own, because finding violations is the job of the next review run and a change no reviewer asked for is a change no reviewer has checked.
	- You MUST tell the fixer not to change what the code does, because this review changes how the code is written and never its behavior.
	- You MUST tell the fixer to keep the code meeting every requirement and specification in the spec file and to leave every intentional design decision in place.
- What the fixer does when it has finished:
	- You MUST tell the fixer to update the scope file when it creates, renames, or moves a file, so that the next review run covers that file.
	- You MUST tell the fixer to run the package's own checks, such as its tests, build, and linter, once it has finished, when the package has them.
	- You MUST require the fixer to reply with only the files it changed and whether the package's checks passed.

### 6. Repeat until clean or the loop limit

Return to Step 3 and review the fixed code in a new review run folder.

**Constraints:**

- You MUST repeat Steps 3, 4, and 5 until a review run reports no violations, the verification run rules none of them valid, or you have performed `max_loops` review runs.
- You MUST start new reviewer and verifier subagents for each review run and have them write to that run's own folder.
- You MUST NOT perform more than `max_loops` review runs, because reviewers can keep raising judgment calls that no fix will settle.

### 7. Report the result

Tell the user how the review ended and what it changed.

**Constraints:**

- You MUST say how many review runs were performed and whether the code is now free of valid violations.
- You MUST say how many violations the reviewers reported in all the review runs and how many of them the verifiers rejected.
- You MUST say which files were changed and whether the package's checks pass.
- You MUST list every valid violation that remains if the loop limit stopped the procedure.
- You MAY delete the workspace once the report is made.

## Examples

### Example Input

```
code: tools/recipe-scaler/src/
max_loops: 2
```

### Example Output

```
The heavy code review of tools/recipe-scaler/src/ performed 2 review runs.

Review run 1 reported 9 violations across 5 rules. The verifiers rejected 2 of them, and the fix run fixed the other 7.
Review run 2 found no violations.

The reviewers reported 9 violations in all, and the verifiers rejected 2. The code is free of violations. The fix run changed scaleRecipe.ts and unitConversion.ts, and the package's tests pass.
```

## Troubleshooting

### A reviewer returns its violations in its reply and writes no file

Ask that reviewer to write the same list to its violation file, and continue once the file exists. The fixer reads the files, so a list that exists only in a reply never reaches it.

### A reviewer's violations are not numbered

Ask that reviewer to rewrite its violation file with each violation as its own `## Violation` entry, numbered from 1. A verifier is given one entry by its number, so an unnumbered list cannot be verified.

### A reviewer reports a violation of a rule it was not assigned

Leave the entry in the file. The verifier and the fixer read the rule each entry names and judge the entry against that rule.

### A verifier writes no verdict file, or its first line is not a verdict

Send that verifier again for the same entry and continue once its verdict file exists. An entry with no verdict is in neither the verified nor the rejected violation file, so the fixer would never see it.

### A verifier reports a violation of its own

Ignore it. The verifier's verdict file is read for its first line only, and a violation no reviewer reported is left for the next review run.

### A violation is rejected as a duplicate of an entry that was also rejected

Leave both rejected. The next review run reports the fault again if it is real, and a verifier rules on it then.

### The package's checks fail after a fix run

Send the fixer back with the failing output and tell it to repair what its fixes broke without undoing them. If the checks still fail, stop the procedure and report the failure to the user, since another review run would review code that does not work.
