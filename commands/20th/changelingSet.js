"use strict";
const { SlashCommandBuilder } = require("@discordjs/builders");
const { Splats } = require("../../Constants");
const tracker = require("../../modules/tracker");
const getHexColor = require("../../modules/getColorHex");
const verifySupporterStatus = require("../../modules/verifySupporterStatus");
const commandUpdate = require("../../modules/commandDatabaseUpdate");

module.exports = {
  data: getCommands(),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    await commandUpdate(interaction);

    if (!interaction.isRepliable()) return "notRepliable";
    interaction.arguments = await getArgs(interaction);
    return await tracker.set(interaction, Splats.changeling20th);
  },
};

async function getArgs(interaction) {
  const args = {
    name: interaction.options.getString("name"),
    exp: interaction.options.getInteger("exp"),
    notes: interaction.options.getString("notes"),
    nameChange: interaction.options.getString("change_name"),
    thumbnail: interaction.options.getAttachment("image"),
    color: getHexColor(interaction.options.getString("color")),
    willpower: interaction.options.getInteger("willpower"),
    health: interaction.options.getInteger("health"),
    bashing: interaction.options.getInteger("bashing_damage"),
    lethal: interaction.options.getInteger("lethal_damage"),
    agg: interaction.options.getInteger("agg_damage"),
    glamour: interaction.options.getInteger("glamour"),
    banality: interaction.options.getInteger("banality"),
    nightmare: interaction.options.getInteger("nightmare"),
    imbalance: interaction.options.getInteger("imbalance"),
    healthChimerical: interaction.options.getInteger("health_chimerical"),
    bashingChimerical: interaction.options.getInteger("bashing_chimerical"),
    lethalChimerical: interaction.options.getInteger("lethal_chimerical"),
    aggChimerical: interaction.options.getInteger("agg_chimerical"),
  };

  if (args.color || args.thumbnail)
    await verifySupporterStatus.fledgling(interaction.user.id);
  return args;
}

function getCommands() {
  const slashCommand = new SlashCommandBuilder()
    .setName("changeling_set")
    .setDescription("Set values for your Changeling 20th")

    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of your Character")
        .setMaxLength(50)
        .setRequired(true)
    )

    .addIntegerOption((option) =>
      option
        .setName("willpower")
        .setDescription(
          "Sets you total Willpower to the number. " +
            "Must be between 1 and 10. CtD 20th Corebook p258"
        )
        .setMinValue(1)
        .setMaxValue(10)
    )

    .addIntegerOption((option) =>
      option
        .setName("glamour")
        .setDescription(
          "Sets you total Glamour to the number. " +
            "Must be between 1 and 10. CtD 20th Corebook p259"
        )
        .setMinValue(1)
        .setMaxValue(10)
    )

    .addIntegerOption((option) =>
      option
        .setName("banality")
        .setDescription(
          "Sets you total Banality to the number. " +
            "Must be between 1 and 10. CtD 20th Corebook p267"
        )
        .setMinValue(1)
        .setMaxValue(10)
    )

    .addIntegerOption((option) =>
      option
        .setName("nightmare")
        .setDescription(
          "Sets you Nightmare to the number. " +
            "Must be between 0 and 10. CtD 20th Corebook p274"
        )
        .setMinValue(0)
        .setMaxValue(10)
    )

    .addIntegerOption((option) =>
      option
        .setName("imbalance")
        .setDescription(
          "Sets you imbalance to the number. " +
            "Must be between 0 and 10. CtD 20th Corebook p275"
        )
        .setMinValue(0)
        .setMaxValue(10)
    )

    .addIntegerOption((option) =>
      option
        .setName("exp")
        .setDescription(
          "Sets your total Exp to the number. " +
            "+ values will update current exp as well. CtD 20th Corebook p175"
        )
        .setMinValue(0)
        .setMaxValue(1000)
    )

    .addIntegerOption((option) =>
      option
        .setName("health")
        .setDescription(
          "Sets your Health to the number. " +
            "Must be between 7 and 15. CtD 20th Corebook p290"
        )
        .setMinValue(7)
        .setMaxValue(15)
    )

    .addIntegerOption((option) =>
      option
        .setName("bashing_damage")
        .setDescription(
          "The total bashing damage inflicted. CtD 20th Corebook p290"
        )
        .setMinValue(0)
        .setMaxValue(15)
    )

    .addIntegerOption((option) =>
      option
        .setName("lethal_damage")
        .setDescription(
          "The total lethal damage inflicted. CtD 20th Corebook p290"
        )
        .setMinValue(0)
        .setMaxValue(15)
    )

    .addIntegerOption((option) =>
      option
        .setName("agg_damage")
        .setDescription(
          "The total Agg damage inflicted. CtD 20th Corebook p290"
        )
        .setMinValue(0)
        .setMaxValue(15)
    )

    .addIntegerOption((option) =>
      option
        .setName("health_chimerical")
        .setDescription(
          "Your total Chimerical Health. Defaults to 7. " +
            "Must be between 7 and 15. CtD 20th Corebook p290"
        )
        .setMinValue(7)
        .setMaxValue(15)
    )

    .addIntegerOption((option) =>
      option
        .setName("bashing_chimerical")
        .setDescription(
          "The total Chimerical bashing damage inflicted. " +
            "CtD 20th Corebook p290"
        )
        .setMinValue(0)
        .setMaxValue(15)
    )

    .addIntegerOption((option) =>
      option
        .setName("lethal_chimerical")
        .setDescription(
          "The total Chimerical lethal damage inflicted. " +
            "CtD 20th Corebook p290"
        )
        .setMinValue(0)
        .setMaxValue(15)
    )

    .addIntegerOption((option) =>
      option
        .setName("agg_chimerical")
        .setDescription(
          "The total Chimerical Agg damage inflicted. " +
            "CtD 20th Corebook p290"
        )
        .setMinValue(0)
        .setMaxValue(15)
    )

    .addStringOption((option) =>
      option
        .setName("notes")
        .setDescription("Any aditional information you would like to include.")
        .setMaxLength(300)
    )

    .addStringOption((option) =>
      option
        .setName("change_name")
        .setDescription("Change your Character's name.")
        .setMaxLength(50)
    )

    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription(
          "Changes the side bar color." +
            " Enter a color hex code eg #6f82ab. [Supporter Only]"
        )
        .setMaxLength(7)
        .setMinLength(7)
    )

    .addAttachmentOption((option) =>
      option
        .setName("image")
        .setDescription(
          "Changes your Character's Thumbnail" + " Image. [Supporter Only]"
        )
    );
  return slashCommand;
}
