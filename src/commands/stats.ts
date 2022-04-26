import { SlashCommandBuilder } from "@discordjs/builders";
import Discord, { MessageEmbed } from "discord.js";
import { ICommand } from "..";
import { getStats } from "../api";

export default {
  data: new SlashCommandBuilder().setName("stats").setDescription("Show backend stats"),
  execute: async (interaction: Discord.CommandInteraction) =>
    getStats().then((stats) =>
      interaction.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`Xornet Status`)
            .setColor(`#32B5FF`)
            .setThumbnail("https://cdn.discordapp.com/attachments/755597803102928966/968508800711675934/unknown.png")
            .addField("Ping", stats.ping)
            .addField("Uptime", stats.uptime)
            .addField("CPU", stats.cpu)
            .addField("RAM", stats.ram)
            .addField("Shard", stats.shard),
        ],
      })
    ),
} as ICommand;
