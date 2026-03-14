import { JetValidator, ValidatorOptions } from "@jetio/validator";
import type { FastifySchemaCompiler, FastifyServerOptions } from "fastify";

export interface JetBridgeOptions extends ValidatorOptions {
  errorFormatter?: (errors: unknown[]) => Error;
}

export function createJetValidatorCompiler(
  globalOptions: JetBridgeOptions = {},
) {
  return (externalSchemas: Record<string, any>) => {
    const validator = new JetValidator(globalOptions);
    for (const [id, schema] of Object.entries(externalSchemas)) {
      validator.addSchema(schema, id);
    }
    const compile: FastifySchemaCompiler<any> = ({ schema, httpPart }) => {
      const validate = validator.compile(schema);
      return (data) => {
        const result = validate(data);

        if (result === true) return { value: data };

        const errors = validate.errors ?? [];

        const err: Error & {
          validation?: unknown[];
          validationContext?: string;
        } = globalOptions.errorFormatter
          ? globalOptions.errorFormatter(errors)
          : new Error(errors.map((e: any) => e.message).join(", "));

        err.validation = errors;
        err.validationContext = httpPart;

        return { error: err };
      };
    };

    return compile;
  };
}

export function createJetValidatorController(
  globalOptions: JetBridgeOptions = {},
) {
  return {
    compilersFactory: {
      buildValidator: createJetValidatorCompiler(globalOptions),
    },
  };
}
