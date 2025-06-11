"use strict";
require(`${process.cwd()}/alias`);
const { EmbedBuilder } = require("discord.js");
const CodRollResults = require("@structures/CodRollResults");
const Roll = require("@src/modules/dice/roll");
const { Emoji } = require("@constants");

const { getCombat } = require("@modules/combat/combatManager");

// Funciones principales de combate
async function initiativeRoll(interaction) {
  const dexterity = interaction.options.getInteger("dexterity");
  const composure = interaction.options.getInteger("composure");
  const initBonus = interaction.options.getInteger("init_bonus") || 0;
  const initPenalty = interaction.options.getInteger("init_penalty") || 0;
  const character = interaction.options.getString("character");
  
  // Verificar si hay un combate activo
  const combat = getCombat(interaction.channel.id);
  const userId = interaction.user.id;
  
  if (combat && combat.participants.has(userId) && !combat.isActive) {
    // Tirar iniciativa dentro del sistema de combate
    const rollResults = combat.rollInitiative(userId, dexterity, composure, initBonus, initPenalty);
    
    const finalPool = dexterity + composure + initBonus - initPenalty;
    const actualPool = Math.max(0, finalPool);
    
    const embed = new EmbedBuilder()
      .setAuthor({
        name: interaction.member?.displayName ?? interaction.user.displayName ?? interaction.user.username,
        iconURL: interaction.member?.displayAvatarURL() ?? interaction.user.displayAvatarURL(),
      })
      .setTitle(`🎯 Iniciativa - ${combat.participants.get(userId).name}`)
      .setColor(rollResults.outcome.color)
      .addFields(
        { name: "Pool", value: `${actualPool}d10 ${rollResults.chance ? '(Chance Die)' : ''}`, inline: true },
        { name: "Resultado", value: `**${rollResults.total} éxitos**\n${rollResults.outcome.toString}`, inline: true }
      );

    // Si todos han tirado iniciativa, mostrar el orden de turnos
    if (combat.allInitiativeRolled()) {
      const turnOrderEmbed = combat.getTurnOrderEmbed();
      return { 
        embeds: [embed, turnOrderEmbed],
        content: "🎯 **¡Iniciativa completada! El combate comienza!**"
      };
    } else {
      // Mostrar quién falta por tirar
      const remaining = Array.from(combat.participants.values())
        .filter(p => !p.hasRolledInitiative)
        .map(p => p.name);
      
      embed.addFields({ 
        name: "Pendientes por tirar", 
        value: remaining.join(', ') || "Todos han tirado" 
      });
      
      return { embeds: [embed] };
    }
  } else {
    // Tirada de iniciativa normal (sin combate activo)
    const args = {
      pool: dexterity + composure,
      bonus: initBonus,
      penalty: initPenalty,
      character: character,
      notes: "Tirada de Iniciativa"
    };

    interaction.arguments = args;
    interaction.rollResults = new CodRollResults(interaction);
    
    const finalPool = dexterity + composure + initBonus - initPenalty;
    const actualPool = Math.max(0, finalPool);
    
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

    if (character) embed.addFields({ name: "Personaje", value: character });

    return { 
      content: getContent(interaction), 
      embeds: [embed] 
    };
  }
}

async function attackRoll(interaction) {
  const attackType = interaction.options.getString("attack_type");
  const basePool = interaction.options.getInteger("pool");
  const weaponBonus = interaction.options.getInteger("weapon_bonus") || 0;
  const weaponDamage = interaction.options.getInteger("weapon_damage") || 0;
  const targetDefense = interaction.options.getInteger("target_defense") || 0;
  const damageType = interaction.options.getString("damage_type");
  
  const args = {
    pool: basePool,
    bonus: weaponBonus,
    penalty: targetDefense,
    character: interaction.options.getString("character"),
    notes: `Ataque ${attackType}`
  };

  interaction.arguments = args;
  interaction.rollResults = new CodRollResults(interaction);
  
  const finalPool = basePool + weaponBonus - targetDefense;
  const actualPool = Math.max(0, finalPool);
  
  // Calcular daño automáticamente si el ataque tuvo éxito
  let damageCalculation = "";
  let finalDamage = 0;
  const damageIcon = getDamageIcon(damageType);
  const damageDescription = getDamageTypeDescription(damageType);
  
  if (interaction.rollResults.total >= 1) {
    finalDamage = interaction.rollResults.total + weaponDamage;
    damageCalculation = `${damageIcon} **DAÑO ${damageType.toUpperCase()}**\n` +
                       `${interaction.rollResults.total} éxitos + ${weaponDamage} bonus arma = **${finalDamage} puntos**\n` +
                       `${damageDescription}`;
  } else {
    damageCalculation = `❌ **SIN DAÑO** - El ataque falló (0 éxitos)`;
  }
  
  const embed = new EmbedBuilder()
    .setAuthor({
      name: interaction.member?.displayName ?? interaction.user.displayName ?? interaction.user.username,
      iconURL: interaction.member?.displayAvatarURL() ?? interaction.user.displayAvatarURL(),
    })
    .setTitle(`⚔️ ${attackType} - Tirando ${actualPool}d10`)
    .setColor(interaction.rollResults.outcome.color)
    .addFields(
      { name: "Pool Base", value: `Atributo + Habilidad = ${basePool}d10`, inline: true },
      { name: "Modificadores de Ataque", value: `🗡️ Arma: +${weaponBonus}d10\n🛡️ Defensa: -${targetDefense}d10`, inline: true },
      { name: "Pool Final", value: `${actualPool}d10 ${interaction.rollResults.chance ? '(Chance Die)' : ''}`, inline: true },
      { name: "Resultado del Ataque", value: `🎲 **${interaction.rollResults.total} éxitos**\n${interaction.rollResults.outcome.toString}` },
      { name: "Daño Calculado", value: damageCalculation }
    );

  if (args.character) embed.addFields({ name: "Personaje", value: args.character });

  return { 
    content: getContent(interaction), 
    embeds: [embed] 
  };
}

