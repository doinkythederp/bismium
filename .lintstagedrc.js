/** @type {Record<string, (filenames: string[]) => string[]>} */
const config = {
  '*.ts': (filenames) => [`eslint ${filenames.join(' ')}`],
  '*.{ts,js,json}': () => [
    'tsc -b',
    'env NODE_OPTIONS=--experimental-vm-modules jest'
  ]
};

export default config;