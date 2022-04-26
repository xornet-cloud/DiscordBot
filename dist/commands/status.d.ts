import { SlashCommandBuilder } from "@discordjs/builders";
import Discord from "discord.js";
export declare const command: {
    data: SlashCommandBuilder;
    execute: (interaction: Discord.CommandInteraction, client: Discord.Client) => Promise<void>;
};
