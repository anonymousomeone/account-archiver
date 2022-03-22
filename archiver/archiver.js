const { Client } = require('discord.js')
const Parse = require('./parse.js')
const fs = require('fs')

class Archiver extends Parse {
    constructor() {
        super()
        this.client = new Client()
    }
    sleep(ms) { return new Promise( res => setTimeout(res, ms)) }
    login(token) {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync('./account/guilds') || !fs.existsSync('./account/dms')) this.createFileStructure()
            this.client.login(token).then(() => {
                console.log(`Archiver ready! Logged in as: ${this.client.user.tag}`)
                resolve(this.client)
            })
        })
    }
    getMessages(channel) {
        return new Promise(async (resolve, reject) => {
            function sleep(ms) {
                 return new Promise( res => setTimeout(res, ms)) 
            }

            var arr = []
            channel.fetchMessages({limit: 1}).then((m) => {
                var id = 0;
                for (var [k, v] of m) {
                    id = v.id
                    arr.push(v)
                }
                recurse(id)
            })
            function recurse(id) {
                channel.fetchMessages({"before": id}).then(async (m) => {
                    var msgs = 0;
                    for (var [k, v] of m) {
                        arr.push(v)
                        msgs++
                    }
                    if (msgs != 50) {
                        process.stdout.write(`${arr.length} / ${arr.length} Messages\n`)
                        resolve(arr)
                    } else {
                        process.stdout.write(`${arr.length} / ? Messages\r`)
                        // this is the fastest you can go, right?
                        await sleep(100)
                        recurse(arr[arr.length - 1].id)
                    }
                })
            }
        })
    }
    archiveChannel(id) {
        return new Promise((resolve, reject) => {
            var channel;
            for (var [k, v] of this.client.channels) {
                if (k == id) {
                    channel = v
                }
            }
            if (!channel) throw new Error('channel not found!')

            console.log(`Archiving channel "${channel.name}" (${channel.id})`)

            if (channel.type != 'text') reject('channel not archivable!')

            var path = `./account/guilds/${channel.guild.id}/`
            if (!fs.existsSync(path)) fs.mkdirSync(path)
            path += `${channel.id}/`
            if (!fs.existsSync(path)) fs.mkdirSync(path)

            fs.writeFileSync(path + 'channel.json', JSON.stringify(this.parseChannel(channel), null, 2))

            this.getMessages(channel).then((messages) => {
                fs.writeFileSync(path + 'messages.json', JSON.stringify(this.parseMessages(messages), null, 2))
                resolve(channel)
            })
        })
    }
    archiveDMChannel(id) {
        return new Promise((resolve, reject) => {
            var channel;
            for (var [k, v] of this.client.channels) {
                if (k == id) {
                    channel = v
                }
            }
            if (!channel) reject('channel not found!')
            
            if (channel.type != 'dm' && channel.type != 'group') reject('use archiveChannel()')

            // hehehehaw
            if (!channel.name && channel.type == 'group') channel.name = channel.recipients.entries().next().value[1].username
            if (!channel.name && channel.type == 'dm') channel.name = channel.recipient.username

            console.log(`Archiving channel "${channel.name}" (${channel.id})`)

            console.log(channel)

            var path = `./account/dms/${channel.id}/`
            if (!fs.existsSync(path)) fs.mkdirSync(path)

            if (channel.type == 'dm') {
                fs.writeFileSync(path + 'channel.json', JSON.stringify(this.parseDMChannel(channel), null, 2))
            } else {
                fs.writeFileSync(path + 'channel.json', JSON.stringify(this.parseGroupChannel(channel), null, 2))
            }
            this.getMessages(channel).then((messages) => {
                fs.writeFileSync(path + 'messages.json', JSON.stringify(this.parseMessages(messages), null, 2))
                resolve(channel)
            })
        })
    }
    archiveGuild(id) {
        return new Promise((resolve, reject) => {
            var guild
            for (var [k, v] of this.client.guilds) {
                if (k == id) {
                    guild = v
                }
            }
            if (!guild) reject('guild not found!')

            console.log(`Archiving guild "${guild.name}" (${guild.id})`)

            var path = `./account/guilds/${guild.id}/`
            if (!fs.existsSync(path)) fs.mkdirSync(path)

            fs.writeFileSync(path + 'guild.json', JSON.stringify(this.parseGuild(guild), null, 2))

            resolve(guild)
        })
    }
    createFileStructure() {
        if (!fs.existsSync('./account')) fs.mkdirSync('./account')
        if (!fs.existsSync('./account/guilds')) fs.mkdirSync('./account/guilds')
        if (!fs.existsSync('./account/dms')) fs.mkdirSync('./account/dms')
    }
}

module.exports = Archiver