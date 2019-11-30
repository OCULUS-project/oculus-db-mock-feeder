import {Db, InsertWriteOpResult, ObjectId} from 'mongodb'
import {readFileSync} from 'fs'
import {ImagesDb, PatientsDb, FactsDb, JobsDb} from './models'
import { Util } from './util';
import { Connector } from './connector';

export class Feeder {

    private readonly dbsNames = {
        users: 'oculus-users-db-name',
        patients: 'oculus-patients-db', 
        images: 'oculus-images-db',
        facts: 'oculus-facts-db',
        jobs: 'oculus-jobs-db'
    }

    private readonly users: Users = {
        admins: [], 
        doctors: [] 
    } 

    private readonly patients: PatientsDb.Patient[] = []
    private readonly patientMetrics: PatientsDb.PatientMetrics[] = []

    private readonly imageFiles: ImagesDb.ImageFile[] = []
    private readonly images: ImagesDb.Image[] = []

    private readonly rules: FactsDb.Rule[] = []
    private static readonly FACT_SOURCES = [FactsDb.FactSourceType.IMAGE, FactsDb.FactSourceType.METRICS]
    private readonly sourceFacts: FactsDb.SourceFact[] = []
    private readonly resultFacts: FactsDb.ResultFact[] = []
    private readonly attributes: FactsDb.AttributeTemplate[] = []

    private readonly jobs: JobsDb.Job[] = []

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
        await this.feedFactsDb()
        await this.feedJobsDb()
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
                const attributes = new Map()
                attributes.set("height", "180")
                attributes.set("weight", "100.5")
                attributes.set("initials", "JR")
                attributes.set("sex", "man")
                attributes.set("score", "0.5")
                
                for (let i = 0; i < metrics.length; i++) {
                    metrics[i].patient = Util.random(this.patients)._id!.toHexString()
                    metrics[i].doctor = Util.random(this.users.doctors)
                    metrics[i].date = new Date(metrics[i].date)
                    metrics[i].attributes = attributes
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
                    fileId: Util.pad(i + Feeder.FIRST_IMAGE_FILE_ID + 1, 24),
                    path: "/img/f_" + Util.pad(i + Feeder.FIRST_IMAGE_FILE_ID + 1, 24) + "/img_" + Util.pad(j, 24) + '.jpg',
                    date: this.now,
                    scaled: [],
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

    /** save rules, source facts, conlusions and attributes to the db */
    private async feedFactsDb() {
        await this.manageDb(
            this.dbsNames.facts, 
            async (db: Db) => {
                await this.saveRules(db)
                await this.saveAttributes(db)
            }
        )
    }

    /** save rules to the db */
    private async saveRules(db: Db) {
        const rules = readJSON("facts-db/rules.json");
        await this.insertDocuments(rules, db, 'rule', this.rules)
    }

    /** save source facts to the db */
    private async saveSourceFacts(db: Db) {
        const rawFacts = <FactsDb.SourceFact[]> readJSON("facts-db/source-facts.json")
        const facts: FactsDb.SourceFact[] = []
        for (let fact of rawFacts) {
            const jobId = Util.random(this.jobs)._id!.toHexString()
            const sourceType = Util.random(Feeder.FACT_SOURCES)
            const source: FactsDb.FactSource = {
                type: sourceType,
                id: (() => {
                    if (sourceType == FactsDb.FactSourceType.IMAGE)
                        return Util.random(this.images)._id!
                    else /* METRICS */
                        return Util.random(this.patientMetrics)._id!
                })().toHexString()
            }
            
            facts.push({
                job: jobId.toString(),
                source: source,
                head: fact.head,
                set: fact.set,
                grfIrf: fact.grfIrf,
                conjunction: fact.conjunction
            })
        }
        await this.insertDocuments(facts, db, "sourceFact", this.sourceFacts)
    }

    /** save attributes to the db */
    private async saveAttributes(db: Db) {
        const rules = readJSON("facts-db/attributes.json");
        await this.insertDocuments(rules, db, 'attributeTemplate', this.attributes)
    }

    /** save conclusions to the db */
    private async saveResultFacts(db: Db) {
        const facts: FactsDb.ResultFact[] = []
        for (let n = 0; n < 10000; n++) {
            facts.push({
                head: "head",
                set: ["set",],
                grfIrf: {
                    grf: Math.random() * 100,
                    irf: Math.random() * 100
                },
                conjunction: false,
                job: Util.random(this.jobs)._id!.toHexString()
            })
        }
        await this.insertDocuments(facts, db, 'resultFacts', this.resultFacts)
    }

    /** save jobs to db */
    private async feedJobsDb() {
        await this.manageDb(
            this.dbsNames.jobs, 
            async (db: Db) => {
                await this.saveJobs(db)

                const factsConnector = new Connector(this.dbsNames.facts, this.host, this.port)
                await factsConnector.manageDb( async (db) => await this.saveSourceFacts(db), false)
                await factsConnector.manageDb( async (db) => await this.saveResultFacts(db), false)
            }
        )
    }

    private async saveJobs(db: Db) {
        const jobs: JobsDb.Job[] = []
                for (let i = 0; i < 100; i++) {
                    const imageFile = Util.random(this.imageFiles)
                    const metrics = (() => {
                        let m: PatientsDb.PatientMetrics
                        do {
                            m = Util.random(this.patientMetrics)
                        } while (m.patient != imageFile.patient)
                        return m
                    })()
                    const job: JobsDb.Job = {
                        status: JobsDb.JobStatus.DONE,
                        doctor: "doc1",
                        patient: metrics.patient,
                        patientMetrics: metrics._id!.toHexString(),
                        imageFile: imageFile._id!.toHexString(),
                        created: this.now,
                        updated: this.now
                    }
                    jobs.push(job)
                }

                await this.insertDocuments(jobs, db, 'jobs', this.jobs)
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
