from sentence_transformers import SentenceTransformer, util
from PIL import Image
from elasticsearch import Elasticsearch, helpers
import torch
import pandas as pd
import requests
import uuid

def ingest():
    # https://huggingface.co/sentence-transformers/clip-ViT-B-32
    model = SentenceTransformer('clip-ViT-B-32')

    esclient = Elasticsearch(
        hosts='http://127.0.0.1:9200',
        http_auth=('elastic', 'changeme')
    )
    
    print(esclient.info())

    df = pd.read_csv('../amazon_products.csv')
    df = df.reset_index()

    # print(df.iloc[436]['Image'].split('|')[0])

    # imUrl = 'https://images-na.ssl-images-amazon.com/images/I/41NjjrMxuJL.jpg'
    # # # util.http_get(imUrl, imUrl.split('/')[-1])

    # img_resp = requests.get(imUrl, stream=True)
    # img_emb = model.encode(Image.open(img_resp.raw), batch_size=128, convert_to_tensor=True, show_progress_bar=True)
    # print(img_emb.tolist())

    index_name = 'products'
    def bulk_insert():
        for index, row in df.iterrows():
            productName = row['Product Name']
            category = row['Category']
            sellingPrice = row['Selling Price']
            aboutProduct = row['About Product']
            productSpecification = row['Product Specification']
            image = row['Image']
            color = row['Color']
            productUrl = row['Product Url']

            print(row['Image'].split('|')[0])

            image = image.split('|')[0] if len(image) > 0 else ''

            categories = [c.strip() for c in category.split('|')] if isinstance(category, str) and len(category) > 0 else []

            imageVector = []
            if image != '':
                try:
                    img_resp = requests.get(image, stream=True)
                    img_emb = model.encode(Image.open(img_resp.raw), batch_size=128, convert_to_tensor=True, show_progress_bar=True)
                    imageVector = img_emb.tolist()
                except:
                    print('download image error: jump')
                    continue

            data = {
                'productName': productName.strip() if isinstance(productName, str) else '',
                'aboutProduct': aboutProduct.strip() if isinstance(aboutProduct, str) else '',
                'sellingPrice': sellingPrice.strip() if isinstance(sellingPrice, str) else '',
                'productSpecification': productSpecification if isinstance(productSpecification, str) else '',
                'categories': categories,
                'image': image,
                'imageVector': imageVector,
                'color': color if isinstance(color, str) else '',
                'productUrl': productUrl
            }

            yield {
                '_index': index_name,
                '_id': uuid.uuid4(),
                '_source': data
            }
    
    helpers.bulk(esclient, bulk_insert())
        

def main():
    ingest()
    # df = pd.read_csv('../amazon_products.csv')
    # df = df.reset_index()
    # print(df.iloc[2]['Color'])

if __name__ == '__main__':
    main()