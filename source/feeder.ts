import { MongoClient, Binary, Db } from 'mongodb'
import { readFileSync } from 'fs'
import { ImagesDb } from './models'

export class Feeder {

    constructor(
        private readonly db: Db
    ) {}

    async feedImgs() {
        const time = new Date()

        let imgs: ImagesDb.Image[] = []
        let collection = this.db.collection('img')
        for (let i = 1; i <= 1000; i++) {
            let filename = 'data/img/imgs_1k/img_' + i.toString().padStart(4, '0') + '.jpg'
            let img = readFileSync(filename)
            imgs.push({
                image: new Binary(img),
                date: time,
                notes: ""
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

    async feedPatients() {
        let patients =  readJSON("patients.json")
        this.insertDocuments(patients, 'patient')

        let metrics =  readJSON("patientMetrics.json")
        this.insertDocuments(metrics, 'patientMetrics')
    }

    async feedJobs() {
        const jobs: any[] = readJSON("jobs.json");
        for (let j of jobs) {
            j.created = new Date();
            j.updated = new Date();
        }
        const rules = readJSON("rules.json");
        const users = readJSON("users.json");
        const patients = readJSON("patients.json");

        this.insertDocuments(jobs, 'job')
        this.insertDocuments(rules, 'rule')
        this.insertDocuments(users, 'user')
        
    }

    private async insertDocuments(data: any[], collectionName: string) {
        var collection = this.db.collection(collectionName)
        collection.deleteMany({})
    
        await collection.insertMany(data)
        console.log("inserted " + collectionName)
    }
}



function readJSON(filename: string): object[] {
    let json = readFileSync('data/' + filename)
    return JSON.parse(json.toString())
}