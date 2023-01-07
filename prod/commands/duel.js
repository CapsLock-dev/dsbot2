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
const Fight_1 = require("./standBattles/Fight");
exports.command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('duel')
        .setDescription('duel')
        .addUserOption(option => option.setName('opponent').setDescription('противник').setRequired(true)),
    exec: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
        if (!interaction.member)
            return;
        const opponent = interaction.options.getMember('opponent');
        const member = interaction.member;
        const dm1 = yield member.createDM();
        const dm2 = yield opponent.createDM();
        new Fight_1.Fight(member, yield (0, db_1.getStands)(client.pool, member.id), dm1, opponent, yield (0, db_1.getStands)(client.pool, opponent.id), dm2);
    })
};
