# Code Design Standards

These are the standards that the design of code, such as its names, its flow of steps, its types, and how its responsibilities are split between units, must adhere to.

## Guiding Philosophy

Write code for the next person who has to read it, who will arrive later and without the context its author had. Keep code simple and readable, so that understanding, following, and changing it takes as little effort as possible. Four principles underlie these standards and shape every rule and clause in them.

### Principle 1: Code Readability

Make code as easy to read and comprehend as reasonably possible, even at the cost of reasonable verbosity.

### Principle 2: Don't Repeat Yourself (DRY)

Give each piece of logic or knowledge a single authoritative implementation, because copies drift apart over time and every fix then has to be made in each one.

- A little duplication is fine. Logic that appears once or twice more can stay, and anything beyond that is a reason to apply DRY.
- Do not take this principle too far by abstracting early and coupling code that has no need to change together.

### Principle 3: Keep It Simple (KISS)

Choose the simplest design that satisfies the current requirements, because cleverness costs every future reader effort and returns nothing. Clear code beats clever code, and a verbose line beats a short one that confuses.

### Principle 4: You Aren't Going to Need It (YAGNI)

Do not build for imagined future needs that do not exist and are unlikely to. Add a capability or feature once the need for it is real.

## Rule 1: Use explicit names

Use explicit names that make the intention of the code clear and unambiguous on their own without needing extra context, next to other names in the same scope and from anywhere else in the codebase the name may be read, except where the local scope makes the name itself unambiguous and blatantly obvious. Treat the local scope as the place where that code is most likely to be read.

### Clause A: Prefer the longer name that removes ambiguity

Choose the name that makes the intention clear even if the result is a longer, more verbose name. Prefer a longer name that removes ambiguity over a shorter name that forces the reader to guess what it refers to or trace it back through the code to be sure.

**Example 1 - Bad** (The name `activeCount` does not say what is being counted):

```typescript
	const activeCount = getSubscriptions().filter(subscription => subscription.status === 'active').length
	const expiredCount = getSubscriptions().filter(subscription => subscription.status === 'expired').length
```

**Example 1 - Good** (The name `activeSubscriptionCount` clearly indicates what is being counted):

```typescript
	const activeSubscriptionCount = getSubscriptions().filter(subscription => subscription.status === 'active').length
	const expiredSubscriptionCount = getSubscriptions().filter(subscription => subscription.status === 'expired').length
```

**Example 2 - Bad** (The name `Status` does not say what the status belongs to):

```typescript
	type Status = 'pending' | 'shipped' | 'delivered'
```

**Example 2 - Good** (The name `ShipmentStatus` clearly indicates what the status belongs to):

```typescript
	type ShipmentStatus = 'pending' | 'shipped' | 'delivered'
```

**Example 3 - Bad** (The name `loadConfig` forces the reader to check the parameter to learn which config is loaded):

```typescript
	async function loadConfig(pluginName: string): Promise<string> {
		return readFile(`plugins/${pluginName}/config.json`, 'utf8')
	}
```

**Example 3 - Good** (The name `loadPluginConfig` itself says which config is loaded):

```typescript
	async function loadPluginConfig(pluginName: string): Promise<string> {
		return readFile(`plugins/${pluginName}/config.json`, 'utf8')
	}
```

**Example 4 - Bad** (The name `prices` covers both the argument passed in and the value returned, so the reader cannot tell the input from the result):

```typescript
	export function applyDiscount(prices: number[], discountRate: number): number[] {
		prices = prices.map(price => price * (1 - discountRate))
		return prices
	}
```

**Example 4 - Good** (The name `discountedPrices` separates the returned result from the `prices` argument passed in):

```typescript
	export function applyDiscount(prices: number[], discountRate: number): number[] {
		const discountedPrices = prices.map(price => price * (1 - discountRate))
		return discountedPrices
	}
```

## Rule 2: Prefer explicit linear steps over dense composition

Write code as a series of explicit, named steps, not as one dense, clever expression. Favor readability, legibility, and self-documentation over brevity and needless cleverness in all code. A few more lines and a well-named intermediate variable cost less than making the reader untangle a nested chain and work through the control flow in their head. Lay out the flow so a reader can follow it from top to bottom with little decoding. Density and point-free composition are not goals.

