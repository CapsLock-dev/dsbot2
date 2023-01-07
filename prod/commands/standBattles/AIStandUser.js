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
exports.AIStandUser = void 0;
const discord_js_1 = require("discord.js");
class AIStandUser {
    constructor(member, stands, dm, fight) {
        this.ready = false;
        this.chosenSpell = null;
        this.chosenStand = null;
        this.freezed = 0;
        this.member = member;
        this.stands = stands;
        this.fight = fight;
        this.dm = dm;
        this.collector = dm.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.Button });
        this.collector.on('collect', (i) => __awaiter(this, void 0, void 0, function* () {
            this.buttonHandler(i);
        }));
        this.sendMenu();
        for (const stand of stands) {
            stand.user = this;
        }
    }
    buttonHandler(i) {
        switch (i.customId) {
            case '':
        }
    }
    swap(reason) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    sendMenu() {
        return __awaiter(this, void 0, void 0, function* () {
            const emb = new discord_js_1.EmbedBuilder()
                .setTitle('Fight')
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
}
exports.AIStandUser = AIStandUser;
