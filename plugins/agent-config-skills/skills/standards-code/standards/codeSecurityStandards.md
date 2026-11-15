# Code Security Standards

These are the standards that the security of code, such as its authentication, its access control, and its handling of secrets and sensitive data, must adhere to.

## Guiding Philosophy

Write code on the assumption that someone will try to misuse it. Code that works for an honest user can still hand a dishonest one data or access they must not have. Two principles underlie these standards and shape every rule and clause in them.

### Principle 1: Verify Before Trusting

Treat every request as untrusted until the code has verified who sent it and what that sender is allowed to do.

### Principle 2: Least Exposure

Give every user, service, log, and response only the data and access it needs, because whatever is exposed can be stolen.

## Rule 1: Authenticate every request that needs an identity

Require authentication on every path that reads or changes anything belonging to a user or to the system. Leave no route, flag, header, or fallback that lets a request skip the check.

### Clause A: Authenticate every request that needs an identity

**Example 1 - Bad** (The route has no authentication, so anyone who knows the URL can delete an invoice):

```typescript
	router.delete('/invoices/:invoiceId', deleteInvoice)
```

**Example 1 - Good** (The `requireAuthentication` middleware runs first and rejects a request that is not signed in):

```typescript
	router.delete('/invoices/:invoiceId', requireAuthentication, deleteInvoice)
```

## Rule 2: Check that the requester is allowed to act on the resource

Knowing who sent a request does not settle what they may do. Before reading or changing a resource, check that the requester has the right to perform that action on that specific resource.

### Clause A: Check that the requester is allowed to act on the resource

**Example 1 - Bad** (Any signed-in user can read any customer's invoice by guessing its ID):

```typescript
	async function getInvoice(invoiceId: string): Promise<Invoice> {
		return invoiceRepository.findById(invoiceId)
	}
```

**Example 1 - Good** (The function returns the invoice only to the customer who owns it):

```typescript
	async function getInvoice(requestingUser: User, invoiceId: string): Promise<Invoice> {
		const invoice = await invoiceRepository.findById(invoiceId)
		const isInvoiceOwner = invoice.customerId === requestingUser.id
		if (!isInvoiceOwner) {
			throw new ForbiddenError('You do not have access to this invoice.')
		}
		return invoice
	}
```

## Rule 3: Keep secrets out of the code

Never write a password, API key, token, or private key into source code, a test, or a committed configuration file. Load every secret at run time from the environment or from a secret store.

### Clause A: Keep secrets out of the code

**Example 1 - Bad** (The API key is written into the source, so everyone who can read the repository or its history has it):

```typescript
	const paymentApiKey = 'example-live-payment-api-key'
```

**Example 1 - Good** (The API key is read from the environment at run time and never appears in the source):

```typescript
	const paymentApiKey = process.env.PAYMENT_API_KEY
	if (!paymentApiKey) {
		throw new Error('The PAYMENT_API_KEY environment variable is not set.')
	}
```

## Rule 4: Keep sensitive data out of logs, errors, and responses

Do not write sensitive data, such as passwords, tokens, payment details, and personally identifiable information, into a log, an error message, or a response that does not need it. Record an identifier that lets an authorized person look the data up.

### Clause A: Keep sensitive data out of logs, errors, and responses

**Example 1 - Bad** (The log entry stores the user's email address and password in plain text for anyone with access to the logs):

```typescript
	logger.info('A user signed in.', { email: credentials.email, password: credentials.password })
```

**Example 1 - Good** (The log entry records only the user ID, which identifies the user without exposing anything sensitive):

```typescript
	logger.info('A user signed in.', { userId: user.id })
```
