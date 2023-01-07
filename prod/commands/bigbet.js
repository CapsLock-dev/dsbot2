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
exports.command = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../db");
exports.command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('bigbet')
        .setDescription('Ставка на несколько человек')
        .addIntegerOption(o => o.setName('value').setDescription('сумма').setRequired(true)),
    exec: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const userList = [];
        const betValue = interaction.options.getInteger('value', true);
        let prize = betValue;
        if ((yield (0, db_1.getBalance)(client.pool, (_a = interaction.member) === null || _a === void 0 ? void 0 : _a.user.id)) < betValue) {
            interaction.reply({ content: 'У вас недостаточно средств', ephemeral: true });
            return;
        }
        (0, db_1.updateBalance)(client.pool, (_b = interaction.member) === null || _b === void 0 ? void 0 : _b.user.id, (yield (0, db_1.getBalance)(client.pool, (_c = interaction.member) === null || _c === void 0 ? void 0 : _c.user.id)) - betValue);
        const row = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId('accept')
            .setLabel('Bet')
            .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
            .setCustomId('start')
            .setLabel('Запустить')
            .setStyle(discord_js_1.ButtonStyle.Success));
        const emb = new discord_js_1.EmbedBuilder()
            .setTitle('Big Bet')
            .setDescription('Участники: ' + userList.join(', '))
            .setFields([{ name: 'Ставка: ', value: `${betValue}` }, { name: 'Выигрыш', value: prize.toString() }]);
        const message = yield interaction.reply({ embeds: [emb], components: [row], fetchReply: true });
        const collector = message.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.Button, max: 1 });
        collector.on('collect', (i) => __awaiter(void 0, void 0, void 0, function* () {
            var _d, _e, _f, _g, _h, _j, _k, _l;
            if (userList.includes((_d = i.member) === null || _d === void 0 ? void 0 : _d.user.id))
                return;
            switch (i.customId) {
                case 'accept':
                    if ((yield (0, db_1.getBalance)(client.pool, (_e = i.member) === null || _e === void 0 ? void 0 : _e.user.id)) >= betValue) {
                        userList.push((_f = i.member) === null || _f === void 0 ? void 0 : _f.user.id);
                        prize += betValue;
                        const emb = new discord_js_1.EmbedBuilder()
                            .setTitle('Big Bet')
                            .setDescription('Участники: ' + userList.join(', '))
                            .setFields([{ name: 'Ставка: ', value: `${betValue}` }, { name: 'Выигрыш', value: prize.toString() }]);
                        (0, db_1.updateBalance)(client.pool, (_g = i.member) === null || _g === void 0 ? void 0 : _g.user.id, (yield (0, db_1.getBalance)(client.pool, (_h = i.member) === null || _h === void 0 ? void 0 : _h.user.id)) - betValue);
                        message.edit({ embeds: [emb], components: [row] });
                    }
                    else {
                        i.reply({ content: 'У вас недостаточно средств', ephemeral: true });
                    }
                    break;
                case 'start':
                    if (interaction.user.id === ((_j = i.member) === null || _j === void 0 ? void 0 : _j.user.id)) {
                        const winner = userList[Math.floor(Math.random() * userList.length)];
                        i.reply(`${(_l = (_k = interaction.guild) === null || _k === void 0 ? void 0 : _k.members.cache.find(u => u.id === winner)) === null || _l === void 0 ? void 0 : _l.user.username} выиграл ${prize}`);
                    }
                    break;
            }
        }));
    })
};
