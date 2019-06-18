import {MongoClient, Binary, Db, InsertOneWriteOpResult, InsertWriteOpResult, ObjectId} from 'mongodb'
import {readFileSync} from 'fs'
import {ImagesDb, PatientsDb} from './models'

export class Feeder {

    private readonly now = new Date()

    constructor(
        private readonly db: Db
    ) {
    }

    private static FIRST_IMAGE_FILE_ID = 9000
    
    /** save images data to the db */
    async feedImagesDb() {
        await this.saveImagesFiles()
        await this.saveImages()
    }

    /** save imageFiles to the db */
    private async saveImagesFiles() {
        let collection = this.db.collection('imageFile')
        let files: ImagesDb.ImageFile[] = []
        const time = new Date()

        for (let i = 1; i < 100; i++) {
            let imgs: string[] = []
            for (let j = i*10-9; j <= i*10; j++) imgs.push(pad(j, 24))

            files.push({
                _id: id(i + Feeder.FIRST_IMAGE_FILE_ID),
                patient: "kowalski",
                author: "doctor",
                images: imgs,
                date: time,
                notes: ""
            })
        }
        
        console.log('sending img files to db')
        await collection.insertMany(files)
    }

    /** save images with the filesystem reference to the db */
    private async saveImages() {
        let imgs: ImagesDb.Image[] = []
        let collection = this.db.collection('image')
        const time = new Date()
        
        for (let i = 0; i <= 100; i++) {
                for (let j = i*10+1; j <= i*10+10; j++) {
                imgs.push({
                    _id: id(j),
                    path: "/f_" + pad(i + Feeder.FIRST_IMAGE_FILE_ID, 24) + "/img_" + pad(j, 24) + '.jpg',
                    date: time,
                    notes: ""
                })

                if (imgs.length >= 50) {
                    console.log('sending imgs to the db ' + i)
                    await collection.insertMany(imgs)
                    imgs = []
                }
            }
        }
        
        if (imgs.length > 0) {
            console.log('sending imgs to the db LAST')
            await collection.insertMany(imgs)
        }
    }

    /** save patients and patients metrics to the db */
    async feedPatientsDb() {
        const patients = <PatientsDb.Patient[]> readJSON("patients.json")
        const patientsResult = await this.insertDocuments(patients, 'patient')

        const metrics = <PatientsDb.PatientMetrics[]> readJSON("patientMetrics.json")
        for (let i = 0; i < metrics.length; i++) {
            metrics[i].date = new Date(metrics[i].date)
            metrics[i].patient = patientsResult.insertedIds[i].toHexString()
        }
        await this.insertDocuments(metrics, 'patientMetrics')
    }

    async feedJobsDb() {
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

    /** insert documents to the db */
    private async insertDocuments(data: any[], collectionName: string): Promise<InsertWriteOpResult> {
        let collection = this.db.collection(collectionName)
        collection.deleteMany({})

        let result = await collection.insertMany(data)
        console.log("inserted " + collectionName)
        return result
    }
}

/** read JSON from data directory to object[] */
function readJSON(filename: string): object[] {
    let json = readFileSync('data/' + filename)
    return JSON.parse(json.toString())
}

/** pad number with zeros  until it achieves given size */
function pad(input: number, size: number) {
    var s = String(input)
    while (s.length < size) {s = "0" + s;}
    return s;
}

/** get MongoDB id with given value */
function id(value: number): ObjectId { return new ObjectId(pad(value, 24)) }