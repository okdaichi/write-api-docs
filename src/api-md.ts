export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export type ApiEndpoint = {
  method: HttpMethod;
  path: string;
  description?: string;
  request: string[];
  response: string[];
  errors: string[];
  notes: string[];
};

export type ApiExamples = {
  params?: Record<string, unknown>;
  request?: Record<string, unknown>;
};

type EndpointListField = "request" | "response" | "errors" | "notes";

type RequestField = {
  name: string;
  line: string;
  required: boolean;
  example?: unknown;
};

const endpointHeading = /^###\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(\S+)\s*$/;
const fieldHeading = /^(Description|Request|Response|Errors|Notes):\s*(.*)$/;
const requestMethodsWithBody = new Set<HttpMethod>(["POST", "PUT", "PATCH"]);

export function parseApiMd(markdown: string): ApiEndpoint[] {
  const endpoints: ApiEndpoint[] = [];
  let current: ApiEndpoint | undefined;
  let currentField: EndpointListField | undefined;

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    const headingMatch = line.match(endpointHeading);

    if (headingMatch) {
      current = {
        method: headingMatch[1] as HttpMethod,
        path: headingMatch[2],
        request: [],
        response: [],
        errors: [],
        notes: [],
      };
      endpoints.push(current);
      currentField = undefined;
      continue;
    }

    if (!current || line.length === 0 || line === "---") {
      continue;
    }

    const fieldMatch = line.match(fieldHeading);

    if (fieldMatch) {
      const fieldName = fieldMatch[1];
      const fieldValue = fieldMatch[2].trim();

      if (fieldName === "Description") {
        current.description = fieldValue || undefined;
        currentField = undefined;
        continue;
      }

      currentField = fieldName.toLowerCase() as EndpointListField;

      if (fieldValue) {
        current[currentField].push(fieldValue);
      }

      continue;
    }

    if (currentField && line.startsWith("- ")) {
      current[currentField].push(line.slice(2).trim());
    }
  }

  return endpoints;
}

export function generateDenoTests(
  endpoints: ApiEndpoint[],
  examples: ApiExamples = {},
): string {
  const tests = endpoints.map((endpoint) => {
    const status = expectedStatus(endpoint);
    const name = endpoint.description ?? `${endpoint.method} ${endpoint.path}`;
    const urlPath = pathToTemplate(endpoint.path);
    const init = requestInit(endpoint, examples);
    const params = pathParams(endpoint.path);
    const paramsBlock = params.length === 0 ? "" : `  const params = {
${
      params.map((param) =>
        `    ${JSON.stringify(param)}: ${jsonValue(exampleValue(endpoint, examples.params, param))}`
      ).join(",\n")
    },
  };

`;

    return `Deno.test(${JSON.stringify(name)}, async () => {
${paramsBlock}\
  const response = await fetch(\`\${baseUrl}${urlPath}\`${init});
  assertEquals(response.status, ${status});
});`;
  });

  return `const baseUrl = Deno.env.get("API_BASE_URL") ?? "http://localhost:3000";

function assertEquals(actual: unknown, expected: unknown): void {
  if (actual !== expected) {
    throw new Error(\`Expected \${expected}, got \${actual}\`);
  }
}

${tests.join("\n\n")}
`;
}

function expectedStatus(endpoint: ApiEndpoint): number {
  const success = endpoint.response.find((line) => /^\d{3}\b/.test(line));
  return success ? Number(success.slice(0, 3)) : 200;
}

function requestInit(endpoint: ApiEndpoint, examples: ApiExamples): string {
  if (["GET", "HEAD"].includes(endpoint.method)) {
    return "";
  }

  if (!requestMethodsWithBody.has(endpoint.method)) {
    return `, {
    method: ${JSON.stringify(endpoint.method)},
  }`;
  }

  const body = requestBody(endpoint, examples);

  return `, {
    method: ${JSON.stringify(endpoint.method)},
    headers: { "content-type": "application/json" },
    body: JSON.stringify(${body}),
  }`;
}

function requestBody(endpoint: ApiEndpoint, examples: ApiExamples): string {
  const params = new Set(pathParams(endpoint.path));
  const fields = requestFields(endpoint)
    .filter((field) => field.required)
    .filter((field) => !params.has(field.name))
    .map((field) => field.name);

  if (fields.length === 0) {
    return "{}";
  }

  const entries = fields.map((field) =>
    `      ${JSON.stringify(field)}: ${jsonValue(exampleValue(endpoint, examples.request, field))}`
  );
  return `{
${entries.join(",\n")},
    }`;
}

function pathToTemplate(path: string): string {
  return path.replaceAll(/\{([^}]+)\}/g, "${" + "params.$1" + "}");
}

function pathParams(path: string): string[] {
  return [...path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);
}

function isPathParameter(line: string): boolean {
  return line.includes("path parameter");
}

function exampleValue(
  endpoint: ApiEndpoint,
  examples: Record<string, unknown> | undefined,
  key: string,
): unknown {
  if (examples && key in examples) {
    return examples[key];
  }

  const inline = requestFields(endpoint).find((field) => field.name === key)?.example;

  return inline !== undefined ? inline : "TODO";
}

function jsonValue(value: unknown): string {
  return JSON.stringify(value);
}

function fieldName(line: string): string {
  return line.split(":")[0]?.trim() ?? "";
}

function requestFields(endpoint: ApiEndpoint): RequestField[] {
  return endpoint.request
    .filter((line) => !isPathParameter(line))
    .map((line) => ({
      name: fieldName(line),
      line,
      required: !line.includes("optional"),
      example: inlineExample(line),
    }))
    .filter((field) => field.name.length > 0);
}

function inlineExample(line: string): unknown {
  const match = line.match(/\bexample\s+(.+)$/);
  if (!match) {
    return undefined;
  }

  return parseExampleValue(match[1].trim());
}

function parseExampleValue(value: string): unknown {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("[") && value.endsWith("]")) ||
    (value.startsWith("{") && value.endsWith("}"))
  ) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }

  return value;
}
