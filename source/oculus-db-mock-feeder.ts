import {Feeder} from './feeder'

(async () => {
    const host = process.argv[2] != undefined ? process.argv[2] : 'localhost'
    const port = process.argv[3] != undefined ? process.argv[3] : '27017'

    const feeder = new Feeder(host, port)
    await feeder.start()
})()
