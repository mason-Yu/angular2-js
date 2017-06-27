#!/bin/sh
# Mac OS script to create a new HTML plugin from the command line

if [ -z "$ANT_HOME" ] || [ ! -f "${ANT_HOME}"/bin/ant ]
then
   echo BUILD FAILED: You must set the environment variable ANT_HOME to your Apache Ant folder
   exit 1
fi

echo "This script generates an HTML plugin from a template, with a UI and Service component"

# ---------- plugin name ---------

echo "Enter your plug-in name in lowercase, without special characters [myplugin]: "
read pluginName
if [[ $pluginName == "" ]]; then
   pluginName='myplugin'
fi
echo "-> your plugin name is $pluginName"

pluginNameUi="$pluginName-ui"
pluginNameService="$pluginName-service"

# ---------- plugin parent directory ---------

echo "Enter a directory where $pluginName-ui and $pluginName-service will be created"
echo "or <return> to use current dir [`pwd`]: "
read pluginDir
if [[ $pluginDir == "" ]]; then
   pluginDir=`pwd`
fi
#work with absolute path otherwise the ant script will generate directories relative to its base
if [[ "$pluginDir" != /* ]]; then
   if [ $(echo "$pluginDir" | cut -c 1) == '~' ]; then
      # combine without the '~/' at the beginning
      pluginDir=$HOME/$(echo $pluginDir | sed 's/^..//')
   else
      pluginDir=`pwd`/$pluginDir
   fi
fi
if [ ! -d "$pluginDir" ]; then
   mkdir $pluginDir
   if [ $? -ne 0 ]; then
      exit 1
   else
      echo "-> $pluginDir was created"
   fi
else
   echo "-> using existing directory $pluginDir"
fi

if [ -d "$pluginDir/$pluginNameUi" ]; then
   echo "Continue and replace existing directory? $pluginDir/$pluginNameUi [y]"
   read response
   if [[ $response == "" || $response == "y" || $response == "Y" ]]; then
      rm -rf $pluginDir/$pluginNameUi
      if [ $? -ne 0 ]; then
         exit 1
      else
         echo "-> $pluginDir/$pluginNameUi deleted"
      fi
   else
      echo "-> stopped"
      exit 1
   fi
fi

if [ -d "$pluginDir/$pluginNameService" ]; then
   echo "Continue and replace existing directory? $pluginDir/$pluginNameService [y]"
   read response
   if [[ $response == "" || $response == "y" || $response == "Y" ]]; then
      rm -rf $pluginDir/$pluginNameService
      if [ $? -ne 0 ]; then
         exit 1
      else
         echo "-> $pluginDir/$pluginNameService deleted"
      fi
   else
      echo "-> stopped"
      exit 1
   fi
fi

# ---------- plugin package ---------

echo "Enter your plugin package name [com.mycompany.$pluginName]: "
read packageName
if [[ $packageName == "" ]]; then
   packageName="com.mycompany.$pluginName"
fi
echo "-> your plugin package name is $packageName"

packageDir=${packageName//\./\/}
bundleName=${packageName//\./_}

# ---------- location of this script ---------

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# ---------- launch the Ant script ---------

"${ANT_HOME}"/bin/ant -f "$SCRIPT_DIR"/generate-plugin.xml \
      -DprojectDir-ui="$pluginDir/$pluginNameUi" \
      -DprojectDir-service="$pluginDir/$pluginNameService" \
      -DprojectName-ui="$pluginNameUi" \
      -DprojectName-service="$pluginNameService" \
      -DpluginName="$pluginName" \
      -DbundleName="$bundleName" \
      -DpackageName="$packageName" \
      -DpackageDir="$packageDir" \
      -DpluginUiTemplateDir="$SCRIPT_DIR/../seed-ui" \
      -DpluginServTemplateDir="$SCRIPT_DIR/../seed-service"

if [ $? -ne 0 ]; then
   exit 1
else
   echo "\n-> HTML plugin created!"
   echo "   See UI component in   $pluginDir/$pluginNameUi"
   echo "   and Java component in $pluginDir/$pluginNameService"
   echo "Follow $pluginDir/$pluginNameUi/README to get started!"
fi





