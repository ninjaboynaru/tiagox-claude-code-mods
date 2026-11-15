---
name: sop-agent-orchestrator
description: Procedure for how to act as an orchestrator and manager of subagents rather than doing the work yourself, by decomposing the task into atomic subtasks and delegating each to the subagent with the most relevant context. Use whenever the user says to act as an orchestrator or to orchestrate, or when a task can be broken into independent pieces of investigation or implementation, or when a task spans multiple systems or files, or would benefit from parallel delegation, even if the user only says "delegate this" or "use subagents".
metadata:
  license: MIT
  package: agent-config-skills
---

# Agent Orchestration

## Overview

This procedure carries out a task as an orchestrator and manager of subagents. Keep your existing role and responsibilities, and carry them out through orchestration. Whatever work you were already doing or were asked to do, continue it by planning the task as subtasks, launching them to subagents in waves, verifying what comes back, and reporting the result.

The procedure works because of two things. Each subagent gets its own context window, so bulk file reading, dead ends, and long tool output stay out of yours, which leaves you able to hold the whole plan. Independent subtasks also run at the same time. Both advantages disappear the moment you start doing the work yourself, so treat your own hands-on effort as the expensive option.

## Ontology

These are the concepts, categories, entities, terms, and relationships used in this skill:

- **Orchestrator**: You, while this skill is in use. The orchestrator plans, delegates, integrates, and verifies.

- **Subagent**: A separate agent with its own context window that the orchestrator starts to do one subtask.

- **Running subagent**: A subagent that the orchestrator has launched and that has not yet returned its result.

- **Producer**: The subagent that returned a result, of any kind of work, that is to be checked.

- **Task**: The whole piece of work the user asked for.

- **Subtask**: One part of the task, sized to be given to one subagent.

- **Kind of work**: The category that a subtask's effort falls into. There are four kinds:
	- **Investigating**: Finding out something that is not yet known.
	- **Producing the work**: Creating or changing the thing the task asks for.
	- **Checking a result**: Verifying that a result meets its finish line.
	- **Writing it up**: Putting findings or results into a document for a reader.

- **Plan**: The written list of every subtask, giving each one's objective, kind of work, owner, and wave.

- **Owner**: The subagent assigned to a subtask.

- **Stakes**: What is lost or put at risk if a result is wrong, such as money, safety, or an action that cannot be undone.

- **Thoroughness**: How much depth, coverage, and checking a subtask or the plan calls for, from a quick answer taken from the first reliable source to a pass over every source.

- **Ready subtask**: A subtask that needs nothing that does not exist yet, so it can start now.

- **Wave**: A set of ready subtasks launched together in one message.

- **Briefing**: The message that starts a subagent. It is everything the subagent knows about its subtask.

- **Handoff file**: A file a subagent writes its output to, so the output can reach another subagent without passing through the orchestrator's context.

## Parameters

- **task** (required): The work the user asked for, or the work you were already doing in your existing role.

**Constraints for parameter acquisition:**
- If all required parameters are already provided, You MUST proceed to the Steps
- If any required parameters are missing, You MUST ask for them before proceeding
- When asking for parameters, You MUST request all parameters in a single prompt
- When asking for parameters, You MUST use the exact parameter names as defined

## Steps

Copy this checklist and check off each step as you complete it.

```
Orchestration Progress:
- [ ] Step 1: Plan the decomposition
- [ ] Step 2: Sort the subtasks into waves
- [ ] Step 3: Route each subtask
- [ ] Step 4: Brief and launch the wave
- [ ] Step 5: Verify what comes back
- [ ] Step 6: Launch the next wave
- [ ] Step 7: Report the result
```

### 1. Plan the decomposition

Break the task into subtasks and think the plan through. Steps 2 and 3 settle each subtask's wave and owner, and once they have, write the plan out in your response before you launch the first subagent.

**Constraints:**

- Writing the plan:
	- You MUST think the plan through, and once Steps 2 and 3 have filled in each subtask's wave and owner, write it out in your response before you launch the first subagent, listing each subtask with its one objective, its kind of work, its owner, and its wave.
	- You MUST NOT wait for the user's approval of the plan before launching, because the plan is your working record and not a request, and waiting stalls a task the user already asked you to carry out.
- What every subtask needs:
	- You MUST state the objective, the files or systems touched, the expected return, and the owner for every subtask in the written plan.
	- You MUST give every subtask one clear objective and a verifiable finish line.
	- You MUST make every subtask completable without waiting on another subtask that is still running.
	- You MUST make every subtask own its files, because two parallel subtasks that edit the same file overwrite each other.
	- You MUST make every subtask return something concrete, such as a decision, a diff, a list of findings, or a written file.
