#!/bin/bash

if [ $# -ne 2 ]; then
    echo "************************************** Missing arguments. Usage : release.sh [version] [message]"
else
    VERSION=$1
    MESSAGE=$2
    echo "************************************** Commit changes '$MESSAGE' **************************************"
    git add .
    git commit -m "$MESSAGE"
    echo "************************************** Adding tag $VERSION and push to Github **************************************"
    npm version v$VERSION
    git push
    git push --tags
fi