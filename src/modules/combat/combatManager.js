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

  rollInitiative(userId, dexterity, composure, bonus = 0, penalty = 0) {
    const participant = this.participants.get(userId);
    if (!participant) return null;

    const args = {
      pool: dexterity + composure,
      bonus: bonus,
      penalty: penalty,
      character: participant.name,
      notes: "Tirada de Iniciativa"
    };

    const mockInteraction = { arguments: args };
    const rollResults = new CodRollResults(mockInteraction);

    participant.initiative = rollResults.total;
    participant.hasRolledInitiative = true;
    participant.rollResults = rollResults;

    if (this.allInitiativeRolled()) {
      this.buildTurnOrder();
      this.initiativePhase = false;
      this.isActive = true;
    }

    return rollResults;
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
      return embed;
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
    if (currentPlayer) {
      embed.addFields({ 
        name: "Turno Actual", 
        value: `🎲 **${currentPlayer.name}** - <@${currentPlayer.userId}>, ¡es tu turno!` 
      });
    }

    return embed;
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
  return { 
    embeds: [combat.getTurnOrderEmbed()],
    content: `🔄 **Turno avanzado por el master**`
  };
}

module.exports = {
  CombatManager,
  getCombat,
  createCombat,
  startCombat,
  joinCombat,
  endCombat,
  nextTurn
}; 