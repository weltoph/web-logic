dist/bundle.js: $(wildcard src/*) webpack.config.js
	npm run build
