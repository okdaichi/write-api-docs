# API.md Convention

A lightweight, human-readable convention for documenting APIs in Markdown.

API.md is inspired by the spirit of [Keep a Changelog](https://keepachangelog.com/): simple files,
clear headings, useful examples, and no required tooling.

## Problem

API documentation often drifts away from the code that developers actually change.

Many projects need a document people can read, edit, review, and keep next to the implementation
without adopting a large documentation process first.

Spec-first and code-generation workflows can be useful, but they may add extra steps to everyday
coding. When the main need is integrity between code and documentation, a small API.md file can be
enough.

## Solution

API.md defines a small Markdown convention for describing APIs in a predictable way.

The goal is not to model every detail of an API. The goal is to make the important parts easy to
write down:

- What endpoints exist
- What each endpoint does
- What request data it expects
- What responses it returns

## Philosophy

- **Code-first:** Keep API documentation close to the implementation and update it in the same pull
  request.
- **Human-first:** Optimize for readers before generators, validators, or machines.
- **Minimal structure:** Use ordinary Markdown headings and lists.
- **No required tooling:** A valid API.md file should be useful in any text editor, code review, or
  repository browser.

## Documentation

- [API.md](API.md) - A canonical example of the convention.
- [CONVENTION.md](CONVENTION.md) - The detailed format specification and execution model.

## SDK Usage

You can use the API.md parser and generator in your own Deno scripts:

```ts
import { parseApiMd, stringifyApiMd } from "https://deno.land/x/api_md/mod.ts";
```

## Optional Tooling

This repository includes a small Deno TypeScript generator that can create starter test code from
API.md.

```sh
deno run --allow-read --allow-write cli.ts API.md generated/api.test.ts
```

Or use the task:

```sh
deno task generate:tests
```

The generator reads [API.md](API.md) and extracts parameters, headers, and JSON bodies to generate
executable tests.

Run generated tests against a service with:

```sh
API_BASE_URL=https://api.example.com TOKEN=secret deno test --allow-env --allow-net generated/api.test.ts
```

This tooling is optional. API.md remains useful as plain Markdown without running any command.

## Use Cases

- Small to mid-size services
- Internal APIs
- Early-stage products
- Codebases where docs are reviewed with implementation changes
- Libraries or services with a small public HTTP surface

## Non-Goals

- API.md is not a full schema definition language.
- API.md does not require validators, generators, or custom parsers.
- API.md does not try to describe every possible API style.

## Status

Early draft and experimental.

## License

MIT. See [LICENSE](LICENSE).
