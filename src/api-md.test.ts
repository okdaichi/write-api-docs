import { generateDenoTests, parseApiMd, stringifyApiMd } from "../mod.ts";

function assertEquals(actual: unknown, expected: unknown): void {
  const a = JSON.stringify(actual, Object.keys(actual as any).sort());
  const e = JSON.stringify(expected, Object.keys(expected as any).sort());
  if (a !== e) {
    throw new Error(
      `Expected ${e}, got ${a}`,
    );
  }
}

const markdown = `# API Specification

Auth: Required

## Endpoints

### GET /v1/resources

Description: List resources

Query:
- limit
- offset

Response:
- 200 OK

### POST /v1/resources

Description: Create a resource

Headers:
- X-Client-Id

Body:
\`\`\`json
{
  "name": "example-resource"
}
\`\`\`

Response:
- 201 Created

### DELETE /v1/resources/{id}

Description: Delete a resource

Auth: None

Response:
- 204 No Content
`;

Deno.test("parseApiMd returns endpoints with new format", () => {
  const endpoints = parseApiMd(markdown);

  assertEquals(endpoints.length, 3);
  assertEquals(endpoints[0], {
    method: "GET",
    path: "/v1/resources",
    description: "List resources",
    auth: "Required",
    query: ["limit", "offset"],
    headers: [],
    response: ["200 OK"],
  });

  assertEquals(endpoints[1].headers, ["X-Client-Id"]);
  assertEquals(endpoints[1].body?.trim(), '{\n  "name": "example-resource"\n}');

  assertEquals(endpoints[2].auth, "None");
});

Deno.test("generateDenoTests creates tests with tokens and query params", () => {
  const output = generateDenoTests(parseApiMd(markdown));

  assertEquals(output.includes('Deno.test("List resources"'), true);
  assertEquals(output.includes('const token = Deno.env.get("TOKEN") ?? "";'), true);
  assertEquals(output.includes('Authorization": `Bearer ${token}`'), true);
  assertEquals(output.includes("?limit=${params.limit}&offset=${params.offset}"), true);

  assertEquals(output.includes('const basePath = Deno.env.get("API_BASE_PATH") ?? "";'), true);
  assertEquals(
    output.includes(
      "fetch(`${baseUrl}${basePath}/v1/resources?limit=${params.limit}&offset=${params.offset}`",
    ),
    true,
  );

  assertEquals(output.includes('Deno.test("Create a resource"'), true);
  assertEquals(output.includes('"X-Client-Id": `${params["X-Client-Id"] ?? "TODO"}`'), true);
  // The generated code for the body might have different indentation or spacing.
  assertEquals(output.includes("body: JSON.stringify({"), true);
  assertEquals(output.includes('"name": "example-resource"'), true);

  assertEquals(output.includes('Deno.test("Delete a resource"'), true);
});

Deno.test("generateDenoTests excludes Authorization if Auth: None", () => {
  const endpoints = parseApiMd(markdown);
  const deleteEndpoint = endpoints.find((e) => e.method === "DELETE");
  const output = generateDenoTests([deleteEndpoint!]);
  assertEquals(output.includes("Authorization"), false);
});

Deno.test("stringifyApiMd generates valid markdown", () => {
  const endpoints: any[] = [
    {
      method: "GET",
      path: "/test",
      description: "Test endpoint",
      auth: "None",
      query: ["param1"],
      headers: [],
      response: ["200 OK"],
    },
  ];

  const output = stringifyApiMd(endpoints, "Required");

  assertEquals(output.includes("### GET /test"), true);
  assertEquals(output.includes("Description: Test endpoint"), true);
  assertEquals(output.includes("Auth: None"), true);
  assertEquals(output.includes("- param1"), true);
});
