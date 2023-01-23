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
            for (let i = 0; i < this.stands.length; i++) {
                const stand = this.stands[i];
                stand.startFight();
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
                switch (i.customId) {
                    case 'attack':
                        this.sendAttackMenu();
                        break;
                    case 'swap':
                        this.sendSwapMenu(false);
                        break;
                    case 'giveup':
                        this.run();
                        break;
                }
                break;
            case discord_js_1.ComponentType.SelectMenu:
                const values = i.values[0];
                switch (i.customId) {
                    case 'start_stand':
                        this.chosenStand = this.stands[parseInt(values)];
                        this.message.delete();
                        this.sendAttackMenu();
                        break;
                    case 'swap_stand':
                        this.chosenStand = this.stands[parseInt(values)];
                        this.ready = true;
                        this.fight.readyCheck();
                        this.message.delete();
                        break;
                    case 'swap_stand_dead':
                        this.chosenStand = this.stands[parseInt(values)];
                        this.message.delete();
                        this.sendAttackMenu();
                    case 'attack_menu':
                        const chosenSkill = (_a = this.chosenStand) === null || _a === void 0 ? void 0 : _a.usedSkills[parseInt(values)];
                        if (((_b = this.chosenStand) === null || _b === void 0 ? void 0 : _b.getCooldown(chosenSkill)) == 0) {
                            this.chosenSpell = chosenSkill;
                            console.log(this.chosenSpell);
                            this.ready = true;
                            this.fight.readyCheck();
                            this.message.delete();
                        }
                        else {
                            i.reply('Этот скилл находится в кд');
                        }
                        break;
                }
                break;
        }
    }
    sendSwapMenu(dead) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const options = [];
            for (let i = 0; i < this.stands.length; i++) {
                const stand = this.stands[i];
                if (((_a = stand.status) === null || _a === void 0 ? void 0 : _a.hp) != 0) {
                    options.push({ label: stand.name, description: `Lvl: ${stand.lvl}`, value: i.toString() });
                }
            }
            const customId = dead ? 'swap_stand_dead' : 'swap_stand';
            const emb = new discord_js_1.EmbedBuilder()
                .setTitle('Битва')
                .setThumbnail('https://media.discordapp.net/attachments/966392406662586458/1041374682072490045/unknown.png?width=649&height=618');
            const menu = new discord_js_1.ActionRowBuilder()
                .addComponents(new discord_js_1.SelectMenuBuilder()
                .setCustomId(customId)
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
        var _a, _b;
        if (this.chosenStand.status.hp > 0) {
            const sBuff = this.fight.standBuffer();
            const target = this.fight.anotherPlayer(this).chosenStand;
            let message = '';
            this.chosenSpell.use(this.fight, target, this.chosenStand);
            message += `${(_a = this.chosenStand) === null || _a === void 0 ? void 0 : _a.name} использовал ${(_b = this.chosenSpell) === null || _b === void 0 ? void 0 : _b.name}`;
            if (target.status.hp <= 0) {
                message += `\n ${target.name} умер`;
            }
            this.fight.sendBattleLog(message, sBuff.stand1, sBuff.stand2);
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
