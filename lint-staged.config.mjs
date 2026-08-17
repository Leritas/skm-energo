import path from 'node:path';

/** @param {string} dir @param {string[]} files */
function rel(dir, files) {
  return files.map((file) => path.relative(dir, file));
}

/** @param {string} dir @param {string[]} files */
function eslintFix(dir, files) {
  const targets = rel(dir, files);
  if (targets.length === 0) {
    return [];
  }
  return [
    `cd ${dir} && eslint --fix ${targets.map((file) => `"${file}"`).join(' ')}`,
  ];
}

/** @param {string[]} files */
function prettierWrite(files) {
  if (files.length === 0) {
    return [];
  }
  return [`prettier --write ${files.map((file) => `"${file}"`).join(' ')}`];
}

/** @param {import('lint-staged').Config} */
export default {
  'backend/**/*.{ts,mjs,js}': (files) =>
    eslintFix(
      'backend',
      files.filter((file) => !file.includes('/node_modules/')),
    ),

  'frontend/**/*.{vue,ts,js,mjs}': (files) => [
    ...prettierWrite(files),
    ...eslintFix('frontend', files),
  ],

  'skm-specs/src/**/*.ts': (files) => prettierWrite(files),

  '*.{json,md,yml,yaml,mjs}': (files) => prettierWrite(files),

  'scripts/**/*.{mjs,js,sh}': (files) =>
    prettierWrite(files.filter((file) => !file.endsWith('.sh'))),
};
