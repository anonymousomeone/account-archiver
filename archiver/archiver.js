const { Client } = require('discord.js')
const fs = require('fs')
const { resolve } = require('path')

class Archiver {
    constructor() {
        this.client
    }
    sleep(ms) { return new Promise( res => setTimeout(res, ms)) }
    login(token) {
        return new Promise((resolve, reject) => {
            this.client = new Client
            this.client.login(token).then(() => {
                console.log(`Archiver ready! Logged in as: ${this.client.user.tag}`)
                resolve(this.client)
            })
        })
    }
    async getMessages(channel) {
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
            async function recurse(id) {
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
                        await sleep(200)
                        process.stdout.write(`${arr.length} / ? Messages\r`)
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
            
            // hehehehaw
            if (!channel.name && channel.type == 'group') channel.name = channel.recipients.entries().next().value[1].username
            if (!channel.name && channel.type == 'dm') channel.name = channel.recipient.username

            console.log(`Archiving channel "${channel.name}" (${channel.id})`)

            if (channel.type == 'voice' || channel.type == 'category') reject('channel not archivable!')

            if (!fs.existsSync('./account/guilds') || !fs.existsSync('./account/dms')) this.createFileStructure()


            var path = ``
            if (channel.type == 'group' || channel.type == 'dm') {
                path = `./account/dms/${channel.name}/`
            } else {
                path = `./account/guilds/${channel.guild.name}/${channel.name}/`
            }

            this.getMessages(channel).then((messages) => {
                if (!fs.existsSync(path)) fs.mkdirSync(path)
                fs.writeFileSync(path + 'messages.json', JSON.stringify(this.parse(messages), null, 2))
                resolve(channel)
            })
        })
    }
    parse(messages) {
        // custom json structure since discord circular structure 🤢🤮
        let arr = []
        for (var i = 0 ; i < messages.length; i++) {
            if (messages[i].embeds[0]) {
                // yeah dont overwrite i
                for (var x = 0; x < messages[i].embeds.length; x++) {
                    // why so many circles ???
                    console.log(messages[i].embeds[x])
                    delete messages[i].embeds[x].message
                    delete messages[i].embeds[x].thumbnail
                    delete messages[i].embeds[x].video.embed
                    delete messages[i].embeds[x].provider
                }
            }
            const json =   {
                "id": messages[i].id,
                "type": messages[i].type,
                "content": messages[i].content,
                "member": messages[i].member,
                "pinned": messages[i].pinned,
                "embeds": messages[i].embeds,
                "attachments": messages[i].attachments,
                "createdTimestamp": messages[i].createdTimestamp,
                "reactions": messages[i].reactions,
                "authorID": messages[i].author.id
            }
            arr.push(json)
        }
        return arr
    }
    createFileStructure() {
        if (!fs.existsSync('./account')) fs.mkdirSync('./account')
        if (!fs.existsSync('./account/guilds')) fs.mkdirSync('./account/guilds')
        if (!fs.existsSync('./account/dms')) fs.mkdirSync('./account/dms')
    }
}

module.exports = Archiver