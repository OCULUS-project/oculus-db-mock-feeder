import {MongoClient, Db} from 'mongodb'
import {Feeder} from './feeder'

enum DbType {
    PATIENTS = 'oculus-patients-db', 
    IMAGES = 'oculus-images-db'
}

class Connector {
    static async connect(dbType: DbType, host: string, port: string) {
        const url = 'mongodb://' + host + ':' + port;
        const client = new MongoClient(url, {useNewUrlParser: true})

        console.log('feeding ' + dbType)
        await client.connect(async (err: Error) => {
            if (err) {
                console.log("connection error: " + err)
            } else {
                const db = client.db(dbType)
                console.log("connected to " + dbType)

                db.dropDatabase();
                await this.feed(dbType, db)
                client.close()
            }
        })
    }

    private static async feed(dbType: DbType, db: Db) {
        const feeder = new Feeder(db)
        switch (dbType) {
            case DbType.PATIENTS:
                await feeder.feedPatients()
                break
            case DbType.IMAGES:
                await feeder.feedImgs()
                break
        }
    }
}

// start the script
(() => {
    const dbType = DbType[<keyof typeof DbType> process.argv[2].toUpperCase()]
    const host = process.argv[3] != undefined ? process.argv[3] : 'localhost'
    const port = process.argv[4] != undefined ? process.argv[4] : '27017'
    
    Connector.connect(dbType, host, port)
})()
