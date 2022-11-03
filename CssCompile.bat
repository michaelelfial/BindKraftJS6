SET ThemeName=%1

SET CurrentDir=%~dp0

if not exist %CurrentDir%Css mkdir %CurrentDir%Css
ECHO //#using "./%ThemeName%.css" > %CurrentDir%Css/%ThemeName%.dep
call sass %CurrentDir%Css/BindKraftJS6.scss %CurrentDir%Css/%ThemeName%.css %2 %3 %4

ECHO BindKraftJS6 Build Successfully


