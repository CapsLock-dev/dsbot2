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
        .setName('pay')
        .setDescription('Перевод на счет')
        .addUserOption(o => o.setName('user').setDescription('получатель').setRequired(true))
        .addNumberOption(o => o.setName('amount').setDescription('сумма').setRequired(true)),
    exec: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
        const member = interaction.member;
        const reciever = interaction.options.getUser('user', true);
        const amount = interaction.options.getNumber('amount', true);
        const balance = yield (0, db_1.getBalance)(client.pool, member.id);
        const recieverBalance = yield (0, db_1.getBalance)(client.pool, reciever.id);
        if (balance > amount && amount >= 0) {
            (0, db_1.updateBalance)(client.pool, member.id, balance - amount);
            (0, db_1.updateBalance)(client.pool, reciever.id, recieverBalance + amount);
            const embed = new discord_js_1.EmbedBuilder()
                .setColor('#00ff00')
                .setTitle(`Перевод пользователю ${reciever.username} выполнен успшено`)
                .addFields({ name: 'Сумма:', value: `${amount}` }, { name: 'Ваш баланс:', value: `${balance - amount}` }, { name: `Баланс получателя`, value: `${recieverBalance + amount}`, inline: true });
            interaction.reply({ embeds: [embed] });
        }
        else {
            interaction.reply('Неверная сумма');
        }
    })
};
