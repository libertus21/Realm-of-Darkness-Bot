"use strict";
require(`${process.cwd()}/alias`);
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { handleErrorDebug } = require("@errors");
const {
  Client,
  GatewayIntentBits,
  Collection,
  Partials,
} = require("discord.js");

// Load environment variables
dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
  partials: [Partials.GuildMember, Partials.User],
});

/* Loading Commands in Client */
client.commands = new Collection();
const commandsPath = path.join(process.cwd(), "commands/cod");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
for (const file of commandFiles) {
  const command = require("@commands/cod/" + file);
  client.commands.set(command.data.name, command);
}

/* Event Listeners */
const eventsPath = path.join(process.cwd(), "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
for (const file of eventFiles) {
  const event = require("@events/" + file);
  if (event.once) {
    client.once(event.name, async (...args) => {
      try {
        await event.execute(...args);
      } catch (error) {
        const err = error;
        await handleErrorDebug(err, client);
      }
    });
  } else {
    client.on(event.name, async (...args) => {
      try {
        await event.execute(...args);
      } catch (error) {
        const err = error;
        await handleErrorDebug(err, client);
      }
    });
  }
}

// Logs into the server using the environment variable
client.login(process.env.TOKEN_COD);
