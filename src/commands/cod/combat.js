"use strict";
require(`${process.cwd()}/alias`);
const { SlashCommandBuilder } = require("@discordjs/builders");
const { initiativeRoll, attackRoll, damageRoll, soakRoll } = require("@modules/combat/codCombat");
const { startCombat, joinCombat, endCombat, nextTurn, getCombat, showCombatStatus } = require("@modules/combat/combatManager");
const commandUpdate = require("@modules/commandDatabaseUpdate");

module.exports = {
  data: getCommand(),
  async execute(interaction) {
    await interaction.deferReply();
    await commandUpdate(interaction);

    if (!interaction.isRepliable()) return "notRepliable";

    switch (interaction.options.getSubcommand()) {
      case "start":
        return await startCombat(interaction);
      case "join":
        return await joinCombat(interaction);
      case "end":
        return await endCombat(interaction);
      case "next":
        return await nextTurn(interaction);
      case "status":
        return await showCombatStatus(interaction);
      case "initiative":
        return await initiativeRoll(interaction);
      case "attack":
        return await attackRoll(interaction);
      case "damage":
        return await damageRoll(interaction);
      case "soak":
        return await soakRoll(interaction);
    }
  },
};

function getCommand() {
  const command = new SlashCommandBuilder();

  command.setName("combat").setDescription("Sistema de combate para Vampiro Requiem 2e (Chronicles of Darkness)");

  // Subcomando de Iniciar Combate
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("start")
      .setDescription("Iniciar un nuevo combate por turnos")
  );

  // Subcomando de Unirse al Combate
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("join")
      .setDescription("Unirse al combate activo")
      
      .addStringOption((option) =>
        option
          .setName("character")
          .setDescription("Nombre del personaje")
          .setMaxLength(50)
          .setRequired(true)
      )
  );

  // Subcomando de Terminar Combate
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("end")
      .setDescription("Terminar el combate activo")
  );

  // Subcomando de Siguiente Turno
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("next")
      .setDescription("Avanzar al siguiente turno (solo para el master)")
  );

  // Subcomando de Estado del Combate
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("status")
      .setDescription("Mostrar el estado actual del combate")
  );

  // Subcomando de Iniciativa
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("initiative")
      .setDescription("Tirada de iniciativa (1d10 + modificador)")
      
      .addIntegerOption((option) =>
        option
          .setName("initiative_modifier")
          .setDescription("Modificador de iniciativa (Destreza + Composure + otros modificadores)")
          .setMaxValue(20)
          .setMinValue(-10)
          .setRequired(true)
      )
      
      .addStringOption((option) =>
        option
          .setName("character")
          .setDescription("Nombre del personaje")
          .setMaxLength(50)
      )
  );

  // Subcomando de Ataque
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("attack")
      .setDescription("Tirada de ataque (calcula daño automáticamente si es exitoso)")
      
      .addStringOption((option) =>
        option
          .setName("attack_type")
          .setDescription("Tipo de ataque")
          .setRequired(true)
          .addChoices(
            { name: "Cuerpo a Cuerpo", value: "Cuerpo a Cuerpo" },
            { name: "Armas de Fuego", value: "Armas de Fuego" },
            { name: "Armas Cuerpo a Cuerpo", value: "Armas Cuerpo a Cuerpo" },
            { name: "Disciplina", value: "Disciplina" }
          )
      )
      
      .addIntegerOption((option) =>
        option
          .setName("pool")
          .setDescription("Pool de dados (suma de Atributo + Habilidad)")
          .setMaxValue(20)
          .setMinValue(1)
          .setRequired(true)
      )
      
      .addStringOption((option) =>
        option
          .setName("damage_type")
          .setDescription("Tipo de daño del arma")
          .setRequired(true)
          .addChoices(
            { name: "Contundente (Bashing)", value: "bashing" },
            { name: "Letal (Lethal)", value: "lethal" },
            { name: "Agravado (Aggravated)", value: "aggravated" }
          )
      )
      
      .addIntegerOption((option) =>
        option
          .setName("weapon_bonus")
          .setDescription("Bonificador del arma")
          .setMaxValue(10)
          .setMinValue(0)
      )
      
      .addIntegerOption((option) =>
        option
          .setName("weapon_damage")
          .setDescription("Bono de daño del arma")
          .setMaxValue(10)
          .setMinValue(0)
      )
      
      .addIntegerOption((option) =>
        option
          .setName("target_defense")
          .setDescription("Defensa del objetivo")
          .setMaxValue(20)
          .setMinValue(0)
      )
      
      .addStringOption((option) =>
        option
          .setName("character")
          .setDescription("Nombre del personaje")
          .setMaxLength(50)
      )
  );

  // Subcomando de Daño
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("damage")
      .setDescription("Calcular daño total (Éxitos + Bono del Arma)")
      
      .addIntegerOption((option) =>
        option
          .setName("attack_successes")
          .setDescription("Éxitos obtenidos en la tirada de ataque")
          .setMaxValue(20)
          .setMinValue(0)
          .setRequired(true)
      )
      
      .addIntegerOption((option) =>
        option
          .setName("weapon_damage")
          .setDescription("Daño base del arma")
          .setMaxValue(10)
          .setMinValue(0)
      )
      
      .addStringOption((option) =>
        option
          .setName("damage_type")
          .setDescription("Tipo de daño")
          .addChoices(
            { name: "Contundente (Bashing)", value: "bashing" },
            { name: "Letal (Lethal)", value: "lethal" },
            { name: "Agravado (Aggravated)", value: "aggravated" }
          )
      )
      
      .addStringOption((option) =>
        option
          .setName("character")
          .setDescription("Nombre del personaje")
          .setMaxLength(50)
      )
  );

  // Subcomando de Absorción
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("soak")
      .setDescription("Tirada de absorción de daño")
      
      .addIntegerOption((option) =>
        option
          .setName("stamina")
          .setDescription("Valor del atributo Stamina")
          .setMaxValue(10)
          .setMinValue(1)
          .setRequired(true)
      )
      
      .addIntegerOption((option) =>
        option
          .setName("incoming_damage")
          .setDescription("Puntos de daño entrante")
          .setMaxValue(50)
          .setMinValue(1)
          .setRequired(true)
      )
      
      .addIntegerOption((option) =>
        option
          .setName("resistance")
          .setDescription("Resistencia sobrenatural (vampiros, etc.)")
          .setMaxValue(10)
          .setMinValue(0)
      )
      
      .addIntegerOption((option) =>
        option
          .setName("armor")
          .setDescription("Rating de armadura")
          .setMaxValue(10)
          .setMinValue(0)
      )
      
      .addStringOption((option) =>
        option
          .setName("damage_type")
          .setDescription("Tipo de daño recibido")
          .addChoices(
            { name: "Contundente (Bashing)", value: "bashing" },
            { name: "Letal (Lethal)", value: "lethal" },
            { name: "Agravado (Aggravated)", value: "aggravated" }
          )
      )
      
      .addStringOption((option) =>
        option
          .setName("character")
          .setDescription("Nombre del personaje")
          .setMaxLength(50)
      )
  );

  return command;
}