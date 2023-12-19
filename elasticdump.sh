#!/bin/bash

./node_modules/elasticdump/bin/elasticdump \
    --input=http://elastic:changeme@127.0.0.1:9200/products \
    --output=products_elastic_mapping.json \
    --type=mapping

./node_modules/elasticdump/bin/elasticdump \
    --input=http://elastic:changeme@127.0.0.1:9200/products \
    --output=products_elastic_index.json \
    --type=data