async function damageRoll(interaction) {
  const attackSuccesses = interaction.options.getInteger("attack_successes");
  const weaponDamage = interaction.options.getInteger("weapon_damage") || 0;
  const damageType = interaction.options.getString("damage_type") || "lethal";
  
  let totalDamage = 0;
  let calculationText = "";
  const damageIcon = getDamageIcon(damageType);
  
  if (attackSuccesses >= 1) {
    totalDamage = attackSuccesses + weaponDamage;
    calculationText = `${attackSuccesses} éxitos + ${weaponDamage} bonus arma = **${totalDamage} puntos**`;
  } else {
    totalDamage = 0;
    calculationText = `El ataque falló (0 éxitos) - **Sin daño**`;
  }
  
  const embed = new EmbedBuilder()
    .setAuthor({
      name: interaction.member?.displayName ?? interaction.user.displayName ?? interaction.user.username,
      iconURL: interaction.member?.displayAvatarURL() ?? interaction.user.displayAvatarURL(),
    })
    .setTitle(`${damageIcon} Daño ${damageType.charAt(0).toUpperCase() + damageType.slice(1)}`)
    .setColor(totalDamage > 0 ? "#ff6b6b" : "#666666")
    .addFields(
      { name: "Regla", value: "Si éxitos ≥ 1: Daño = Éxitos + Bono del Arma", inline: false },
      { name: "Cálculo", value: calculationText, inline: false },
      { name: "Tipo", value: getDamageTypeDescription(damageType), inline: false }
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
  
  const damageIcon = getDamageIcon(damageType);
  
  const embed = new EmbedBuilder()
    .setAuthor({
      name: interaction.member?.displayName ?? interaction.user.displayName ?? interaction.user.username,
      iconURL: interaction.member?.displayAvatarURL() ?? interaction.user.displayAvatarURL(),
    })
    .setTitle(`🛡️ Absorción vs ${damageIcon} ${damageType} - Tirando ${soakPool}d10`)
    .setColor(finalDamage === 0 ? "#00ff00" : "#ffaa00")
    .addFields(
      { name: "Pool Base", value: `Stamina (${stamina}) + Resistencia (${resistance}) = ${stamina + resistance}d10`, inline: true },
      { name: "Armadura", value: `${damageType === "aggravated" ? "❌ No aplica vs Agravado" : `✅ +${armorRating}d10`}`, inline: true },
      { name: "Pool Final", value: `${soakPool}d10 ${interaction.rollResults.chance ? '(Chance Die)' : ''}`, inline: true },
      { name: "Daño Entrante", value: `${damageIcon} **${incomingDamage} puntos** de daño ${damageType}`, inline: true },
      { name: "Éxitos de Absorción", value: `🎲 **${interaction.rollResults.total} éxitos**`, inline: true },
      { name: "Daño Final", value: `${finalDamage === 0 ? '✅' : '💔'} **${finalDamage} puntos** ${finalDamage === 0 ? '¡Absorbido completamente!' : 'de daño recibido'}`, inline: true }
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

function getDamageIcon(damageType) {
  switch (damageType) {
    case "bashing":
      return "👊"; // Puño para contundente
    case "lethal":
      return "🗡️"; // Espada para letal
    case "aggravated":
      return "🔥"; // Fuego para agravado
    default:
      return "💥";
  }
}

function getDamageTypeDescription(damageType) {
  switch (damageType) {
    case "bashing":
      return "Contundente - se cura rápidamente";
    case "lethal":
      return "Letal - cortes, balas, etc.";
    case "aggravated":
      return "Agravado - fuego, sol, garras sobrenaturales";
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