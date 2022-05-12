'use strict';
const { SlashCommandBuilder } = require('@discordjs/builders');
const execute = require('../../../modules/Tracker/executeCommand.js');

module.exports = {
	data: demonTFCommands(),      
	
	async execute(interaction) {
        await execute(interaction);
	}
};

function demonTFCommands()
{
    const slashCommand = new SlashCommandBuilder();

    slashCommand.setName('demon')
	    .setDescription('x');

    slashCommand.addSubcommand(subcommand => subcommand
        .setName('new')
        .setDescription("Create a new Demon 20th.")
        .addStringOption(option =>
            option.setName("name")
            .setDescription("The name of your Character")
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName("willpower")
            .setDescription("Your total Willpower. " +
                "Must be between 1 and 10. DtF Corebook p162")
            .setMinValue(1)
            .setMaxValue(10)
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName("faith")
            .setDescription("Your total Faith. " +
                "Must be between 1 and 10. DtF Corebook p249")
            .setMinValue(1)
            .setMaxValue(10)
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName("torment")
            .setDescription("Your Permanent Torment. " +
                "Must be between 1 and 10. DtF Corebook p160")
            .setMinValue(1)
            .setMaxValue(10)
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName("exp")
            .setDescription("Your total Experiance. " +
                "DtF Corebook p164")
            .setMinValue(0)
            .setMaxValue(1000))
        .addIntegerOption(option =>
            option.setName("health")
            .setDescription("Your total Health. Defaults to 7." +
                "Must be between 7 and 15. DtF Corebook p245")
            .setMinValue(7)
            .setMaxValue(15))
        .addIntegerOption(option =>
            option.setName("bashing_damage")
            .setDescription("The total bashing damage inflicted. " +
                "DtF Corebook p247")
            .setMinValue(0)
            .setMaxValue(15))
        .addIntegerOption(option =>
            option.setName("lethal_damage")
            .setDescription("The total lethal damage inflicted. " +
                "DtF Corebook p247")
            .setMinValue(0)
            .setMaxValue(15))
        .addIntegerOption(option =>
            option.setName("agg_damage")
            .setDescription("The total Agg damage inflicted. " +
                "DtF Corebook p247")
            .setMinValue(0)
            .setMaxValue(15))
        .addStringOption(option =>
            option.setName("notes")
            .setDescription("Any aditional information you" +
                " would like to include."))
        .addStringOption(option =>
            option.setName("colour")
            .setDescription("Changes the side bar colour." +
                " Enter a colour hex code eg #6f82ab. " +
                "[Supporter Only]"))
        .addStringOption(option =>
            option.setName("image")
            .setDescription("Changes your Character's Thumbnail" +
            " Image. Must be a valid URL. [Supporter Only]"))
    );

    slashCommand.addSubcommand(subcommand => subcommand
        .setName('set')
        .setDescription('Sets values for your Demon 20th')
        .addStringOption(option =>
            option.setName("name")
            .setDescription("The name of your Character")
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName("willpower")
            .setDescription("Sets you total Willpower to the number. " +
                "Must be between 1 and 10. DtF Corebook p162")
            .setMinValue(1)
            .setMaxValue(10))
        .addIntegerOption(option =>
            option.setName("faith")
            .setDescription("Sets you total Faith to the number. " +
                "Must be between 1 and 10. DtF Corebook p249")
            .setMinValue(1)
            .setMaxValue(10))
        .addIntegerOption(option =>
            option.setName("torment")
            .setDescription("Sets you Permanent Torment to the number. " +
                "Must be between 1 and 10. DtF Corebook p160")
            .setMinValue(1)
            .setMaxValue(10))
        .addIntegerOption(option =>
            option.setName("exp")
            .setDescription("Sets your total Exp to the number. " +
                "+ values will update current exp as well." +
                " DtF Corebook p164")
            .setMinValue(0)
            .setMaxValue(1000))
        .addIntegerOption(option =>
            option.setName("health")
            .setDescription("Sets your Health to the number. " +
                "Must be between 7 and 15. DtF Corebook p245")
            .setMinValue(7)
            .setMaxValue(15))
        .addIntegerOption(option =>
            option.setName("bashing_damage")
            .setDescription("The total bashing damage inflicted. " +
                "DtF Corebook p247")
            .setMinValue(0)
            .setMaxValue(15))
        .addIntegerOption(option =>
            option.setName("lethal_damage")
            .setDescription("The total lethal damage inflicted. " +
                "DtF Corebook p247")
            .setMinValue(0)
            .setMaxValue(15))
        .addIntegerOption(option =>
            option.setName("agg_damage")
            .setDescription("The total Agg damage inflicted. " +
                "DtF Corebook p247")
            .setMinValue(0)
            .setMaxValue(15))
        .addStringOption(option =>
            option.setName("notes")
            .setDescription("Any aditional information you" +
                " would like to include."))
        .addStringOption(option =>
            option.setName("change_name")
            .setDescription("Change your Character's name."))
        .addStringOption(option =>
            option.setName("colour")
            .setDescription("Changes the side bar colour." +
                " Enter a colour hex code eg #6f82ab. " +
                "[Supporter Only]"))
        .addStringOption(option =>
            option.setName("image")
            .setDescription("Changes your Character's Thumbnail" +
            " Image. Must be a valid URL. [Supporter Only]"))                    
    );

    slashCommand.addSubcommand(subcommand => subcommand
        .setName('update')
        .setDescription('Updates you Demon 20th')
        .addStringOption(option =>
            option.setName("name")
            .setDescription("The name of your Character")
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName("willpower")
            .setDescription("Updates your Willpower by the amount. " +
                "Must be between -15 and 15. DtF Corebook p162")
            .setMinValue(-15)
            .setMaxValue(15))
        .addIntegerOption(option =>
            option.setName("faith")
            .setDescription("Updates your Faith by the amount. " +
                "Must be between -15 and 15. DtF Corebook p249")
            .setMinValue(-15)
            .setMaxValue(15))
        .addIntegerOption(option =>
            option.setName("torment")
            .setDescription("Updates your Temporary Torment by the amount. " +
                "Must be between -15 and 15. DtF Corebook p160")
            .setMinValue(-15)
            .setMaxValue(15))
        .addIntegerOption(option =>
            option.setName("exp")
            .setDescription("Updates your current exp. + values will increase" +
                " total as well. DtF Corebook p164")
            .setMinValue(-3000)
            .setMaxValue(3000))
        .addIntegerOption(option =>
            option.setName("health")
            .setDescription("Updates your Health by the amount. " +
                "Must be between -20 and 20. DtF Corebook p245")
            .setMinValue(-20)
            .setMaxValue(20))
        .addIntegerOption(option =>
            option.setName("bashing_damage")
            .setDescription("Updates your Bashing damage by the amount. " +
                "DtF Corebook p247")
            .setMinValue(-50)
            .setMaxValue(50))
        .addIntegerOption(option =>
            option.setName("lethal_damage")
            .setDescription("Updates your Lethal damage by the amount. " +
                "DtF Corebook p247")
            .setMinValue(-50)
            .setMaxValue(50))
        .addIntegerOption(option =>
            option.setName("agg_damage")
            .setDescription("Updates your Agg damage by the amount. " +
                "DtF Corebook p247")
            .setMinValue(-50)
            .setMaxValue(50))
        .addUserOption(option =>
            option.setName("player")
            .setDescription("The player the character belongs to. Used by STs" +
            " to update another players Char [ST Only]"))
        .addStringOption(option =>
            option.setName("notes")
            .setDescription("Any aditional information you" +
                " would like to include."))
        
    );
    return slashCommand;
}