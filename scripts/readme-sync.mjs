import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_REPO_ROOT = path.resolve(__dirname, "..");

const SECTION_NAMES = ["structure", "architecture", "commands"];

const SECTION_MARKERS = {
  structure: {
    start: "<!-- readme-sync:structure:start -->",
    end: "<!-- readme-sync:structure:end -->",
  },
  architecture: {
    start: "<!-- readme-sync:architecture:start -->",
    end: "<!-- readme-sync:architecture:end -->",
  },
  commands: {
    start: "<!-- readme-sync:commands:start -->",
    end: "<!-- readme-sync:commands:end -->",
  },
};

const ROOT_STRUCTURE_ENTRIES = [
  {
    relativePath: "app",
    label: "app/",
    description: "App Router route entries, layout, and metadata",
  },
  {
    relativePath: "pages",
    label: "pages/",
    description: "Guard directory so Next.js does not treat src/pages as Pages Router",
  },
  {
    relativePath: "public",
    label: "public/",
    description: "Static assets served as-is",
  },
  {
    relativePath: "src",
    label: "src/",
    description: "Application layers and shared code",
    children: [
      {
        relativePath: "src/pages",
        label: "pages/",
        description: "Page-level compositions in the FSD Pages layer",
      },
      {
        relativePath: "src/widgets",
        label: "widgets/",
        description: "Composite UI sections",
      },
      {
        relativePath: "src/features",
        label: "features/",
        description: "User-facing flows and interactions",
      },
      {
        relativePath: "src/entities",
        label: "entities/",
        description: "Domain models and API layers",
      },
      {
        relativePath: "src/shared",
        label: "shared/",
        description: "Shared UI, libraries, styles, and types",
      },
      {
        relativePath: "src/proxy.ts",
        label: "proxy.ts",
        description: "Request proxy entrypoint",
      },
    ],
  },
  {
    relativePath: "test",
    label: "test/",
    description: "Vitest setup and Node-oriented tests",
  },
  {
    relativePath: "package.json",
    label: "package.json",
    description: "NPM scripts and dependency manifest",
  },
];

function normalizeLineEndings(content) {
  return content.replace(/\r\n/g, "\n");
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function pathExists(repoRoot, relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function listFilesRecursive(repoRoot, startPath) {
  const rootPath = path.join(repoRoot, startPath);

  if (!fs.existsSync(rootPath)) {
    return [];
  }

  /** @type {string[]} */
  const files = [];

  function walk(currentPath) {
    const directoryEntries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of directoryEntries) {
      const absolutePath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        walk(absolutePath);
        continue;
      }

      files.push(normalizePath(path.relative(repoRoot, absolutePath)));
    }
  }

  walk(rootPath);

  return files.sort();
}

function createStructureEntries(repoRoot, entries) {
  return entries
    .filter((entry) => pathExists(repoRoot, entry.relativePath))
    .map((entry) => ({
      label: entry.label,
      description: entry.description,
      children: entry.children ? createStructureEntries(repoRoot, entry.children) : [],
    }));
}

function renderTree(entries, prefix = "") {
  return entries.flatMap((entry, index) => {
    const isLast = index === entries.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const paddedLabel = entry.label.padEnd(18, " ");
    const lines = [`${prefix}${connector}${paddedLabel} # ${entry.description}`];

    if (entry.children.length > 0) {
      const childPrefix = `${prefix}${isLast ? "    " : "│   "}`;
      lines.push(...renderTree(entry.children, childPrefix));
    }

    return lines;
  });
}

function formatStructureBlock(repoRoot) {
  const entries = createStructureEntries(repoRoot, ROOT_STRUCTURE_ENTRIES);

  return ["```text", "codelog/", ...renderTree(entries), "```"].join("\n");
}

