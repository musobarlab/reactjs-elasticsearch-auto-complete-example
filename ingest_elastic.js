const fs = require("fs");
const { parse } = require("csv-parse");
const { Client } = require('@elastic/elasticsearch');

const main = () => {
    const esClient = new Client({
        nodes: ['http://localhost:9200'],
        auth: {
            username: 'elastic',
            password: 'changeme'
        },
        requestTimeout: 5000
    });

    let datas = [];
    fs.createReadStream("./amazon_products.csv")
    .pipe(parse({ delimiter: ","}))
    .on("data", (row) => { 
        const productName = row[1];
        const category = row[4];
        const sellingPrice = row[7];
        const aboutProduct = row[10];
        const productSpecification = row[11];
        const image = row[15];
        const variant = row[17];
        const productUrl = row[18];

        const categories = category.length > 0 ? category.split('|').map(c => c.trim()) : [];
        console.log('.');

        datas.push({
            productName: productName.trim(),
            aboutProduct: aboutProduct.trim(),
            sellingPrice: sellingPrice.trim(),
            productSpecification: productSpecification,
            categories: categories,
            image: image,
            variant: variant,
            productUrl: productUrl
        })
    }).on('end', () => {

        const operations = datas.flatMap(doc => [{ index: { _index: 'products' } }, doc]);

        esClient.bulk({
            refresh: true,
            body: operations
        }).catch(e => console.log('elastic ingest error: ', e));
    });


};

main();