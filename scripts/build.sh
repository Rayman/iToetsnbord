cat iphonenav.js itoetsnbord.js iphoneinit.js | java -jar yui242.jar --type js -o all.js
head -n 1 licence.txt > mootools.js
java -jar yui242.jar mootools-1.2.4-core.js >> mootools.js
echo "
" >> mootools.js
tail -n 1 licence.txt >> mootools.js
echo "" >> mootools.js
java -jar yui242.jar mootools-1.2.4.4-more.js >> mootools.js