if (Test-Path sea-prep.blob) { Remove-Item sea-prep.blob }
npm run esbuild
node --experimental-sea-config sea-config.json
node -e "require('fs').copyFileSync(process.execPath, 'athan.exe')"
npx postject athan.exe NODE_SEA_BLOB sea-prep.blob `
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
