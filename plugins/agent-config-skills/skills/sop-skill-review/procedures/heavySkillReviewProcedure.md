# Heavy Skill Review Procedure

## Overview

This procedure checks a skill against the authoring skill for each kind of content it holds, with one reviewer subagent for every pairing of a file and an authoring skill. A fixer subagent fixes what the reviewers found, and the review runs again until a review run finds no violations or a loop limit is reached. Run this procedure only when you are explicitly told to.

## Ontology

These are the concepts, categories, entities, terms, and relationships used in this procedure:

- **Skill under review**: The skill or command being checked, which is its `SKILL.md` and every other file in its folder.

- **Authoring skill**: A skill that says how one kind of content is written. A file is checked against each authoring skill that matches what it holds:
	- `skill-creator` for every file. It covers everything about a skill, such as its intent, its description and body, and the organization and format of its folder and the other files in it.
	- `author-skills` for every file. It covers the skill's name, its frontmatter, and its layout.
	- `author-standards` for a file that holds standards. It covers how standards are structured and written.
	- `author-sop` for a file that holds an SOP. It covers the format of an SOP and its constraints.
	- `author-ontology` for a file that holds an Ontology section. It covers how an Ontology section is written.

- **Reviewer**: A subagent that checks one file against one authoring skill and reports the violations it finds.

- **Fixer**: A subagent that fixes the violations the reviewers reported.

- **Review run**: One round in which every reviewer checks its file.

- **Fix run**: One round in which the fixer fixes the violations of the review run before it.

- **File list**: The file in the workspace that lists every file under review and, in a review of changes, the changes in each file.

## Parameters

- **skill** (required): The skill to review, given as the path of its folder, a list of its files, or a set of changes to it.
- **max_loops** (optional, default: 4): The largest number of review runs to perform.

**Constraints for parameter acquisition:**
- If all required parameters are already provided, You MUST proceed to the Steps
- If any required parameters are missing, You MUST ask for them before proceeding
- When asking for parameters, You MUST request all parameters in a single prompt
- When asking for parameters, You MUST use the exact parameter names as defined

## Steps

Copy this checklist and check off each step as you complete it.

```
Heavy Skill Review Progress:
- [ ] Step 1: Check the prerequisites
- [ ] Step 2: Prepare the workspace
- [ ] Step 3: Prepare the file list
- [ ] Step 4: Run a review run
- [ ] Step 5: Run a fix run
- [ ] Step 6: Repeat until clean or the loop limit
- [ ] Step 7: Report the result
```

### 1. Check the prerequisites

Confirm that every authoring skill this procedure depends on is available before any other work starts.

**Constraints:**

- You MUST NOT run this procedure if you are one of the subagents it starts, because each subagent would then start subagents of its own without end.
- You MUST confirm that all five authoring skills are available, which are `skill-creator`, `author-skills`, `author-standards`, `author-sop`, and `author-ontology`.
- You MUST stop when any authoring skill is not available, tell the user by name which authoring skills are available and which are not, and ask the user what to do.
- You MUST NOT continue past a missing authoring skill until the user answers, because a file cannot be checked against guidance that cannot be loaded.

### 2. Prepare the workspace

Create a temporary workspace folder that holds everything this procedure produces.

**Constraints:**

- You MUST create one uniquely named workspace folder in the system temp directory for this procedure, such as `heavy-skill-review-<unique id>/`.
- You MUST create a folder inside the workspace for each review run, named `review-run-1/`, `review-run-2/`, and so on, at the time that run is needed.
- You MUST keep the file list from Step 3 and every violation file inside the workspace.

### 3. Prepare the file list

Decide what kind of review this is, then write the file list in the workspace. Every subagent works from this file.

**Constraints:**

- The kind of review:
	- You MUST determine whether this is a review of changes or a review of the existing skill as it stands, because that decides which text a reviewer may report on.
	- You MUST ask the user which kind of review this is when you are unsure.
	- You MAY decide the kind of review without asking when the request or its context makes it obvious.
