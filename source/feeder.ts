import {MongoClient, Binary, Db, InsertOneWriteOpResult, InsertWriteOpResult} from 'mongodb'
import {readFileSync} from 'fs'
import {ImagesDb, PatientsDb} from './models'

export class Feeder {

    private readonly now = new Date()

    constructor(
        private readonly db: Db
    ) {
    }

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
        const metrics = <PatientsDb.PatientMetrics[]>readJSON("patientMetrics.json")
        for (const m of metrics) {
            m.dateOfBirth = new Date(m.dateOfBirth)
            m.updatedAt = this.now
        }
        const metricsResult = await this.insertDocuments(metrics, 'patientMetrics')

        const patients = <PatientsDb.Patient[]>readJSON("patients.json")
        for (let i = 0; i < metrics.length; i++)
            patients[i].metrics = metricsResult.insertedIds[i].toHexString()
        this.insertDocuments(patients, 'patient')
    }

    async feedJobs() {
        const jobs: any[] = readJSON("jobs.json");
        for (const j of jobs) {
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

    private async insertDocuments(data: any[], collectionName: string): Promise<InsertWriteOpResult> {
        let collection = this.db.collection(collectionName)
        collection.deleteMany({})

        let result = await collection.insertMany(data)
        console.log("inserted " + collectionName)
        return result
    }
}


function readJSON(filename: string): object[] {
    let json = readFileSync('data/' + filename)
    return JSON.parse(json.toString())
}