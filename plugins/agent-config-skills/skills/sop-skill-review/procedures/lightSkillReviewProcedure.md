# Light Skill Review Procedure

Verify the skill under review against the authoring skill for each kind of content it holds. Load every authoring skill that matches, and verify the skill against it:

- Load the `skill-creator` skill and verify everything about the skill against its guidance, such as its intent, its description and body, and the organization and format of its folder and the other files in it.
- Load the `author-skills` skill and verify the skill's name, frontmatter, and layout against it.
- When the skill holds standards, load the `author-standards` skill and verify the standards against it.
- When the skill holds an SOP, load the `author-sop` skill and verify the SOP against it.
- When the skill holds an Ontology section, load the `author-ontology` skill and verify the section against it.

If any of these five skills is not available, stop, tell the user which of them are available and which are not, and ask what to do.

Fix every violation you find.
