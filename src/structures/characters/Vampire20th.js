"use strict";
require(`${process.cwd()}/alias`);
const Consumable = require("../Consumable");
const Character20th = require("./base/Character20th");
const { Splats, Emoji } = require("@constants");
const { EmbedBuilder } = require("discord.js");

class Discipline {
  constructor(name, level = 1, path = "") {
    this.name = name;
    this.level = level;
    this.path = path;
  }

  toString() {
    return `${this.name} ${'●'.repeat(this.level)}${this.path ? ` (${this.path})` : ''}`;
  }
}

module.exports = class Vampire20th extends Character20th {
  constructor({ 
    client, 
    name, 
    humanity = 7, 
    blood = 10, 
    willpower = 6,
    clan = "",
    abilities = {
      talents: [],
      skills: [],
      knowledges: []
    },
    disciplines = []
  } = {}) {
    super({ client, name, willpower });
    this.splat = Splats.vampire20th;
    this.morality = {
      name: "Humanity",
      pool: new Consumable(10, humanity, 0),
    };
    this.blood = new Consumable(blood, blood, 0);
    this.clan = clan;
    this.abilities = abilities;
    this.disciplines = disciplines.map(d => 
      d instanceof Discipline ? d : new Discipline(d.name, d.level, d.path)
    );
  }

  static getSplat() {
    return Splats.vampire20th;
  }

  setFields(args) {
    super.setFields(args);
    if (args.blood != null) this.blood.setTotal(args.blood);
    if (args.morality != null) this.morality.pool.setCurrent(args.morality);
    if (args.moralityName != null) this.morality.name = args.moralityName;
    if (args.clan != null) this.clan = args.clan;
    if (args.abilities != null) this.abilities = args.abilities;
    if (args.disciplines != null) {
      this.disciplines = args.disciplines.map(d => 
        d instanceof Discipline ? d : new Discipline(d.name, d.level, d.path)
      );
    }
  }

  updateFields(args) {
    super.updateFields(args);
    if (args.blood != null) this.blood.updateCurrent(args.blood);
    if (args.morality != null) this.morality.pool.updateCurrent(args.morality);
    if (args.clan != null) this.clan = args.clan;
    if (args.abilities != null) {
      this.abilities = {
        ...this.abilities,
        ...args.abilities
      };
    }
    if (args.disciplines != null) {
      this.disciplines = [
        ...this.disciplines,
        ...args.disciplines.map(d => 
          d instanceof Discipline ? d : new Discipline(d.name, d.level, d.path)
        )
      ];
    }
  }

  async deserilize(json) {
    await super.deserilize(json);
    this.class = json.class;
    this.morality.pool.setCurrent(json.morality_value);
    this.morality.name = json.morality_name;
    this.blood.setTotal(json.blood_total);
    this.blood.setCurrent(json.blood_current);
    this.clan = json.clan;
    this.abilities = json.abilities;
    this.disciplines = json.disciplines.map(d => 
      new Discipline(d.name, d.level, d.path)
    );
    return this;
  }

  serialize() {
    const serializer = super.serialize();
    serializer.character["morality_name"] = this.morality.name;
    serializer.character["morality_value"] = this.morality.pool.current;
    serializer.character["blood_total"] = this.blood.total;
    serializer.character["blood_current"] = this.blood.current;
    serializer.character["splat"] = this.splat.slug;
    serializer.character["clan"] = this.clan;
    serializer.character["abilities"] = this.abilities;
    serializer.character["disciplines"] = this.disciplines.map(d => ({
      name: d.name,
      level: d.level,
      path: d.path
    }));
    return serializer;
  }

  getEmbed(notes) {
    const embed = new EmbedBuilder()
      .setColor(this.color)
      .setAuthor(this.getAuthor())
      .setTitle(`${this.name} - ${this.clan}`)
      .setURL("https://realmofdarkness.app/");

    if (this.thumbnail) embed.setThumbnail(this.thumbnail);

    embed.addFields({
      name: `Willpower [${this.willpower.current}/${this.willpower.total}]`,
      value: this.willpower.getTracker({ emoji: Emoji.purple_dot_3 }),
      inline: false,
    });

    if (this.blood.total > 15) {
      embed.addFields({
        name: "Blood",
        value: this.blood.getTracker({ showEmoji: false }),
        inline: false,
      });
    } else {
      embed.addFields({
        name: `Blood [${this.blood.current}/${this.blood.total}]`,
        value: this.blood.getTracker({ emoji: Emoji.red_dot }),
        inline: false,
      });
    }

    embed.addFields({
      name: `${this.morality.name} ${this.morality.pool.current}`,
      value: this.morality.pool.getTracker({ emoji: Emoji.purple_dot_2 }),
      inline: false,
    });

    embed.addFields({
      name: "Health",
      value: this.health.getTracker(),
      inline: false,
    });

    if (Object.values(this.abilities).some(arr => arr.length > 0)) {
      embed.addFields({
        name: "Abilities",
        value: `**Talents:** ${this.abilities.talents.join(", ") || "None"}\n` +
               `**Skills:** ${this.abilities.skills.join(", ") || "None"}\n` +
               `**Knowledges:** ${this.abilities.knowledges.join(", ") || "None"}`,
        inline: false
      });
    }

    if (this.disciplines.length > 0) {
      embed.addFields({
        name: "Disciplines",
        value: this.disciplines.map(d => d.toString()).join("\n"),
        inline: false
      });
    }

    if (this.exp.total > 0) {
      embed.addFields({
        name: "Experience",
        value: this.exp.getTracker({ showEmoji: false }),
        inline: false,
      });
    }

    if (notes) embed.addFields({ name: "Notes", value: notes });

    const links = "\n[Website](https://realmofdarkness.app/) " +
      "| [Commands](https://realmofdarkness.app/20th/commands/) " +
      "| [Patreon](https://www.patreon.com/MiraiMiki)";
    
    if (embed.data.fields.length > 0) {
      embed.data.fields.at(-1).value += links;
    } else {
      embed.addFields({ name: "Links", value: links });
    }

    return embed;
  }
};