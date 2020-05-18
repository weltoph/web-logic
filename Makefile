.PHONY: build test

SCRIPTFILES=$(wildcard src/*)
STATICFILES=$(wildcard static/*)
CONFIGFILES=webpack.config.js

build: ${SCRIPTFILES} ${STATICFILES} ${CONFIGFILES} test
	mkdir -p dist
	npm run build
	cp $(wildcard static/*) dist/

test: ${SCRIPTFILES}
	npm run test