### Clause A: Name each meaningful intermediate step

Give every meaningful intermediate step of an operation its own name, even if that costs an extra line.

**Example 1 - Bad** (The reader has to unpack three nested calls from the inside out to follow the order of the steps):

```typescript
	return formatCurrency(applyDiscount(sumLineItems(order.lineItems), order.discountRate))
```

**Example 1 - Good** (Each step has a name and its own line, so the steps read in the order they run):

```typescript
	const subtotal = sumLineItems(order.lineItems)
	const discountedTotal = applyDiscount(subtotal, order.discountRate)
	const formattedTotal = formatCurrency(discountedTotal)
	return formattedTotal
```

### Clause B: Prefer early return guards over chains and ternaries

For conditional flow, use early return guards in place of nested ternaries and chained expressions. In asynchronous code, that means `async` and `await` with guards in place of `.then` chains.

**Example 1 - Bad** (The nested ternary puts three outcomes on one line, and the reader has to pair each condition with its result):

```typescript
	const ticketQueues = tickets.map(ticket =>
		ticket.isSpam ? 'discard' : ticket.priority === 'urgent' ? 'on-call' : 'backlog'
	)
```

**Example 1 - Good** (Each outcome has its own guard and return, so the reader takes one case at a time):

```typescript
	const ticketQueues = tickets.map(ticket => {
		if (ticket.isSpam) return 'discard'
		if (ticket.priority === 'urgent') return 'on-call'
		return 'backlog'
	})
```

**Example 2 - Bad** (The closed account case is a ternary buried inside nested `.then` chains, so the reader has to trace the nesting to see when each branch runs):

```typescript
	function loadAccountBalance(accountId: string): Promise<number> {
		return findAccount(accountId).then(account =>
			account.isClosed ? 0 : fetchLedger(account.ledgerId).then(ledger => ledger.balance)
		)
	}
```

**Example 2 - Good** (The `await` keyword puts the steps in order, and the early return guard handles the closed account before the rest of the flow):

```typescript
	async function loadAccountBalance(accountId: string): Promise<number> {
		const account = await findAccount(accountId)
		if (account.isClosed) return 0
		const ledger = await fetchLedger(account.ledgerId)
		return ledger.balance
	}
```

### Clause C: Keep the pipeline shape visible

When code runs in stages, such as building tasks, running them, and collecting their results, give each stage its own named statement so that the stages read in order down the page. Do not leave the reader to work out the stages from how one expression nests inside another.

Use `map`, `filter`, and other combinators where each one reads cleanly on its own, and do not chain several of them into a single expression only to save lines.

**Example 1 - Bad** (The validate, skip, and publish flow is hidden inside a `.then` chain and a ternary, nested in a `map`, a `Promise.all`, and a `filter`):

```typescript
	const publishedArticles = (await Promise.all(
		articles.map(article =>
			validateArticle(article).then(validation =>
				validation.passed ? publishArticle(article) : null
			)
		)
	)).filter(publishedArticle => publishedArticle !== null)
```

**Example 1 - Good** (Each stage is named, the per-article flow is an async function with an early return guard, and building the tasks, awaiting them, and collecting the results each have their own line):

```typescript
	const publishTasks = articles.map(article => async () => {
		const validation = await validateArticle(article)
		if (!validation.passed) return null
		const publishedArticle = await publishArticle(article)
		return publishedArticle
	})
	const publishResults = await Promise.all(publishTasks.map(publishTask => publishTask()))
	const publishedArticles = publishResults.filter(publishResult => publishResult !== null)
```

## Rule 3: Write the least code that solves the problem

All code is a liability that must be maintained and will eventually break. Every line costs reading, testing, and maintenance for as long as it exists, so complexity that brings no benefit is a loss. Write the minimal solution that meets the requirement.

### Clause A: Write only what the requirement needs

Solve the problem at hand and nothing more. Leave out options, parameters, abstractions, and handling for cases that nobody has asked for and that are unlikely in the immediate future.

