# Contributing

Thanks for helping improve the API.md Convention.

This project is specification-first, not tool-first. Changes should make the convention clearer, easier to adopt, or easier to explain.

## Ways to Contribute

- Propose changes to the format.
- Improve examples.
- Clarify documentation.
- Add translations.
- Report confusing wording or missing guidance.
- Share real-world usage notes.

## Keep It Simple

The most important contribution rule is: keep it simple.

API.md should remain easy to write by hand, easy to review in a pull request, and useful without special tools.

Before adding a new rule, section, keyword, or convention, ask:

- Can this be explained with an example instead?
- Does this help most users, or only a narrow case?
- Would this make adoption feel heavier?
- Can projects choose their own wording here?

Prefer examples over rules.

## What Makes a Good Proposal

A good proposal usually includes:

- The problem it solves.
- A short before-and-after example.
- Why existing Markdown conventions are not enough.
- Any tradeoffs or compatibility concerns.

Small changes are easier to review than broad redesigns.

## What to Avoid

Please avoid:

- Turning API.md into a full schema language.
- Requiring generated output.
- Adding mandatory tooling.
- Adding fields that most projects will not use.
- Replacing readable examples with abstract rules.

## Governance

Maintainers review issues and pull requests.

Changes should prioritize simplicity, readability, and low adoption cost. Backward compatibility is preferred, but it is not strict while the convention is in its early experimental stage.

If a change would make the convention more complex, maintainers may ask for a smaller proposal, more examples, or real-world evidence that the complexity is worth it.

## Pull Request Checklist

- The change keeps the convention human-readable.
- The README remains clear to a first-time reader.
- Examples still work when copied into a plain Markdown file.
- New guidance is optional unless it is essential.
- The changelog is updated when the convention changes.

## Code of Conduct

This project follows the [Code of Conduct](CODE_OF_CONDUCT.md).
