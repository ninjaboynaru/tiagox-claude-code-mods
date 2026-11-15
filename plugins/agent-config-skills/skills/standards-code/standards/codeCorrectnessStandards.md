# Code Correctness Standards

These are the standards that the behavior of code, such as its logic, its handling of edge cases, and its effect on the code and data that depend on it, must adhere to.

## Guiding Philosophy

Code exists to do a job, and it is correct only when it does that job for every input and every state it will meet. Code that reads well and does the wrong thing has failed. Two principles underlie these standards and shape every rule and clause in them.

### Principle 1: Intention Is the Measure

Judge code against what it is supposed to do, which comes from the author's intention and from its written specifications and requirements. Code that runs without an error has not been shown to be correct.

### Principle 2: Other Code Depends on This Code

Callers, stored data, and clients were all built around how the code behaves today. Find out what relies on a behavior before changing it.

## Rule 1: Make the logic do what is intended

Write logic that produces the result the author intends. A logic fault is code that compiles, runs, and uses the language properly, yet computes the wrong result or takes the wrong branch. Check every condition, comparison, loop boundary, and order of operations against the intended behavior.

### Clause A: Make the logic do what is intended

**Example 1 - Bad** (The `||` operator makes the check true for every number, so the function never rejects a value outside 0 to 100):

```typescript
	function isValidPercentage(value: number): boolean {
		return value >= 0 || value <= 100
	}
```

**Example 1 - Good** (The `&&` operator requires both bounds to hold, so only a value from 0 to 100 passes):

```typescript
	function isValidPercentage(value: number): boolean {
		return value >= 0 && value <= 100
	}
```

## Rule 2: Use the language and its libraries according to their real behavior

Use every operator, language feature, and library call according to what it does, not what its name suggests. Confirm the behavior in the documentation when you are not certain of it.

### Clause A: Use the language and its libraries according to their real behavior

**Example 1 - Bad** (Without a compare function, `sort` compares the elements as strings, so the score 10 sorts before the score 9):

```typescript
	const sortedScores = [...scores].sort()
```

**Example 1 - Good** (The compare function makes `sort` order the scores as numbers):

```typescript
	const sortedScores = [...scores].sort((firstScore, secondScore) => firstScore - secondScore)
```

## Rule 3: Meet the specifications and requirements

Make the code do everything its specifications and requirements call for, and nothing that contradicts them. When no written specification exists, treat the request that led to the code as the specification.

### Clause A: Meet the specifications and requirements

**Example 1 - Bad** (The requirement allows a refund within 30 days of delivery, and this code counts the days from the order date):

```typescript
	const daysSinceOrder = countDaysBetween(order.orderedAt, today)
	const isRefundAllowed = daysSinceOrder <= REFUND_WINDOW_DAYS
```

**Example 1 - Good** (The code counts the days from the delivery date, as the requirement states):

```typescript
	const daysSinceDelivery = countDaysBetween(order.deliveredAt, today)
	const isRefundAllowed = daysSinceDelivery <= REFUND_WINDOW_DAYS
```

## Rule 4: Handle edge cases

Handle the inputs and states at the edges of what the code can receive, such as an empty collection, a missing value, zero, a negative number, a boundary value, a duplicate, and the failure of an operation the code depends on. Decide what the code must do in each edge case that can occur, and write that behavior on purpose.

### Clause A: Handle edge cases

**Example 1 - Bad** (A product with no ratings divides zero by zero, so the function returns `NaN`):

```typescript
	function calculateAverageRating(ratings: number[]): number {
		const ratingTotal = ratings.reduce((runningTotal, rating) => runningTotal + rating, 0)
		return ratingTotal / ratings.length
	}
```

**Example 1 - Good** (The guard handles a product with no ratings before the division runs):

```typescript
	function calculateAverageRating(ratings: number[]): number | undefined {
		if (ratings.length === 0) return undefined
		const ratingTotal = ratings.reduce((runningTotal, rating) => runningTotal + rating, 0)
		return ratingTotal / ratings.length
	}
```

## Rule 5: Validate input where it enters the system

Expect input from a user, a file, the network, or another system to be missing, malformed, of the wrong type, or out of range. Validate it at the point where it enters the system, and reject invalid input with an error that says what is wrong with it. The code past that point can then rely on the input being valid.

### Clause A: Validate input where it enters the system

**Example 1 - Bad** (The quantity comes straight from the form, so text becomes `NaN`, and a negative number or a fraction flows into the order total):

