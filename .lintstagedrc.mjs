/** @type {Record<string, (filenames: string[]) => string[]>} */
const config = {
  '*.ts': (filenames) => [`eslint ${filenames.join(' ')}`],
  '*.{ts,js,json}': () => ['pnpm build -r', 'pnpm test -r']
};

export default config;
