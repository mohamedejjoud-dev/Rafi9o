/**
 * E2E driver — basic assessment golden path (12 questions → review → submit).
 * Uses agent-browser CLI; clicks the first option of each question.
 */
import { execSync } from "node:child_process";

const run = (cmd) => execSync(cmd, { encoding: "utf8", timeout: 30000 }).trim();
const snap = () => run("agent-browser snapshot -i -c");
const refOf = (text, re) => {
  const m = text.match(re);
  if (!m) throw new Error(`ref not found for /${re}/ in:\n${text.slice(0, 500)}`);
  return m[1];
};

// 12 questions: click first selectable option, then Next / Review.
for (let q = 1; q <= 12; q++) {
  const s = snap();
  const heading = s.match(/heading "([^"]+)" \[level=1/)?.[1] ?? "?";
  const optionRef = refOf(s, /(?:radio|checkbox|switch)[^\n]*ref=(e\d+)/);
  run(`agent-browser click @${optionRef}`);
  let next = snap();
  const nextRef =
    next.match(/button "Voir le récapitulatif"[^\n]*ref=(e\d+)/) ??
    next.match(/button "(?:Question suivante|Suivant)"[^\n]*ref=(e\d+)/);
  if (!nextRef) throw new Error(`Next button missing on Q${q}:\n${next.slice(0, 600)}`);
  run(`agent-browser click @${nextRef[1]}`);
  console.log(`Q${q} done — "${heading}"`);
  run("sleep 0.5");
}

// Review page → confirm submission.
const review = snap();
console.log("REVIEW PAGE:\n" + review.split("\n").slice(0, 14).join("\n"));
const confirmRef = refOf(review, /button "([^"]*G[ée]n[ée]rer[^"]*|Confirmer[^"]*)"[^\n]*ref=(e\d+)/);
run(`agent-browser click @${confirmRef}`);
console.log("Submitted — waiting for result page…");
run("sleep 3");
console.log("URL:", run("agent-browser get url"));
