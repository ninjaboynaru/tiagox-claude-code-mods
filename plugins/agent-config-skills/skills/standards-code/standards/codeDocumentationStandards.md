# Code Documentation Standards

These are the standards that documentation within code files, such as one-line comments, block comments, and file docs, must adhere to.

## Guiding Philosophy

Every comment in a source file is a second copy of the truth that nobody compiles, nobody tests, and nobody is required to update. It starts out accurate and drifts. Treat comments and doc strings as maintenance liabilities rather than free documentation, and default to not writing them.

### Principle 1: AI Written Comment Patterns

The most common documentation defects in AI-written code are:

1. Volume: Doc-comments that restate the signature in prose, tags that echo the parameter name, and inline notes narrating each line. That noise buries the few comments carrying real information, and it goes stale the moment the code changes.
2. Irrelevance: Doc-comments that are not relevant to the code at hand, state pointless details, or provide no value.

### Principle 2: Comments are Written for Maintainers

Comments are primarily written for future code maintainers to aid in their job of understanding the code so they can modify, update, debug, and reason about it.

At minimum a doc-comment must both:

- Tell a maintainer something the code cannot
- Be genuinely useful in helping the maintainer do their job

Comments and docs that fail to do these two things for a maintainer fail the bar.

## Rule 1: Assume a competent maintainer

Necessity cannot be judged until you define who is reading, so assume a competent maintainer and write only what that reader cannot get for themselves.

### Clause A: Define the reader

Assume a reader who:

- Knows the language, its standard library, and the frameworks in use
- Knows the cloud services and platform APIs the code calls, and can read their documentation
- Can follow a reference, jump to a definition, and read the call sites
- Knows the domain the software operates in

### Clause B: Write only what this reader cannot get for themselves

Leave out general language behavior, framework semantics, cloud service behavior, and domain concepts, however true they are.

**Example 1 - Bad** (The comment describes standard monitoring behavior that the platform already documents):

```typescript
	// M-of-N alarms need one execution per period to accumulate datapoints.
```

**Example 1 - Good** (The comment states a limit specific to this account that the reader cannot look up):

```typescript
	// This account's SES sandbox caps sends at 200/day, so batch above that silently drops.
```

## Rule 2: A comment must be necessary

Write a comment only when it carries a non-obvious invariant, constraint, side effect, failure mode, or rationale that the code, types, names, and structure cannot express.

### Clause A: Test necessity by deleting the comment

Remove the comment, read the code, and follow the definitions and call sites. If the maintainer in Rule 1 can still understand the code and change it safely, fail the comment.

### Clause B: Being correct is not enough

Fail a true comment that narrates self-explanatory code, and fail a true comment whose reason is already obvious from the name or from where the code sits. Do not accept "it states a why" as a pass.

**Example 1 - Bad** (The name, type, and optional marker already say what the doc-comment says):

```typescript
	interface CanaryProps {
		/** How often the canary runs. If absent, it is not scheduled. */
		triggerRate?: Duration
	}
```

**Example 1 - Good** (The field stands without a doc-comment, because its name, type, and optional marker say everything):

```typescript
	interface CanaryProps {
		triggerRate?: Duration
	}
```

**Example 2 - Bad** (The expression already says what the comment says):

```typescript
	// Fall back to one hour when no trigger is configured.
	const rate = triggerRate ?? Duration.hours(1)
```

**Example 2 - Good** (The fallback expression is left to speak for itself):

```typescript
	const rate = triggerRate ?? Duration.hours(1)
```

**Example 3 - Bad** (The comment states a why, but the name and placement already give the reason):

```typescript
	// Cache the result so we do not recompute it on every call.
	const cached = memo.get(key)
```

**Example 3 - Good** (The name `cached` and the `memo` lookup already give the reason, so there is no comment):

```typescript
	const cached = memo.get(key)
```

### Clause C: Know what passes necessity

Accept these as passing necessity:

