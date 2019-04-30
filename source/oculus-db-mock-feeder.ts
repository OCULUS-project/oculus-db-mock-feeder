import { MongoClient, Binary, Db } from 'mongodb'
import { readFileSync } from 'fs'

const host = process.argv[2] != undefined ? process.argv[2] : 'localhost'
const port = process.argv[3] != undefined ? process.argv[3] : '27017'

const url = 'mongodb://' + host + ':' + port;
const dbName = 'oculus';
const client = new MongoClient(url)

client.connect(async (err: Error) => {
  if(err){ 
    console.log("connection error: " + err)
  } 
  else {
    const db = client.db(dbName)
    console.log("connected")
   
    await feedImgs(db)

    console.log('done')
    client.close()
  }
})

interface ImgEntry {
  image: Binary,
  date: Date
}

async function feedImgs(db: Db): Promise<void> {
    const time = new Date()

    let imgs: ImgEntry[] = []
    let collection = db.collection('img')
    for (let i = 1; i <= 1000; i++) {
        let filename = 'data/img/imgs_1k/img_' + i.toString().padStart(4, '0') + '.jpg'
        let img = readFileSync(filename)
        imgs.push({
            image: new Binary(img),
            date: time
        })

        if (imgs.length >= 25) {
            console.log('sending imgs to db ' + i)
            await collection.insertMany(imgs)
            imgs = []
        }
    }

    if (imgs.length > 0) {
        console.log('sending imgs to db LAST')
        await collection.insertMany(imgs)
    }
}