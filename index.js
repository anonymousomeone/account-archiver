const Archiver = require('./archiver/archiver.js')
const { token } = require('./config.json')

const archiver = new Archiver

archiver.login(token).then(() => {
    archiver.archiveChannel("935435926849613868").then((channel) => {
        // console.log(channel)
        console.log('done')
        // process.exit(0)
    }).catch((err) => {
        console.log(err)
        process.exit(1)
    })
})

