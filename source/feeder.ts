import {Db, InsertWriteOpResult, ObjectId} from 'mongodb'
import {readFileSync} from 'fs'
import {ImagesDb, PatientsDb} from './models'
import { Util } from './util';
import { Connector } from './connector';

export class Feeder {

    private readonly dbsNames = {
        users: 'oculus-users-db-name',
        patients: 'oculus-patients-db', 
        images: 'oculus-images-db'
    }

    private readonly users: Users = {
        admins: [], 
        doctors: [] 
    } 

    private readonly patients: PatientsDb.Patient[] = []
    private readonly patientMetrics: PatientsDb.PatientMetrics[] = []

    private readonly imageFiles: ImagesDb.ImageFile[] = []
    private readonly images: ImagesDb.Image[] = []

    private readonly now = new Date()

    private static FIRST_IMAGE_FILE_ID = 9000
    
    constructor(
        private readonly host: string,
        private readonly port: string
    ) {}

    public async start() {
        await this.feedUsersDb()
        await this.feedPatientsDb()
        await this.feedImagesDb()
    }

    /** TODO */
    private async feedUsersDb() {
        this.users.admins.push("admin123")
        this.users.doctors.push("doctorDr", "doctorProf", "doctorDeath")
    }

    /** save patients and patients metrics to the db */
    private async feedPatientsDb() {
        await this.manageDb(
            this.dbsNames.patients, 
            async (db: Db) => {
                const patients = <PatientsDb.Patient[]> readJSON("patients-db/patients.json")
                await this.insertDocuments(patients, db, 'patient', this.patients)

                const metrics = <PatientsDb.PatientMetrics[]> readJSON("patients-db/patientMetrics.json")
                for (let i = 0; i < metrics.length; i++) {
                    metrics[i].patient = Util.random(this.patients)._id!.toHexString()
                    metrics[i].doctor = Util.random(this.users.doctors)
                    metrics[i].date = new Date(metrics[i].date)
                }
                await this.insertDocuments(metrics, db, 'patientMetrics', this.patientMetrics)
            }
        )
    }

    /** save images data to the db */
    private async feedImagesDb() {
        await this.manageDb(
            this.dbsNames.images, 
            async (db: Db) => {
                await this.saveImagesFiles(db)
                await this.saveImages(db)
            }
        )
    }

    /** save imageFiles to the db */
    private async saveImagesFiles(db: Db) {
        let files: ImagesDb.ImageFile[] = []

        for (let i = 1; i < 100; i++) {
            let imgs: string[] = []
            for (let j = i*10-9; j <= i*10; j++) imgs.push(Util.pad(j, 24))

            files.push({
                _id: id(i + Feeder.FIRST_IMAGE_FILE_ID),
                patient: Util.random(this.patients)._id!.toHexString(),
                author: Util.random(this.users.doctors),
                images: imgs,
                date: this.now,
                notes: ""
            })
        }

        await this.insertDocuments(files, db, 'imageFile', this.imageFiles)
    }

    /** save images with the filesystem reference to the db */
    private async saveImages(db: Db) {
        let imgs: ImagesDb.Image[] = []
        
        for (let i = 0; i <= 100; i++) {
            for (let j = i*10+1; j <= i*10+10; j++) {
                imgs.push({
                    _id: id(j),
                    path: "/f_" + Util.pad(i + Feeder.FIRST_IMAGE_FILE_ID, 24) + "/img_" + Util.pad(j, 24) + '.jpg',
                    date: this.now,
                    notes: ""
                })

                if (imgs.length >= 100) {
                    Util.log('sending imgs to the db ' + i)
                    await this.insertDocuments(imgs, db, 'image', this.images)
                    imgs = []
                }
            }
        }
        
        if (imgs.length > 0) {
            Util.log('sending imgs to the db LAST')
            await this.insertDocuments(imgs, db, 'image', this.images)
        }
    }

    private async feedFactsDb() {

    }

    /** TODO */
    private async feedJobsDb() {
        // const jobs: any[] = readJSON("jobs.json");
        // for (const j of jobs) {
        //     j.created = new Date();
        //     j.updated = new Date();
        // }
        // const rules = readJSON("rules.json");
        // const users = readJSON("users.json");
        // const patients = readJSON("patients.json");

        // this.insertDocuments(jobs, 'job')
        // this.insertDocuments(rules, 'rule')
        // this.insertDocuments(users, 'user')

    }

    /** insert documents to the db and push ids to local store */
    private async insertDocuments<T>(data: T[], db: Db, collectionName: string, store: T[]): Promise<InsertWriteOpResult> {
        Util.log("inserting " + collectionName)
        const collection = db.collection(collectionName)
        
        const inserted = await collection.insertMany(data)
        for (let i of inserted.ops) store.push(i);

        Util.log("inserted " + collectionName)
        return inserted
    }

    private async manageDb(dbName: string, action: (db: Db) => void) {
        let connector = new Connector(dbName, this.host, this.port)
        await connector.manageDb(action)
    }
}

interface Users {
    admins: string[],
    doctors: string[]
}

/** read JSON from data directory to object[] */
function readJSON(filename: string): object[] {
    let json = readFileSync('data/' + filename)
    return JSON.parse(json.toString())
}

/** get MongoDB id with given value */
function id(value: number): ObjectId { return new ObjectId(Util.pad(value, 24)) }
