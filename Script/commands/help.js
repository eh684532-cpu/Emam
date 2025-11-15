const fs = require("fs");
const path = require("path");
const request = require("request");

module.exports.config = {
  name: "help",
  version: "2.0.3",
  hasPermssion: 0,
  credits: "MOHAMMAD 𝐄𝐌𝐀𝐌",
  description: "Auto detects all commands and groups by category in styled format",
  commandCategory: "system",
  usages: "[command name]",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const commandDir = __dirname;
    const files = fs.readdirSync(commandDir).filter(f => f.endsWith(".js"));

    let commands = [];
    for (let file of files) {
      try {
        const cmd = require(path.join(commandDir, file));
        if (!cmd.config || !cmd.config.name) continue;
        commands.push({
          name: cmd.config.name,
          category: cmd.config.commandCategory || "other",
          description: cmd.config.description || "No description available.",
          author: cmd.config.credits || "Unknown",
          version: cmd.config.version || "N/A",
          usages: cmd.config.usages || "No usage info",
        });
      } catch (e) {
        console.error(`Error loading command from ${file}:`, e);
      }
    }

    // Fancy font map
    const fontMap = {
      A:"𝙰", B:"𝙱", C:"𝙲", D:"𝙳", E:"𝙴", F:"𝙵", G:"𝙶", H:"𝙷", I:"𝙸", J:"𝙹",
      K:"𝙺", L:"𝙻", M:"𝙼", N:"𝙽", O:"𝙾", P:"𝙿", Q:"𝚀", R:"𝚁", S:"𝚂",
      T:"𝚃", U:"𝚄", V:"𝚅", W:"𝚆", X:"𝚇", Y:"𝚈", Z:"𝚉",
      a:"𝚊", b:"𝚋", c:"𝚌", d:"𝚍", e:"𝚎", f:"𝚏", g:"𝚐", h:"𝚑", i:"𝚒", j:"𝚓",
      k:"𝚔", l:"𝚕", m:"𝚖", n:"𝚗", o:"𝚘", p:"𝚙", q:"𝚚", r:"𝚛", s:"𝚜",
      t:"𝚝", u:"𝚞", v:"𝚟", w:"𝚠", x:"𝚡", y:"𝚢", z:"𝚣"
    };
    const fancy = str => str.replace(/[A-Za-z]/g, c => fontMap[c] || c);

    // Normalize category (case-insensitive)
    const categories = {};
    for (let cmd of commands) {
      const normalizedCat = (cmd.category || "other").toLowerCase();
      if (!categories[normalizedCat]) categories[normalizedCat] = [];
      categories[normalizedCat].push(cmd.name);
    }

    // Capitalize function for display
    const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    // Random GIF links
    const gifs = [
      "https://i.imgur.com/3tBIaSF.gif",
      "https://i.imgur.com/vWl3Tb5.gif",
      "https://i.imgur.com/DYfouuR.gif"
    ];
    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

    // Build menu message
    let msg = `MIRAI MENU\n━━━━━━━━━━━━━━━━━━━\n\n`;

    const emojiMap = {
      "system": "⚙️", "fun": "🎯", "owner": "👑", "image": "🖼️",
      "admin": "🛡️", "tools": "🧰", "utility": "🔧", "ai": "🤖",
      "music": "🎵", "game": "🎮", "media": "🎬", "info": "ℹ️", "other": "📁"
    };

    const sortedCategories = Object.keys(categories).sort();
    for (const catKey of sortedCategories) {
      const displayName = capitalize(catKey);
      const emoji = emojiMap[catKey] || "📁";
      msg += `${emoji} 𝙲𝙰𝚃𝙴𝙶𝙾𝚁𝚈: ${fancy(displayName)}\n`;
      msg += categories[catKey].map(c => `🔹 ${fancy(c)}`).join("\n") + "\n\n";
    }

    msg += "━━━━━━━━━━━━━━━━━━━\n";
    msg += `💡 𝚃𝙸𝙿: 𝚄𝚂𝙴 "${global.config.PREFIX || "/"}help [command]" 𝚃𝙾 𝙶𝙴𝚃 𝙵𝚄𝙻𝙻 𝙳𝙴𝚃𝙰𝙸𝙻𝚂.\n`;
    msg += "🪄 𝙱𝙾𝚃 𝙱𝚈: 𝙼𝙾𝙷𝙰𝙼𝙼𝙰𝙳 𝐄𝐌𝐀𝐌 ✨";

    // Download and send GIF
    const imgPath = __dirname + "/cache/helppic.gif";
    const callback = () => api.sendMessage(
      { body: msg, attachment: fs.createReadStream(imgPath) },
      event.threadID,
      () => fs.unlinkSync(imgPath),
      event.messageID
    );

    request(randomGif)
      .pipe(fs.createWriteStream(imgPath))
      .on("close", callback)
      .on("error", (err) => {
        console.error("GIF download error:", err);
        api.sendMessage(msg, event.threadID, event.messageID); // Fallback: send text only
      });

  } catch (err) {
    console.error("Help command error:", err);
    api.sendMessage("❌ Error: " + err.message, event.threadID, event.messageID);
  }
};