- The kind of work in a subtask:
	- You MUST give every subtask exactly one kind of work, which is investigating, producing the work, checking a result, or writing it up.
	- You MUST split a subtask when its objective needs "and" to join two kinds of work, because a subagent that holds several kinds of work cannot be checked apart from its own output and cannot be redirected without disturbing the rest.
- The size of a subtask:
	- You SHOULD split a subtask further when it spans several systems or would need its own plan to start.
	- You SHOULD merge a subtask into another subtask of the same kind of work when it is a single edit, or when the handoff would cost more than doing the work in one place.
- The effort of the plan:
	- You MUST match how thorough each subtask is, and how much checking the plan includes, to what the user asked for and what is at stake if the result is wrong.
	- You SHOULD default to the least thoroughness and checking that meets the request, because every extra pass costs time and context that the user did not ask for.
	- You SHOULD add a checking subtask only when a wrong result would be costly or hard to undo, or when the user asked for one.
- Your own work while planning:
	- You MAY read just enough to plan the split, such as listing a directory or checking which packages exist.
	- You MUST NOT implement, edit files, run investigations, or write yourself when a subagent could do it, because doing the work yourself fills your context and turns parallel work back into serial work.

**Example 1 - Bad** (The subtask mixes investigation with implementation across two systems and has no clear finish line):

```text
	Investigate the login failures and fix whatever is wrong in the auth service and the web client.
```

**Example 1 - Good** (The subtask has one objective and names what it must return):

```text
	Find why the auth service rejects valid tokens. Return the cause, with the file and line where it happens.
```

**Example 2 - Bad** (The objective joins investigating, producing the work, and writing it up with "and", so one subagent holds all three):

```text
	Find the three cheapest direct flights to Lisbon in May, book the best one, and write the itinerary up for the user.
```

**Example 2 - Good** (Each subtask has one kind of work, and the later ones wait on the earlier ones):

```text
	Subtask 1, investigating: Find the three cheapest direct flights to Lisbon in May. Return the airline, date, and price of each.
	Subtask 2, producing the work: Book the flight the user picks from subtask 1.
	Subtask 3, writing it up: Write the itinerary from the booking in subtask 2 as a one-page document.
```

**Example 3 - Bad** (The user asked which of two train routes is faster, and the plan adds a checker for each route and a write-up the user did not ask for):

```text
	Subtask 1 investigates route A. Subtask 2 investigates route B. Subtasks 3 and 4 each recheck one route. Subtask 5 writes a report on both.
```

**Example 3 - Good** (One thin investigation fits the question, and the plan adds checking only if a wrong answer would be costly):

```text
	Subtasks 1 and 2, investigating, in the same wave: Find the current scheduled travel time of route A and of route B. Return the time and the timetable source.
	You compare the two times and answer the user.
```

**Example 4 - Bad** (The orchestrator launches subagents as soon as it has an idea of the split, then asks the user to approve the plan):

```text
	You launch the research subagents, and then ask: "Shall I go ahead with this plan?"
```

**Example 4 - Good** (The plan is written out in full before the first launch, and the launch follows without a request for approval):

```text
	Plan, written before any launch:
	1. Find hotels under 120 euros a night near the city center. Kind: investigating. Owner: general-purpose subagent. Wave 1.
	2. Find the opening hours of the three museums on the user's list. Kind: investigating. Owner: general-purpose subagent. Wave 1.
	3. Write both results up as one comparison table. Kind: writing it up. Owner: general-purpose subagent. Wave 2.
	Launching wave 1 now.
```

### 2. Sort the subtasks into waves

Work out which subtasks are ready now and which are blocked. Ask of each subtask what it needs that does not exist yet. If the answer is nothing, it is ready.

**Constraints:**

- You MUST treat a subtask as blocked only when it needs another subtask's output as input, or when the two would write the same file.
- You MUST put every ready subtask in the first wave.
- You SHOULD look for parallelism deliberately, since work that reads different systems, investigates different hypotheses, or touches separate files is almost always independent even when it feels like a pipeline.
- You SHOULD start a slow subtask that blocks nothing in the first wave, wherever it sits in your plan, so that it finishes while the rest proceed.

**Example 1 - Bad** (The slow documentation rebuild waits for the last wave although nothing blocked it):

