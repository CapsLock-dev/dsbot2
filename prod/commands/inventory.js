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
        .setName('inventory')
        .setDescription('Инвентарь'),
    exec: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
        if (!interaction.member)
            return;
        function updateMenu() {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                const roleList = (yield (0, db_1.getInventory)(client.pool, member.id)).roles;
                const roleOptions = [];
                for (const roleId of roleList) {
                    const role = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.roles.cache.find(r => r.id === roleId);
                    if (role) {
                        roleOptions.push({ label: role.name, description: 'Включить/Выключить', value: role.id });
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
                    .setCustomId('return')
                    .setLabel('Назад')
                    .setStyle(discord_js_1.ButtonStyle.Secondary));
                return { components: [roleMenu, returnBtn] };
            });
        }
        const member = interaction.member;
        const menu = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.SelectMenuBuilder()
            .setCustomId('menu')
            .setPlaceholder('Выберите инвентарь для открытия')
            .setMaxValues(1)
            .setMinValues(1)
            .addOptions([{ label: 'Роли', description: 'Включение/Выключение ролей', value: 'roles' }]));
        const returnBtn = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId('escape')
            .setLabel('Закрыть')
            .setStyle(discord_js_1.ButtonStyle.Danger));
        const message = yield interaction.reply({ components: [menu, returnBtn], fetchReply: true });
        const collector = message.createMessageComponentCollector({ time: 60000 * 5 });
        collector.on('collect', (i) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            if (((_a = i.member) === null || _a === void 0 ? void 0 : _a.user.id) !== interaction.user.id)
                return;
            const member = i.member;
            switch (i.componentType) {
                case discord_js_1.ComponentType.Button:
                    switch (i.customId) {
                        case 'return':
                            message.edit({ components: [menu, returnBtn] });
                            break;
                        case 'escape':
                            collector.stop();
                            break;
                    }
                    break;
                case discord_js_1.ComponentType.SelectMenu:
                    const value = i.values[0];
                    switch (i.customId) {
                        case 'roleMenu':
                            if (member.roles.cache.find(r => r.id === value)) {
                                member.roles.remove(value);
                            }
                            else {
                                member.roles.add(value);
                            }
                            break;
                        case 'menu':
                            switch (value) {
                                case 'roles':
                                    message.edit(yield updateMenu());
                                    break;
                            }
                            break;
                    }
                    break;
            }
        }));
        collector.on('end', (i) => __awaiter(void 0, void 0, void 0, function* () {
            message.delete();
        }));
    })
};
