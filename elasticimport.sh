#!/bin/bash

./node_modules/elasticdump/bin/elasticdump \
    --input=./products_elastic_index.json \
    --output=http://elastic:changeme@127.0.0.1:9200/products \
    --type=data