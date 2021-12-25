/** @type {Record<string, (filenames: string[]) => string[]>} */
const config = {
  '*.ts': (filenames) => [`eslint ${filenames.join(' ')}`],
  '*.{ts,js,json}': () => ['rm -rf ./lib/test/', 'tsc -b', 'jest']
};

export default config;
