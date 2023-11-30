'use strict';
const { SlashCommandBuilder } = require('@discordjs/builders');
const remorse = require('../../modules/dice/5th/remorse');
const commandUpdate = require('../../modules/commandDatabaseUpdate');

module.exports = {
  data: getCommand(),
  async execute(interaction) {
    await interaction.deferReply();
    await commandUpdate(interaction);

    if (!interaction.isRepliable()) return 'notRepliable';

    return await remorse(interaction);
  }
};

function getCommand() {
  const command = new SlashCommandBuilder()
    .setName('remorse')
    .setDescription('Humanity Remorse roll. p239')


    .addStringOption(option => {
      option.setName("name")
        .setDescription("Name of the character making the roll. " +
          'Must be a sheet character.')
        .setMaxLength(50)
      return option;
    })


    .addStringOption(option => {
      option.setName("notes")
        .setDescription("Any extra information you would like to include about this roll.")
        .setMaxLength(300)
      return option;
    })

  return command;
}
