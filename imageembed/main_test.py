from sentence_transformers import SentenceTransformer, util
from PIL import Image
from elasticsearch import Elasticsearch, helpers
import torch
import pandas as pd
import requests
import uuid

def main():
    model = SentenceTransformer('clip-ViT-B-32')

    img_emb = model.encode(Image.open('41NjjrMxuJL.jpg'), batch_size=128, convert_to_tensor=True, show_progress_bar=True)
    print(img_emb.tolist())

if __name__ == '__main__':
    main()