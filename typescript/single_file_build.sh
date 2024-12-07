#!/bin/bash
npm run build
node --experimental-sea-config sea-config.json
cp $(command -v node) athan
chmod +rwx athan
codesign --remove-signature athan
npx postject athan NODE_SEA_BLOB sea-prep.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
    --macho-segment-name NODE_SEA
codesign --sign - athan