- The file list:
	- You MUST write the file list as `files-under-review.md` in the workspace, and state at its top whether the review covers changes or the existing skill.
	- You MUST list every file of the skill, in a review of the existing skill, with a number and its full path, such as `file-03`, because that review covers the whole skill.
	- You MUST list every changed file the same way, in a review of changes, along with the changes in each file, because that review covers all of the changes.
	- You MUST NOT leave any part of the skill or any change out of the review, because a skill review has no exclusions.
- The marks on each file in the file list:
	- You MUST read each file under review far enough to mark, beside it in the file list, whether it holds standards, whether it holds an SOP, and whether it holds an Ontology section, because those marks decide which authoring skills the file is checked against beyond `skill-creator` and `author-skills`.
	- You MUST give a file every mark that applies to it, so that a file holding more than one kind of content is checked against every matching authoring skill.

### 4. Run a review run

Start the reviewer subagents. Each reviewer checks its one file against its one authoring skill and reports what it finds.

**Constraints:**

- Which reviewers to start:
	- You MUST start one reviewer for every pairing of a file and an authoring skill the file is checked against, which is `skill-creator` and `author-skills` for every file and each further authoring skill the file is marked for.
	- You MUST run at most five reviewer subagents at a time, and start the next ones as earlier ones finish.
- The authoring skill of each reviewer:
	- You MUST instruct each reviewer to load its one authoring skill and check its file against that skill only, so that it understands how that kind of content must be written before it judges the file.
	- You MUST tell each reviewer to stop when it cannot load its authoring skill, to review nothing, and to reply to you with the name of the skill it could not load, because a review made without the skill is a review from guesswork.
	- You MUST stop the procedure when a reviewer replies that it could not load its authoring skill, tell the user which skill failed to load and for which reviewer, and ask the user what to do.
	- You MUST tell each `skill-creator` reviewer to judge everything about the skill that it can judge by reading its file, and to leave out whether the skill is invoked for the right prompts and how well it performs, since judging those takes test runs of the skill.
	- You MUST NOT run the test cases, evals, benchmarks, blind comparisons, description optimization, or packaging of `skill-creator` unless the user explicitly asked for them, and You MUST tell each `skill-creator` reviewer not to run them, because they are separate work that the user decides when to do.
	- You MUST tell each `skill-creator` reviewer that the other four authoring skills win where they disagree with `skill-creator`, and that text which follows one of them is correct.
	- You MUST tell each `skill-creator` reviewer what the other four authoring skills decide, which is the skill's name, its frontmatter metadata, the layout of a standards skill and of an SOP skill, the structure and wording of standards, the format of an SOP and the MUST, SHOULD, and MAY wording of its constraints, and the Ontology section, because that reviewer loads only `skill-creator` and cannot otherwise tell which text follows another authoring skill.
- What each reviewer reads and reports on:
	- You MUST instruct each reviewer to read the file list before it reviews.
	- You MUST tell each reviewer to report violations only in its assigned file.
	- You MUST tell each reviewer, in a review of changes, to report violations only in the changed text and never in the existing text around it, because a fault in text the change did not touch is not what the review was asked to judge.
	- You MUST leave each reviewer to work out for itself which other files it needs to read to check its file.
- What each reviewer writes:
	- You MUST give each reviewer its own violation file inside the current review run folder, named after its file number and its authoring skill, such as `review-run-1/file-03-author-sop.md`.
	- You MUST require every violation entry to give the file path and line number, to quote the text at fault, and to name the authoring skill it breaks.
	- You MUST require a reviewer that finds nothing to write that it found no violations, so that an empty result can be told apart from a reviewer that failed.
	- You MUST tell each reviewer to report violations only and never to edit the skill, because reviewers editing the same files would overwrite each other and leave the fixer working from findings that no longer match the text.
	- You MUST require each reviewer that completed its review to reply with only the number of violations it found, so that you know the result of the review run without opening any file.
