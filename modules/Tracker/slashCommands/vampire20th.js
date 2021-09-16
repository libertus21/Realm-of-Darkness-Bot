'use strict';
module.exports.vampire20thNewCommands = (command) =>
{
    command.addSubcommand(subcommand => subcommand
        .setName('20th')
        .setDescription('Not the sparkly kind.')
        .addStringOption(option =>
            option.setName("name")
            .setDescription("The name of your Character")
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName("willpower")
            .setDescription("Your total Willpower. " +
                "Must be between 1 and 10. VtM 20th Corebook p120")
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName("blood")
            .setDescription("Your total Blood Pool. " +
                "Must be between 1 and 100. VtM 20th Corebook p121")
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName("morality")
            .setDescription("Your total Humanity or Path. " +
                "Must be between 0 and 10. VtM 20th Corebook p309")
            .setRequired(true))
        .addStringOption(option =>
            option.setName("morality_type")
            .setDescription("The name of your chosen Morality. " +
                "Default to 'Humanity'. VtM 20th Corebook p309"))
        .addIntegerOption(option =>
            option.setName("exp")
            .setDescription("Your total Experiance. " +
                "VtM 20th Corebook p122"))
        .addIntegerOption(option =>
            option.setName("health")
            .setDescription("Your total Health. Defaults to 7." +
                "Must be between 7 and 15. VtM 20th Corebook p282"))
        .addIntegerOption(option =>
            option.setName("bashing_damage")
            .setDescription("The total bashing damage inflicted." +
                "VtM 20th Corebook p285"))
        .addIntegerOption(option =>
            option.setName("lethal_damage")
            .setDescription("The total lethal damage inflicted." +
                "VtM 20th Corebook p285"))
        .addIntegerOption(option =>
            option.setName("agg_damage")
            .setDescription("The total Agg damage inflicted." +
                "VtM 20th Corebook p285"))
        .addStringOption(option =>
            option.setName("notes")
            .setDescription("Any aditional information you" +
                " would like to include."))
        .addStringOption(option =>
            option.setName("colour")
            .setDescription("Changes the side bar colour." +
                " Enter 3 space seperated RGB values. " +
                "[Supporter Only]"))
        .addStringOption(option =>
            option.setName("image")
            .setDescription("Changes your Character's Thumbnail" +
            " Image. Must be a valid URL. [Supporter Only]")));
}

module.exports.vampire20thSetCommands = (command) => 
{
    command.addSubcommand(subcommand => subcommand
        .setName('20th')
        .setDescription('Not the sparkly kind.')
        .addStringOption(option =>
            option.setName("name")
            .setDescription("The name of your Character")
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName("willpower")
            .setDescription("Sets you total Willpower to the number. " +
                "Must be between 1 and 10. VtM 20th Corebook p120"))
        .addIntegerOption(option =>
            option.setName("blood")
            .setDescription("Sets you total Blood Pool to the number. " +
                "Must be between 1 and 100. VtM 20th Corebook p121"))
        .addIntegerOption(option =>
            option.setName("morality")
            .setDescription("Sets your Mortality to the number. " +
                "Must be between 0 and 10. VtM 20th Corebook p309"))
        .addStringOption(option =>
            option.setName("morality_type")
            .setDescription("Sets the name of your chosen Morality. " +
                "VtM 20th Corebook p309"))
        .addIntegerOption(option =>
            option.setName("exp")
            .setDescription("Sets your total Exp to the number. " +
                "Positive value will update current exp as well." +
                " V20 Core p122"))
        .addIntegerOption(option =>
            option.setName("health")
            .setDescription("Sets your Health to the number. " +
                "Must be between 7 and 15. VtM 20th Corebook p282"))
        .addIntegerOption(option =>
            option.setName("bashing_damage")
            .setDescription("The total bashing damage inflicted." +
                "VtM 20th Corebook p285"))
        .addIntegerOption(option =>
            option.setName("lethal_damage")
            .setDescription("The total lethal damage inflicted." +
                "VtM 20th Corebook p285"))
        .addIntegerOption(option =>
            option.setName("agg_damage")
            .setDescription("The total Agg damage inflicted." +
                "VtM 20th Corebook p285"))
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
                " Enter 3 space seperated RGB values. " +
                "[Supporter Only]"))
        .addStringOption(option =>
            option.setName("image")
            .setDescription("Changes your Character's Thumbnail" +
            " Image. Must be a valid URL. [Supporter Only]"))                    
    );
}

module.exports.vampire20thUpdateCommands = (command) =>
{
    command.addSubcommand(subcommand => subcommand
        .setName('20th')
        .setDescription('Not the sparkly kind.')
        .addStringOption(option =>
            option.setName("name")
            .setDescription("The name of your Character")
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName("willpower")
            .setDescription("Updates your Willpower by the amount. " +
                "Must be between -15 and 15. VtM 20th Corebook p120"))
        .addIntegerOption(option =>
            option.setName("blood")
            .setDescription("Updates you Blood Pool by the amount. " +
                "Must be between -200 and 200. VtM 20th Corebook p121"))
        .addIntegerOption(option =>
            option.setName("morality")
            .setDescription("Updates your Morality by the amount. " +
                "Must be between -20 and 20. VtM 20th Corebook p309"))
        .addIntegerOption(option =>
            option.setName("exp")
            .setDescription("Your total Experiance. " +
                "VtM 20th Corebook p122"))
        .addIntegerOption(option =>
            option.setName("health")
            .setDescription("Updates your Health by the amount. " +
                "Must be between -20 and 20. VtM 20th Corebook p282"))
        .addIntegerOption(option =>
            option.setName("bashing_damage")
            .setDescription("Updates your Bashing damage by the amount. " +
                "VtM 20th Corebook p285"))
        .addIntegerOption(option =>
            option.setName("lethal_damage")
            .setDescription("Updates your Lethal damage by the amount. " +
                "VtM 20th Corebook p285"))
        .addIntegerOption(option =>
            option.setName("agg_damage")
            .setDescription("Updates your Agg damage by the amount. " +
                "VtM 20th Corebook p285"))
        .addStringOption(option =>
            option.setName("notes")
            .setDescription("Any aditional information you" +
                " would like to include."))
        
    );
}