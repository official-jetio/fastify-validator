# @jetio/fastify-validator

**JetValidator integration for Fastify - 19x faster schema compilation**

Drop-in replacement for Fastify's default AJV validator with significantly faster compilation and additional features.

## Why?

Fastify uses AJV by default for schema validation. While AJV is excellent, schema compilation can be slow in serverless environments where every millisecond counts.

**Compilation speed matters for:**
- ✅ Serverless cold starts (Lambda, Cloud Functions)
- ✅ Applications with many routes
- ✅ Dynamic schema generation
- ✅ Fast server restarts

## Performance

**Compilation speed:**
- AJV: ~28ms per schema
- JetValidator: ~1.4ms per schema
- **19x faster on average**

[See benchmarks](https://github.com/official-jetio/validator/blob/main/benchmarks/results/COMPARISON.md)

**For 20 routes:**
- AJV: ~560ms compilation time
- JetValidator: ~28ms compilation time
- **532ms faster cold start**

## Installation
```bash
npm install @jetio/fastify-validator
```

## Usage
### Using `createJetValidatorController`
```typescript
import Fastify from 'fastify';
import { createJetValidatorController } from '@jetio/fastify-validator';

const fastify = Fastify({
  schemaController: createJetValidatorController({})
});


// Define routes with schemas as usual
fastify.post('/user', {
  schema: {
    body: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 2 },
        email: { type: 'string', format: 'email' },
        age: { type: 'number', minimum: 0 }
      },
      required: ['name', 'email']
    }
  }
}, async (request, reply) => {
  return { success: true, user: request.body };
});

fastify.listen({ port: 3000 });
```

### Using `createJetValidatorCompiler`

```typescript
import Fastify from 'fastify';
import { createJetValidatorCompiler } from '@jetio/fastify-validator';

const fastify = Fastify({
  schemaController: {
    compilersFactory: {
      buildValidator: createJetValidatorCompiler({}),
    },
  }
});


// Define routes with schemas as usual
fastify.post('/user', {
  schema: {
    body: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 2 },
        email: { type: 'string', format: 'email' },
        age: { type: 'number', minimum: 0 }
      },
      required: ['name', 'email']
    }
  }
}, async (request, reply) => {
  return { success: true, user: request.body };
});

fastify.listen({ port: 3000 });
```

This is for those who wants just the buildValidator and not the entire schema controller.


## Options
All [JetValidator options](https://github.com/official-jetio/validator#configuration-options) are supported for both `createJetValidatorController` and `createJetValidatorCompiler`:
```typescript
createJetValidatorController({
  allErrors: true,        // Collect all errors
  removeAdditional: true, // Remove extra properties
  coerceTypes: true,      // Auto-convert types
  useDefaults: true,      // Apply default values
  validateFormats: true,  // Enable format validation
  $data: true,            // Enable $data references
  errorMessage: true,     // Custom error messages
  strict: true,            // Strict validation mode
  async: true,
  inlineRefs: false,

  //And more.


  //Including 
  errorFormatter?: (errors: any[]) => Error; // Not in jet validator but needed in fastify.
  //Custom Function for formating jet validator errors.
})
```

## Features

Everything Fastify + AJV supports, plus:

- ✅ **19x faster compilation**
- ✅ **Full JSON Schema Draft 06-2020-12 support**
- ✅ **99.2% spec compliance**
- ✅ **Json Schema Compliant TypeScript type inference** (with [@jetio/schema-builder](https://github.com/official-jetio/schema-builder))
- ✅ **elseIf conditionals**
- ✅ **Inbuilt formats and custom error messages**
- ✅ **Advanced $data references**
- ✅ **Custom keywords** (3 types)
- ✅ **Macro system**
- ✅ **Zero dependencies**
- ✅ **Meta schema system and cli**
- ✅ **Advance $ref resolution**
- ✅ **Stand alone code generation that inlines everything and supports custom keywords**

## Migration from Deafult Fastify Compiler

**Zero code changes** to your routes. Just change the Fastify initialization:
```diff
const fastify = Fastify();
+ import { createJetValidatorController } from '@jetio/fastify-validator';
+ 
+ const fastify = Fastify({
+   schemaController: createJetValidatorController()
+ });
```

Everything else stays the same.

## Examples

See the [examples](https://github.com/official-jetio/fastify-validator/tree/main/examples) directory:

- [basic.js](http://github.com/official-jetio/fastify-validator/blob/main/examples/basic.js) - Basic usage
- [comparison.js](http://github.com/official-jetio/fastify-validator/blob/main/examples/comparison.js) - Compilation speed comparison


> **Note on Async Validation:** While JetValidator supports async validation natively, it is not supported in this Fastify integration. Per [Fastify's own recommendation](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/), async logic such as database lookups during validation can lead to Denial of Service vulnerabilities and unhandled promise rejections. Use Fastify's `preHandler` hooks for async validation tasks instead.



## Compatibility

- **Fastify:** 4.x, 5.x
- **Node.js:** 16+

## 🔗 Links

- [JetValidator](https://github.com/official-jetio/validator) - Main validator
- [Benchmarks](https://github.com/official-jetio/validator#benchmarks) - Performance details
- [Complete Documentation (20k+ lines)](https://github.com/official-jetio/validator/blob/main/DOCUMENTATION.md) - Main validator full documentation
- [Issue Tracker](https://github.com/official-jetio/fastify-validator/issues)
- [GitHub Discussions](https://github.com/official-jetio/fastify-validator/discussions)

## 📄 License

MIT © [Great Venerable](https://github.com/greatvenerable)

---

Built with ❤️ for developers who demand full JSON Schema compliance and blazing-fast Fastify startup times.

 **[The Venerable Supreme](https://github.com/greatvenerable)**