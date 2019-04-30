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
   
    // await feedImgs(db)
    await feedJobs(db)

    console.log('done')
    client.close()
  }
})

interface ImgEntry {
  image: Binary,
  date: Date
}

async function feedImgs(db: Db) {
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

async function feedJobs(db: Db) {
    const jobs: any[] = readJSON("jobs.json");
    for (let j of jobs) {
        j.created = new Date();
        j.updated = new Date();
    }
    const rules = readJSON("rules.json");
    const users = readJSON("users.json");
    const patients = readJSON("patients.json");

    insertDocuments(db, jobs, 'job')
    insertDocuments(db, rules, 'rule')
    insertDocuments(db, users, 'user')
    insertDocuments(db, patients, 'patient')
}

async function insertDocuments(db: Db, data: any[], collectionName: string) {
    var collection = db.collection(collectionName)
    collection.deleteMany({})

    await collection.insertMany(data)
    console.log("inserted " + collectionName)
}

function readJSON(filename: string): object[] {
    let json = readFileSync('data/' + filename)
    return JSON.parse(json.toString())
}