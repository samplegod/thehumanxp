import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import ts from "typescript";

async function importTypeScriptModule(file) {
  const source = await readFile(resolve(file), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: file,
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

const [{ quoteSearchIndex }, { searchQuotes }] = await Promise.all([
  importTypeScriptModule("lib/quote-search-index.generated.ts"),
  importTypeScriptModule("lib/quote-search.ts"),
]);

const cases = [
  {
    query: "Mark Gober",
    expectedMinimum: 5,
    expectedFirstSpeaker: "Mark Gober",
  },
  {
    query: "woolla",
    expectedMinimum: 5,
    expectedFirstSpeaker: "Dr. Marjorie Woollacott",
  },
  {
    query: "Episode 160",
    expectedMinimum: 5,
    expectedFirstEpisode: 160,
  },
  {
    query: "plant medicine",
    expectedMinimum: 5,
    expectedFirstEpisode: 160,
  },
  {
    query: "reality—who are we",
    expectedMinimum: 1,
    expectedFirstSpeaker: "Mark Gober",
  },
];

for (const testCase of cases) {
  const results = searchQuotes(quoteSearchIndex, testCase.query);
  assert.ok(
    results.length >= testCase.expectedMinimum,
    `${testCase.query}: expected at least ${testCase.expectedMinimum} results`,
  );
  if (testCase.expectedFirstSpeaker) {
    assert.equal(
      results[0]?.speaker,
      testCase.expectedFirstSpeaker,
      `${testCase.query}: unexpected top-ranked speaker`,
    );
  }
  if (testCase.expectedFirstEpisode) {
    assert.equal(
      results[0]?.episodeNumber,
      testCase.expectedFirstEpisode,
      `${testCase.query}: unexpected top-ranked episode`,
    );
  }
}

assert.equal(searchQuotes(quoteSearchIndex, "not-a-real-hxp-phrase").length, 0);
assert.deepEqual(searchQuotes(quoteSearchIndex, ""), quoteSearchIndex);

const benchmarkQueries = [
  "consciousness",
  "Mark Gober",
  "Episode 160",
  "plant medicine",
  "reality who are we",
];
const iterations = 2_000;
const startedAt = performance.now();
for (let index = 0; index < iterations; index += 1) {
  searchQuotes(quoteSearchIndex, benchmarkQueries[index % benchmarkQueries.length]);
}
const elapsedMs = performance.now() - startedAt;

console.log(`Passed ${cases.length + 2} quote-search checks.`);
console.log(
  `${iterations.toLocaleString()} ranked searches completed in ${elapsedMs.toFixed(2)}ms ` +
    `(${(elapsedMs / iterations).toFixed(4)}ms average).`,
);
