import { generateDenoTests, parseApiMd } from "./api-md.ts";

function assertEquals(actual: unknown, expected: unknown): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

const markdown = `# API

## Endpoints

### GET /v1/items

Description: List items

Request:

- limit: integer, optional

Response:

- 200 OK

---

### POST /v1/items

Description: Create an item

Request:

- name: string, required, example "Example item"
- description: string, optional

Response:

- 201 Created

---

### DELETE /v1/items/{item_id}

Description: Delete an item

Request:

- item_id: string, required, example "item_123"

Response:

- 204 No Content
`;

Deno.test("parseApiMd returns endpoints from API.md headings", () => {
  const endpoints = parseApiMd(markdown);

  assertEquals(endpoints.length, 3);
  assertEquals(endpoints[0], {
    method: "GET",
    path: "/v1/items",
    description: "List items",
    request: ["limit: integer, optional"],
    response: ["200 OK"],
    errors: [],
    notes: [],
  });
});

Deno.test("generateDenoTests creates status checks with inline examples", () => {
  const output = generateDenoTests(parseApiMd(markdown));

  assertEquals(output.includes('Deno.test("List items"'), true);
  assertEquals(output.includes("assertEquals(response.status, 200);"), true);
  assertEquals(output.includes('Deno.test("Create an item"'), true);
  assertEquals(output.includes("assertEquals(response.status, 201);"), true);
  assertEquals(output.includes('"name": "Example item"'), true);
  assertEquals(output.includes('method: "DELETE"'), true);
  assertEquals(output.includes('"item_id": "item_123"'), true);
  assertEquals(output.includes("${params.item_id}"), true);
});

Deno.test("generateDenoTests allows external examples to override inline examples", () => {
  const output = generateDenoTests(parseApiMd(markdown), {
    params: {
      item_id: "item_override",
    },
    request: {
      name: "Override item",
    },
  });

  assertEquals(output.includes('"name": "Override item"'), true);
  assertEquals(output.includes('"item_id": "item_override"'), true);
});
