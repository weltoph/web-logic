.PHONY: main

main: $(wildcard src/*) $(wildcard dist/*.html) webpack.config.js
	npm run build