```text
	Wave 1 fixes the parser. Wave 2 updates the tests. Wave 3 rebuilds the documentation, which takes twenty minutes and depends on neither.
```

**Example 1 - Good** (The slow, unblocked subtask starts in the first wave and runs while the others proceed):

```text
	Wave 1 fixes the parser and starts the documentation rebuild. Wave 2 updates the tests.
```

### 3. Route each subtask

Choose the subagent for each subtask in the wave. A specialist starts with the architecture, vocabulary, and tooling already loaded, so it needs less briefing and makes fewer wrong turns.

**Constraints:**

- You MUST read the available subagents and their descriptions before routing.
- You MUST route each subtask on its subject, meaning the system it touches, the data it reads, or the kind of output it produces.
- You MUST pick the subagent whose existing context is closest to the subtask.
- You SHOULD fall back to a general-purpose subagent only when nothing specialized is a closer fit.

**Example 1 - Bad** (A subtask about financial transactions goes to a general subagent although a specialist exists):

```text
	The subtask to recategorize last month's transactions goes to the general-purpose subagent.
```

**Example 1 - Good** (The subtask goes to the subagent whose description covers its subject):

```text
	The subtask to recategorize last month's transactions goes to the finance subagent, whose description covers categorizing transactions.
```

### 4. Brief and launch the wave

Write a briefing for each subtask in the wave and launch them together. A subagent starts with no memory of this conversation, so the briefing is everything it knows.

**Constraints:**

- What every briefing holds:
	- You MUST state the objective in every briefing as an outcome and not as a procedure.
	- You MUST include the absolute paths, package names, ticket IDs, or account IDs the subagent needs.
	- You MUST include the relevant constraints and decisions already made, so the subagent does not reopen them.
	- You MUST name any skill the subagent should load and any file with instructions, context, rules, or guidance it should read.
	- You MUST state the exact shape of what to return, since you are the only consumer of the subagent's output.
	- You MUST state the subagent's boundary, meaning what it owns and what it must leave alone.
	- You MUST state how thorough the subagent should be, matched to the stakes as Step 1 sets out, so that the subagent neither stops short nor spends effort the task does not call for.
	- You MUST NOT delegate a bare restatement of the user's prompt, because a briefing that would not let a competent engineer start without asking questions costs a round trip of clarifying questions.
- How a subagent returns its result:
	- You MUST tell a subagent to write its result to a handoff file and return only the path plus a short summary when the result will be a lot of text or will be the input to another subtask.
	- You MUST use a system temp path with a descriptive name for every handoff file, such as `/tmp/orchestration/<task>-<subtask>-<uid>.md`, and keep a list of which file holds what.
	- You SHOULD have a subagent return its result directly when the result is small, such as a decision, a verdict, a count, or a short list.
- You MUST NOT launch the first wave before the plan is written out with every subtask's wave and owner filled in, as Step 1 sets out, because a launch without the written plan leaves no record to check the work against.
- You MUST launch every subtask in the wave in the same message, because subagents dispatched one message apart run one after another.

**Example 1 - Bad** (The briefing names no location, no decision already made, no boundary, and nothing to return):

```text
	Fix the failing test in the compiler.
```

**Example 1 - Good** (The briefing gives the location, the decision to keep, the boundary, and the exact return):

```text
	Read `project/instructions/rules.md` first, before doing anything else, to
	understand the context, the guidelines, and the project scope.

	In /path/to/example-package, `npm test` fails in tests/parser.test.ts on the
	duplicate-name case. The check lives in validateUniqueNames() in src/parser.ts.

	We decided last week that duplicate names must throw and not warn, because
	output is flat and a duplicate would silently overwrite. Keep that behavior. The
	test or the error message is what is wrong, not the rule.

	Own src/parser.ts and tests/parser.test.ts. Leave the other modules alone. Run
	`npm test` and the repo's format check before returning.

	Return the diff you applied and the passing test output.
```

**Example 2 - Bad** (The subagent is told to return everything, so all of it lands in your context):

```text
	Research the auth flow and report everything you find.
```

**Example 2 - Good** (The subagent writes its findings to a handoff file and returns only the path and a short summary):

```text
	Research the auth flow. Write your full findings to /tmp/orchestration/auth-flow-research.md.
	Return only that path and a 3-line summary of what you concluded.
```

**Example 3 - Bad** (The briefing gives no thoroughness, so the subagent guesses how deep to go):

```text
	Find out which of the two nearby pharmacies stocks the user's allergy medicine.
```