```typescript
	const quantity = Number(formData.get('quantity'))
	const orderTotal = quantity * product.unitPrice
```

**Example 1 - Good** (The quantity is checked as soon as it is read, and anything other than a whole number above zero is rejected with a clear error):

```typescript
	const quantity = Number(formData.get('quantity'))
	const isValidQuantity = Number.isInteger(quantity) && quantity > 0
	if (!isValidQuantity) {
		throw new ValidationError('The quantity must be a whole number greater than zero.')
	}
	const orderTotal = quantity * product.unitPrice
```

## Rule 6: Do not defeat the type system

In a language with a type system, write code that the compiler can check. Do not silence the compiler with an unsafe type assertion, an escape type such as `any`, or access to a value that the types say may be missing. Narrow a value with a real check before using it as a more specific type.

### Clause A: Do not defeat the type system

**Example 1 - Bad** (The `as` assertion tells the compiler the response body is a `Forecast` without checking it, so a malformed response fails later and far from its cause):

```typescript
	const forecast = (await response.json()) as Forecast
```

**Example 1 - Good** (The `isForecast` type guard checks the response body, and the compiler narrows it to a `Forecast` only after the check passes):

```typescript
	const responseBody: unknown = await response.json()
	if (!isForecast(responseBody)) {
		throw new Error('The weather service returned a malformed forecast.')
	}
	const forecast = responseBody
```

## Rule 7: Do not break behavior that other code depends on

When you change code, find everything that depends on how it behaves today, such as its callers, its subclasses, and the modules that read what it writes. Keep that behavior working, or update everything that depends on it in the same change.

### Clause A: Do not break behavior that other code depends on

**Example 1 - Bad** (The function used to return `undefined` for an unknown code, and the checkout still checks for `undefined`, so an unknown code now crashes the checkout):

```typescript
	function findCoupon(couponCode: string): Coupon {
		const coupon = coupons.get(couponCode)
		if (!coupon) {
			throw new Error(`No coupon has the code ${couponCode}.`)
		}
		return coupon
	}
```

**Example 1 - Good** (The function keeps returning `undefined` for an unknown code, which is the behavior the checkout depends on):

```typescript
	function findCoupon(couponCode: string): Coupon | undefined {
		return coupons.get(couponCode)
	}
```

## Rule 8: Keep changes backward compatible with old data and old clients

New code is deployed while data written by the old code and clients built against the old code still exist. Make every change keep reading the old data and keep answering the old clients, unless the same change migrates them.

### Clause A: Keep changes backward compatible with old data and old clients

**Example 1 - Bad** (Settings saved before the field was renamed hold the value under `theme`, so every existing user loses their color scheme):

```typescript
	function readColorScheme(savedSettings: SavedSettings): ColorScheme {
		return savedSettings.colorScheme ?? DEFAULT_COLOR_SCHEME
	}
```

**Example 1 - Good** (The function falls back to the old `theme` field, so settings saved before the rename still load):

```typescript
	function readColorScheme(savedSettings: SavedSettings): ColorScheme {
		return savedSettings.colorScheme ?? savedSettings.theme ?? DEFAULT_COLOR_SCHEME
	}
```

## Rule 9: Put time limits and resource limits on outside inputs and outside APIs

An outside API, such as a web service or a database, can stall and never answer, and an outside input can be far larger than the code expects. Give every call to an outside API a time limit, and give every outside input a resource limit, so that one slow API or one huge input cannot hold up or exhaust the program.

### Clause A: Give every call to an outside API a time limit

Set the time limit on the call or on the client that makes it, and handle a time-out like any other failure of the call.

**Example 1 - Bad** (The call has no time limit, so a weather service that stops answering holds the request forever):

```typescript
	const response = await fetch(`${WEATHER_API_URL}/forecast?city=${encodeURIComponent(city)}`)
```

**Example 1 - Good** (The `signal` option ends the call with a time-out error after `WEATHER_REQUEST_TIMEOUT_MS`):

```typescript
	const response = await fetch(`${WEATHER_API_URL}/forecast?city=${encodeURIComponent(city)}`, {
		signal: AbortSignal.timeout(WEATHER_REQUEST_TIMEOUT_MS),
	})
```

**Example 2 - Bad** (The pool sets no connection time-out and no statement time-out, so a stuck database holds every request that uses it):

```typescript
	const pool = new Pool({ connectionString: databaseUrl })
```

**Example 2 - Good** (The pool gives up on a connection after `DATABASE_CONNECTION_TIMEOUT_MS` and ends any statement that runs longer than `DATABASE_STATEMENT_TIMEOUT_MS`):

