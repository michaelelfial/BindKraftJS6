ECHO OFF
SET CurrentDir=%~dp0

if not exist %CurrentDir%Css mkdir %CurrentDir%Css
ECHO //#using "./%ThemeName%.css" > %CurrentDir%Css/%ThemeName%.dep

kraft system -scssfile %CurrentDir%Css/BindKraftJS6.scss -cssfile %CurrentDir%Css/%ThemeName%.css -themename %ThemeName% %Optimize% %Noninteractive%

ECHO BindKraftJS6 Build Successfully


