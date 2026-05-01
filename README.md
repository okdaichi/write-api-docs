# API.md Convention

A lightweight, human-readable convention for documenting APIs in Markdown.

API.md is inspired by the spirit of [Keep a Changelog](https://keepachangelog.com/): simple files, clear headings, useful examples, and no required tooling.

## Problem

API documentation often drifts away from the code that developers actually change.

Many projects need a document people can read, edit, review, and keep next to the implementation without adopting a large documentation process first.

Spec-first and code-generation workflows can be useful, but they may add extra steps to everyday coding. When the main need is integrity between code and documentation, a small API.md file can be enough.

## Solution

API.md defines a small Markdown convention for describing APIs in a predictable way.

The goal is not to model every detail of an API. The goal is to make the important parts easy to write down:

- What endpoints exist
- What each endpoint does
- What request data it expects
- What responses it returns
- What changed over time

## Philosophy

- **Code-first:** Keep API documentation close to the implementation and update it in the same pull request.
- **Human-first:** Optimize for readers before generators, validators, or machines.
- **Minimal structure:** Use ordinary Markdown headings and lists.
- **No required tooling:** A valid API.md file should be useful in any text editor, code review, or repository browser.
- **Integrity over generation:** Prioritize keeping implementation and documentation aligned over generating application types.
- **Tests over types:** If tooling is added, prefer tools that check code and docs against each other over tools that make API.md the source for generated types.
- **Examples over rules:** Prefer clear examples to a large specification.

## Example

See [API.md](API.md) for the canonical example of this convention.

## Use Cases

- Small to mid-size services
- Internal APIs
- Early-stage products
- Codebases where docs are reviewed with implementation changes
- Libraries or services with a small public HTTP surface
- Teams that want useful docs with a low adoption cost

## Non-Goals

- API.md is not a full schema definition language.
- API.md does not require validators, generators, or custom parsers.
- API.md is not designed around type generation.
- API.md does not try to describe every possible API style.
- API.md does not guarantee backward compatibility while the convention is experimental.

## Status

Early draft and experimental.

The convention is intentionally small. Feedback should focus on whether the format is clear, useful, and easy to adopt.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before proposing changes.

## License

MIT. See [LICENSE](LICENSE).
