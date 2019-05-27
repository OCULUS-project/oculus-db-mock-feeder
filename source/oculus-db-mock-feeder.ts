import {MongoClient} from 'mongodb'
import {Feeder} from './feeder'

enum DbType {
    PATIENTS = 'oculus-patients-db', 
    IMAGES = 'oculus-images-db'
}

class Connector {
    static async connect(dbType: DbType) {
        const url = 'mongodb://' + host + ':' + port;
        const client = new MongoClient(url, {useNewUrlParser: true})

        console.log('feeding ' + dbType)
        await client.connect(async (err: Error) => {
            if (err) {
                console.log("connection error: " + err)
            } else {
                const db = client.db(dbType)
                console.log("connected to " + dbType)

                const feeder = new Feeder(db)
                await this.feed(dbType, feeder)

                client.close()
            }
        })
    }

    private static async feed(dbType: DbType, feeder: Feeder) {
        switch (dbType) {
            case DbType.PATIENTS:
                feeder.feedPatients()
                break
            case DbType.IMAGES:
                feeder.feedImgs()
                break
        }
    }
}

const dbType = DbType[<keyof typeof DbType> process.argv[2].toUpperCase()]
const host = process.argv[3] != undefined ? process.argv[3] : 'localhost'
const port = process.argv[4] != undefined ? process.argv[4] : '27017'

// start the script
Connector.connect(dbType)


