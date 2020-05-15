.PHONY: build test

test: $(wildcard src/*) $(wildcard dist/*.html) webpack.config.js
	npm run test

main: $(wildcard src/*) $(wildcard dist/*.html) webpack.config.js
	npm run build
