import { cp, mkdir, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "../../..");
const sourceDirectory = resolve(repositoryRoot, "src/shopify/cms/schema");
const destinationDirectory = resolve(scriptDirectory, "../app/generated/cms-schema");

await mkdir(destinationDirectory, { recursive: true });
const sourceFiles = await readdir(sourceDirectory, { withFileTypes: true });
for (const entry of sourceFiles) {
  if (entry.isFile() && entry.name.endsWith(".ts")) {
    await cp(resolve(sourceDirectory, entry.name), resolve(destinationDirectory, entry.name));
  }
}
