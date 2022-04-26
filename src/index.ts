require("dotenv").config();
import { REST } from "@discordjs/rest";
import chalk from "chalk";
import Discord, { Intents, PresenceStatusData } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Routes } from "discord-api-types/v10";
import fs from "node:fs";
import { getStats } from "./api";

class Bot extends Discord.Client {
  public static APPLICATION_ID = "942200099801538600";
  public commandHandler: CommandHandler = new CommandHandler(this);
  private iterator = 0;
  constructor() {
    super({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING,
      ],
    });
    this.on("ready", () => {
      console.log(`Bot logged in as ${this.user?.username}#${this.user?.discriminator}`);
      this.commandHandler.submitSlashCommands(Array.from(this.guilds.cache.values()));
      setInterval(() => {
        getStats()
          .then((stats) => {
            this.user!.setPresence({
              activities: [
                {
                  name: (() => {
                    switch (this.iterator) {
                      case 0:
                        return stats.ping;
                      case 1:
                        return stats.uptime;
                      case 2:
                        return stats.cpu;
                      case 3:
                        return stats.ram;
                      default:
                        return "Your mom";
                    }
                  })(),
                },
              ],
              status: (stats.ping_raw <= 100 ? "online" : "idle") as PresenceStatusData,
            });
          })
          .catch(() => {
            this.user!.setPresence({
              activities: [{ name: "Backend Down" }],
              status: "dnd",
            });
          });
      }, 5000);
      setInterval(() => {
        this.iterator >= 3 ? (this.iterator = 0) : this.iterator++;
      }, 10000);
    });

    this.on("interactionCreate", (interaction) => {
      if (!interaction.isCommand()) return;
      this.commandHandler.parseCommand(interaction);
    });

    this.login(process.env.DISCORD_TOKEN);
  }
}

class CommandHandler {
  public commands: Discord.Collection<string, { data: SlashCommandBuilder; execute: (interaction: Discord.CommandInteraction, client: Discord.Client) => any | Promise<any> }> = new Discord.Collection();

  constructor(public client: Discord.Client) {
    this.registerCommands(this.getCommandFiles("./commands"));
  }

  public getCommandFiles(directory: string, commands: string[] = []) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
      const path = `${directory}/${file}`;
      if (file.endsWith(".js")) {
        console.log(`${chalk.blue("[COMMAND.FOUND]")} Loading ${file}`);
        commands.push(file);
      } else if (fs.statSync(path).isDirectory()) {
        console.log(`${chalk.blue("[COMMAND.FOUND]")} Loading Folder: ${path}`);
        this.getCommandFiles(path, commands);
      }
    }

    return commands;
  }

  public registerCommands(paths: string[]) {
    for (let i = 0; i < paths.length; i++) {
      this.registerCommand(paths[i]);
    }
  }

  public registerCommand(targetPath: string) {
    const { command } = require(`./commands/${targetPath}`);
    this.commands.set(command.data.name, command);
  }

  public async registerGuildSlashCommand(guildId: string) {
    const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);
    const slashCommands = this.commands.map((command) => command.data.toJSON());
    try {
      await rest.put(Routes.applicationGuildCommands(Bot.APPLICATION_ID, guildId), { body: slashCommands });
    } catch (error) {
      console.error(error);
    }
    console.log(`${chalk.blue("[SLASH.REGISTER]")} Registered Guild: ${guildId}`);
  }

  public async submitSlashCommands(guilds: Discord.Guild[]) {
    return Promise.all(guilds.map((guild) => this.registerGuildSlashCommand(guild.id)));
  }

  async parseCommand(interaction: Discord.CommandInteraction) {
    if (interaction.user.bot) return;
    const command = this.commands.get(interaction.commandName);
    if (!command) return;
    command.execute(interaction, this.client);
  }
}

new Bot();
