import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// As regras do Next (Core Web Vitals) e do TypeScript; o formato do código fica com o Prettier.
export default defineConfig([...nextVitals, ...nextTs, globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"])]);
