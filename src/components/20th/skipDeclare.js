"use strict";
require(`${process.cwd()}/alias`);
const { MessageFlags } = require("discord.js");
const { ComponentCID } = require("@constants");
const { RealmError, ErrorCodes } = require("@errors");
const API = require("@api");
const checkPerms = require("@modules/Initiative/checkButtonPerm");

module.exports = {
  name: ComponentCID.INIT_SKIP,
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const tracker = await API.getInitTracker(interaction.channelId);
    if (!tracker)
      throw new RealmError({
        code: ErrorCodes.InitNoTracker,
        cause: "pressed skip action button",
      });
    await checkPerms(interaction, tracker);
    return await tracker.skipAction(interaction);
  },
};
