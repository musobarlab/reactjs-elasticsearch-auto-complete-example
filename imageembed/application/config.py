import os
import dotenv

 # load env
dotenv.load_dotenv()

def str2bool(v):
  return v.lower() in ("yes", "true", "t", "1")

config = {
    'HTTP_PORT': os.environ['HTTP_PORT'],
    'BASE_PATH': os.environ['BASE_PATH'],
    'CORS_ORIGINS': os.environ['CORS_ORIGINS'].split(','),
    
    'BASIC_AUTH_USER': os.environ['BASIC_AUTH_USER'],
    'BASIC_AUTH_PASS': os.environ['BASIC_AUTH_PASS'],

    'ELASTICSEARCH_NODES': os.environ['ELASTICSEARCH_NODES'].split(','),
    'ELASTICSEARCH_USERNAME': os.environ['ELASTICSEARCH_USERNAME'],
    'ELASTICSEARCH_PASSWORD': os.environ['ELASTICSEARCH_PASSWORD'],
    'ELASTICSEARCH_REQUEST_TIMEOUT': os.environ['ELASTICSEARCH_REQUEST_TIMEOUT'],

}
