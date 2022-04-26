import { SlashCommandBuilder } from "@discordjs/builders";
import Discord, { MessageEmbed } from "discord.js";
import { getStats, IBackendStatus } from "../api";
import { parseTime } from "../util";

export const command = {
  data: new SlashCommandBuilder().setName("stats").setDescription("Show backend stats"),
  execute: async (interaction: Discord.CommandInteraction) =>
    getStats().then((json: IBackendStatus) =>
      interaction.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`Xornet Status`)
            .setColor(`#32B5FF`)
            .setThumbnail("https://cdn.discordapp.com/attachments/755597803102928966/968508800711675934/unknown.png")
            .addField("Memory Total", `${~~json.memory.total} MB`)
            .addField("Memory Used", `${~~json.memory.used} MB`)
            .addField("CPU Usage", `${json.processor}%`)
            .addField("Uptime", `${parseTime(json.uptime)}`)
            .addField("Shard", `${json.shard}`),
        ],
      })
    ),
};
