# Code Package Standards

These are the standards that the organization of a package, such as its files, its folders, and their names, must adhere to.

## Guiding Philosophy

Organize a package for the person who has to find something in it. A reader opens a package looking for one thing, and its files, folders, and names should lead them to that thing with as little searching as possible.

### Principle 1: Findability

A package's layout is the first thing a reader sees, before any code. Arrange and name its files and folders so that a reader can tell where something lives from the names alone.

### Principle 2: Structure Follows Need

Add structure only when the package's current contents call for it. A folder or layer created for contents that do not exist yet adds a step to every search and gives nothing back.

## Rule 1: Group files into subfolders by theme

A folder is a list that a reader scans to find what they came for. When a folder holds several themes of files, give each sizable theme its own subfolder, so that the theme collapses to one name and the reader finds it at a glance. When a folder is short, keep it flat, since a subfolder over a few files adds a hop and a longer import path without making anything easier to find.

### Clause A: Group a theme of about three files that sits among unrelated neighbors

Create a subfolder when about three or more files share one theme and at least two other files in the folder do not belong to it. Below that, keep the folder flat. Name the subfolder for what a reader comes looking for, such as `validators` or `emails`, and never for a file type, such as `html`. Do not create a folder for files that do not yet exist.

**Example 1 - Bad** (Three validators, three emails, and three unrelated files sit in one flat list, so the reader has to scan all nine names to find one theme):

```text
	checkout/
	├── addressValidator.ts
	├── cardValidator.ts
	├── checkoutRoutes.ts
	├── checkoutService.ts
	├── checkoutTypes.ts
	├── couponValidator.ts
	├── orderConfirmationEmail.html
	├── paymentFailedEmail.html
	└── refundIssuedEmail.html
```

**Example 1 - Good** (Each theme of three files collapses to one subfolder name, and the three unrelated files stay at the top level):

```text
	checkout/
	├── emails/
	│   ├── orderConfirmationEmail.html
	│   ├── paymentFailedEmail.html
	│   └── refundIssuedEmail.html
	├── validators/
	│   ├── addressValidator.ts
	│   ├── cardValidator.ts
	│   └── couponValidator.ts
	├── checkoutRoutes.ts
	├── checkoutService.ts
	└── checkoutTypes.ts
```

**Example 2 - Bad** (Each subfolder holds a single file, so it adds a hop and a longer import path without making anything easier to find):

```text
	checkout/
	├── emails/
	│   └── orderConfirmationEmail.html
	├── validators/
	│   └── cardValidator.ts
	├── checkoutRoutes.ts
	├── checkoutService.ts
	└── checkoutTypes.ts
```

**Example 2 - Good** (The folder is short, so all five files stay flat at the top level):

```text
	checkout/
	├── cardValidator.ts
	├── checkoutRoutes.ts
	├── checkoutService.ts
	├── checkoutTypes.ts
	└── orderConfirmationEmail.html
```
