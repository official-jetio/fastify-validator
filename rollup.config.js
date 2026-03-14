import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";

export default [
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.esm.js",
      format: "esm",
      sourcemap: false,
      exports: "named",
    },
    external: ["fastify", "@jetio/validator"],
    plugins: [
      resolve(),
      typescript({
        tsconfig: "./tsconfig.rollup.json",
      }),
    ],
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.cjs.js",
      format: "cjs",
      sourcemap: false,
      exports: "named",
    },
    external: ["fastify", "@jetio/validator"],
    plugins: [
      resolve(),
      typescript({
        tsconfig: "./tsconfig.rollup.json",
      }),
    ],
  },
];