**Example 3 - Good** (The briefing says how thorough to be, matched to a low-stakes question):

```text
	Find out which of the two nearby pharmacies stocks the user's allergy medicine.
	Call or check each pharmacy's own stock page once, and stop at the first clear answer. A short
	answer is enough because a wrong answer costs the user one extra trip. Return the pharmacy
	name and how you confirmed the stock.
```

### 5. Verify what comes back

Check each returned result before you rely on it. Treat every result as a claim, since subagents do report work as finished when it is not.

**Constraints:**

- You MUST read the live state or the source before you repeat a result to the user or build on it.
- You MUST have a result verified by yourself or by a subagent other than the producer, because a producer that checks its own result tends to confirm it.
- You MUST NOT count the producer's own statement that it checked its result as verification, because that statement is part of the claim being verified.
- You MAY use one or two other subagents to verify a result or to act as its adversary, to reduce your own verification load.
- You MUST add each verifying subagent to the plan as a subtask whose kind of work is checking a result.
- You MUST send a wrong or thin result back with sharper instructions, or reassign it.
- You MUST NOT quietly finish a weak result yourself, because that hides which subtask was underspecified and drops you back into serial work with a context window that is already full.
- You MUST NOT paste a subagent's large output into another briefing, because that carries it through your context a second time. Pass the handoff file's path.

**Example 1 - Bad** (You repeat the subagent's claim to the user without checking it):

```text
	The subagent says all tests pass, so you tell the user that all tests pass.
```

**Example 1 - Good** (You check the claim against live state before repeating it):

```text
	The subagent says all tests pass, so you run the test command, see the tests pass, and then tell the user.
```

**Example 2 - Bad** (The subagent that gathered the figures is also the one that confirms them, so the confirmation is the same claim a second time):

```text
	You ask the subagent that collected the quarter's expense totals to confirm that the totals are correct, and you pass its confirmation to the user.
```

**Example 2 - Good** (A different subagent checks the figures against the source, and the producer is not asked to confirm):

```text
	You launch a second subagent to recompute the expense totals from the original receipts and return any mismatch. The first subagent is not asked to confirm its own totals.
```

### 6. Launch the next wave

Check which subtasks became unblocked, and return to Step 3 for the next wave. A subagent is running from the moment you launch it until it returns its result, and a requirement that arrives in that time, from the user or from another result, enters the plan as a new subtask.

**Constraints:**

- You MUST repeat Steps 3 to 5 until no subtasks remain.
- A new requirement:
	- You MUST turn a new requirement that arrives while a subagent is running into a new subtask, give it one kind of work as Step 1 sets out, and add it to the written plan with its objective, kind of work, owner, and wave.
	- You MUST launch the new subtask to a different subagent than the running one, and you MAY launch it at once when it is ready.
	- You MUST NOT send a running subagent a message that adds to the work it already has, because a subagent whose scope keeps growing loses its finish line and ends up holding several kinds of work.
	- You MAY send a running subagent only a message that corrects, narrows, or cancels the work it already has.

**Example 1 - Bad** (The user's new request is sent to the running subagent, which widens its scope):

```text
	While a subagent drafts the garden plan, the user asks for a cost estimate as well. You message the running subagent: "Also add a cost estimate."
```

**Example 1 - Good** (The new request becomes its own subtask, and the running subagent keeps the work it already has):

```text
	While a subagent drafts the garden plan, the user asks for a cost estimate as well. You add a subtask to the plan, kind of work investigating, owner the general-purpose subagent, and launch it at once. The drafting subagent receives no message.
```

**Example 2 - Bad** (The message to the running subagent adds a letter to write, which is new work of another kind):

```text
	You message the subagent that is surveying three suppliers: "Also draft an order letter to the cheapest one."
```

**Example 2 - Good** (The message narrows the work the running subagent already has):

```text
	You message the subagent that is surveying three suppliers: "Drop the third supplier, since the user ruled it out. Finish the other two."
```

### 7. Report the result

Tell the user how the task ended.

**Constraints:**

- You MUST say what was delegated, what came back, what you verified and how, and anything that remains open.

**Example 1 - Bad** (The report says nothing about what was delegated, what was checked, or what is still open):

```text
	Everything is done.
```

**Example 1 - Good** (The report names each delegated subtask, how its result was verified, and what remains open):

```text
	I delegated the parser fix and the documentation update. The parser fix came back with a passing test run, which I confirmed by running the tests myself. The documentation update is still open, because the subagent could not find the old page.
```
