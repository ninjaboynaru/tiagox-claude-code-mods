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
