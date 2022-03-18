class Parse {
    constructor() {
        // w
    }
    parseMessages(messages) {
        // custom json structure since discord circular structure 🤢🤮
        let arr = []
        for (var i = 0 ; i < messages.length; i++) {
            if (messages[i].embeds[0]) {
                // yeah dont overwrite i
                for (var x = 0; x < messages[i].embeds.length; x++) {
                    const json = {
                        url: messages[i].embeds[x].url
                    }
                    // asdf
                    messages[i].embeds[x] = json
                }
            }
            // debugger
            const json = {
                "id": messages[i].id,
                "type": messages[i].type,
                "content": messages[i].content,
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
    parseChannel(channel) {
        var members = []
        // why isnt it channel.members for both ?
        for (var [k, v] of channel.members) {
            delete v.user.settings
            v.user.avatar = `https://cdn.discordapp.com/avatars/${v.user.id}/${v.user.avatar}.webp`
            members.push(v.user)
        }

        var json = {
            "id": channel.id,
            "name": channel.name,
            "icon": channel.icon,
            "members": members,
            "parentID": channel.parentID,
        }
        return json
    }
    parseDMChannel(channel) {
        var recipient = channel.recipient
        delete recipient.settings
        recipient.avatar = `https://cdn.discordapp.com/avatars/${recipient.id}/${recipient.avatar}.webp`

        var json = {
            "id": channel.id,
            "name": channel.name,
            "icon": channel.icon,
            "recipient": recipient,
        }
        return json
    }
    parseGroupChannel(channel) {
        var recipients = []
        for (var [k, v] of channel.recipients) {
            delete v.settings
            v.avatar = `https://cdn.discordapp.com/avatars/${v.id}/${v.avatar}.webp`
            recipients.push(v)
        }
        var json = {
            "id": channel.id,
            "name": channel.name,
            "icon": channel.icon,
            "recipients": recipients,
        }
        return json
    }
    parseGuild(channel) {
        var emojis = []
        for (var [k, v] of channel.guild.emojis) {
            const emoji = {
                id: v.id,
                name: v.name,
                url: `https://cdn.discordapp.com/emojis/${v.id}.webp`,
                animated: v.animated
            }
            emojis.push(emoji)
        }
        var members = []
        for (var [k, v] of channel.guild.members) {
            v.user = v.user.id
            v.avatar = `https://cdn.discordapp.com/avatars/${v.user.id}/${v.user.avatar}.webp`
            members.push(v)
        }
        const json = {
            "members": members,
            "emojis": emojis,
            "id": channel.guild.id,

        }
        return json
    }
}
module.exports = Parse