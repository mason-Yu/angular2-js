@echo off

REM --- Windows script to create a new HTML plugin from the command line

setlocal
echo.

IF not defined ANT_HOME (
   echo BUILD FAILED: You must set the environment variable ANT_HOME to your Apache Ant folder
   goto end
)
IF not EXIST "%ANT_HOME%\bin\ant" (
   echo BUILD FAILED: You must set the environment variable ANT_HOME to your Apache Ant folder
   echo "%ANT_HOME%\bin\ant" is missing
   goto end
)

echo This script generates an HTML plugin from a template, with a UI and Service component
echo.

REM --- plugin name

SET /P pluginName="Enter your plug-in name in lowercase, without special characters [myplugin]: "
IF "%pluginName%" == "" SET pluginName=myplugin
echo ^-^> your plugin name is "%pluginName%"

SET pluginNameUi=%pluginName%-ui
SET pluginNameService=%pluginName%-service


REM --- plugin parent directory

SET /P pluginDir="Enter a directory where %pluginNameUi% and %pluginNameService% will be created [%CD%]: "
IF "%pluginDir%" == "" SET pluginDir=%CD%

rem --- work with absolute paths otherwise the ant script will generate directories relative to its base
SET isAbsolutePath=0
IF "%pluginDir:~0,1%" == "\" SET isAbsolutePath=1
IF "%pluginDir:~1,1%" == ":" SET isAbsolutePath=1
IF %isAbsolutePath% EQU 0 SET pluginDir=%CD%\%pluginDir%

IF not exist "%pluginDir%" (
   mkdir "%pluginDir%"
   echo ^-^> "%pluginDir%" was created
) ELSE (
   echo ^-^> using existing directory "%pluginDir%"
)

IF exist "%pluginDir%\%pluginNameUi%" (
   CHOICE /M "Continue and replace existing directory? %pluginDir%/%pluginNameUi%"
   IF errorlevel 2 (
      echo ^-^> stopped
      goto end
   )
   rmdir /s/q %pluginDir%\%pluginNameUi%
)

IF exist "%pluginDir%\%pluginNameService%" (
   CHOICE /M "Continue and replace existing directory? %pluginDir%/%pluginNameService%"
   IF errorlevel 2 (
      echo ^-^> stopped
      goto end
   )
   rmdir /s/q %pluginDir%\%pluginNameService%
)


REM --- plugin package
SET /P  packageName="Enter your plugin package name [com.mycompany.%pluginName%]: "
IF "%packageName%" == "" SET packageName=com.mycompany.%pluginName%
echo ^-^> your plugin package name is "%packageName%"

SET packageDir=%packageName:.=/%
SET bundleName=%packageName:.=_%


REM --- location of this script
SET SCRIPT_DIR=%~dp0


REM --- launch the Ant script

CALL "%ANT_HOME%\bin\ant" -f "%SCRIPT_DIR%\generate-plugin.xml" ^
      -DprojectDir-ui="%pluginDir%\%pluginNameUi%" ^
      -DprojectDir-service="%pluginDir%\%pluginNameService%" ^
      -DprojectName-ui="%pluginNameUi%" ^
      -DprojectName-service="%pluginNameService%" ^
      -DpluginName="%pluginName%" ^
      -DbundleName="%bundleName%" ^
      -DpackageName="%packageName%" ^
      -DpackageDir="%packageDir%" ^
      -DpluginUiTemplateDir="%SCRIPT_DIR%\..\seed-ui" ^
      -DpluginServTemplateDir="%SCRIPT_DIR%\..\seed-service"


IF %errorlevel% EQU 0 (
   echo.
   echo ^-^> HTML plugin created!
   echo.   See UI component in   "%pluginDir%\%pluginNameUi%"
   echo.   and Java component in "%pluginDir%\%pluginNameService%"
   echo. Follow $pluginDir/$pluginNameUi/README to get started!
   goto end
)


:end
endlocal
echo.
