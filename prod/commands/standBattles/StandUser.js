"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandUser = void 0;
const discord_js_1 = require("discord.js");
class StandUser {
    constructor(member, stands, dm, fight) {
        this.ready = false;
        this.chosenSpell = null;
        this.chosenStand = null;
        this.chosenMove = 'Idle';
        this.freezed = 0;
        this.member = member;
        this.stands = stands;
        this.fight = fight;
        this.dm = dm;
        this.collector = dm.createMessageComponentCollector();
        this.collector.on('collect', (i) => __awaiter(this, void 0, void 0, function* () {
            this.menuHandler(i);
        }));
        this.init();
        for (const stand of stands) {
            stand.user = this;
        }
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const options = [];
            for (let i = 0; i < 4; i++) {
                const stand = this.stands[i];
                options.push({ label: stand.name, description: `Lvl: ${stand.lvl}`, value: i.toString() });
            }
            const emb = new discord_js_1.EmbedBuilder()
                .setTitle('Битва')
                .setThumbnail('https://media.discordapp.net/attachments/966392406662586458/1041374682072490045/unknown.png?width=649&height=618');
            const menu = new discord_js_1.ActionRowBuilder()
                .addComponents(new discord_js_1.SelectMenuBuilder()
                .setCustomId('start_stand')
                .setMaxValues(1)
                .setMinValues(1)
                .setPlaceholder('Выберите стартового стенда')
                .addOptions(options));
            this.message = yield this.dm.send({ components: [menu], embeds: [emb] });
        });
    }
    menuHandler(i) {
        var _a, _b;
        switch (i.componentType) {
            case discord_js_1.ComponentType.Button:
                break;
            case discord_js_1.ComponentType.SelectMenu:
                switch (i.customId) {
                    case 'start_stand':
                        this.chosenStand = this.stands[parseInt(i.values[0])];
                        this.sendAttackMenu();
                        break;
                    case 'swap_stand':
                        this.chosenStand = this.stands[parseInt(i.values[0])];
                        break;
                    case 'attack_menu':
                        const chosenSkill = (_a = this.chosenStand) === null || _a === void 0 ? void 0 : _a.usedSkills[parseInt(i.values[0])];
                        if (((_b = this.chosenStand) === null || _b === void 0 ? void 0 : _b.getCooldown(chosenSkill)) == 0) {
                            this.chosenSpell = chosenSkill;
                        }
                        else {
                            i.reply('Этот скилл находится в кд');
                        }
                }
                break;
        }
    }
    sendSwapMenu(dead) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield this.message.delete();
            const options = [];
            for (let i = 0; i < 4; i++) {
                const stand = this.stands[i];
                if (((_a = stand.status) === null || _a === void 0 ? void 0 : _a.hp) != 0) {
                    options.push({ label: stand.name, description: `Lvl: ${stand.lvl}`, value: i.toString() });
                }
            }
            const emb = new discord_js_1.EmbedBuilder()
                .setTitle('Битва')
                .setThumbnail('https://media.discordapp.net/attachments/966392406662586458/1041374682072490045/unknown.png?width=649&height=618');
            const menu = new discord_js_1.ActionRowBuilder()
                .addComponents(new discord_js_1.SelectMenuBuilder()
                .setCustomId('swap_stand')
                .setMaxValues(1)
                .setMinValues(1)
                .setPlaceholder('Выберите стенд')
                .addOptions(options));
            this.message = yield this.dm.send({ components: [menu], embeds: [emb] });
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            this.fight.end('run', this);
        });
    }
    sendAttackMenu() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.message.delete();
            const options = [];
            const stand = this.chosenStand;
            for (let i = 0; i < stand.usedSkills.length; i++) {
                const skill = stand.usedSkills[i];
                options.push({ label: skill.name, description: `КД: ${stand.getCooldown(skill)}`, value: i.toString() });
            }
            const emb = new discord_js_1.EmbedBuilder()
                .setTitle('Атака');
            const menu = new discord_js_1.ActionRowBuilder()
                .addComponents(new discord_js_1.SelectMenuBuilder()
                .setCustomId('attack_menu')
                .setMaxValues(1)
                .setMinValues(1)
                .setPlaceholder('Выберите скилл')
                .addOptions(options));
            this.message = yield this.dm.send({ embeds: [emb], components: [menu] });
        });
    }
    sendMainMenu() {
        return __awaiter(this, void 0, void 0, function* () {
            this.message.delete();
            const emb = new discord_js_1.EmbedBuilder()
                .setTitle('Битва')
                .setDescription('Выберите действие');
            const buttons = new discord_js_1.ActionRowBuilder()
                .addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId('attack')
                .setLabel('Выбрать атаку')
                .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
                .setCustomId('swap')
                .setLabel('Поменять стенд')
                .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
                .setCustomId('giveup')
                .setLabel('Сдаться')
                .setStyle(discord_js_1.ButtonStyle.Primary));
            this.message = yield this.dm.send({ components: [buttons], embeds: [emb] });
        });
    }
    useSpell() {
        var _a;
        if (this.chosenStand.status.hp > 0) {
            const target = this.fight.anotherPlayer(this).chosenStand;
            let message = '';
            this.chosenSpell.use(this.fight, target);
            message += `${(_a = this.chosenStand) === null || _a === void 0 ? void 0 : _a.name} использовал ${this.chosenSpell}`;
            if (target.status.hp <= 0) {
                message += `\n ${target.name} умер`;
            }
        }
        else {
        }
    }
    update() {
        for (const stand of this.stands.filter(s => s.status.hp > 0)) {
            for (const entry of stand.status.cooldowns) {
                entry.cd -= 1;
            }
        }
        this.chosenSpell = null;
        this.chosenMove = "Idle";
    }
}
exports.StandUser = StandUser;
