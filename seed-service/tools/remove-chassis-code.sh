#!/bin/sh

toolsDir=`dirname $0`
echo "Remove all chassis related code in this project? Y or N [N]"
read response
if [[ $response == "y" || $response == "Y" ]]; then
   # Remove chassis specific files
   find $toolsDir/../src -name 'Chassis*' -exec rm -f {} \;
   find $toolsDir/../src -name 'ModelObject.java' -exec rm -f {} \;
   find $toolsDir/../src -name 'ObjectStore.java' -exec rm -f {} \;
   find $toolsDir/../src -name 'ModelObjectUriResolver.java' -exec rm -f {} \;
   find $toolsDir/../src -name 'ResultItemComparator.java' -exec rm -f {} \;

   # Remove chassis code in all other files (.ts, .html, .xml, .properties only)
   find $toolsDir/../src -type f \( -name '*.java' -o -name '*.xml' \) \
   -exec sed -i '' -e '/removable-chassis-line/d' -e '/removable-chassis-code/,/end-chassis-code/d' {} \;

else
   echo "-> stopped"
   exit 1
fi

