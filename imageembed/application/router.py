import json
import io
from typing import Annotated
from sentence_transformers import SentenceTransformer, util
from PIL import Image
from elasticsearch import Elasticsearch
from fastapi import (
    APIRouter,
    File, 
    Form, 
    UploadFile
)

from application import (
    config,
    search_model
)

from application.logger import logger as log

esclient = Elasticsearch(
    hosts=config.config['ELASTICSEARCH_NODES'],
    http_auth=(config.config['ELASTICSEARCH_USERNAME'], config.config['ELASTICSEARCH_PASSWORD'])
)

model = SentenceTransformer('clip-ViT-B-32')

router = APIRouter(
    prefix=''
)

@router.get('/')
async def index():
    return {'success': True, 'message': 'server up and running'}

@router.post('/search')
async def index(file: UploadFile):
    if not file:
        return {'success': False, 'message': 'file cannot be empty'}
    
    try:
        contents = await file.read()

        img_emb = model.encode(Image.open(io.BytesIO(contents)), batch_size=128, convert_to_tensor=True, show_progress_bar=True)

        search_payload = {
            "_source": ["productName", "image"],
            "query": {
                "script_score": {
                    "query": {
                        "match_all": {}
                    },
                    "script": {
                        "source": "cosineSimilarity(params.query_vector, doc['imageVector']) + 1.0",
                        "params": {
                            "query_vector": img_emb.tolist()
                        }
                    }
                }
            }
        }

        response = esclient.search(
            index='products',
            body=search_payload
        )

        return {'success': True, 'message': 'search result', 'data': response}
    except Exception as e:
        log.error(e)
        return {'success': False, 'message': 'search error'}
    finally:
        await file.close()
