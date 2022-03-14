const { Client } = require('discord.js')
const beautify = require('json-beautify')
const fs = require('fs')

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
    async getMessages(channel, msgid) {
        return new Promise(async (resolve, reject) => {
            function sleep(ms) {
                 return new Promise( res => setTimeout(res, ms)) 
            }

            var arr = []
            async function recurse(id) {
                channel.fetchMessages({"before": id}).then(async (m) => {
                    var msgs = 0;
                    for (var [k, v] of m) {
                        arr.push(v)
                        msgs++
                    }
                    if (msgs != 50) {
                        resolve(arr)
                    } else {
                        await sleep(200)
                        process.stdout.write(`${arr.length} / ? Messages\r`)
                        recurse(arr[arr.length - 1].id)
                    }
                })
            }
            recurse(msgid)
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

            // when the circle is sus 😔
            const replacerFunc = () => {
                const visited = new WeakSet();
                return (key, value) => {
                    if (typeof value === "object" && value !== null) {
                        if (visited.has(value)) {
                        return;
                        }
                        visited.add(value);
                    }
                    return value;
                };
            };
            
            console.log(`Archiving "${channel.name}" (${channel.id})`)
            channel.fetchMessages({limit: 1}).then((m) => {
                var id = 0;
                for (var [k, v] of m) {
                    id = v.id
                }
                this.getMessages(channel, id).then((messages) => {
                    fs.writeFileSync('./messages.json', JSON.stringify(messages, replacerFunc(), 2))
                    resolve()
                })
            })
        })
    }
}

module.exports = Archiver