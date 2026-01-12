import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const ignoreDirs = new Set([
  "node_modules",
  ".git",
  "uploads",
  "logs",
  "coverage",
  "dist",
  ".next"
]);

const files = [];
const scriptExtensions = new Set([".js", ".cjs", ".mjs"]);

const walk = (dir) => {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (ignoreDirs.has(entry.name)) {
        continue;
      }
      walk(join(dir, entry.name));
      continue;
    }

    if (entry.isFile()) {
      const extension = entry.name.slice(entry.name.lastIndexOf("."));
      if (!scriptExtensions.has(extension)) {
        continue;
      }
      files.push(join(dir, entry.name));
    }
  }
};

const loadPackageScripts = () => {
  const packagePath = join(rootDir, "package.json");
  if (!existsSync(packagePath)) {
    return {};
  }

  try {
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
    return packageJson?.scripts || {};
  } catch {
    return {};
  }
};

const isPlaceholderTest = (scriptValue) =>
  typeof scriptValue === "string" &&
  scriptValue.includes("no test specified");

const runNpmScript = (name, scriptValue, options = {}) => {
  if (!scriptValue) {
    console.log(`Skipping ${name}: script not found.`);
    return;
  }

  if (name === "test" && isPlaceholderTest(scriptValue)) {
    if (process.env.RUN_PLACEHOLDER_TESTS === "true") {
      console.log("Running placeholder test script (forced).");
    } else {
      console.log("Skipping test: placeholder script detected.");
      return;
    }
  }

  if (options.onlyWhenEnv && process.env[options.onlyWhenEnv] !== "true") {
    console.log(`Skipping ${name}: set ${options.onlyWhenEnv}=true to run.`);
    return;
  }

  const result = spawnSync(npmCommand, ["run", name], { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

walk(rootDir);
files.sort();

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    stdio: "pipe"
  });
  if (result.status !== 0) {
    const relPath = relative(rootDir, file) || file;
    process.stderr.write(`Syntax check failed: ${relPath}\n`);
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }
    if (result.stdout) {
      process.stderr.write(result.stdout);
    }
    process.exit(result.status ?? 1);
  }
}

const scripts = loadPackageScripts();
runNpmScript("lint", scripts.lint, { onlyWhenEnv: "RUN_LINT" });
runNpmScript("test", scripts.test, { onlyWhenEnv: "RUN_TESTS" });

console.log(
  `Build OK: ${files.length} file${files.length === 1 ? "" : "s"} checked.`
);
