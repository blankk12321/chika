const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "dist", "cloudflare-pages");
const nextOutDir = path.join(projectRoot, "out");

execFileSync(process.execPath, [path.join(projectRoot, "tools", "process-logo.js")], { stdio: "inherit" });

if (fs.existsSync(outputDir)) {
  const resolvedOutputDir = fs.realpathSync(outputDir);
  const relativeOutputDir = path.relative(projectRoot, resolvedOutputDir);
  if (relativeOutputDir.startsWith("..") || path.isAbsolute(relativeOutputDir)) {
    throw new Error(`Refusing to clean output outside project root: ${resolvedOutputDir}`);
  }
  fs.rmSync(outputDir, { recursive: true, force: true });
}

fs.mkdirSync(outputDir, { recursive: true });

if (fs.existsSync(nextOutDir)) {
  copyDir(nextOutDir, outputDir);
} else {
  for (const file of ["index.html", "script.js", "styles.css", "certifications-patents.html", "CHIKA-Standard-NDA.pdf"]) {
    const sourceFile = path.join(projectRoot, file);
    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, path.join(outputDir, file));
    }
  }
  for (const dir of [
    "precision-injection-molding",
    "injection-mold-tooling",
    "metal-plastic-manufacturing",
    "sheet-metal-fabrication",
    "equipment",
    "factory-strength",
    "quality-control",
    "request-a-quote",
    "products",
  ]) {
    const sourceDir = path.join(projectRoot, dir);
    if (fs.existsSync(sourceDir)) {
      copyDir(sourceDir, path.join(outputDir, dir));
    }
  }
  if (fs.existsSync(path.join(projectRoot, "assets", "images"))) {
    copyDir(path.join(projectRoot, "assets", "images"), path.join(outputDir, "assets", "images"));
  }
  if (fs.existsSync(path.join(projectRoot, "assets", "site"))) {
    copyDir(path.join(projectRoot, "assets", "site"), path.join(outputDir, "assets", "site"));
  }
}

fs.writeFileSync(
  path.join(outputDir, "_headers"),
  `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  X-Frame-Options: DENY

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: public, max-age=0, must-revalidate
`,
);

fs.writeFileSync(path.join(outputDir, "_redirects"), "/index.html  /  301\n");

console.log(`Cloudflare Pages static export created at ${outputDir}`);

function copyDir(source, destination) {
  fs.mkdirSync(destination, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDir(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}
