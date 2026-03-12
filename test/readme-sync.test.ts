import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  buildManagedSections,
  checkReadme,
  runCli,
  syncReadme,
  syncReadmeContent,
} from "../scripts/readme-sync.mjs";

const tempDirectories = [];

function createFixtureRepo() {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "codelog-readme-sync-"));
  tempDirectories.push(repoRoot);

  const directories = [
    "app/home",
    "pages",
    "public/fonts",
    "src/pages/home",
    "src/widgets/header",
    "src/features/post-list/api",
    "src/entities/post/api",
    "src/shared/lib/supabase",
    "test",
  ];

  for (const directory of directories) {
    fs.mkdirSync(path.join(repoRoot, directory), { recursive: true });
  }

  const files = {
    "README.md": `# Demo

## Structure

<!-- readme-sync:structure:start -->
stale structure
<!-- readme-sync:structure:end -->

## Commands

<!-- readme-sync:commands:start -->
stale commands
<!-- readme-sync:commands:end -->
`,
    "package.json": JSON.stringify(
      {
        name: "fixture",
        private: true,
        scripts: {
          dev: "next dev",
          build: "next build",
          "check:readme": "node scripts/readme-sync.mjs check",
        },
      },
      null,
      2,
    ),
    "app/layout.tsx": "export default function RootLayout() { return null; }\n",
    "app/home/page.tsx": "export default function HomePage() { return null; }\n",
    "pages/README.md": "- guard\n",
    "src/pages/home/index.ts": "export const homePage = true;\n",
    "src/widgets/header/index.ts": "export const headerWidget = true;\n",
    "src/features/post-list/api/post-list.action.ts": "export async function getPostsAction() {}\n",
    "src/entities/post/api/post.service.ts": "export async function getPostsService() {}\n",
    "src/shared/lib/supabase/client.ts": "export const supabase = true;\n",
    "src/proxy.ts": "export function proxy() {}\n",
    "test/setup.ts": "export {};\n",
  };

  for (const [filePath, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(repoRoot, filePath), content);
  }

  return repoRoot;
}

afterEach(() => {
  while (tempDirectories.length > 0) {
    const directory = tempDirectories.pop();

    if (directory) {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  }
});

describe("readme sync", () => {
  it("detects stale managed blocks", () => {
    const repoRoot = createFixtureRepo();

    const result = checkReadme(repoRoot);

    expect(result.ok).toBe(false);
    expect(result.failures).toHaveLength(2);
    expect(result.failures.map((failure) => failure.section)).toEqual(["structure", "commands"]);
  });

  it("synchronizes managed blocks from the repository snapshot", () => {
    const repoRoot = createFixtureRepo();
    const changed = syncReadme(repoRoot);
    const readmeContent = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
    const sections = buildManagedSections(repoRoot);

    expect(changed.changed).toBe(true);
    expect(readmeContent).toContain(sections.structure);
    expect(readmeContent).toContain(sections.commands);
    expect(checkReadme(repoRoot).ok).toBe(true);
  });

  it("reports missing markers during sync", () => {
    const repoRoot = createFixtureRepo();
    const readmeWithoutMarkers = "# Demo\n";
    const sections = buildManagedSections(repoRoot);

    expect(() => syncReadmeContent(readmeWithoutMarkers, sections)).toThrow(
      'Missing managed block markers for "structure".',
    );
  });

  it("runs the CLI in both check and sync modes", () => {
    const repoRoot = createFixtureRepo();
    const output = [];
    const io = {
      log(message) {
        output.push(`log:${message}`);
      },
      error(message) {
        output.push(`error:${message}`);
      },
    };

    expect(runCli(["check"], io, repoRoot)).toBe(1);
    expect(runCli(["sync"], io, repoRoot)).toBe(0);
    expect(runCli(["check"], io, repoRoot)).toBe(0);

    expect(output).toContain("error:README sync check failed.");
    expect(output).toContain("log:README managed sections synchronized.");
    expect(output).toContain("log:README managed sections are in sync.");
  });
});
