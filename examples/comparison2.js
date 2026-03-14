import Fastify from "fastify";
import { createJetValidatorController } from "../dist/index.esm.js";
import Ajv from "ajv";

const ROUTES = 100;

const makeWideSchema = (i) => ({
  $id: `schema-${i}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  type: "object",
  properties: Object.fromEntries(
    Array.from({ length: 500 }, (_, j) => [
      `prop${i}_${j}`,
      j % 5 === 0
        ? { type: "string", minLength: 5, maxLength: 100 }
        : j % 5 === 1
        ? { type: "number", minimum: 0, maximum: 1000, multipleOf: 0.01 }
        : j % 5 === 2
        ? { type: "array", items: { type: "string", minLength: 1 }, minItems: 1, maxItems: 10 }
        : j % 5 === 3
        ? {
            type: "object",
            properties: {
              id: { type: "string" },
              value: { type: "number", minimum: 0 },
              label: { type: "string", minLength: 1 },
            },
            required: ["id", "value"],
            additionalProperties: false,
          }
        : { type: "string", pattern: "^[a-zA-Z0-9_-]+$", minLength: 3, maxLength: 50 },
    ]),
  ),
  required: Array.from({ length: 20 }, (_, j) => `prop${i}_${j}`),
  additionalProperties: false,
});

function createAjvSchemaController(options = {}) {
  return {
    compilersFactory: {
      buildValidator: (externalSchemas) => {
        const ajv = new Ajv(options);
        for (const [id, schema] of Object.entries(externalSchemas)) {
          ajv.addSchema(schema, id);
        }
        return ({ schema, httpPart }) => {
          const validate = ajv.compile(schema);
          return (data) => {
            const valid = validate(data);
            if (valid) return { value: data };
            const err = new Error("Validation failed");
            err.validation = validate.errors;
            err.validationContext = httpPart;
            return { error: err };
          };
        };
      },
    },
  };
}

const OPTIONS = { removeAdditional: true, useDefaults: true, coerceTypes: true };

const fastifyJet = Fastify({
  schemaController: createJetValidatorController(OPTIONS),
});
for (let i = 0; i < ROUTES; i++) {
  fastifyJet.post(`/jet${i}`, { schema: { body: makeWideSchema(i) } }, async () => ({ success: true }));
}

const fastifyDefault = Fastify();
for (let i = 0; i < ROUTES; i++) {
  fastifyDefault.post(`/default${i}`, { schema: { body: makeWideSchema(i) } }, async () => ({ success: true }));
}

const fastifyAjvBare = Fastify({
  schemaController: createAjvSchemaController(),
});
for (let i = 0; i < ROUTES; i++) {
  fastifyAjvBare.post(`/bare${i}`, { schema: { body: makeWideSchema(i) } }, async () => ({ success: true }));
}

console.log("=== Fastify Startup Benchmark (Wide Schemas) ===");
console.log(`Routes: ${ROUTES} per instance | 500 properties per schema\n`);

console.log("Testing JetValidator (removeAdditional + useDefaults + coerceTypes)...");
console.time("JetValidator");
await fastifyJet.ready();
console.timeEnd("JetValidator");

console.log("\nTesting Fastify default AJV...");
console.time("Fastify default AJV");
await fastifyDefault.ready();
console.timeEnd("Fastify default AJV");

console.log("\nTesting AJV without options...");
console.time("AJV without options");
await fastifyAjvBare.ready();
console.timeEnd("AJV without options");

await fastifyJet.close();
await fastifyDefault.close();
await fastifyAjvBare.close();

console.log("\n=== Done ===");