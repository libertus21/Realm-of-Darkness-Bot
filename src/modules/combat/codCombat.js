"use strict";
require(`${process.cwd()}/alias`);
const { EmbedBuilder } = require("discord.js");
const CodRollResults = require("@structures/CodRollResults");
const Roll = require("@src/modules/dice/roll");
const { Emoji } = require("@constants");

// Funciones principales de combate
async function initiativeRoll(interaction) {
  const dexterity = interaction.options.getInteger("dexterity");
  const composure = interaction.options.getInteger("composure");
  const initBonus = interaction.options.getInteger("init_bonus") || 0;
  const initPenalty = interaction.options.getInteger("init_penalty") || 0;
  
  const args = {
    pool: dexterity + composure,
    bonus: initBonus,
    penalty: initPenalty,
    character: interaction.options.getString("character"),
    notes: "Tirada de Iniciativa"
  };

  interaction.arguments = args;
  interaction.rollResults = new CodRollResults(interaction);
  
  const finalPool = dexterity + composure + initBonus - initPenalty;
  const actualPool = Math.max(0, finalPool); // El pool final después de modificadores
  
  const embed = new EmbedBuilder()
    .setAuthor({
      name: interaction.member?.displayName ?? interaction.user.displayName ?? interaction.user.username,
      iconURL: interaction.member?.displayAvatarURL() ?? interaction.user.displayAvatarURL(),
    })
    .setTitle(`🎯 Iniciativa - Tirando ${actualPool}d10`)
    .setColor(interaction.rollResults.outcome.color)
    .addFields(
      { name: "Pool Base", value: `Destreza (${dexterity}) + Composure (${composure}) = ${dexterity + composure}d10`, inline: true },
      { name: "Modificadores", value: `Bonus: +${initBonus} | Penalty: -${initPenalty}`, inline: true },
      { name: "Pool Final", value: `${actualPool}d10 ${interaction.rollResults.chance ? '(Chance Die)' : ''}`, inline: true },
      { name: "Resultado", value: `**${interaction.rollResults.total} éxitos**\n${interaction.rollResults.outcome.toString}` }
    );

  if (args.character) embed.addFields({ name: "Personaje", value: args.character });

  return { 
    content: getContent(interaction), 
    embeds: [embed] 
  };
}

async function attackRoll(interaction) {
  const attackType = interaction.options.getString("attack_type");
  const attribute = interaction.options.getInteger("attribute");
  const skill = interaction.options.getInteger("skill");
  const weaponBonus = interaction.options.getInteger("weapon_bonus") || 0;
  const targetDefense = interaction.options.getInteger("target_defense") || 0;
  
  const args = {
    pool: attribute + skill,
    bonus: weaponBonus,
    penalty: targetDefense,
    character: interaction.options.getString("character"),
    notes: `Ataque ${attackType}`
  };

  interaction.arguments = args;
  interaction.rollResults = new CodRollResults(interaction);
  
  const finalPool = attribute + skill + weaponBonus - targetDefense;
  const actualPool = Math.max(0, finalPool);
  
  const embed = new EmbedBuilder()
    .setAuthor({
      name: interaction.member?.displayName ?? interaction.user.displayName ?? interaction.user.username,
      iconURL: interaction.member?.displayAvatarURL() ?? interaction.user.displayAvatarURL(),
    })
    .setTitle(`⚔️ ${attackType} - Tirando ${actualPool}d10`)
    .setColor(interaction.rollResults.outcome.color)
    .addFields(
      { name: "Pool Base", value: `Atributo (${attribute}) + Habilidad (${skill}) = ${attribute + skill}d10`, inline: true },
      { name: "Modificadores", value: `Arma: +${weaponBonus} | Defensa: -${targetDefense}`, inline: true },
      { name: "Pool Final", value: `${actualPool}d10 ${interaction.rollResults.chance ? '(Chance Die)' : ''}`, inline: true },
      { name: "Resultado", value: `**${interaction.rollResults.total} éxitos**\n${interaction.rollResults.outcome.toString}` }
    );

  if (args.character) embed.addFields({ name: "Personaje", value: args.character });

  return { 
    content: getContent(interaction), 
    embeds: [embed] 
  };
}

async function damageRoll(interaction) {
  const strength = interaction.options.getInteger("strength");
  const attackSuccesses = interaction.options.getInteger("attack_successes");
  const weaponDamage = interaction.options.getInteger("weapon_damage") || 0;
  const damageType = interaction.options.getString("damage_type") || "lethal";
  
  const totalDamage = strength + attackSuccesses + weaponDamage;
  
  const embed = new EmbedBuilder()
    .setAuthor({
      name: interaction.member?.displayName ?? interaction.user.displayName ?? interaction.user.username,
      iconURL: interaction.member?.displayAvatarURL() ?? interaction.user.displayAvatarURL(),
    })
    .setTitle(`💥 Daño ${damageType.charAt(0).toUpperCase() + damageType.slice(1)}`)
    .setColor("#ff6b6b")
    .addFields(
      { name: "Cálculo", value: `Fuerza (${strength}) + Éxitos de Ataque (${attackSuccesses}) + Arma (${weaponDamage})`, inline: false },
      { name: "Daño Total", value: `${totalDamage} puntos de daño ${damageType}`, inline: false },
      { name: "Tipo de Daño", value: getDamageTypeDescription(damageType), inline: false }
    );

  const character = interaction.options.getString("character");
  if (character) embed.addFields({ name: "Personaje", value: character });

  return { embeds: [embed] };
}

