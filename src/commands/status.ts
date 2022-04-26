import { SlashCommandBuilder } from "@discordjs/builders";
import Discord, { MessageEmbed } from "discord.js";
import { ICommand } from "..";

export default {
  data: new SlashCommandBuilder().setName("status").setDescription("Displays Bot Status"),
  execute: async (interaction: Discord.CommandInteraction, client: Discord.Client) =>
    interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`${client.user!.username}'s Status`)
          .setColor(`#32B5FF`)
          .addField("Bot", `\`🟢 ONLINE\` - \`${client.ws.ping}ms\``)
          .addField("Uptime", `<t:${parseInt((client.readyTimestamp! / 1000).toString())}:R>`),
      ],
    }),
} as ICommand;
