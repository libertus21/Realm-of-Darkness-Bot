/**
 * Vampire: The Masquerade 20th Anniversary Edition Discord Bot
 *
 * This bot handles commands and interactions for the V20 game system,
 * providing dice rolling, character management, and other utilities.
 */
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

// Determine environment and source directory
const runningFromDist = process.env.NODE_ENV === "production";
const srcDir = runningFromDist ? "dist" : "src";

// Initialize Discord client with required intents and partials
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.GuildMember, Partials.User],
});

/* Loading Commands in Client */
client.commands = new Collection();
const commandsPath = path.join(process.cwd(), srcDir, "commands/20th");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

console.log(`Loading ${commandFiles.length} commands for V20 bot...`);
for (const file of commandFiles) {
  try {
    const command = require(`@commands/20th/${file}`);
    if (command.data && command.data.name) {
      client.commands.set(command.data.name, command);
    } else {
      console.warn(`Command ${file} is missing required properties`);
    }
  } catch (error) {
    console.error(`Failed to load command ${file}:`, error);
  }
}

/* Loading Component Events in Client */
client.components = new Collection();
const componentsPath = path.join(process.cwd(), srcDir, "components/20th");

// Check if components directory exists before trying to read it
if (fs.existsSync(componentsPath)) {
  const componentFiles = fs
    .readdirSync(componentsPath)
    .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

  console.log(`Loading ${componentFiles.length} components for V20 bot...`);
  for (const file of componentFiles) {
    try {
      const component = require(`@components/20th/${file}`);
      if (component.name) {
        client.components.set(component.name, component);
      } else {
        console.warn(`Component ${file} is missing a name property`);
      }
    } catch (error) {
      console.error(`Failed to load component ${file}:`, error);
    }
  }
} else {
  console.warn(`Components directory not found: ${componentsPath}`);
}

/* Event Listeners */
const eventsPath = path.join(process.cwd(), srcDir, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

console.log(`Loading ${eventFiles.length} events for V20 bot...`);
for (const file of eventFiles) {
  try {
    const event = require(`@events/${file}`);
    if (event.name) {
      if (event.once) {
        client.once(event.name, async (...args) => {
          try {
            await event.execute(...args);
          } catch (error) {
            await handleErrorDebug(error, client);
          }
        });
      } else {
        client.on(event.name, async (...args) => {
          try {
            await event.execute(...args);
          } catch (error) {
            await handleErrorDebug(error, client);
          }
        });
      }
    } else {
      console.warn(`Event ${file} is missing a name property`);
    }
  } catch (error) {
    console.error(`Failed to load event ${file}:`, error);
  }
}

// Signal successful initialization
client.on("ready", () => {
  console.log(`V20 Bot logged in as ${client.user.tag}`);
});

// Log in to Discord using token from environment variables
client.login(process.env.TOKEN_20TH).catch((error) => {
  console.error("Failed to log in to Discord:", error);
  process.exit(1);
});
