# run vite build for bp ( main package )
vite build

# copy the new build file from ./dist/buddypond.umd.cjs to ./public/buddypond.umd.cjs
cp ./dist/buddypond.umd.cjs ./public/buddypond.umd.js
cp ./dist/buddypond.umd.cjs ../bp.js