- A surprising invariant, an external constraint, a non-obvious side effect, or an unavoidable workaround
- An ordering requirement or failure mode a caller cannot infer from the signature
- Units, null and empty handling, or thrown errors that the types do not carry
- Fields on a type or schema that encode outside quirks, such as an upstream API returning a sentinel under a size limit
- A `TODO` with a tracking reference and real context

**Example 1 - Bad** (The comment restates the call and leaves out the outside constraint that makes the wait necessary):

```typescript
	// Wait before retrying.
	await sleep(RETRY_DELAY_MS)
```

**Example 1 - Good** (The constraint lives outside the code, in the payment provider's behavior):

```typescript
	// Stripe rejects duplicate charges inside 60s, so back off before retrying.
	// https://stripe.com/docs/error-handling#idempotency
	await sleep(RETRY_DELAY_MS)
```

**Example 2 - Bad** (The comment repeats the schema's name and says nothing about the upstream quirk its nullable fields encode):

```typescript
	// Schema for a file diff.
	const FileDiffSchema = z.object({
		cannotDiffReason: z.string().nullable(),
		hunks: z.array(HunkSchema).nullable(),
	})
```

**Example 2 - Good** (Nothing in the schema reveals what the upstream API returns for large files):

```typescript
	// Files over 5 MB come back as cannotDiffReason: "TOO LARGE" with hunks: null.
	const FileDiffSchema = z.object({
		cannotDiffReason: z.string().nullable(),
		hunks: z.array(HunkSchema).nullable(),
	})
```

## Rule 3: A comment must match local precedent

Match a comment's presence, placement, format, and level of detail to how comparable code is commented in the same file, elsewhere in the package, or in a written package standard.

### Clause A: Treat a pattern as established only when it repeats or is required

Treat a pattern as established only when it repeats across analogous code or a written package standard requires it. Do not treat one nearby comment as a convention, and do not take an existing verbose or historical comment as license for another one.

### Clause B: Let necessity alone decide where there is no precedent

In a new file, or a codebase with no comment convention to read, there is nothing to match, so decide by necessity alone. Do not take the absence of precedent as permission to narrate.

## Rule 4: Apply necessity then precedent, with no partial credit

Check necessity first and precedent second, delete any comment that fails either gate, and trim only the comments that pass both.

### Clause A: Check the two gates in order

1. When necessity fails, delete the comment. Do not look for precedent to rescue it, and do not offer a shorter replacement.
2. When necessity passes but precedent fails, delete the comment.
3. When both pass, judge the wording. Cut it back to the part the code cannot say and fix anything inaccurate.

### Clause B: Trim only a comment that passed necessity

Trim a comment only when it already passed necessity and came out padded. Never trim to save one that failed. When a shorter form would only paraphrase an identifier, a type, an optional marker, a fallback expression, a configuration value, or general platform behavior, delete the whole comment.

**Example 1 - Bad** (The real constraint is buried in a restatement of the loop):

```typescript
	// Loop over each recipient and send the email, capping at 100 per run because SES throttles this account above that rate.
```

**Example 1 - Good** (The comment is trimmed to the constraint the code cannot say):

```typescript
	// Cap at 100 per run: SES throttles this account above that rate.
```

## Rule 5: Match comment size to code complexity

### Clause A: Match comment size to code complexity

Keep a comment's length in proportion to the complexity of the code underneath it. Do not give a single field or assignment a miniature design document. Cut a comment that explains substantially more context than a maintainer needs at that location, since it is padding even when every sentence is true.

## Rule 6: Do not restate the code

### Clause A: Do not restate the code

Delete comments that translate the code into English, repeat a name or type, announce the next statement, or restate an optional marker, fallback expression, or configuration value.

**Example 1 - Bad** (The comment translates the statement into English):

```typescript
	retries += 1 // increment the retry counter
```

**Example 1 - Good** (The statement needs no comment, because the name `retries` already says what is incremented):

```typescript
	retries += 1
```

**Example 2 - Bad** (The comment repeats the method name):

```typescript
	user.save() // save the user
```

**Example 2 - Good** (The call is left without a comment, because the method name says what it does):

```typescript
	user.save()
```

**Example 3 - Bad** (The comment translates the increment into English and gives no reason for it):

```typescript
	i += 1 // add one to i
```

**Example 3 - Good** (The comment gives a reason for the increment that the statement cannot show):

```typescript
	i += 1 // compensate for zero-indexing in the display output
```

## Rule 7: Do not narrate line by line

### Clause A: Do not narrate line by line

Do not put a comment above each statement in a block, which is narration and not documentation. Replace that narration with well-named functions and clear structure. When a block needs commentary to follow, extract it into a named function instead.

**Example 1 - Bad** (Each comment announces the statement directly below it):

```typescript
	// Check the name is present
	if (!name) throw new Error('name required')
	// Check the email is valid
	if (!isValid(email)) throw new Error('bad email')
```

**Example 1 - Good** (The function name says what the block does, so the block needs no comments):

```typescript
	function validateInput({ name, email }: Input): void {
		if (!name) throw new Error('name required')
		if (!isValid(email)) throw new Error('bad email')
	}
```

## Rule 8: No banner or section comments

### Clause A: No banner or section comments

Do not write decorative dividers such as `// ===== Helpers =====`, which organize nothing the reader cannot see. If a file needs headings to navigate, treat that as a signal that the file likely needs to be split into other files or extracted into sections, classes, or functions.

## Rule 9: No verbose prose blocks

### Clause A: No verbose prose blocks

Delete multi-sentence explanations, parenthetical asides, exhaustive background, repeated conclusions, and polished prose whose content is already visible in nearby names and structure. Length reads as thoroughness and functions as noise.

## Rule 10: No source history or metadata

### Clause A: No source history or metadata

Write comments only as technical notes about the code as it stands. Do not put incident IDs, ticket numbers, dates, author names, what changed, why this change exists, previous behavior, rejected implementations, or review context in them. Leave those to version control, the code review, the design document, and the operational record, which hold them better because they are dated and attributed.

Apply this even when the comment is factually accurate.

**Example 1 - Bad** (The comments record the author, date, ticket, and previous behavior, all of which version control already holds):

```python
	# Author: someone@example.com
	# Date: 2024-01-15
	# Ticket: ABC-1234
	# Previously used a single batch call, changed after the timeout incident.
	def process_order(order: Order) -> Receipt:
		return billing_client.charge(order)
```

**Example 1 - Good** (The function carries no history, because nothing about the code as it stands needs a note):

```python
	def process_order(order: Order) -> Receipt:
		return billing_client.charge(order)
```

## Rule 11: No configuration motivation

### Clause A: No configuration motivation

Do not explain why an alarm threshold, period, retry count, timeout, feature flag, or fallback value was chosen. Unless the source has to preserve a durable external constraint nobody could infer from the code, that reasoning belongs in the ticket, runbook, or design document.

## Rule 12: No cross-file narration

### Clause A: No cross-file narration

Do not describe downstream consumers, "single source of truth" wiring, or where a value travels next. A maintainer can follow the references. This narration also rots fastest, since it breaks whenever code you are not editing moves. The same applies to upstream code.

## Rule 13: No dead references

### Clause A: No dead references

Delete comments naming functions, variables, files, types, or behaviors that no longer exist. They send readers looking for something that is gone.

## Rule 14: No rejected alternatives

### Clause A: No rejected alternatives

Do not write comments such as "could also use X here" and "tried Y but it was slower", which document a decision rather than a current invariant. Put the tradeoff in the code review or design document, where the reasoning can be discussed and dated.

## Rule 15: Delete commented-out code

### Clause A: Delete commented-out code

Never commit a commented-out block. Version control remembers it, nobody can tell whether it is meant to come back or how old it is, and its presence makes the live path ambiguous.

## Rule 16: A doc-comment must add information beyond the signature

Write a doc-comment only when it says something the signature does not, and write it in the doc-comment syntax the package already uses.

### Clause A: Say something the signature does not

Write a doc-comment to state non-obvious behavior, contracts, invariants, units, null and empty handling, ordering, or errors thrown. Skip it when the name and types already say everything. Never restate the signature in prose, and never add a tag that only echoes a parameter name or its type.

**Example 1 - Bad** (The doc-comment restates the signature in prose, and its tags echo the parameter and return type):

```java
	/**
	 * This method takes an order and places it, then returns a confirmation.
	 * @param order the order to place
	 * @return the confirmation
	 */
	public OrderConfirmation placeOrder(Order order) {
		return orderProcessor.place(order);
	}
```

**Example 1 - Good** (The doc-comment names an exception the signature does not declare):

```java
	/** Places an order. Throws {@link PaymentException} if payment fails. */
	public OrderConfirmation placeOrder(Order order) {
		return orderProcessor.place(order);
	}
```

**Example 2 - Bad** (The doc-comment repeats the method name, and its tag echoes the return type):

```java
	/**
	 * Finds all orders.
	 * @return the list of orders
	 */
	public List<Order> findAllOrders() {
		return orderRepository.findAll();
	}
```

**Example 2 - Good** (The method has no doc-comment, because the name and return type already say everything):

```java
	public List<Order> findAllOrders() {
		return orderRepository.findAll();
	}
```

### Clause B: Follow the package's doc-comment syntax

Doc-comment syntax varies by language. Follow whatever the package already uses for its Javadoc, JSDoc, TSDoc, docstrings, or rustdoc, and match the tag style of neighboring code.

## Rule 17: A required doc-comment must be complete

### Clause A: A required doc-comment must be complete

Complete every doc-comment that a package convention requires, or drop it where the convention permits. A required doc-comment that documents only part of the contract is worse than none, because consumers read the omission as a guarantee.

## Rule 18: TODOs need a tracking reference and context

### Clause A: TODOs need a tracking reference and context

Give every `TODO`, `FIXME`, or `HACK` a tracking reference plus one line saying what is deferred and why. A marker without a ticket is a note to nobody and will never be actioned. Use the package's tracking system.

**Example 1 - Bad** (The marker has no tracking reference and does not say why the work is deferred):

```java
	// TODO: add retry logic
```

**Example 1 - Good** (The marker carries a ticket ID, the constraint, and what is deferred until it lifts):

```java
	// TODO(ABC-1234): Aurora JDBC driver has no batch inserts above 10k rows.
	// Chunk the writes until the driver upgrade lands.
```

## Rule 19: Keep comments true, or delete them

### Clause A: Keep comments true, or delete them

When you change code, update or delete the comments and doc-comments describing it. A comment contradicting the code is worse than silence, because the reader trusts it and acts on it. If you cannot make a comment true, delete it.

**Example 1 - Bad** (The retry logic is gone, but the comment describing it remains):

```python
	# Retries up to 3 times with exponential backoff
	def send_notification(user_id: str) -> None:
		client.send(user_id)
```

**Example 1 - Good** (The comment was deleted along with the retry logic it described):

```python
	def send_notification(user_id: str) -> None:
		client.send(user_id)
```

## Rule 20: Put the information in the code where you can

### Clause A: Put the information in the code where you can

Do not reach for a comment because the code contains a regex, a magic number, a complex expression, or unusual behavior. Name the value, extract the expression into a named function, or introduce a type. A comment is the fallback for information that genuinely cannot live in the code, not the first tool.

## Rule 21: Write the survivors well

### Clause A: Write the survivors well

A comment that earns its place is worth writing carefully. Be brief, choose precise words, use correct grammar, and name the constraint outright rather than gesturing at it. Hold comment prose to the same standard as any other prose by applying the Writing Standards in `standards-writing`.

**Example 1 - Bad** (The comment names no constraint and tells the reader nothing):

```typescript
	// This does stuff with the thing for reasons
```

**Example 1 - Good** (The comment names the limit and the action it forces):

```typescript
	// The payment API rejects request bodies over 10 KB, so truncate the note before the call.
```
