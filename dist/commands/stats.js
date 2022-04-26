"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const api_1 = require("../api");
exports.command = {
    data: new builders_1.SlashCommandBuilder().setName("stats").setDescription("Show backend stats"),
    execute: async (interaction) => (0, api_1.getStats)().then((stats) => interaction.reply({
        embeds: [
            new discord_js_1.MessageEmbed()
                .setTitle(`Xornet Status`)
                .setColor(`#32B5FF`)
                .setThumbnail("https://cdn.discordapp.com/attachments/755597803102928966/968508800711675934/unknown.png")
                .addField("Ping", stats.ping)
                .addField("Uptime", stats.uptime)
                .addField("CPU", stats.cpu)
                .addField("RAM", stats.ram)
                .addField("Shard", stats.shard),
        ],
    })),
};
//# sourceMappingURL=stats.js.map