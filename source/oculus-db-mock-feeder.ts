import {MongoClient, Db} from 'mongodb'
import {Feeder} from './feeder'

enum DbType {
    PATIENTS = 'oculus-patients-db', 
    IMAGES = 'oculus-images-db'
}

class Connector {
    private readonly client: MongoClient

    constructor(
        private readonly dbType: DbType, 
        host: string, 
        port: string
    ) {
        const url = 'mongodb://' + host + ':' + port;
        this.client = new MongoClient(url, {useNewUrlParser: true})
    }

    async connect() {
        await this.client.connect(async (err: Error) => { await this.connectAction(err) } )
    }

    private async connectAction(err: Error, connector: Connector = this) {
        if (err) {
            console.log("connection error: " + err)
        } else {
            console.log("connected to " + connector.dbType)
            const db = connector.client.db(connector.dbType)

            console.log('feeding ' + connector.dbType)
            db.dropDatabase();
            await connector.feed(db)
            connector.client.close()
        }
    }

    private async feed(db: Db) {
        const feeder = new Feeder(db)
        switch (this.dbType) {
            case DbType.PATIENTS:
                await feeder.feedPatientsDb()
                break
            case DbType.IMAGES:
                await feeder.feedImagesDb()
                break
        }
    }
}

// start the script
(async () => {
    const dbType = DbType[<keyof typeof DbType> process.argv[2].toUpperCase()]
    const host = process.argv[3] != undefined ? process.argv[3] : 'localhost'
    const port = process.argv[4] != undefined ? process.argv[4] : '27017'
    
    await new Connector(dbType, host, port).connect()
})()
