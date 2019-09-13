import * as pluginTester from 'babel-plugin-tester';
import plugin from '../../src';

pluginTester({
  plugin,
  tests: [
    {
      title: 'import type statement',
      code: `import type { A } from "module";`,
      output: `import { A } from "module";`,
    },
    {
      title: 'import type specifier',
      code: `import A, { type B, C } from "module";`,
      output: `import A, { B, C } from "module";`,
    },
    {
      title: 'import typeof statement',
      code: `import typeof A, { B, C } from "module";
let a: A = 1;

function f(b: B, c: $Keys<C>) {}`,
      output: `import A, { B, C } from "module";
let a: typeof A = 1;

function f(b: typeof B, c: keyof typeof C) {}`,
    },
    {
      title: 'import typeof specifier',
      code: `import { typeof B, typeof C } from "module";

function f(b: B, c: $Keys<C>) {}`,
      output: `import { B, C } from "module";

function f(b: typeof B, c: keyof typeof C) {}`,
    },
  ],
});
