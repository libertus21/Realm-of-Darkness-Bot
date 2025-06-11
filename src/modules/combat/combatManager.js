"use strict";
require(`${process.cwd()}/alias`);
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const CodRollResults = require("@structures/CodRollResults");

// Almacenamiento en memoria para combates activos
const activeCombats = new Map();

class CombatManager {
  constructor(channelId, masterId) {
    this.channelId = channelId;
    this.masterId = masterId;
    this.participants = new Map();
    this.turnOrder = [];
    this.currentTurnIndex = 0;
    this.round = 1;
    this.isActive = false;
    this.initiativePhase = true;
  }

  addParticipant(userId, characterName) {
    this.participants.set(userId, {
      userId,
      name: characterName,
      initiative: null,
      hasRolledInitiative: false
    });
  }

  removeParticipant(userId) {
    this.participants.delete(userId);
    this.rebuildTurnOrder();
  }

  rollInitiative(userId, initiativeModifier = 0) {
    const participant = this.participants.get(userId);
    if (!participant) return null;

    // Tirar un solo d10 y sumar el modificador
    const dieRoll = Math.floor(Math.random() * 10) + 1;
    const finalInitiative = dieRoll + initiativeModifier;

    participant.initiative = finalInitiative;
    participant.dieRoll = dieRoll;
    participant.initiativeModifier = initiativeModifier;
    participant.hasRolledInitiative = true;

    if (this.allInitiativeRolled()) {
      this.buildTurnOrder();
      this.initiativePhase = false;
      this.isActive = true;
    }

    return {
      dieRoll: dieRoll,
      modifier: initiativeModifier,
      total: finalInitiative
    };
  }

  allInitiativeRolled() {
    return Array.from(this.participants.values()).every(p => p.hasRolledInitiative);
  }

  buildTurnOrder() {
    this.turnOrder = Array.from(this.participants.values())
      .sort((a, b) => b.initiative - a.initiative);
  }

  getCurrentPlayer() {
    if (this.turnOrder.length === 0) return null;
    return this.turnOrder[this.currentTurnIndex];
  }

  nextTurn() {
    this.currentTurnIndex++;
    if (this.currentTurnIndex >= this.turnOrder.length) {
      this.currentTurnIndex = 0;
      this.round++;
    }
    return this.getCurrentPlayer();
  }

  getTurnOrderEmbed() {
    const embed = new EmbedBuilder()
      .setTitle(`⚔️ Combate - Ronda ${this.round}`)
      .setColor("#FF6B6B");

    if (this.turnOrder.length === 0) {
      embed.setDescription("No hay participantes en el combate");
      return { embed, content: null };
    }

    let orderList = "";
    for (let i = 0; i < this.turnOrder.length; i++) {
      const participant = this.turnOrder[i];
      const isCurrent = i === this.currentTurnIndex;
      const marker = isCurrent ? "▶️" : "⭐";
      const emphasis = isCurrent ? "**" : "";
      
      orderList += `${marker} ${emphasis}${participant.name}${emphasis} (${participant.initiative} éxitos)\n`;
    }

    embed.addFields({ name: "Orden de Turnos", value: orderList });

    const currentPlayer = this.getCurrentPlayer();
    let content = null;
    
    if (currentPlayer) {
      embed.addFields({ 
        name: "Turno Actual", 
        value: `🎲 **${currentPlayer.name}** - ¡es tu turno!` 
      });
      // El ping REAL va en el content principal
      content = `<@${currentPlayer.userId}> ¡Es tu turno! (${currentPlayer.name})`;
    }

    return { embed, content };
  }

  advanceTurnAfterAction(userId) {
    // Verificar que es el turno del usuario actual
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.userId !== userId) {
      return null; // No es su turno
    }

    // Avanzar al siguiente turno
    this.nextTurn();
    return this.getTurnOrderEmbed();
  }

  endCombat() {
    this.isActive = false;
    activeCombats.delete(this.channelId);
  }
}

function getCombat(channelId) {
  return activeCombats.get(channelId);
}

