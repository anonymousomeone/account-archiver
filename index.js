const Archiver = require('./archiver/archiver.js')
const { token } = require('./config.json')

const archiver = new Archiver

archiver.initGui()
// archiver.login(token).then((client) => {
//     // archiver.archiveChannel("951532360065757217").then((channel) => {
//     //     console.log('done')
//     //     // process.exit(0)
//     // }).catch((err) => {
//     //     console.log(err)                                           
//     //     process.exit(1)
//     // })
//     archiver.archiveGuild('825144985484787772').then((guild) => {
//         console.log('done')
//     })
//     // archiver.archiveDMChannel('866356932293558302').then(() => {
//     //     console.log('done')
//     // })
// })
