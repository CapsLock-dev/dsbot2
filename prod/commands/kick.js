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
        .setName('kick')
        .setDescription('Кик. Цена: 1000')
        .addUserOption(option => option.setName('target').setDescription('Цель').setRequired(true)),
    exec: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!interaction.member)
            return;
        const target = interaction.options.getMember('target');
        const member = interaction.member;
        if ((_a = client.cooldowns.get(member.id)) === null || _a === void 0 ? void 0 : _a.findCooldown('kick')) {
            interaction.reply({ content: 'Вы не можете сейчас использовать кик', ephemeral: true });
            return;
        }
        if ((yield (0, db_1.getBalance)(client.pool, member.id)) >= 1000) {
            if (target.voice.channel) {
                yield (0, db_1.updateBalance)(client.pool, member.id, (yield (0, db_1.getBalance)(client.pool, member.id)) - 1000);
                target.voice.disconnect();
                interaction.reply({ content: 'Цель кикнута', ephemeral: true });
            }
            else {
                interaction.reply({ content: 'Цель не в канале', ephemeral: true });
            }
        }
        else {
            interaction.reply({ content: 'У вас недостаточно средств', ephemeral: true });
        }
    })
};
