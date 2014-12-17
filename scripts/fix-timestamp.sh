#!/bin/bash

REV=$(git rev-list -n 1 HEAD 'package.json');
STAMP=$(git show --pretty=format:%ai --abbrev-commit "$REV" | head -n 1);
echo "Set package.json mtime to $STAMP";
touch -d "$STAMP" package.json;

REV=$(git rev-list -n 1 HEAD 'bower.json');
STAMP=$(git show --pretty=format:%ai --abbrev-commit "$REV" | head -n 1);
echo "Set bower.json mtime to $STAMP";
touch -d "$STAMP" bower.json;