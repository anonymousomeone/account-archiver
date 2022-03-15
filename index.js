const Archiver = require('./archiver/archiver.js')
const { token } = require('./config.json')

const archiver = new Archiver

archiver.login(token).then(() => {
    archiver.archiveChannel("883118469032316999").then((channel) => {
        // console.log(channel)
        console.log('done')
    })
})

