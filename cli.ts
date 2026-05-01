import { type ApiExamples, generateDenoTests, parseApiMd } from "./mod.ts";

type CliOptions = {
  inputPath: string;
  outputPath: string;
  examplesPath?: string;
};

if (import.meta.main) {
  const options = parseArgs(Deno.args);
  const markdown = await Deno.readTextFile(options.inputPath);
  const endpoints = parseApiMd(markdown);

  if (endpoints.length === 0) {
    throw new Error(`No endpoints found in ${options.inputPath}`);
  }

  const examples = options.examplesPath ? await readExamples(options.examplesPath) : {};
  const output = generateDenoTests(endpoints, examples);
  const parentPath = dirname(options.outputPath);

  if (parentPath) {
    await Deno.mkdir(parentPath, { recursive: true });
  }

  await Deno.writeTextFile(options.outputPath, output);
  console.log(`Generated ${endpoints.length} tests in ${options.outputPath}`);
}

async function readExamples(path: string): Promise<ApiExamples> {
  const content = await Deno.readTextFile(path);
  const parsed = JSON.parse(content) as ApiExamples;

  return parsed;
}

function parseArgs(args: string[]): CliOptions {
  const [
    inputPath = "API.md",
    outputPath = "generated/api.test.ts",
    examplesPath,
  ] = args;

  return {
    inputPath,
    outputPath,
    examplesPath,
  };
}

function dirname(path: string): string {
  const normalized = path.replaceAll("\\", "/");
  const index = normalized.lastIndexOf("/");

  if (index === -1) {
    return "";
  }

  return normalized.slice(0, index);
}
