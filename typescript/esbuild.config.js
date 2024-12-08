const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['dist/main.js'],
  bundle: true,
  platform: 'node',
  target: 'node23',
  outfile: 'dist/main.bundle.js',
}).catch(() => process.exit(1));