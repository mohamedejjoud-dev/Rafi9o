/**
 * E2E driver — advanced assessment golden path (10 questions → review → submit).
 * Reuses the same click-first-option strategy as e2e-basic.mjs.
 */
import { execSync } from "node:child_process";

const run = (cmd) => execSync(cmd, { encoding: "utf8", timeout: 30000 }).trim();
const snap = () => run("agent-browser snapshot -i -c");

// Intro → start.
run("agent-browser click @$(agent-browser snapshot -i -c | rg -o 'button \"Commencer\" \\[ref=(e\\d+)' -or '$1' | head -1)");

for (let q = 1; q <= 10; q++) {
  const s = snap();
  const heading = s.match(/heading "([^"]+)" \[level=1/)?.[1] ?? "?";
  const opt = s.match(/(?:radio|checkbox|switch)[^\n]*ref=(e\d+)/);
  if (!opt) throw new Error(`No option on Q${q}:\n${s.slice(0, 500)}`);
  run(`agent-browser click @${opt[1]}`);
  const next = snap();
  const nxt =
    next.match(/button "Voir le récapitulatif"[^\n]*ref=(e\d+)/) ??
    next.match(/button "(?:Question suivante|Suivant)"[^\n]*ref=(e\d+)/);
  if (!nxt) throw new Error(`Next missing on Q${q}:\n${next.slice(0, 500)}`);
  run(`agent-browser click @${nxt[1]}`);
  console.log(`Q${q} done — "${heading}"`);
  run("sleep 0.5");
}

const review = snap();
const ref = review.match(/button "Confirmer[^"]*" \[ref=(e\d+)/) ?? review.match(/button "[^"]*G[ée]n[ée]rer[^"]*" \[ref=(e\d+)/);
if (!ref) throw new Error(`Confirm missing:\n${review.slice(-800)}`);
run(`agent-browser click @${ref[1]}`);
console.log("Submitted — waiting for premium result…");
run("sleep 4");
console.log("URL:", run("agent-browser get url"));
