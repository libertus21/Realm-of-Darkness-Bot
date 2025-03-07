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
    talents = {},
    skills = {},
    knowledges = {},
    disciplines = []
  } = {}) {
    super({ client, name, willpower });
    this.splat = Splats.vampire20th;
    this.morality = { name: "Humanity", pool: new Consumable(10, humanity, 0) };
    this.blood = new Consumable(blood, blood, 0);
    this.clan = clan;
    this.talents = talents;
    this.skills = skills;
    this.knowledges = knowledges;
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
    
    const updateAbilities = (source, target) => {
      for (const [ability, level] of Object.entries(source)) {
        target[ability] = level;
      }
    };
    
    if (args.talents) updateAbilities(args.talents, this.talents);
    if (args.skills) updateAbilities(args.skills, this.skills);
    if (args.knowledges) updateAbilities(args.knowledges, this.knowledges);

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
    
    const mergeAbilities = (source, target) => {
      for (const [ability, level] of Object.entries(source)) {
        target[ability] = (target[ability] || 0) + level;
      }
    };
    
    if (args.talents) mergeAbilities(args.talents, this.talents);
    if (args.skills) mergeAbilities(args.skills, this.skills);
    if (args.knowledges) mergeAbilities(args.knowledges, this.knowledges);

    if (args.disciplines != null) {
      this.disciplines = [
        ...(this.disciplines || []),
        ...args.disciplines.map(d => 
          d instanceof Discipline ? d : new Discipline(d.name, d.level, d.path)
        )
      ];
    }
  }

  async deserilize(json) {
    await super.deserilize(json);
    this.morality.pool.setCurrent(json.morality_value);
    this.morality.name = json.morality_name;
    this.blood.setTotal(json.blood_total);
    this.blood.setCurrent(json.blood_current);
    this.clan = json.clan;
    const mapAbilities = (skills) => {
      const abilities = {};
  
      const categoryMap = {
        talents: ['alertness', 'athletics', 'awareness', 'brawl', 'empathy',
                 'expression', 'intimidation', 'leadership', 'streetwise', 'subterfuge'],
        skills: ['animal_ken', 'crafts', 'drive', 'etiquette', 'firearms',
                'larceny', 'melee', 'performance', 'stealth', 'survival'],
        knowledges: ['academics', 'computer', 'finance', 'investigation',
                    'law', 'medicine', 'occult', 'politics', 'science', 'technology']
      };
  
      for (const [skillName, skillData] of Object.entries(skills)) {
        if (skillData.value > 0) {
          if (categoryMap.talents.includes(skillName)) {
            abilities.talents = abilities.talents || {};
            abilities.talents[skillName] = skillData.value;
          } else if (categoryMap.skills.includes(skillName)) {
            abilities.skills = abilities.skills || {};
            abilities.skills[skillName] = skillData.value;
          } else if (categoryMap.knowledges.includes(skillName)) {
            abilities.knowledges = abilities.knowledges || {};
            abilities.knowledges[skillName] = skillData.value;
          }
        }
      }
      return abilities;
    };
    const abilities = mapAbilities(json.skills || {});
    this.talents = abilities.talents || {};
    this.skills = abilities.skills || {};
    this.knowledges = abilities.knowledges || {};
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

    const flattenAbilities = (abilities) => {
      Object.entries(abilities).forEach(([field, value]) => {
        serializer.character[field] = value;
      });
    };

    flattenAbilities(this.talents);
    flattenAbilities(this.skills);
    flattenAbilities(this.knowledges);

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

    const formatAbilities = (abilities) => {
      return Object.entries(abilities)
        .filter(([_, level]) => level > 0)
        .map(([name, level]) => `${name}: ${'●'.repeat(level)}`)
        .join(', ') || 'None';
    };

    embed.addFields({
      name: "Abilities",
      value: `**Talents:** ${formatAbilities(this.talents)}\n` +
             `**Skills:** ${formatAbilities(this.skills)}\n` +
             `**Knowledges:** ${formatAbilities(this.knowledges)}`,
      inline: false
    });

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
