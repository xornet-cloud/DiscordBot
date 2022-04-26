import "dotenv/config";
import { REST } from "@discordjs/rest";
import chalk from "chalk";
import Discord, { Intents, PresenceStatusData } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Routes } from "discord-api-types/v10";
import { getStats } from "./api";
import status from "./commands/status";
import stats from "./commands/status";

export interface ICommand {
  data: SlashCommandBuilder;
  execute: (interaction: Discord.CommandInteraction, client: Discord.Client) => any | Promise<any>;
}

class Bot extends Discord.Client {
  public static APPLICATION_ID = process.env.APPLICATION_ID!;
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
  public commands: Discord.Collection<string, ICommand> = new Discord.Collection();

  constructor(public client: Discord.Client) {
    this.registerCommands([stats, status]);
  }

  public registerCommands(commands: ICommand[]) {
    for (let i = 0; i < commands.length; i++) {
      this.registerCommand(commands[i]);
    }
  }

  public registerCommand(command: ICommand) {
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
