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
        .setName('roles')
        .setDescription('Переключение ролей'),
    exec: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (!interaction.member)
            return;
        const member = interaction.member;
        if (!(yield (0, db_1.getInventory)(client.pool, member.id)).filterArray('roles')) {
            interaction.reply('У вас нет ни одной купленной роли');
            return;
        }
        const roleList = (yield (0, db_1.getInventory)(client.pool, member.id)).filterArray('roles');
        const roleOptions = [];
        for (const roleId of roleList) {
            const role = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.roles.cache.find(r => r.id === roleId);
            if (role) {
                roleOptions.push({ label: role.name, description: 'Включить/Выключить', value: role.id });
            }
            else {
                (_b = interaction.channel) === null || _b === void 0 ? void 0 : _b.send(`Роли: ${roleId} не существует`);
            }
        }
        const roleMenu = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.SelectMenuBuilder()
            .setCustomId('roleMenu')
            .setPlaceholder('Выберите роль для переключения')
            .setMaxValues(1)
            .setMinValues(1)
            .addOptions(roleOptions));
        const returnBtn = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId('close')
            .setLabel('Закрыть')
            .setStyle(discord_js_1.ButtonStyle.Secondary));
        const msg = yield interaction.reply({ components: [roleMenu, returnBtn], fetchReply: true });
        const collector = msg.createMessageComponentCollector({ time: 60000 * 5 });
        collector.on('collect', (i) => __awaiter(void 0, void 0, void 0, function* () {
            switch (i.componentType) {
                case discord_js_1.ComponentType.SelectMenu:
                    const value = i.values[0];
                    if (member.roles.cache.find(r => r.id === value)) {
                        member.roles.remove(value);
                    }
                    else {
                        member.roles.add(value);
                    }
                    break;
                case discord_js_1.ComponentType.Button:
                    collector.stop();
                    break;
            }
        }));
        collector.on('end', () => __awaiter(void 0, void 0, void 0, function* () {
            msg.delete();
        }));
    })
};