function createCombat(channelId, masterId) {
  const combat = new CombatManager(channelId, masterId);
  activeCombats.set(channelId, combat);
  return combat;
}

async function startCombat(interaction) {
  const channelId = interaction.channel.id;
  const masterId = interaction.user.id;

  if (getCombat(channelId)) {
    return {
      content: "❌ Ya hay un combate activo en este canal. Usa `/combat end` para terminarlo primero.",
      ephemeral: true
    };
  }

  const combat = createCombat(channelId, masterId);

  const embed = new EmbedBuilder()
    .setTitle("⚔️ ¡Nuevo Combate Iniciado!")
    .setColor("#00FF00")
    .setDescription(
      "**Master del Combate:** " + interaction.user.displayName + "\n\n" +
      "**Instrucciones:**\n" +
      "1️⃣ Los jugadores se unen con `/combat join nombre_personaje`\n" +
      "2️⃣ Cuando todos estén listos, usen `/combat initiative` para tirar iniciativa\n" +
      "3️⃣ El combate comenzará automáticamente cuando todos hayan tirado\n" +
      "4️⃣ En cada turno, el jugador activo será mencionado automáticamente\n" +
      "5️⃣ Usen comandos de combate para realizar acciones\n" +
      "6️⃣ El master puede usar `/combat end` para terminar el combate"
    )
    .addFields(
      { name: "Participantes", value: "Ninguno aún", inline: false },
      { name: "Estado", value: "🔄 Esperando participantes", inline: false }
    );

  return { embeds: [embed] };
}

async function joinCombat(interaction) {
  const channelId = interaction.channel.id;
  const combat = getCombat(channelId);
  const characterName = interaction.options.getString("character");
  const userId = interaction.user.id;

  if (!combat) {
    return {
      content: "❌ No hay un combate activo en este canal.",
      ephemeral: true
    };
  }

  if (combat.isActive) {
    return {
      content: "❌ El combate ya está en progreso. No se pueden agregar más participantes.",
      ephemeral: true
    };
  }

  if (combat.participants.has(userId)) {
    return {
      content: "❌ Ya estás participando en este combate.",
      ephemeral: true
    };
  }

  combat.addParticipant(userId, characterName);

  const embed = new EmbedBuilder()
    .setTitle("✅ Participante Agregado")
    .setColor("#00FF00")
    .setDescription(`**${characterName}** se ha unido al combate!`)
    .addFields({
      name: "Participantes Actuales",
      value: Array.from(combat.participants.values())
        .map(p => `• ${p.name}`)
        .join('\n') || "Ninguno"
    });

  return { embeds: [embed] };
}

async function endCombat(interaction) {
  const channelId = interaction.channel.id;
  const combat = getCombat(channelId);

  if (!combat) {
    return {
      content: "❌ No hay un combate activo en este canal.",
      ephemeral: true
    };
  }

  combat.endCombat();

  const embed = new EmbedBuilder()
    .setTitle("🏁 Combate Terminado")
    .setColor("#FF0000")
    .setDescription(`El combate ha sido terminado por ${interaction.user.displayName}`);

  return { embeds: [embed] };
}

