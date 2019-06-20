# oculus-db-mock-feeder
The script that feeds all OCULUS databases with mocked data. All the data is valid, models real-life scenarios and is consistent between collections.

Additionaly the file `scripts/models.ts` contains interfaces for all data models used in the system.

In `scripts` directory there are bash scripts for provisioning filesytem data.

In `data` directory there are static files like images for images-db or jsons for mocking mongo.

## build & run
to install all dependencies type: `npm install`

to build and run the script type: `npm start <mongo-host> <mongo-port>`

to run without new build type: `npm run go <mongo-host> <mongo-port>`

example: `npm start 192.168.1.251 2500`
