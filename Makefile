all:
	cat lib/lib.js \
        lib/extract-content.js \
        lib/scoring-words.js \
    > extract-content-allinone.js

clean:
	rm extract-content-allinone.js