async function soakRoll(interaction) {
  const stamina = interaction.options.getInteger("stamina");
  const resistance = interaction.options.getInteger("resistance") || 0;
  const armorRating = interaction.options.getInteger("armor") || 0;
  const incomingDamage = interaction.options.getInteger("incoming_damage");
  const damageType = interaction.options.getString("damage_type") || "lethal";
  
  let soakPool = stamina + resistance;
  
  // La armadura solo reduce daño letal y contundente, no agravado
  if (damageType !== "aggravated") {
    soakPool += armorRating;
  }
  
  const args = {
    pool: soakPool,
    character: interaction.options.getString("character"),
    notes: `Absorción contra ${incomingDamage} daño ${damageType}`
  };

  interaction.arguments = args;
  interaction.rollResults = new CodRollResults(interaction);
  
  const finalDamage = Math.max(0, incomingDamage - interaction.rollResults.total);
  
  const embed = new EmbedBuilder()
    .setAuthor({
      name: interaction.member?.displayName ?? interaction.user.displayName ?? interaction.user.username,
      iconURL: interaction.member?.displayAvatarURL() ?? interaction.user.displayAvatarURL(),
    })
    .setTitle(`🛡️ Absorción - Tirando ${soakPool}d10`)
    .setColor(finalDamage === 0 ? "#00ff00" : "#ffaa00")
    .addFields(
      { name: "Pool Base", value: `Stamina (${stamina}) + Resistencia (${resistance}) = ${stamina + resistance}d10`, inline: true },
      { name: "Armadura", value: `${damageType === "aggravated" ? "No aplica vs Agravado" : `+${armorRating}d10`}`, inline: true },
      { name: "Pool Final", value: `${soakPool}d10 ${interaction.rollResults.chance ? '(Chance Die)' : ''}`, inline: true },
      { name: "Daño Entrante", value: `${incomingDamage} puntos de daño ${damageType}`, inline: true },
      { name: "Éxitos de Absorción", value: `**${interaction.rollResults.total} éxitos**`, inline: true },
      { name: "Daño Final", value: `**${finalDamage} puntos** ${finalDamage === 0 ? '¡Absorbido completamente!' : 'de daño recibido'}`, inline: true }
    );

  if (args.character) embed.addFields({ name: "Personaje", value: args.character });

  return { 
    content: getContent(interaction), 
    embeds: [embed] 
  };
}

function getContent(interaction) {
  const results = interaction.rollResults;
  let content = toDiceString(results.dice, interaction, true);
  if (results.roteDice.length) {
    content += Emoji.red_period;
    content += toDiceString(results.roteDice, interaction);
  }
  if (results.rerollDice.length) {
    content += Emoji.black_period;
    content += toDiceString(results.rerollDice, interaction);
  }
  if (content.length >= 2000) content = null;
  return content;
}

function toDiceString(diceResults, interaction, chanceDice = false) {
  const args = interaction.arguments;
  const chance = interaction.rollResults.chance;
  const emotes = {
    1: { fail: Emoji.red1, sux: Emoji.green1 },
    2: { fail: Emoji.red2, sux: Emoji.green2 },
    3: { fail: Emoji.red3, sux: Emoji.green3 },
    4: { fail: Emoji.red4, sux: Emoji.green4 },
    5: { fail: Emoji.red5, sux: Emoji.green5 },
    6: { fail: Emoji.red6, sux: Emoji.green6 },
    7: { fail: Emoji.red7, sux: Emoji.green7 },
    8: { fail: Emoji.red8, sux: Emoji.green8 },
    9: { fail: Emoji.red9, sux: Emoji.green9 },
    10: { fail: Emoji.red10, sux: Emoji.green10 },
  };

  let mess = "";
  for (const dice of diceResults) {
    if (chance) {
      if (dice == 10) mess += Emoji.black_crit;
      else if (dice == 1 && chanceDice) mess += Emoji.botch;
      else mess += emotes[dice].fail;
    } else {
      if (dice >= (args.reroll ?? 10)) mess += Emoji.black_crit;
      else if (dice >= (args.target ?? 8)) mess += emotes[dice].sux;
      else mess += emotes[dice].fail;
    }
    mess += " ";
  }
  return mess;
}

function getDamageTypeDescription(damageType) {
  switch (damageType) {
    case "bashing":
      return "Daño contundente - se cura rápidamente";
    case "lethal":
      return "Daño letal - cortes, balas, etc.";
    case "aggravated":
      return "Daño agravado - fuego, sol, garras sobrenaturales";
    default:
      return "Tipo de daño desconocido";
  }
}

module.exports = {
  initiativeRoll,
  attackRoll,
  damageRoll,
  soakRoll
}; 