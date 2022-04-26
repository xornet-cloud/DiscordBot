"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const rest_1 = require("@discordjs/rest");
const chalk_1 = __importDefault(require("chalk"));
const discord_js_1 = __importStar(require("discord.js"));
const v10_1 = require("discord-api-types/v10");
const node_fs_1 = __importDefault(require("node:fs"));
const api_1 = require("./api");
class Bot extends discord_js_1.default.Client {
    constructor() {
        super({
            intents: [
                discord_js_1.Intents.FLAGS.GUILDS,
                discord_js_1.Intents.FLAGS.GUILD_PRESENCES,
                discord_js_1.Intents.FLAGS.GUILD_MEMBERS,
                discord_js_1.Intents.FLAGS.GUILD_MESSAGES,
                discord_js_1.Intents.FLAGS.GUILD_VOICE_STATES,
                discord_js_1.Intents.FLAGS.DIRECT_MESSAGES,
                discord_js_1.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
                discord_js_1.Intents.FLAGS.DIRECT_MESSAGE_TYPING,
            ],
        });
        this.commandHandler = new CommandHandler(this);
        this.iterator = 0;
        this.on("ready", () => {
            var _a, _b;
            console.log(`Bot logged in as ${(_a = this.user) === null || _a === void 0 ? void 0 : _a.username}#${(_b = this.user) === null || _b === void 0 ? void 0 : _b.discriminator}`);
            this.commandHandler.submitSlashCommands(Array.from(this.guilds.cache.values()));
            setInterval(() => {
                (0, api_1.getStats)()
                    .then((stats) => {
                    this.user.setPresence({
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
                        status: (stats.ping_raw <= 100 ? "online" : "idle"),
                    });
                })
                    .catch(() => {
                    this.user.setPresence({
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
            if (!interaction.isCommand())
                return;
            this.commandHandler.parseCommand(interaction);
        });
        this.login(process.env.DISCORD_TOKEN);
    }
}
Bot.APPLICATION_ID = "942200099801538600";
class CommandHandler {
    constructor(client) {
        this.client = client;
        this.commands = new discord_js_1.default.Collection();
        this.registerCommands(this.getCommandFiles("./commands"));
    }
    getCommandFiles(directory, commands = []) {
        const files = node_fs_1.default.readdirSync(directory);
        for (const file of files) {
            const path = `${directory}/${file}`;
            if (file.endsWith(".js")) {
                console.log(`${chalk_1.default.blue("[COMMAND.FOUND]")} Loading ${file}`);
                commands.push(file);
            }
            else if (node_fs_1.default.statSync(path).isDirectory()) {
                console.log(`${chalk_1.default.blue("[COMMAND.FOUND]")} Loading Folder: ${path}`);
                this.getCommandFiles(path, commands);
            }
        }
        return commands;
    }
    registerCommands(paths) {
        for (let i = 0; i < paths.length; i++) {
            this.registerCommand(paths[i]);
        }
    }
    registerCommand(targetPath) {
        const { command } = require(`/usr/app/dist/commands/${targetPath}`);
        this.commands.set(command.data.name, command);
    }
    async registerGuildSlashCommand(guildId) {
        const rest = new rest_1.REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
        const slashCommands = this.commands.map((command) => command.data.toJSON());
        try {
            await rest.put(v10_1.Routes.applicationGuildCommands(Bot.APPLICATION_ID, guildId), { body: slashCommands });
        }
        catch (error) {
            console.error(error);
        }
        console.log(`${chalk_1.default.blue("[SLASH.REGISTER]")} Registered Guild: ${guildId}`);
    }
    async submitSlashCommands(guilds) {
        return Promise.all(guilds.map((guild) => this.registerGuildSlashCommand(guild.id)));
    }
    async parseCommand(interaction) {
        if (interaction.user.bot)
            return;
        const command = this.commands.get(interaction.commandName);
        if (!command)
            return;
        command.execute(interaction, this.client);
    }
}
new Bot();
//# sourceMappingURL=index.js.map