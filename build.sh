babel ./src -d ./lib
mkdir -p ./lib/scss
mkdir -p ./lib/fonts
cp -R ./src/css/ ./lib/scss
cp -R ./src/fonts/ ./lib/fonts