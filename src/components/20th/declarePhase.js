"use strict";
require(`${process.cwd()}/alias`);
const { ComponentCID } = require("@constants");
const { RealmError, ErrorCodes } = require("@errors");
const API = require("@api");
const checkPerms = require("@modules/Initiative/checkButtonPerm");

module.exports = {
  name: ComponentCID.INIT_DECLARE,
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const tracker = await API.getInitTracker(interaction.channelId);
    if (!tracker)
      throw new RealmError({
        code: ErrorCodes.InitNoTracker,
        cause: "pressed declare action button",
      });
    await checkPerms(interaction, tracker);
    return await tracker.declarePhase(interaction);
  },
};
