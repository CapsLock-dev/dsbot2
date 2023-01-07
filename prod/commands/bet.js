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
var Result;
(function (Result) {
    Result[Result["\u043F\u0440\u043E\u0438\u0433\u0440\u0430\u043B\u0438"] = 0] = "\u043F\u0440\u043E\u0438\u0433\u0440\u0430\u043B\u0438";
    Result[Result["\u0432\u044B\u0438\u0433\u0440\u0430\u043B\u0438"] = 1] = "\u0432\u044B\u0438\u0433\u0440\u0430\u043B\u0438";
})(Result || (Result = {}));
var Colors;
(function (Colors) {
    Colors[Colors["#ff0000"] = 0] = "#ff0000";
    Colors[Colors["#00ff00"] = 1] = "#00ff00";
})(Colors || (Colors = {}));
exports.command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('bet')
        .setDescription('Сделать ставку 50 на 50')
        .addNumberOption(option => option.setName('value').setRequired(true).setDescription('Сумма')),
    exec: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
        if (!interaction.member)
            return;
        const result = Math.round(Math.random());
        const value = interaction.options.get('value', true).value;
        const balance = yield (0, db_1.getBalance)(client.pool, interaction.member.user.id);
        if (balance < value || value < 0) {
            interaction.reply('Неверная сумма');
            return;
        }
        yield (0, db_1.updateBalance)(client.pool, interaction.member.user.id, balance - value + value * 2 * result);
        const emb = new discord_js_1.EmbedBuilder()
            .setColor(Colors[result])
            .setTitle("Bet")
            .setDescription(`Вы ${Result[result]} ${value}`)
            .addFields({ name: 'Ваш баланс:', value: `${balance - value + value * 2 * result}` });
        interaction.reply({ embeds: [emb] });
    })
};
