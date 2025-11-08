module.exports.config = {
    name: "approve",
    version: "1.0.2",
    hasPermssion: 2,
    credits: "rX",
    description: "Approve the GC using bot",
    commandCategory: "Admin",
    cooldowns: 5
};

const fs = require("fs");
const dataPath = __dirname + "/rx/approvedThreads.json";
const dataPending = __dirname + "/rx/pendingdThreads.json";

module.exports.onLoad = () => {
    if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify([]));
    if (!fs.existsSync(dataPending)) fs.writeFileSync(dataPending, JSON.stringify([]));
};

module.exports.handleReply = async function({ event, api, handleReply, args, Users }) {
    if (handleReply.author != event.senderID) return;
    const { body, threadID, messageID } = event;
    let data = JSON.parse(fs.readFileSync(dataPath));
    let dataP = JSON.parse(fs.readFileSync(dataPending));
    let idBox = (args[0]) ? args[0] : threadID;

    switch (handleReply.type) {
        case "pending":
            if (body.toUpperCase() === "A") {
                if (!data.includes(idBox)) data.push(idBox);
                fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
                dataP.splice(dataP.indexOf(idBox), 1);
                fs.writeFileSync(dataPending, JSON.stringify(dataP, null, 2));
                api.sendMessage(`✅ Successfully approved the box:\n${idBox}`, threadID, messageID);
            }
            break;
    }
};

module.exports.run = async function({ event, api, args, Users }) {
    const { threadID, messageID } = event;
    let data = JSON.parse(fs.readFileSync(dataPath));
    let dataP = JSON.parse(fs.readFileSync(dataPending));
    let idBox = (args[0]) ? args[0] : threadID;

    // LIST APPROVED
    if (args[0] === "list" || args[0] === "l") {
        let msg = `=====「 GC THAT HAD BEEN APPROVED: ${data.length} 」=====\n`;
        let count = 0;
        for (const e of data) {
            const threadInfo = await api.getThreadInfo(e);
            const threadName = threadInfo.threadName || await Users.getNameUser(e);
            msg += `\n〘${++count}〙 » ${threadName}\n${e}`;
        }
        return api.sendMessage(msg, threadID, messageID);
    }

    // LIST PENDING
    if (args[0] === "pending" || args[0] === "p") {
        let msg = `=====「 THREADS NEED TO BE APPROVE: ${dataP.length} 」=====\n`;
        let count = 0;
        for (const e of dataP) {
            const threadInfo = await api.getThreadInfo(e);
            const threadName = threadInfo.threadName || await Users.getNameUser(e);
            msg += `\n〘${++count}〙 » ${threadName}\n${e}`;
        }
        return api.sendMessage(msg, threadID, messageID);
    }

    // DELETE APPROVED
    if (args[0] === "del" || args[0] === "d") {
        idBox = args[1] ? args[1] : threadID;
        if (!data.includes(idBox)) return api.sendMessage("[ ERR ] Box is not pre-approved!", threadID, messageID);
        data.splice(data.indexOf(idBox), 1);
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return api.sendMessage(`[ OK ] Box removed successfully:\n${idBox}`, threadID, messageID);
    }

    // APPROVE NEW GROUP
    if (data.includes(idBox)) {
        return api.sendMessage(`[ - ] ID ${idBox} is already pre-approved!`, threadID, messageID);
    } else {
        api.sendMessage({
            body: `🌸 Maria Bot Connected Successfully! 🌸\nUse !help to see all available commands!`
        }, idBox, () => {
            // Approved list update
            data.push(idBox);
            fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

            // Pending list থেকে remove
            if (dataP.includes(idBox)) {
                dataP.splice(dataP.indexOf(idBox), 1);
                fs.writeFileSync(dataPending, JSON.stringify(dataP, null, 2));
            }

            // Nickname change আগের মতো রাখছি
            api.changeNickname(` ${(!global.config.BOTNAME) ? "" : global.config.BOTNAME}`, idBox, global.data.botID);
        });
    }
};