- The results of the review run:
	- You MUST combine every violation file in the current review run folder into one combined violation file in that folder, named `combined-violations.md`, once all reviewers have finished.
	- You MUST build the combined file by joining the violation files with a command line tool, with each one under a heading that names its file and its authoring skill, and you MUST NOT retype their contents, because retyping bloats your context and can drop or change an entry.
	- You MUST NOT read the violation files or the combined violation file yourself, because their contents bloat your context, unless you have an explicit and well-justified reason, such as listing the violations that remain in Step 7.

### 5. Run a fix run

If no reviewer in the current review run reported a violation, the review is finished, so go to Step 7.
Otherwise start one fixer subagent to fix the skill where it is.

**Constraints:**

- What the fixer reads:
	- You MUST point the fixer to the file list from Step 3 and the combined violation file in the current review run folder.
	- You MUST NOT parse and restate the violations yourself, because restating them can drop or change an entry.
	- You MUST instruct the fixer to load the authoring skill each violation names before it fixes that violation.
	- You MUST tell the fixer to stop when it cannot load an authoring skill, to fix nothing more, and to reply to you with the name of the skill it could not load, and you MUST then stop the procedure, tell the user which skill failed to load, and ask the user what to do.
- What the fixer may change:
	- You MUST tell the fixer to fix only the violations listed in the combined violation file and never to look for violations of its own, because finding violations is the job of the next review run and a change no reviewer asked for is a change no reviewer has checked.
	- You MUST tell the fixer not to change what the skill instructs an agent to do, because this review changes how the skill is written and never what it asks for.
	- You MUST tell the fixer that the other four authoring skills win where they disagree with `skill-creator`, and to leave a violation of `skill-creator` unfixed when its fix would break one of them, because the next review run would report that fix as a violation.
- What the fixer does when it has finished:
	- You MUST tell the fixer to update the file list when it creates, renames, or moves a file, so that the next review run covers that file.
	- You MUST require the fixer to reply with only the files it changed.

### 6. Repeat until clean or the loop limit

Return to Step 4 and review the fixed skill in a new review run folder.

**Constraints:**

- You MUST repeat Steps 4 and 5 until a review run reports no violations or you have performed `max_loops` review runs.
- You MUST start new reviewer subagents for each review run and have them write to that run's own folder.
- You MUST NOT perform more than `max_loops` review runs, because reviewers can keep raising judgment calls that no fix will settle.

### 7. Report the result

Tell the user how the review ended and what it changed.

**Constraints:**

- You MUST say how many review runs were performed and whether the skill is now free of violations.
- You MUST say which files were changed.
- You MUST list every violation that remains if the loop limit stopped the review.
- You MAY delete the workspace once the report is made.

## Examples

### Example Input

```
skill: .claude/skills/sop-recipe-scaling/
max_loops: 2
```

### Example Output

```
The heavy skill review of .claude/skills/sop-recipe-scaling/ performed 2 review runs.

Review run 1 found 2 violations of skill-creator, 1 of author-skills, and 1 of author-sop, and the fix run fixed all 4. Review run 2 found no violations.

The skill is free of violations. The fix run changed SKILL.md and procedures/scaleRecipeProcedure.md.
```

## Troubleshooting

### A reviewer returns its violations in its reply and writes no file

Ask that reviewer to write the same list to its violation file, and continue once the file exists. The fixer reads the files, so a list that exists only in a reply never reaches it.

### A reviewer reports a violation of an authoring skill it was not assigned

Leave the entry in the file. The fixer loads the authoring skill each entry names and fixes the entry against that skill.

### A subagent cannot load an authoring skill that you confirmed in Step 1

Stop the procedure. Tell the user which authoring skill failed to load and which subagent reported it, and ask what to do. Do not replace that subagent with one that reviews from memory, since its findings would not come from the skill.