function formatArchitectureBlock(snapshot) {
  const lines = [];

  if (snapshot.appPageCount > 0 && snapshot.hasAppLayout) {
    lines.push("- `app/` 아래 `page.tsx`와 `layout.tsx`를 기준으로 App Router 라우팅과 공통 레이아웃을 구성합니다.");
  }

  if (snapshot.hasFsdLayers) {
    lines.push("- UI와 도메인 코드는 `src/pages`, `src/widgets`, `src/features`, `src/entities`, `src/shared` 계층으로 분리합니다.");
  }

  if (snapshot.actionFileCount > 0 && snapshot.serviceFileCount > 0) {
    lines.push("- 서버 변경과 도메인 로직은 `src/**/api/*.action.ts`와 `src/**/api/*.service.ts` 패턴으로 분리합니다.");
  }

  if (snapshot.hasSupabaseLib) {
    lines.push("- Supabase 인증 및 클라이언트 유틸리티는 `src/shared/lib/supabase/` 아래에서 공통 관리합니다.");
  }

  if (snapshot.hasProxyEntry) {
    lines.push("- 요청 프록시 진입점은 `src/proxy.ts`에 두고 있습니다.");
  }

  if (snapshot.hasPagesRouterGuard) {
    lines.push("- 루트 `pages/README.md`를 유지해 Next.js가 `src/pages`를 Pages Router로 오인하지 않도록 방지합니다.");
  }

  return lines.join("\n");
}

function escapeTableCell(value) {
  return value.replace(/\|/g, "\\|");
}

function formatCommandsBlock(scripts) {
  const scriptEntries = Object.entries(scripts);

  const rows = [
    "| 스크립트 | 실제 명령 |",
    "| --- | --- |",
    ...scriptEntries.map(([name, command]) => {
      return `| \`npm run ${escapeTableCell(name)}\` | \`${escapeTableCell(command)}\` |`;
    }),
  ];

  return rows.join("\n");
}

