"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
exports.command = {
    data: new builders_1.SlashCommandBuilder().setName("status").setDescription("Displays Bot Status"),
    execute: async (interaction, client) => interaction.reply({
        embeds: [
            new discord_js_1.MessageEmbed()
                .setTitle(`${client.user.username}'s Status`)
                .setColor(`#32B5FF`)
                .addField("Bot", `\`🟢 ONLINE\` - \`${client.ws.ping}ms\``)
                .addField("Uptime", `<t:${parseInt((client.readyTimestamp / 1000).toString())}:R>`),
        ],
    }),
};
//# sourceMappingURL=status.js.map