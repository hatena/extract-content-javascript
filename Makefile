all:
	cat lib/lib.js \
        lib/extract-content.js \
        lib/scoring-words.js \
    > extract-content-allinone.js

package:
	cat lib/lib.js \
        lib/extract-content.js \
    > lib/extract-content-all.js

clean:
	rm extract-content-allinone.js
	rm lib/extract-content-allinone.js
