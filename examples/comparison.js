import Fastify from "fastify";
import { createJetValidatorController } from "../dist/index.esm.js";
import Ajv from "ajv";

const ROUTES = 100;

const makeComplexSchema = (i) => ({
  $id: `schema-${i}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  type: "object",
  properties: {
    role: { type: "string", enum: ["admin", "user", "moderator"] },
    age: { type: "integer", minimum: 0, maximum: 120 },
    username: { type: "string", pattern: "^[a-zA-Z0-9_-]+$", minLength: 3, maxLength: 50 },
    score: { type: "number", minimum: 0, multipleOf: 0.01 },
    metadata: {
      type: "object",
      properties: {
        tags: { type: "array", items: { type: "string", minLength: 1 }, maxItems: 10 },
        config: { type: "object", additionalProperties: { type: "string" } },
      },
      additionalProperties: false,
    },
  },
  required: ["role"],
  additionalProperties: false,
  allOf: [
    {
      if: { properties: { role: { type: "string", const: "admin" } }, required: ["role"] },
      then: { required: ["username"], properties: { username: { type: "string", minLength: 5 } } },
      else: { properties: { score: { type: "number", minimum: 10 } } },
    },
  ],
  oneOf: [
    { properties: { role: { type: "string", const: "admin" } }, required: ["role"], not: { required: ["score"] } },
    { properties: { role: { type: "string", enum: ["user", "moderator"] } }, required: ["role", "score"] },
  ],
  anyOf: [
    { required: ["username"] },
    { required: ["metadata"] },
  ],
  not: {
    type: "object",
    properties: { role: { type: "string", const: "banned" } },
    required: ["role"],
  },
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

const OPTIONS = { removeAdditional: true, useDefaults: true, coerceTypes: true, strict: false };

const fastifyJet = Fastify({
  schemaController: createJetValidatorController(OPTIONS),
});
for (let i = 0; i < ROUTES; i++) {
  fastifyJet.post(`/jet${i}`, { schema: { body: makeComplexSchema(i) } }, async () => ({ success: true }));
}

const fastifyDefault = Fastify();
for (let i = 0; i < ROUTES; i++) {
  fastifyDefault.post(`/default${i}`, { schema: { body: makeComplexSchema(i) } }, async () => ({ success: true }));
}

const fastifyAjvBare = Fastify({
  schemaController: createAjvSchemaController(),
});
for (let i = 0; i < ROUTES; i++) {
  fastifyAjvBare.post(`/bare${i}`, { schema: { body: makeComplexSchema(i) } }, async () => ({ success: true }));
}

console.log("=== Fastify Startup Benchmark (Complex Schemas) ===");
console.log(`Routes: ${ROUTES} per instance | allOf, oneOf, anyOf, not, conditionals\n`);

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