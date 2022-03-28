class Parse {
    parseMessages(messages) {
        // custom json structure since discord circular structure 🤢🤮
        let arr = []
        for (var i = 0 ; i < messages.length; i++) {
            if (messages[i].embeds[0]) {
                // yeah dont overwrite i
                for (var x = 0; x < messages[i].embeds.length; x++) {
                    var embed = messages[i].embeds[x]
                    var jmbed = {}
                    try {
                        if (embed.type == 'video') {
                            jmbed = {
                                "type": embed.type,
                                "title": embed.title,
                                "url": embed.url,
                                "thumbnail": embed.thumbnail.url,
                                "video": {
                                    "height": embed.video.height,
                                    "width": embed.video.width
                                }
                            }
                        } else if (embed.type == 'gifv') {
                            jmbed = {
                                "type": embed.type,
                                "url": embed.url,
                                "video": {
                                    "height": embed.video.height,
                                    "width": embed.video.width,
                                    "url": embed.video.url
                                }
                            }
                        } else if (embed.type == 'image') {
                            jmbed = {
                                "type": embed.type,
                                "url": embed.url
                            }
                        }
                    } catch(err) {
                        console.log(err)
                        jmbed = null
                    }
                    // console.log(messages[i].embeds[x])
                    // asdf
                    messages[i].embeds[x] = jmbed
                }
            }
            // debugger
            const json = {
                "id": messages[i].id,
                "type": messages[i].type,
                "authorID": messages[i].author.id,
                "content": messages[i].content,
                "reactions": messages[i].reactions,
                "attachments": messages[i].attachments,
                "embeds": messages[i].embeds,
                "createdTimestamp": messages[i].createdTimestamp,
                "pinned": messages[i].pinned,
            }
            arr.push(json)
        }
        return arr
    }
    parseChannel(channel) {
        var members = []
        // why isnt it channel.members for both ?
        for (var [k, v] of channel.members) {
            if (v.user == String) v.avatar = null
            else v.avatar = v.avatarURL
            if (!v.user) v.userid = null
            else v.user = v.id

            members.push(v)
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
            "name": channel.name,
            "id": channel.id,
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
            "name": channel.name,
            "id": channel.id,
            "icon": `https://cdn.discordapp.com/channel-icons/${channel.id}/${channel.icon}.webp`,
            "recipients": recipients,
        }
        return json
    }
    parseGuild(guild) {
        var emojis = []
        for (var [k, v] of guild.emojis) {
            const emoji = {
                id: v.id,
                name: v.name,
                url: `https://cdn.discordapp.com/emojis/${v.id}.webp`,
                animated: v.animated
            }
            emojis.push(emoji)
        }
        var members = []
        for (var [k, v] of guild.members) {
            const user = {
                "tag": v.user.tag,
                "id": v.user.id,
                "avatar": v.user.avatar = `https://cdn.discordapp.com/avatars/${v.user.id}/${v.user.avatar}.webp`,
                "note": v.user.note,
                "bot": v.user.bot,
                "createdAt": v.user.createdAt,
                "presence": v.user.presence,
            }
            members.push(user)
        }

        var roles = []
        for (var [k, v] of guild.roles) {
            var member = []
            for (var [key, val] of v.members) {
                delete val.user.settings
                member.push(val.user)
            }
            const role = {
                "name": v.name,
                "id": v.id,
                "members": member,
                "hexColor": v.hexColor,
            }
            roles.push(role)
        }
        const json = {
            "name": guild.name,
            "id": guild.id,
            "icon": guild.icon,
            "members": members,
            "emojis": emojis,
            "roles": roles,
        }
        return json
    }
}
module.exports = Parse