async function showCombatStatus(interaction) {
  const channelId = interaction.channel.id;
  const combat = getCombat(channelId);

  if (!combat) {
    return {
      content: "❌ No hay un combate activo en este canal.",
      ephemeral: true
    };
  }

  const embed = new EmbedBuilder()
    .setTitle("📊 Estado del Combate")
    .setColor("#4169E1");

  // Estado general
  if (combat.initiativePhase) {
    embed.setDescription("🎯 **Fase de Iniciativa** - Esperando que todos tiren iniciativa");
    
         // Mostrar quién ha tirado y quién falta
     let participantsList = "";
     for (const participant of combat.participants.values()) {
       const status = participant.hasRolledInitiative ? 
         `✅ **Iniciativa ${participant.initiative}** (d10: ${participant.dieRoll} + ${participant.initiativeModifier})` : 
         "⏳ Pendiente";
       participantsList += `• ${participant.name}: ${status}\n`;
     }
    
    embed.addFields(
      { name: "Master del Combate", value: `<@${combat.masterId}>`, inline: true },
      { name: "Participantes", value: participantsList || "Ninguno", inline: false }
    );
    
  } else if (combat.isActive) {
    embed.setDescription("⚔️ **Combate Activo** - En progreso");
    
         // Orden de turnos con indicador del turno actual
     let orderList = "";
     for (let i = 0; i < combat.turnOrder.length; i++) {
       const participant = combat.turnOrder[i];
       const isCurrent = i === combat.currentTurnIndex;
       const marker = isCurrent ? "➤" : "  ";
       const emphasis = isCurrent ? "**" : "";
       const highlight = isCurrent ? "🎯 " : "";
       
       orderList += `${marker} ${highlight}${emphasis}${participant.name} (Iniciativa: ${participant.initiative})${emphasis}\n`;
     }
    
    const currentPlayer = combat.getCurrentPlayer();
    
    embed.addFields(
      { name: "Master del Combate", value: `<@${combat.masterId}>`, inline: true },
      { name: "Ronda Actual", value: `**${combat.round}**`, inline: true },
      { name: "Turno Actual", value: currentPlayer ? `**${currentPlayer.name}** (<@${currentPlayer.userId}>)` : "Ninguno", inline: true },
      { name: "Orden de Turnos", value: orderList || "Sin participantes", inline: false }
    );
    
    if (currentPlayer) {
      embed.addFields({
        name: "⏰ Esperando Acción",
        value: `<@${currentPlayer.userId}> es tu turno con **${currentPlayer.name}**`,
        inline: false
      });
    }
    
  } else {
    embed.setDescription("🔄 **Combate Creado** - Esperando participantes");
    
    let participantsList = "";
    for (const participant of combat.participants.values()) {
      participantsList += `• ${participant.name}\n`;
    }
    
    embed.addFields(
      { name: "Master del Combate", value: `<@${combat.masterId}>`, inline: true },
      { name: "Participantes", value: participantsList || "Ninguno", inline: false }
    );
  }

  // Información adicional
  embed.addFields({
    name: "ℹ️ Información",
    value: `**Total de participantes:** ${combat.participants.size}\n` +
           `**Estado:** ${combat.initiativePhase ? "Iniciativa" : combat.isActive ? "Activo" : "Esperando"}\n` +
           `**Canal:** ${interaction.channel.name}`,
    inline: false
  });

  // Si hay combate activo, incluir el ping
  let content = null;
  if (combat.isActive && combat.getCurrentPlayer()) {
    const currentPlayer = combat.getCurrentPlayer();
    content = `<@${currentPlayer.userId}> ¡Es tu turno! (${currentPlayer.name})`;
  }

  return { 
    embeds: [embed],
    content: content
  };
}

async function nextTurn(interaction) {
  const channelId = interaction.channel.id;
  const combat = getCombat(channelId);
  const userId = interaction.user.id;

  if (!combat) {
    return {
      content: "❌ No hay un combate activo en este canal.",
      ephemeral: true
    };
  }

  if (!combat.isActive) {
    return {
      content: "❌ El combate no está activo. Espera a que todos tiren iniciativa.",
      ephemeral: true
    };
  }

  // Solo el master puede avanzar turnos manualmente
  if (combat.masterId !== userId) {
    return {
      content: "❌ Solo el master del combate puede avanzar turnos manualmente.",
      ephemeral: true
    };
  }

  combat.nextTurn();
  const turnOrderData = combat.getTurnOrderEmbed();
  return { 
    embeds: [turnOrderData.embed],
    content: `🔄 **Turno avanzado por el master**\n${turnOrderData.content || ""}`
  };
}

module.exports = {
  CombatManager,
  getCombat,
  createCombat,
  startCombat,
  joinCombat,
  endCombat,
  nextTurn,
  showCombatStatus
}; 