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
        const userList = [];
        const betValue = interaction.options.getInteger('value', true);
        const author = interaction.member;
        let prize = betValue;
        let balance = yield (0, db_1.getBalance)(client.pool, author.id);
        if (balance < betValue) {
            interaction.reply({ content: 'У вас недостаточно средств', ephemeral: true });
            return;
        }
        userList.push(author.id);
        (0, db_1.updateBalance)(client.pool, author.id, balance - betValue);
        const row = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId('accept')
            .setLabel('Сделать ставку')
            .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
            .setCustomId('start')
            .setLabel('Начать')
            .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Отменить')
            .setStyle(discord_js_1.ButtonStyle.Danger));
        const emb = new discord_js_1.EmbedBuilder()
            .setTitle('Big Bet')
            .setDescription('Участники: ' + userList.map(id => { return `<@${id}>`; }).join(', '))
            .setFields([{ name: 'Ставка: ', value: `${betValue}` }, { name: 'Выигрыш', value: prize.toString() }])
            .setColor("#dacaa4");
        const message = yield interaction.reply({ embeds: [emb], components: [row], fetchReply: true });
        const collector = message.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.Button, time: 60000 * 5 });
        collector.on('collect', (i) => __awaiter(void 0, void 0, void 0, function* () {
            if (!i.member)
                return;
            const member = i.member;
            balance = yield (0, db_1.getBalance)(client.pool, member.id);
            switch (i.customId) {
                case 'accept':
                    if (userList.find(id => id == member.id)) {
                        yield i.reply({ content: 'Вы уже участвуете', ephemeral: true });
                        break;
                    }
                    if (balance >= betValue) {
                        userList.push(`${member.id}`);
                        prize += betValue;
                        const emb = new discord_js_1.EmbedBuilder()
                            .setTitle('Big Bet')
                            .setDescription('Участники: ' + userList.map(id => { return `<@${id}>`; }).join(', '))
                            .setFields([{ name: 'Ставка: ', value: `${betValue}` }, { name: 'Выигрыш', value: prize.toString() }])
                            .setColor("#dacaa4");
                        yield (0, db_1.updateBalance)(client.pool, member.id, balance - betValue);
                        i.deferUpdate();
                        message.edit({ embeds: [emb], components: [row] });
                    }
                    else {
                        yield i.reply({ content: 'У вас недостаточно средств', ephemeral: true });
                    }
                    break;
                case 'start':
                    if (member.id == author.id) {
                        const winner = userList[Math.floor(Math.random() * userList.length)];
                        const emb = new discord_js_1.EmbedBuilder()
                            .setTitle('Big Bet')
                            .setDescription('Участники: ' + userList.map(id => { return `<@${id}>`; }).join(', '))
                            .setFields([{ name: 'Ставка: ', value: `${betValue}` }, { name: 'Выигрыш', value: prize.toString() },
                            { name: 'Выиграл: ', value: `<@${winner}>` }])
                            .setColor("#dacaa4");
                        i.deferUpdate();
                        message.edit({ embeds: [emb] });
                        yield (0, db_1.updateBalance)(client.pool, winner, balance + prize);
                        collector.stop();
                    }
                    else {
                        yield i.reply({ content: 'Вы не можете начать, т.к вы не создатель ставки', ephemeral: true });
                    }
                    break;
                case 'cancel':
                    if (member.id == author.id) {
                        yield message.edit({ content: 'Отменено', embeds: [], components: [] });
                        userList.forEach((id) => __awaiter(void 0, void 0, void 0, function* () {
                            const balance = yield (0, db_1.getBalance)(client.pool, id);
                            yield (0, db_1.updateBalance)(client.pool, id, balance + betValue);
                        }));
                        collector.stop();
                    }
                    else {
                        yield i.reply({ content: 'Вы не можете начать, т.к вы не создатель ставки', ephemeral: true });
                    }
                    break;
            }
        }));
        collector.on('end', (i) => __awaiter(void 0, void 0, void 0, function* () {
            message.edit({ components: [] });
        }));
    })
};
