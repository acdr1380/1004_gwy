option confirm off

open root:Glsoft@2018@192.168.0.50:22

cd /home/glsoft/gl_1004_gwygz

rm *

put .\dist\test\*

close

exit

pause