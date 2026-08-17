import path from 'node:path';

function rel(dir, files) {
  return files.map((file) => path.relative(dir, file));
}

function eslintFix(dir, files) {
  const targets = rel(dir, files);
  if (targets.length === 0) {
    return [];
  }
  return [
    `cd ${dir} && eslint --fix ${targets.map((file) => `"${file}"`).join(' ')}`,
  ];
}

function prettierWrite(files) {
  if (files.length === 0) {
    return [];
  }
  return [`prettier --write ${files.map((file) => `"${file}"`).join(' ')}`];
}

export default {
  'backend/**/*.{ts,mjs,js}': (files) => eslintFix('backend', files),

  'frontend/**/*.{vue,ts,js,mjs}': (files) => [
    ...prettierWrite(files),
    ...eslintFix('frontend', files),
  ],

  'skm-specs/src/**/*.ts': (files) => prettierWrite(files),

  '*.{json,md,yml,yaml,mjs}': (files) => prettierWrite(files),

  'scripts/**/*.{mjs,js,sh}': (files) =>
    prettierWrite(files.filter((file) => !file.endsWith('.sh'))),
};
