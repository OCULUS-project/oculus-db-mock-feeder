import { MongoClient, Db } from 'mongodb'
import { Util } from './util';

export class Connector {
    private readonly url: string

    constructor(
        private readonly dbName: string,
        host: string, 
        port: string
    ) {
        this.url = 'mongodb://' + host + ':' + port;
    }

    public async manageDb(action: (db: Db) => void, onEmptyDb: boolean = true) {
        let client = new MongoClient(this.url, {useNewUrlParser: true})
        let connection = client.connect()
        await connection.then(
            async (client: MongoClient) => await this.onConnected(client, action, onEmptyDb),
            (reason: any) => this.onFailure(reason)
        )
    }

    private async onConnected(client: MongoClient, action: (db: Db) => void, onEmptyDb: boolean) {
        const db = this.getDb(client, onEmptyDb)
        await action(db)
        client.close()
    }

    private getDb(client: MongoClient, empty: boolean): Db {
        const db = client.db(this.dbName)
        Util.log("connected to " + db.databaseName)
        
        if (empty) {
            db.dropDatabase()
            Util.log("dropped " + db.databaseName)
        }

        return db
    }

    private onFailure(reason: any) {
        Util.log("could not connect to " + this.dbName + "\n\treason " + reason)
    }
}
