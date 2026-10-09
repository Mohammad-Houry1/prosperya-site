import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import react from "eslint-plugin-react";
export default [
  { ignores:["dist","coverage","node_modules"] },
  js.configs.recommended,
  {
    files:["**/*.{js,jsx,mjs}"],
    languageOptions:{ecmaVersion:2023,sourceType:"module",globals:{...globals.browser,...globals.node},parserOptions:{ecmaFeatures:{jsx:true}}},
    plugins:{react,"react-hooks":reactHooks,"react-refresh":reactRefresh},
    rules:{...reactHooks.configs.recommended.rules,"react/jsx-uses-vars":"error","react-refresh/only-export-components":["warn",{allowConstantExport:true}],"no-unused-vars":["error",{argsIgnorePattern:"^_",varsIgnorePattern:"^_"}]},
  },
];
