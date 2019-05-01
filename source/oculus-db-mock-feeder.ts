import { MongoClient } from 'mongodb'
import { Feeder } from './feeder'

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
   
    const feeder = new Feeder(db)
    await feeder.feedJobs()

    console.log('done')
    client.close()
  }
})
