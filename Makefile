.PHONY: build test

build: $(wildcard src/*) $(wildcard static/*) webpack.config.js test
	npm run build
	cp $(wildcard static/*) dist/

test: $(wildcard src/*)
	npm run test
