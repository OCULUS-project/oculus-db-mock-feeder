# oculus-db-mock-feeder
The script that feeds all OCULUS databases with mocked data. All the data is valid and models real-life scenarios.

Additionaly the file `scripts/models.ts` contains interfaces for all data models used in the system.

In `scripts` directory there are bash scripts for provisioning filesytem data.

In `data` directory there are static files like images for images-db or jsons for mocking mongo.

## build & run
to install all dependencies type: `npm install`

to build and run the script type: `npm start <db-to-feed> <mongo-host> <mongo-port>`

to run without new build type: `npm run go <db-to-feed> <mongo-host> <mongo-port>`

example: `npm start patients 192.168.1.251 2500`