export function collectRepoSnapshot(repoRoot) {
  const packageJsonPath = path.join(repoRoot, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const appFiles = listFilesRecursive(repoRoot, "app");
  const srcFiles = listFilesRecursive(repoRoot, "src");

  return {
    scripts: packageJson.scripts ?? {},
    appPageCount: appFiles.filter((filePath) => filePath.endsWith("/page.tsx") || filePath === "app/page.tsx").length,
    hasAppLayout: appFiles.includes("app/layout.tsx"),
    hasFsdLayers: ["src/pages", "src/widgets", "src/features", "src/entities", "src/shared"].every((entry) =>
      pathExists(repoRoot, entry),
    ),
    actionFileCount: srcFiles.filter((filePath) => /\/api\/[^/]+\.action\.ts$/.test(filePath)).length,
    serviceFileCount: srcFiles.filter((filePath) => /\/api\/[^/]+\.service\.ts$/.test(filePath)).length,
    hasSupabaseLib: srcFiles.some((filePath) => filePath.startsWith("src/shared/lib/supabase/")),
    hasProxyEntry: pathExists(repoRoot, "src/proxy.ts"),
    hasPagesRouterGuard: pathExists(repoRoot, "pages/README.md"),
  };
}

export function buildManagedSections(repoRoot) {
  const snapshot = collectRepoSnapshot(repoRoot);

  return {
    structure: formatStructureBlock(repoRoot),
    architecture: formatArchitectureBlock(snapshot),
    commands: formatCommandsBlock(snapshot.scripts),
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getManagedSectionContent(readmeContent, sectionName) {
  const markers = SECTION_MARKERS[sectionName];

  const sectionPattern = new RegExp(
    `${escapeRegExp(markers.start)}\\n?([\\s\\S]*?)\\n?${escapeRegExp(markers.end)}`,
    "m",
  );

  const match = normalizeLineEndings(readmeContent).match(sectionPattern);

  if (!match) {
    return {
      error: `Missing managed block markers for "${sectionName}".`,
    };
  }

  return {
    content: match[1].trim(),
  };
}

function findFirstDifferentLine(actual, expected) {
  const actualLines = normalizeLineEndings(actual).split("\n");
  const expectedLines = normalizeLineEndings(expected).split("\n");
  const maxLength = Math.max(actualLines.length, expectedLines.length);

  for (let index = 0; index < maxLength; index += 1) {
    if (actualLines[index] !== expectedLines[index]) {
      return {
        line: index + 1,
        actual: actualLines[index] ?? "<missing>",
        expected: expectedLines[index] ?? "<missing>",
      };
    }
  }

  return null;
}

export function checkReadmeContent(readmeContent, sections) {
  return SECTION_NAMES.flatMap((sectionName) => {
    const section = getManagedSectionContent(readmeContent, sectionName);

    if ("error" in section) {
      return [{ section: sectionName, message: section.error }];
    }

    const actual = section.content.trim();
    const expected = sections[sectionName].trim();

    if (actual === expected) {
      return [];
    }

    const difference = findFirstDifferentLine(actual, expected);

    return [
      {
        section: sectionName,
        message: `Block content differs from the generated snapshot at line ${difference?.line ?? 1}.`,
        difference,
      },
    ];
  });
}

export function syncReadmeContent(readmeContent, sections) {
  let updatedContent = normalizeLineEndings(readmeContent);

  for (const sectionName of SECTION_NAMES) {
    const markers = SECTION_MARKERS[sectionName];
    const pattern = new RegExp(`${escapeRegExp(markers.start)}[\\s\\S]*?${escapeRegExp(markers.end)}`, "m");

    if (!pattern.test(updatedContent)) {
      throw new Error(`Missing managed block markers for "${sectionName}".`);
    }

    updatedContent = updatedContent.replace(
      pattern,
      `${markers.start}\n${sections[sectionName]}\n${markers.end}`,
    );
  }

  return updatedContent;
}

export function checkReadme(repoRoot) {
  const readmePath = path.join(repoRoot, "README.md");
  const readmeContent = fs.readFileSync(readmePath, "utf8");
  const sections = buildManagedSections(repoRoot);
  const failures = checkReadmeContent(readmeContent, sections);

  return {
    ok: failures.length === 0,
    failures,
  };
}

export function syncReadme(repoRoot) {
  const readmePath = path.join(repoRoot, "README.md");
  const readmeContent = fs.readFileSync(readmePath, "utf8");
  const sections = buildManagedSections(repoRoot);
  const syncedContent = syncReadmeContent(readmeContent, sections);
  const normalizedOriginal = normalizeLineEndings(readmeContent);

  if (normalizedOriginal !== syncedContent) {
    fs.writeFileSync(readmePath, syncedContent);
  }

  return {
    changed: normalizedOriginal !== syncedContent,
  };
}

function printFailure(io, failure) {
  io.error(`- ${failure.section}: ${failure.message}`);

  if (failure.difference) {
    io.error(`  expected: ${failure.difference.expected}`);
    io.error(`  actual:   ${failure.difference.actual}`);
  }
}

export function runCli(args = process.argv.slice(2), io = console, repoRoot = DEFAULT_REPO_ROOT) {
  const mode = args[0] ?? "check";

  if (mode === "sync") {
    const result = syncReadme(repoRoot);

    io.log(
      result.changed ? "README managed sections synchronized." : "README managed sections already up to date.",
    );

    return 0;
  }

  if (mode === "check") {
    const result = checkReadme(repoRoot);

    if (result.ok) {
      io.log("README managed sections are in sync.");
      return 0;
    }

    io.error("README sync check failed.");
    result.failures.forEach((failure) => printFailure(io, failure));
    io.error("Run `npm run sync:readme` to update the managed sections.");

    return 1;
  }

  io.error("Usage: node scripts/readme-sync.mjs <check|sync>");
  return 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  try {
    process.exitCode = runCli();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