```typescript
	const pool = new Pool({
		connectionString: databaseUrl,
		connectionTimeoutMillis: DATABASE_CONNECTION_TIMEOUT_MS,
		statement_timeout: DATABASE_STATEMENT_TIMEOUT_MS,
	})
```

### Clause B: Give every outside input a resource limit

Set a maximum size for the input, such as a number of bytes, and enforce it before the program reads the whole input into memory or while it reads.

**Example 1 - Bad** (The upload handler sets no size limit, so one huge file fills the memory of the program):

```typescript
	const upload = multer({ storage: multer.memoryStorage() })
```

**Example 1 - Good** (The `fileSize` limit makes the handler reject any file larger than `MAX_UPLOAD_BYTES`):

```typescript
	const upload = multer({
		storage: multer.memoryStorage(),
		limits: { fileSize: MAX_UPLOAD_BYTES },
	})
```

**Example 2 - Bad** (The whole import file is read into memory with no check of its size):

```typescript
	const importFileText = await readFile(importFilePath, 'utf8')
```

**Example 2 - Good** (The code reads the file size first and rejects a file that is over the limit):

```typescript
	const importFileStats = await stat(importFilePath)
	const isImportFileTooLarge = importFileStats.size > MAX_IMPORT_FILE_BYTES
	if (isImportFileTooLarge) {
		throw new ValidationError('The import file is larger than the allowed size.')
	}
	const importFileText = await readFile(importFilePath, 'utf8')
```

## Rule 10: Clean up on every way out

Whatever the code creates or opens for temporary use, such as a temporary file, a file handle, a database connection, a lock, or a helper process, it must remove or close after success, after an error, and after a stop. Put the cleanup where it runs on every way out of the code, and never only at the end of the successful path.

### Clause A: Clean up after success and after an error

Put the cleanup in a `finally` block, or in the language's equivalent, so that it runs whether the code succeeds or throws.

**Example 1 - Bad** (If `uploadReport` throws, the line that removes the file never runs, so the temporary file stays on disk):

```typescript
	const temporaryFilePath = path.join(os.tmpdir(), `${randomUUID()}.csv`)
	await writeFile(temporaryFilePath, csvText)
	await uploadReport(temporaryFilePath)
	await rm(temporaryFilePath)
```

**Example 1 - Good** (The `finally` block removes the file after success and after an error):

```typescript
	const temporaryFilePath = path.join(os.tmpdir(), `${randomUUID()}.csv`)
	try {
		await writeFile(temporaryFilePath, csvText)
		await uploadReport(temporaryFilePath)
	} finally {
		await rm(temporaryFilePath, { force: true })
	}
```

**Example 2 - Bad** (If the query throws, the connection is never released, and enough failures leave the pool with no connection to give):

```typescript
	const connection = await pool.connect()
	const queryResult = await connection.query('SELECT id, total FROM orders WHERE customer_id = $1', [customerId])
	connection.release()
	return queryResult.rows
```

**Example 2 - Good** (The `finally` block releases the connection after success and after an error):

```typescript
	const connection = await pool.connect()
	try {
		const queryResult = await connection.query('SELECT id, total FROM orders WHERE customer_id = $1', [customerId])
		return queryResult.rows
	} finally {
		connection.release()
	}
```

### Clause B: Clean up after a stop

A `finally` block does not run when a signal ends the process, so handle the stop signals wherever the code holds something that must be removed.

**Example 1 - Bad** (The `finally` block does not run when a signal stops the process, so the work folder stays on disk):

```typescript
	const workDirectoryPath = await mkdtemp(path.join(os.tmpdir(), 'export-'))
	try {
		await runExport(workDirectoryPath)
	} finally {
		await rm(workDirectoryPath, { recursive: true, force: true })
	}
```

**Example 1 - Good** (The stop handler removes the work folder before the process exits, and the `finally` block removes the handlers once the export is done):

```typescript
	const workDirectoryPath = await mkdtemp(path.join(os.tmpdir(), 'export-'))
	const removeWorkDirectory = () => rm(workDirectoryPath, { recursive: true, force: true })
	const stopExport = async (): Promise<void> => {
		await removeWorkDirectory()
		process.exit(1)
	}
	process.once('SIGINT', stopExport)
	process.once('SIGTERM', stopExport)
	try {
		await runExport(workDirectoryPath)
	} finally {
		process.off('SIGINT', stopExport)
		process.off('SIGTERM', stopExport)
		await removeWorkDirectory()
	}
```
