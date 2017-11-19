#!/usr/bin/env bash
pwd
aws s3 sync dist/. s3://www.supnig.com
echo "Invalidating cloudfrond distribution to get fresh cache"
aws cloudfront create-invalidation --distribution-id=EDGHFTN6MY6WO --paths /\* --profile=default
