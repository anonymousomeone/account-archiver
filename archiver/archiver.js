const { channel } = require('diagnostics_channel')
const { Client } = require('discord.js')
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
                resolve()
            })
        })
    }
    getMessages(channel, msgid) {
        return new Promise(async (resolve, reject) => {
            var arr = []
            async function recurse(id) {
                var messages = []
                channel.fetchMessages({"before": id}).then((m) => {
                    for (var [k, v] of m) {
                        messages.push(v)
                    }
                })
                arr.push(messages)
                if (messages.length != 50) {
                    return;
                } else {
                    await sleep(200)
                    recurse(messages[messages.length].id)
                }
            }
            await recurse(msgid)
            resolve(arr)
        })
    }
    archiveChannel(id) {
        var channel;
        for (var [k, v] of this.client.channels) {
            if (k == id) {
                channel = v
            }
        }
        console.log(channel)
        channel.fetchMessages().then((m) => {
            var id = 0;
            for (var [k, v] of m) {
                id = v.id
            }
            this.getMessages(id).then((messages) => {
                console.log(messages)
            })
        })
    }
}

module.exports = Archiver