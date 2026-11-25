// Till Firmware Do Us Part — a robot's wedding vow.
// Writes one sentence (114 chars, no trailing newline) to $MAKEFUN_OUTPUT_DIR/entry.txt
// and verifies the output by reading it back and comparing its SHA-256 hash.
//
// Usage: MAKEFUN_OUTPUT_DIR=<dir> node main.ts
// Node.js standard library only. Fully deterministic: the same input always
// produces the same bytes.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The vow: one sentence, funny and heartfelt, spoken by a robot at its own
// wedding. 114 characters, one line, no trailing newline in the output file.
const VOW =
  "From this day forward, you are my home screen, my favourite notification, and the only app I will never uninstall.";

function sha256Hex(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function main() {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR;
  if (!outDir) {
    console.error("MAKEFUN_OUTPUT_DIR is not set");
    process.exit(1);
  }

  // Sanity checks on the vow itself, so a typo can never slip through silently.
  if (VOW.length === 0 || VOW.length > 200) {
    console.error(`vow must be 1-200 characters, got ${VOW.length}`);
    process.exit(1);
  }
  if (VOW.trim().length === 0) {
    console.error("vow must not be only whitespace");
    process.exit(1);
  }
  // The competition asks for exactly ONE sentence: a single terminal full
  // stop, and no other sentence-ending punctuation anywhere in the line.
  const terminators = (VOW.match(/[.!?]/g) ?? []).length;
  if (terminators !== 1 || !VOW.endsWith(".")) {
    console.error(`vow must be exactly one sentence, found ${terminators} terminator(s)`);
    process.exit(1);
  }
  if (VOW.includes("\n") || VOW.includes("\r")) {
    console.error("vow must fit on a single line");
    process.exit(1);
  }

  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, VOW, "utf8");

  // Read-back verification: the file must be byte-identical to the vow,
  // with no trailing newline added by the write step.
  const written = readFileSync(outPath, "utf8");
  const expectedHash = sha256Hex(VOW);
  const actualHash = sha256Hex(written);
  if (written !== VOW || actualHash !== expectedHash) {
    console.error("verification failed: output does not match the vow");
    process.exit(1);
  }
  if (written.endsWith("\n")) {
    console.error("verification failed: output must not end with a newline");
    process.exit(1);
  }

  console.log(`wrote ${outPath} (${VOW.length} chars, sha256 ${actualHash})`);
  console.log("verification OK: read-back matches the vow byte for byte");
}

main();
