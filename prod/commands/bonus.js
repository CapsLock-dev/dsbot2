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
        .setName('bonus')
        .setDescription('Получить ежечасный бонус'),
    exec: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
        if (!interaction.member)
            return;
        const cd = client.cooldowns.get(interaction.member.user.id);
        if (!(cd === null || cd === void 0 ? void 0 : cd.findCooldown('bonus'))) {
            const balance = yield (0, db_1.getBalance)(client.pool, interaction.member.user.id);
            (0, db_1.updateBalance)(client.pool, interaction.member.user.id, balance + 100);
            interaction.reply('Вы получили бонус 100$');
            cd === null || cd === void 0 ? void 0 : cd.addCooldown('bonus', 3600);
        }
        else {
            interaction.reply('Вы не можете сейчас получить бонус');
        }
    })
};
