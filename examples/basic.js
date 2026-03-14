import Fastify from "fastify";
import {
  createJetValidatorCompiler,
  createJetValidatorController,
} from "../dist/index.esm.js";

const fastify = Fastify({
  schemaController: createJetValidatorController({
    useDefaults: true,
    strict: false,
  }),
});

// Alternative usage - both approaches are equivalent, this gives more flexibility
// const fastify = Fastify({
//   schemaController: {
//     compilersFactory: {
//       buildValidator: createJetValidatorCompiler({
//         useDefaults: true,
//         strict: false,
//       }),
//     },
//   },
// });

// Define a route with schema validation
fastify.post(
  "/user",
  {
    schema: {
      body: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 2 },
          email: { type: "string", format: "email" },
          age: { type: "number", minimum: 0, maximum: 120 },
        },
        required: ["name", "email"],
      },
    },
  },
  async (request, reply) => {
    // request.body is validated
    return {
      success: true,
      user: request.body,
    };
  },
);


fastify.setErrorHandler((error, request, reply) => {
  if (error.validation) {
    reply.status(400).send({ errors: error.validation });
  }
});

// Start the server
fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("Server running on http://localhost:3000");
  console.log("Try: POST http://localhost:3000/user");
  console.log("Valid Body:");
  console.log(
    'Body: { "name": "Alice", "email": "alice@example.com", "age": 25 }',
  );
  console.log("Invalid: Body:");
  console.log(
    'Body: { "name": "Alice", "email": "alice@example.com", "age": -3 }',
  );
});
