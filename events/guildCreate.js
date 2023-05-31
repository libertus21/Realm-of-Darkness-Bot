'use strict';
const { Events } = require('discord.js');
const setActivity = require('../modules/setActivity');
const API = require('../realmAPI');
const RealmError = require('../Errors/RealmError');
const { handleErrorDebug } = require('../Errors/index');

module.exports = {
	name: Events.GuildCreate,
	once: false,
	async execute(guild) {		
		try
		{
			await setActivity(guild.client);
			await API.updateGuild(guild);
		}
		catch(error)
		{
			try
			{
				if (!error.discordResponse) // Not a RoD Error, we need to debug
				{
					const rodError = new RealmError({cause: error.stack});
					error.discordResponse = rodError.discordResponse;
					error.debug = rodError.debug;
				}
				await handleErrorDebug(error, guild.client);
			}
			catch (e)
			{
				console.error(`Error at guildCreate()`);
				console.error(e);
				console.error(`\n\nError that triggered this:`);
				console.error(error)
			}
		}
	},
};