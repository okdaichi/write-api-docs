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
  auth: "Required" | "None";
  query: string[];
  headers: string[];
  body?: string;
  response: string[];
};

export type ApiExamples = {
  params?: Record<string, unknown>;
  auth?: { token?: string };
};

type EndpointListField = "query" | "headers" | "response";

const endpointHeading = /^###\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(\S+)\s*$/;
const fieldHeading = /^(Description|Query|Headers|Body|Response|Auth):\s*(.*)$/;

/**
 * Parses API.md content into an array of ApiEndpoint objects.
 */
export function parseApiMd(markdown: string): ApiEndpoint[] {
  const endpoints: ApiEndpoint[] = [];
  let current: ApiEndpoint | undefined;
  let currentField: EndpointListField | "body" | undefined;
  let inJsonBlock = false;
  let globalAuth: "Required" | "None" = "Required";

  // Quick pass for global fields
  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.match(endpointHeading)) break;
    const match = line.match(/^Auth:\s*(Required|None)$/);
    if (match) {
      globalAuth = match[1] as "Required" | "None";
    }
  }

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    const headingMatch = line.match(endpointHeading);

    if (headingMatch) {
      current = {
        method: headingMatch[1] as HttpMethod,
        path: headingMatch[2],
        auth: globalAuth,
        query: [],
        headers: [],
        response: [],
      };
      endpoints.push(current);
      currentField = undefined;
      inJsonBlock = false;
      continue;
    }

    if (!current || line.length === 0) {
      continue;
    }

    if (inJsonBlock) {
      if (line.startsWith("```")) {
        inJsonBlock = false;
        currentField = undefined;
      } else if (currentField === "body") {
        current.body = (current.body || "") + rawLine + "\n";
      }
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

      if (fieldName === "Auth") {
        if (fieldValue === "Required" || fieldValue === "None") {
          current.auth = fieldValue;
        }
        currentField = undefined;
        continue;
      }

      if (fieldName === "Body") {
        currentField = "body";
        continue;
      }

      currentField = fieldName.toLowerCase() as EndpointListField;

      if (fieldValue) {
        current[currentField].push(fieldValue);
      }

      continue;
    }

    if (currentField === "body" && line.startsWith("```json")) {
      inJsonBlock = true;
      continue;
    }

    if (currentField && currentField !== "body" && line.startsWith("- ")) {
      current[currentField].push(line.slice(2).trim());
    }
  }

  return endpoints;
}

/**
 * Converts an array of ApiEndpoint objects back into the API.md Markdown format.
 */
export function stringifyApiMd(
  endpoints: ApiEndpoint[],
  globalAuth: "Required" | "None" = "Required",
): string {
  const lines: string[] = ["# API", ""];

  if (globalAuth !== "Required") {
    lines.push(`Auth: ${globalAuth}`, "");
  }

  lines.push("## Endpoints", "");

  for (const endpoint of endpoints) {
    lines.push(`### ${endpoint.method} ${endpoint.path}`, "");

    if (endpoint.description) {
      lines.push(`Description: ${endpoint.description}`, "");
    }

    if (endpoint.auth !== globalAuth) {
      lines.push(`Auth: ${endpoint.auth}`, "");
    }

    if (endpoint.query.length > 0) {
      lines.push("Query:");
      for (const q of endpoint.query) {
        lines.push(`- ${q}`);
      }
      lines.push("");
    }

    if (endpoint.headers.length > 0) {
      lines.push("Headers:");
      for (const h of endpoint.headers) {
        lines.push(`- ${h}`);
      }
      lines.push("");
    }

    if (endpoint.body) {
      lines.push("Body:");
      lines.push("```json");
      lines.push(endpoint.body.trim());
      lines.push("```");
      lines.push("");
    }

    if (endpoint.response.length > 0) {
      lines.push("Response:");
      for (const r of endpoint.response) {
        lines.push(`- ${r}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

/**
 * Generates Deno test code from an array of ApiEndpoint objects.
 */
export function generateDenoTests(
  endpoints: ApiEndpoint[],
  examples: ApiExamples = {},
): string {
  const tests = endpoints.map((endpoint) => {
    const status = expectedStatus(endpoint);
    const name = endpoint.description ?? `${endpoint.method} ${endpoint.path}`;
    const urlPath = pathToTemplate(endpoint.path);
    const init = requestInit(endpoint);
    const params = pathParams(endpoint.path);
    const query = endpoint.query.map((q) => q.split(":")[0].trim());

    const paramsBlock = (params.length === 0 && query.length === 0) ? "" : `  const params = {
${
      [...params, ...query].map((param) =>
        `    ${JSON.stringify(param)}: ${jsonValue(exampleValue(examples.params, param))}`
      ).join(",\n")
    },
  };

`;

    const queryString = query.length === 0 ? "" : "?" + query.map((q) => {
      const access = q.includes("-") ? `["${q}"]` : `.${q}`;
      return `${q}=\${params${access}}`;
    }).join("&");

    return `Deno.test(${JSON.stringify(name)}, async () => {
${paramsBlock}\
  const response = await fetch(\`\${baseUrl}\${basePath}${urlPath}${queryString}\`${init});
  assertEquals(response.status, ${status});
});`;
  });

  return `const baseUrl = Deno.env.get("API_BASE_URL") ?? "http://localhost:3000";
const basePath = Deno.env.get("API_BASE_PATH") ?? "";
const token = Deno.env.get("TOKEN") ?? "";

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

function requestInit(endpoint: ApiEndpoint): string {
  const headers: Record<string, string> = {};

  if (endpoint.auth === "Required") {
    headers["Authorization"] = "Bearer ${token}";
  }

  for (const h of endpoint.headers) {
    const name = h.split(":")[0].trim();
    const access = name.includes("-") ? `["${name}"]` : `.${name}`;
    headers[name] = `\${params${access} ?? "TODO"}`;
  }

  if (endpoint.body) {
    headers["Content-Type"] = "application/json";
  }

  const hasHeaders = Object.keys(headers).length > 0;
  const hasBody = !!endpoint.body;
  const isNotGet = endpoint.method !== "GET";

  if (!hasHeaders && !hasBody && !isNotGet) {
    return "";
  }

  const parts = [];
  if (isNotGet) {
    parts.push(`method: ${JSON.stringify(endpoint.method)}`);
  }
  if (hasHeaders) {
    const headerLines = Object.entries(headers).map(([k, v]) =>
      `      ${JSON.stringify(k)}: \`${v}\``
    );
    parts.push(`headers: {
${headerLines.join(",\n")}
    }`);
  }
  if (hasBody && endpoint.body) {
    parts.push(`body: JSON.stringify(${endpoint.body.trim()})`);
  }

  return `, {
    ${parts.join(",\n    ")}
  }`;
}

function pathToTemplate(path: string): string {
  return path.replaceAll(/\{([^}]+)\}/g, "${" + "params.$1" + "}");
}

function pathParams(path: string): string[] {
  return [...path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);
}

function exampleValue(
  examples: Record<string, unknown> | undefined,
  key: string,
): unknown {
  if (examples && key in examples) {
    return examples[key];
  }

  return "TODO";
}

function jsonValue(value: unknown): string {
  return JSON.stringify(value);
}