**Example 1 - Bad** (Every caller formats US dollars, so the three extra parameters are options nobody asked for):

```typescript
	function formatPrice(price: number, currency = 'USD', locale = 'en-US', fractionDigits = 2): string {
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency,
			minimumFractionDigits: fractionDigits,
			maximumFractionDigits: fractionDigits,
		}).format(price)
	}
```

**Example 1 - Good** (The function does the one thing its callers need):

```typescript
	function formatPrice(price: number): string {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
	}
```

**Example 2 - Bad** (The function returns the user's email beside the user, although the email is already on the user and nothing shows a caller needing it separately):

```typescript
	async function loadUser(userId: string): Promise<{ user: User; email: string }> {
		const user = await userRepository.findById(userId)
		return { user, email: user.email }
	}
```

**Example 2 - Good** (The function returns the user alone and leaves the caller to read `user.email` from it):

```typescript
	async function loadUser(userId: string): Promise<User> {
		return userRepository.findById(userId)
	}
```

### Clause B: Use what is already provided before writing your own

Use what the language, its standard library, the surrounding code, and the libraries already in use provide before writing your own version. Rule 6 covers the package's own shared utilities. Write your own version or use some other alternative only when the provided one would reduce usability or readability or does not satisfy your use case.

**Example 1 - Bad** (The function rebuilds the query string parsing that the standard `URL` class already provides, and it misses cases such as `+` standing for a space and a trailing `#` fragment):

```typescript
	function getQueryParameter(url: string, parameterName: string): string | null {
		const queryString = url.split('?')[1]
		if (!queryString) return null
		for (const pair of queryString.split('&')) {
			const [key, value] = pair.split('=')
			if (decodeURIComponent(key) === parameterName) {
				return decodeURIComponent(value ?? '')
			}
		}
		return null
	}
```

**Example 1 - Good** (The standard `URL` class parses the query string, so the function only asks it for the parameter):

```typescript
	function getQueryParameter(url: string, parameterName: string): string | null {
		return new URL(url).searchParams.get(parameterName)
	}
```

## Rule 4: Name a Boolean condition when its meaning is not obvious

Name a Boolean condition when it is ambiguous, difficult to understand, complex, or hides cryptic business or system logic, wherever it appears, such as in an if statement, a loop, a filter, a ternary, or a logical expression. Give it an intermediate Boolean variable named for what is true when it holds. When a compound condition is complex, break it into named sub-conditions that the final name combines. The names carry the intent the combined expression hides, which makes the code easier for a human to comprehend.

Keep a condition inline when its meaning is clear at a glance, such as `if (!itemSchema)` or `session?.mcpServerName !== mcpServerName`, because a variable only adds a line when the name is obvious.

### Clause A: Name a condition when its meaning is not obvious

**Example 1 - Bad** (The reader has to work out that the type check on `window` means the code is running on the server):

```typescript
	if (typeof window === 'undefined') {
		return defaultTheme
	}
```

**Example 1 - Good** (The name `isRenderingOnServer` states the purpose of the type check before the if statement uses it):

```typescript
	const isRenderingOnServer = typeof window === 'undefined'
	if (isRenderingOnServer) {
		return defaultTheme
	}
```

**Example 2 - Bad** (The reader has to evaluate the compound condition part by part to learn which subscriptions it selects):

```typescript
	const subscriptionsToRemind = subscriptions.filter(subscription =>
		(subscription.plan === 'monthly' || subscription.plan === 'annual') && !subscription.cancelled && subscription.renewalDate.getTime() - Date.now() < REMINDER_WINDOW_MS
	)
```

**Example 2 - Good** (Each part of the condition has a name, and `needsRenewalReminder` combines them):

```typescript
	const subscriptionsToRemind = subscriptions.filter(subscription => {
		const isPaidPlan = subscription.plan === 'monthly' || subscription.plan === 'annual'
		const renewsWithinReminderWindow = subscription.renewalDate.getTime() - Date.now() < REMINDER_WINDOW_MS
		const needsRenewalReminder = isPaidPlan && !subscription.cancelled && renewsWithinReminderWindow
		return needsRenewalReminder
	})
```

## Rule 5: Give each fact one authoritative value

Apply DRY to values as well as logic. When several occurrences of a value represent one fact that must change together, give the fact an authoritative name and derive its other forms from it. Do not merge values that merely happen to be equal today.

### Clause A: Name a fact once and derive its other forms

**Example 1 - Bad** (The thirty minute timeout is written three times in three forms, so a change to it has to be made in three places):

```typescript
	const SESSION_TIMEOUT_MS = 1800000
	const SESSION_TIMEOUT_SECONDS = 1800
	const sessionExpiryMessage = 'Your session expires after 30 minutes.'
```

**Example 1 - Good** (The constant `SESSION_TIMEOUT_MINUTES` holds the fact once, and the other forms are derived from it):

```typescript
	const SESSION_TIMEOUT_MINUTES = 30
	const SESSION_TIMEOUT_SECONDS = SESSION_TIMEOUT_MINUTES * 60
	const SESSION_TIMEOUT_MS = SESSION_TIMEOUT_SECONDS * 1000
	const sessionExpiryMessage = `Your session expires after ${SESSION_TIMEOUT_MINUTES} minutes.`
```

### Clause B: Keep values apart when they are equal only by coincidence

**Example 1 - Bad** (The name `LIMIT` merges the email retry limit and the failed login limit, which are separate facts that only happen to both be three):

```typescript
	const LIMIT = 3
	await retry(sendEmail, LIMIT)
	const isAccountLocked = failedLoginAttempts >= LIMIT
```

**Example 1 - Good** (Each fact has its own name, so one limit can change without the other):

```typescript
	const MAX_EMAIL_SEND_RETRIES = 3
	const MAX_FAILED_LOGIN_ATTEMPTS = 3
	await retry(sendEmail, MAX_EMAIL_SEND_RETRIES)
	const isAccountLocked = failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS
```

## Rule 6: Check shared utilities before writing code

Before implementing any helper, utility function, or piece of logic, check the project's shared utilities and common code. Look in common locations such as `src/utilities`, `utils`, and `helpers`. Common operations such as safe file path conversion, file and directory existence checks, directory creation, math, and cryptography may already be implemented there, and so may operations specific to the package's domain. A package that renders schematic designs, for example, might keep its common rendering operations in a folder called `renderingUtilities` or `rendering`. Writing a duplicate creates inconsistency and a maintenance burden.

When the utility you need does not exist and is reusable across the codebase as it stands today, create it in the shared location. Do not create a shared utility for a reuse situation that does not exist yet.
### Clause A: Use the shared utility that already exists

**Example 1 - Bad** (The module writes its own directory helper, although the project's shared `utils/fileSystem` module already exports one):

```typescript
	async function ensureDirectoryExists(directoryPath: string): Promise<void> {
		await mkdir(directoryPath, { recursive: true })
	}

	await ensureDirectoryExists(reportDirectoryPath)
```

**Example 1 - Good** (The module imports the shared helper and writes no copy of it):

```typescript
	import { ensureDirectoryExists } from '../utils/fileSystem'

	await ensureDirectoryExists(reportDirectoryPath)
```

**Example 2 - Bad** (The module writes its own millimeter to pixel conversion, although the schematic package's `rendering` folder already exports one):

```typescript
	const MILLIMETERS_PER_INCH = 25.4
	const componentWidthInPixels = Math.round((component.widthInMillimeters / MILLIMETERS_PER_INCH) * canvas.pixelsPerInch)
```

**Example 2 - Good** (The module uses the conversion from the package's own `rendering` folder, so every drawing converts units the same way):

```typescript
	import { millimetersToPixels } from '../rendering/units'

	const componentWidthInPixels = millimetersToPixels(component.widthInMillimeters, canvas.pixelsPerInch)
```

## Rule 7: Use the most specific type that does the job

Choose the most specific type that does the job over a generic one. In a language with generics, write each function and type against the concrete types its callers pass in. Introduce a generic type parameter only when the function has to work for more than one type and that need exists today, not in some hypothetical future.

When only one type ever satisfies a generic, the reader has to work out what the parameter stands for and what business logic the author had in mind. The generic also weakens what the compiler can check inside the body and promises a reuse that nothing requires.

### Clause A: Write against the concrete types the callers pass

**Example 1 - Bad** (Only invoices are ever sorted, so `T` makes the reader work out what the items are and promises a reuse that nothing requires):

```typescript
	function sortByNewest<T extends { createdAt: Date }>(items: T[]): T[] {
		return [...items].sort((firstItem, secondItem) => secondItem.createdAt.getTime() - firstItem.createdAt.getTime())
	}
```

**Example 1 - Good** (The function names the one type its callers pass, so the reader and the compiler both know it handles invoices):

```typescript
	function sortInvoicesByNewest(invoices: Invoice[]): Invoice[] {
		return [...invoices].sort((firstInvoice, secondInvoice) => secondInvoice.createdAt.getTime() - firstInvoice.createdAt.getTime())
	}
```

## Rule 8: Give each responsibility its own unit

When a class or module starts doing a second job that has its own state, rules, or vocabulary, move that job into a separate class or module named after it, and make the original call it. Aim for one job per unit, not for small units, so leave in place a job that takes a few lines and has no state or rules of its own.

### Clause A: Give each responsibility its own unit

**Example 1 - Bad** (The weather client fetches forecasts and also owns the state and rules of request rate limiting):

```typescript
	class WeatherClient {
		private readonly requestTimestamps: number[] = []

		async fetchForecast(city: string): Promise<Forecast> {
			const oneMinuteAgo = Date.now() - ONE_MINUTE_IN_MS
			const recentRequestTimestamps = this.requestTimestamps.filter(requestTimestamp => requestTimestamp > oneMinuteAgo)
			const isOverRequestLimit = recentRequestTimestamps.length >= MAX_REQUESTS_PER_MINUTE
			if (isOverRequestLimit) {
				throw new Error('The weather request limit was reached.')
			}
			this.requestTimestamps.push(Date.now())

			return this.requestForecast(city)
		}
	}
```

**Example 1 - Good** (Rate limiting is its own unit with its own state and rules, and the weather client only asks it to record a request):

```typescript
	class RequestRateLimiter {
		private readonly requestTimestamps: number[] = []

		constructor(private readonly maxRequestsPerMinute: number) {}

		recordRequest(): void {
			const oneMinuteAgo = Date.now() - ONE_MINUTE_IN_MS
			const recentRequestTimestamps = this.requestTimestamps.filter(requestTimestamp => requestTimestamp > oneMinuteAgo)
			const isOverRequestLimit = recentRequestTimestamps.length >= this.maxRequestsPerMinute
			if (isOverRequestLimit) {
				throw new Error('The request limit was reached.')
			}
			this.requestTimestamps.push(Date.now())
		}
	}

	class WeatherClient {
		constructor(private readonly requestRateLimiter: RequestRateLimiter) {}

		async fetchForecast(city: string): Promise<Forecast> {
			this.requestRateLimiter.recordRequest()
			return this.requestForecast(city)
		}
	}
```

## Rule 9: Let an operation decide when it has nothing to do

When a function can tell from its own inputs or state that there is nothing for it to produce, make the function decide that and return its usual no-result value. Do not make callers run the same check before they call it. This rule does not apply when callers need different policies, or when the condition steers a larger workflow that a reader has to see at the call site.

### Clause A: Let an operation decide when it has nothing to do

**Example 1 - Bad** (Every caller has to know when the reminder email is worth building):

```typescript
	const hasOverdueInvoices = overdueInvoices.length > 0
	const reminderEmail = hasOverdueInvoices ? buildReminderEmail(overdueInvoices) : undefined
```

**Example 1 - Good** (The builder knows when there is nothing to build, so the caller just asks for the email):

```typescript
	const reminderEmail = buildReminderEmail(overdueInvoices)

	function buildReminderEmail(overdueInvoices: Invoice[]): Email | undefined {
		if (overdueInvoices.length === 0) {
			return undefined
		}

		const invoiceList = formatInvoiceList(overdueInvoices)
		return { subject: REMINDER_EMAIL_SUBJECT, body: invoiceList }
	}
```

## Rule 10: Follow the existing conventions

Write new code the way the code around it is already written, including its naming, its structure, and its style. Look for the convention to follow in this order, and follow the first one that covers your case:

1. The code around it in the same file.
2. The nearby files in the same package.
3. The conventions of the whole package, when the package has its own.

### Clause A: Follow the existing conventions

**Example 1 - Bad** (Every other loader in the file is named `load`, and the new function breaks the convention with `fetch`):

```typescript
	async function loadCustomer(customerId: string): Promise<Customer> {
		return customerRepository.findById(customerId)
	}

	async function loadOrder(orderId: string): Promise<Order> {
		return orderRepository.findById(orderId)
	}

	async function fetchInvoice(invoiceId: string): Promise<Invoice> {
		return invoiceRepository.findById(invoiceId)
	}
```

**Example 1 - Good** (The new function is named `loadInvoice`, which matches the loaders already in the file):

```typescript
	async function loadCustomer(customerId: string): Promise<Customer> {
		return customerRepository.findById(customerId)
	}

	async function loadOrder(orderId: string): Promise<Order> {
		return orderRepository.findById(orderId)
	}

	async function loadInvoice(invoiceId: string): Promise<Invoice> {
		return invoiceRepository.findById(invoiceId)
	}
```

## Rule 11: Follow the best practices of the language

Write code the way the language's own guidance and its community recommend. Use the idioms and current features of the language over older forms that they replaced.

### Clause A: Follow the best practices of the language

**Example 1 - Bad** (The index variable exists only to reach each attachment, which a `for...of` loop does directly):

```typescript
	for (let index = 0; index < attachments.length; index++) {
		await uploadAttachment(attachments[index])
	}
```

**Example 1 - Good** (The `for...of` loop hands over each attachment with no index to manage):

```typescript
	for (const attachment of attachments) {
		await uploadAttachment(attachment)
	}
```

## Rule 12: Avoid obvious performance problems

Write code that is reasonably performant. Avoid work that is plainly wasteful, such as repeating inside a loop what could be done once, sending one query per item where a single query serves, or searching a list again and again where a map or a set would do. Do not optimize past that point without a measurement that shows the need, because optimized code is harder to read.

### Clause A: Avoid obvious performance problems

**Example 1 - Bad** (The loop sends one query for each order, so 500 orders cost 500 round trips to the database):

```typescript
	const customers: Customer[] = []
	for (const order of orders) {
		const customer = await customerRepository.findById(order.customerId)
		customers.push(customer)
	}
```

**Example 1 - Good** (A single query loads every customer the orders need):

```typescript
	const customerIds = orders.map(order => order.customerId)
	const customers = await customerRepository.findByIds(customerIds)
```

## Rule 13: Use a well-established library for complex common behavior

Use a well-established, trusted library for complex common behavior, and do not write your own logic for it. Such a library has already met more edge cases, bugs, and attacks than new code will, and its maintainers carry the cost of keeping it correct. Write your own logic for a part of the behavior only when the library cannot do that part at all, as clause B describes.

### Clause A: Use a well-established library instead of your own logic

Complex common behavior is behavior that many programs need and that is easy to get subtly wrong. It includes these kinds, and others like them:

- HTTP routing and request parsing
- Logging
- Date and time arithmetic
- Parsing of standard formats, such as CSV, YAML, and XML
- Cryptography

A library is well established and trusted when it has all of these:

- **Wide use**: Many other projects depend on it.
- **A long history of use**: It has been in use for years.
- **Active maintenance**: It still gets releases and security fixes.
- **A known maintainer**: A named person, team, or organization stands behind it.

Small, simple logic does not call for a library. Write logic of a few lines that has no edge cases yourself, such as keeping a number between a minimum and a maximum, because a dependency costs more than that code.

**Example 1 - Bad** (The code matches the method and path by hand, so every case a router already covers, such as decoding the product ID in the path, becomes this code's job):

```typescript
	import { createServer } from 'node:http'

	const server = createServer((request, response) => {
		const requestPath = (request.url ?? '').split('?')[0]
		const pathSegments = requestPath.split('/').filter(pathSegment => pathSegment !== '')
		const isProductLookup = request.method === 'GET' && pathSegments.length === 2 && pathSegments[0] === 'products'
		if (!isProductLookup) {
			response.writeHead(404).end()
			return
		}

		const product = findProduct(pathSegments[1])
		if (!product) {
			response.writeHead(404).end()
			return
		}
		response.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(product))
	})
	server.listen(3000)
```

**Example 1 - Good** (Express matches the method and path, decodes the product ID, and answers an unmatched request with a 404):

```typescript
	import express from 'express'

	const app = express()

	app.get('/products/:productId', (request, response) => {
		const product = findProduct(request.params.productId)
		if (!product) {
			response.status(404).end()
			return
		}
		response.json(product)
	})
	app.listen(3000)
```

**Example 2 - Bad** (The code treats a month as thirty days, so a subscription that starts on January 31 renews in March and not in February):

```typescript
	const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000
	const DAYS_PER_MONTH = 30
	const renewalDate = new Date(startDate.getTime() + DAYS_PER_MONTH * MILLISECONDS_PER_DAY)
```

**Example 2 - Good** (The `addMonths` function of date-fns handles the different month lengths, so a subscription that starts on January 31 renews at the end of February):

```typescript
	import { addMonths } from 'date-fns'

	const renewalDate = addMonths(startDate, 1)
```

### Clause B: Write your own logic only when the library cannot do the job

Write your own logic for a part of the behavior only when the library cannot do that part at all, which means that no option, plugin, or documented extension of the library produces the result you need. An inconvenient interface, a longer setup, an unfamiliar API, or a preference for your own style does not meet this test.

When the test is met, write your own logic for the part the library cannot do, and keep using the library for every part it can. State in a comment why the library cannot do that part. Do not bend the library into doing it, because a workaround the library was not designed for is harder to read and to verify than the logic it replaces.

**Example 1 - Bad** (The code forces `addBusinessDays` to skip a list of closed dates by recounting them over a longer span until the count stops changing, which is harder to follow and to verify than a loop):

```typescript
	import { addBusinessDays, differenceInCalendarDays, isWeekend } from 'date-fns'

	function addOpenDays(startDate: Date, openDayCount: number, closedDates: Date[]): Date {
		const closedWeekdays = closedDates.filter(closedDate => !isWeekend(closedDate))
		let resultDate = addBusinessDays(startDate, openDayCount)
		let skippedClosedDayCount = 0
		let closedDayCount = countDatesInRange(closedWeekdays, startDate, resultDate)
		while (closedDayCount > skippedClosedDayCount) {
			skippedClosedDayCount = closedDayCount
			resultDate = addBusinessDays(startDate, openDayCount + skippedClosedDayCount)
			closedDayCount = countDatesInRange(closedWeekdays, startDate, resultDate)
		}
		return resultDate
	}

	function countDatesInRange(dates: Date[], rangeStart: Date, rangeEnd: Date): number {
		const datesInRange = dates.filter(date => {
			const isAfterRangeStart = differenceInCalendarDays(date, rangeStart) > 0
			const isOnOrBeforeRangeEnd = differenceInCalendarDays(rangeEnd, date) >= 0
			return isAfterRangeStart && isOnOrBeforeRangeEnd
		})
		return datesInRange.length
	}
```

**Example 1 - Good** (The loop is the code's own logic for the closed dates, and the comment gives the reason that date-fns cannot do it):

```typescript
	import { addDays, isSameDay, isWeekend } from 'date-fns'

	// date-fns addBusinessDays skips only Saturdays and Sundays and cannot skip a list of closed dates.
	function addOpenDays(startDate: Date, openDayCount: number, closedDates: Date[]): Date {
		let currentDate = startDate
		let remainingOpenDays = openDayCount
		while (remainingOpenDays > 0) {
			const nextDate = addDays(currentDate, 1)
			const isClosedDate = isWeekend(nextDate) || closedDates.some(closedDate => isSameDay(closedDate, nextDate))
			if (!isClosedDate) {
				remainingOpenDays--
			}
			currentDate = nextDate
		}
		return currentDate
	}
```
