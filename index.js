const Archiver = require('./archiver/archiver.js')
const { token } = require('./config.json')

const archiver = new Archiver

archiver.login(token).then(() => {
    archiver.archiveChannel("897285324189884447").then((channel) => {
        // console.log(channel)
        console.log('done')
    }).catch((err) => {
        console.log(err)
        process.exit(1)
    })
})

