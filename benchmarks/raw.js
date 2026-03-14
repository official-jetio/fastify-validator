import { JetValidator } from "@jetio/validator";
import Ajv from "ajv";

const makeSchema = (i, propCount) => ({
  type: "object",
  properties: Object.fromEntries(
    Array.from({ length: propCount }, (_, j) => [
      `prop${i}_${j}`,
      { type: "string" },
    ]),
  ),
});

const ROUTES = 10;

function runJet(propCount) {
  const jet = new JetValidator({
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: true,
    cache: false
  });
  const label = `JetValidator (${propCount} props × ${ROUTES} routes)`;
  console.time(label);
  for (let i = 0; i < ROUTES; i++) {
    jet.compile(makeSchema(i, propCount));
  }
  console.timeEnd(label);
}

function runAjv(propCount, options = {}, label) {
  const ajv = new Ajv(options);
  console.time(label);
  for (let i = 0; i < ROUTES; i++) {
    ajv.compile(makeSchema(i, propCount));
  }
  console.timeEnd(label);
}

console.log("=== JetValidator vs AJV — Schema Compilation Benchmark ===");
console.log("No frameworks. No overhead. Raw compilation speed.\n");

for (const propCount of [5, 50, 500]) {
  console.log(`--- ${propCount} properties per schema ---`);
  runJet(propCount);
  runAjv(propCount, { removeAdditional: true, useDefaults: true, coerceTypes: true }, `AJV with options    (${propCount} props × ${ROUTES} routes)`);
  runAjv(propCount, {}, `AJV without options (${propCount} props × ${ROUTES} routes)`);
  console.log();
}

console.log("=== Done ===");