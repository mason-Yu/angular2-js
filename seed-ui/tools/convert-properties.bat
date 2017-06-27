@echo off
REM --- Windows script
REM --- (if Ant runs out of memory try defining ANT_OPTS=-Xmx512M)

@setlocal
@IF not defined ANT_HOME (
   @echo BUILD FAILED: You must set the env variable ANT_HOME to your Apache Ant folder
   goto end
)

@call "%ANT_HOME%\bin\ant" -f %~dp0\convert-properties.xml convert-properties

:end
