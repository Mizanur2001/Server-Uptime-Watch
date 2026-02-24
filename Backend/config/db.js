const mongoose = require('mongoose')

const dbURL = process.env.DATABASEURL

exports.Connectdb = () => {
    return new Promise((resolve, reject) => {
        if (!dbURL) {
            console.error('FATAL: DATABASEURL environment variable is not set!');
            process.exit(1);
        }

        mongoose.connect(dbURL, {
            // Security: automatically create indexes defined in schemas
            autoIndex: process.env.NODE_ENV !== 'production',
            // Connection timeouts
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        }).then(() => {
            console.log("db Connected")
            resolve(true)
        }).catch((error) => {
            console.error(`Unable to connect db -- ${error.message}`);
            reject(error)
            process.exit(-1)
        })
    })
}