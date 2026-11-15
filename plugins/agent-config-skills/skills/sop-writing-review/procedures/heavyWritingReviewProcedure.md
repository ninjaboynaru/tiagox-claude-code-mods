# Heavy Writing Review Procedure

## Overview

This procedure checks a piece of writing against the Writing Standards in `standards-writing` one rule at a time. Each rule gets its own reviewer subagent, which checks the whole writing against that rule and no other. A fixer subagent then fixes what the reviewers found, and the review runs again until a review run finds no violations or a loop limit is reached. Run this procedure only when you are explicitly told to.

## Ontology

These are the concepts, categories, entities, terms, and relationships used in this procedure:

- **Writing Standards**: The standards document in `standards-writing` that the writing is checked against. It holds numbered rules.

- **Reviewer**: A subagent that checks the whole writing against one rule of the Writing Standards and reports the violations it finds.

- **Fixer**: The subagent that fixes the violations the reviewers found in one review run.

- **Review run**: One round in which every reviewer checks the writing against its rule.

- **Fix run**: One round in which the fixer writes a fixed copy of the writing from what the review run before it found.

- **Workspace**: The temporary folder that holds the copies of the writing and the violation files.

- **Violation file**: The file one reviewer writes its violations to.

- **Combined violation file**: The file that joins every violation file of one review run. The fixer works from it.

## Parameters

- **writing** (required): The writing to review, given as a file path or as text.
- **max_loops** (optional, default: 4): The largest number of review runs to perform.

**Constraints for parameter acquisition:**
- If all required parameters are already provided, You MUST proceed to the Steps
- If any required parameters are missing, You MUST ask for them before proceeding
- When asking for parameters, You MUST request all parameters in a single prompt
- When asking for parameters, You MUST use the exact parameter names as defined

## Steps

Copy this checklist and check off each step as you complete it.

```
Heavy Writing Review Progress:
- [ ] Step 1: Prepare the workspace
- [ ] Step 2: Prepare the writing
- [ ] Step 3: Run a review run
- [ ] Step 4: Run a fix run
- [ ] Step 5: Repeat until clean or the loop limit
- [ ] Step 6: Report the result
```

### 1. Prepare the workspace

Create a temporary workspace folder that holds everything this procedure produces.

**Constraints:**

- You MUST NOT run this procedure if you are one of the subagents it starts, because each subagent would then start subagents of its own without end.
- You MUST create one uniquely named workspace folder in the system temp directory for this procedure, such as `heavy-writing-review-<unique id>/`.
- You MUST create a folder inside the workspace for each review run, named `review-run-1/`, `review-run-2/`, and so on, at the time that run is needed.
- You MUST keep every copy of the writing and every violation file inside the workspace.

### 2. Prepare the writing

Put a copy of the writing inside the first review run folder, where the subagents can read it.

**Constraints:**

- You MUST copy the writing into `review-run-1/` when it is a file, and save it there as a new file when it is text, such as a chat response.
- You MUST leave the original writing untouched until Step 6, because the copies in the workspace are what the subagents read and change.

### 3. Run a review run

Start one reviewer subagent for each rule in the Writing Standards. Each reviewer checks the entire writing in the current review run folder against its one rule and reports what it finds.

**Constraints:**

- Which reviewers to start:
	- You MUST start one reviewer subagent per rule, so that every rule in the Writing Standards is covered.
	- You MUST run at most five reviewer subagents at a time, and start the next ones as earlier ones finish.
- What each reviewer reads:
	- You MUST assign each reviewer exactly one rule and tell it to check the writing against that rule only, because a reviewer that checks one rule reads the whole writing with full attention on it.
	- You MUST instruct each reviewer to load `standards-writing` and read its assigned rule in full, along with any reference file that rule points to.
	- You MUST point each reviewer to the copy of the writing in the current review run folder.
- How each reviewer reports:
	- You MUST give each reviewer its own violation file inside the current review run folder, named after its rule, such as `review-run-1/rule-07.md`.
	- You MUST require every violation entry to quote the text that breaks the rule.
	- You MUST require a reviewer that finds nothing to write that it found no violations, so that an empty result can be told apart from a reviewer that failed.
	- You MUST tell each reviewer to report violations only and never to edit the writing, because reviewers editing the same file would overwrite each other and leave the fixer working from findings that no longer match the text.
	- You MUST require each reviewer to reply with only the number of violations it found, so that you know the result of the review run without opening any file.
- The results of the review run:
	- You MUST combine every violation file in the current review run folder into one combined violation file in that folder, such as `review-run-1/combined-violations.md`, once all reviewers have finished.
	- You MUST build the combined file by joining the violation files with a command line tool, with each one under a heading that names its rule, and you MUST NOT retype their contents, because retyping bloats your context and can drop or change an entry.
	- You MUST NOT read the violation files or the combined violation file yourself, because their contents bloat your context, unless you have an explicit and well-justified reason, such as listing the violations that remain in Step 6.

### 4. Run a fix run

If no reviewer in the current review run reported a violation, skip to Step 6.
Otherwise create the next review run folder and start one fixer subagent to produce a fixed copy of the writing in it.

**Constraints:**

- You MUST point the fixer to the writing and the combined violation file in the current review run folder.
- You MUST NOT parse and restate the violations yourself, because restating them can drop or change an entry.
- You MUST instruct the fixer to load `standards-writing` and, for each violation, to read the rule it names along with that rule's bad and good examples before fixing it.
- You MUST tell the fixer to fix only the violations listed in the combined violation file and never to look for violations of its own, because finding violations is the job of the next review run and a change no reviewer asked for is a change no reviewer has checked.
- You MUST tell the fixer to write the fixed writing as a new file in the next review run folder, such as `review-run-2/`, and to leave the copy it read unchanged.
- You MUST tell the fixer not to cut anything the user asked for, because conciseness never means removing requested information.

### 5. Repeat until clean or the loop limit

Return to Step 3 and review the fixed copy of the writing in a new review run folder.

**Constraints:**

- You MUST repeat Steps 3 and 4 until a review run reports no violations or you have performed `max_loops` review runs.
- You MUST start new reviewer subagents for each review run and have them write to that run's own folder.
- You MUST NOT perform more than `max_loops` review runs, because reviewers can keep raising judgment calls that no fix will settle.

### 6. Report the result

Deliver the final writing and tell the user how the review ended.

**Constraints:**

- You MUST copy the newest copy of the writing in the workspace back over the original file, or give the user its text when the writing was not in a file.
- You MUST say how many review runs were performed and whether the writing is now free of violations.
- You MUST list every violation that remains if the loop limit stopped the procedure.
- You MAY delete the workspace once the report is made.

## Examples

### Example Input

```
writing: Projects/Garden Shed/Index.md
max_loops: 2
```

### Example Output

```
The heavy writing review of Projects/Garden Shed/Index.md performed 2 review runs.

Review run 1 found 6 violations across 4 rules, and the fix run fixed all 6.
Review run 2 found no violations.

The writing is free of violations, and the fixed version is saved to Projects/Garden Shed/Index.md.
```

## Troubleshooting

### A reviewer returns its violations in its reply and writes no file

Ask that reviewer to write the same list to its violation file, and continue once the file exists. The fixer reads the files, so a list that exists only in a reply never reaches it.

### A reviewer reports a violation of a rule it was not assigned

Leave the entry in the file. The fixer reads the rule each entry names and fixes the entry against that rule.
