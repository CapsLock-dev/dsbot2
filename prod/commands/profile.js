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
        .setName('profile')
        .setDescription('profile'),
    exec: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
        if (!interaction.member)
            return;
        const member = interaction.member;
        const inv = yield (0, db_1.getInventory)(client.pool, member.id);
        const bal = yield (0, db_1.getBalance)(client.pool, member.id);
        if (!member.joinedAt) {
            return;
        }
        function sendRoleMenu() {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
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
                    .setCustomId('return')
                    .setLabel('Назад')
                    .setStyle(discord_js_1.ButtonStyle.Secondary));
                return { components: [roleMenu, returnBtn] };
            });
        }
        function sendChannelMenu() {
            return __awaiter(this, void 0, void 0, function* () {
                const channelList = (yield (0, db_1.getInventory)(client.pool, member.id)).filterArray('channels');
                const options = [];
                for (const channelId in channelList) {
                    const channel = member.guild.channels.cache.find(c => c.id === channelId);
                    if (channel) {
                        options.push({ label: channel.name, description: 'Нажмите чтобы редактировать', value: channelId });
                    }
                }
                const channelMenu = new discord_js_1.ActionRowBuilder()
                    .addComponents(new discord_js_1.SelectMenuBuilder()
                    .setCustomId('channelMenu')
                    .setPlaceholder('Выберите канал для редактирования')
                    .setMaxValues(1)
                    .setMinValues(1)
                    .addOptions(options));
                const returnBtn = new discord_js_1.ActionRowBuilder()
                    .addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId('return')
                    .setLabel('Назад')
                    .setStyle(discord_js_1.ButtonStyle.Secondary));
                return { components: [channelMenu, returnBtn] };
            });
        }
        function sendStandMenu() {
            return __awaiter(this, void 0, void 0, function* () {
                const standList = yield (0, db_1.getStands)(client.pool, member.id);
                const options = [];
                for (const stand of standList) {
                    options.push({ label: stand.name, description: 'Нажмите, чтобы редактировать', value: stand.name });
                }
                const standMenu = new discord_js_1.ActionRowBuilder()
                    .addComponents(new discord_js_1.SelectMenuBuilder()
                    .setCustomId('standMenu')
                    .setPlaceholder('Выберите стенд для редактирования')
                    .setMaxValues(1)
                    .setMinValues(1)
                    .addOptions(options));
                const returnBtn = new discord_js_1.ActionRowBuilder()
                    .addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId('return')
                    .setLabel('Назад')
                    .setStyle(discord_js_1.ButtonStyle.Secondary));
                return { components: [standMenu, returnBtn] };
            });
        }
        const serverDays = Math.round((Date.now() - member.joinedAt) / 1000 / 60 / 60 / 24).toString();
        const exp = (0, db_1.getExp)(client.pool, member.id);
        const lvl = (0, db_1.getLvl)(client.pool, member.id);
        const emb = new discord_js_1.EmbedBuilder()
            .setTitle(member.displayName)
            .setDescription(`Награды: \nБаланс: ${bal}\nУровень: ${lvl}\nОпыт: ${exp}\nНа сервере: ${serverDays} дней`)
            .setThumbnail(member.avatarURL());
        const menu = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.SelectMenuBuilder()
            .setCustomId('menu')
            .setPlaceholder('Выберите опцию')
            .setMaxValues(1)
            .setMinValues(1)
            .addOptions([{ label: 'Роли', description: 'Вкл/Выкл ролей', value: 'roles' },
            { label: 'Каналы', description: 'Настройка личных каналов', value: 'channels' },
            { label: 'Стенды', description: 'Ваши стенды', value: 'stands' }]));
        const closeButton = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId('close')
            .setLabel('Закрыть')
            .setStyle(discord_js_1.ButtonStyle.Danger));
        const message = yield interaction.reply({ embeds: [emb], components: [menu, closeButton], fetchReply: true });
        const collector = message.createMessageComponentCollector({ time: 60000 * 5 });
        collector.on('collect', (i) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            if (((_a = i.member) === null || _a === void 0 ? void 0 : _a.user.id) !== interaction.user.id)
                return;
            const member = i.member;
            switch (i.componentType) {
                case discord_js_1.ComponentType.SelectMenu:
                    switch (i.customId) {
                        case 'roles':
                            if (inv.filterArray('roles')) {
                                message.edit(yield sendRoleMenu());
                            }
                            else {
                                i.reply('У вас нет ни одной купленной роли');
                            }
                            break;
                        case 'roles':
                            const value = i.values[0];
                            if (member.roles.cache.find(r => r.id === value)) {
                                member.roles.remove(value);
                            }
                            else {
                                member.roles.add(value);
                            }
                            break;
                        case 'channels':
                            break;
                        case 'channels':
                            if (inv.filterArray('channels')) {
                                message.edit(yield sendChannelMenu());
                            }
                            else {
                                i.reply('У вас нет ни одного купленного канала');
                            }
                            break;
                        case 'stands':
                            const stands = yield (0, db_1.getStands)(client.pool, member.id);
                            if (stands) {
                                message.edit(yield sendStandMenu());
                            }
                            else {
                                i.reply('У вас нет ни одного стенда');
                            }
                            break;
                    }
                    break;
                case discord_js_1.ComponentType.Button:
                    switch (i.customId) {
                        case 'return':
                            message.edit({ components: [menu, closeButton] });
                            break;
                        case 'close':
                            collector.stop();
                            break;
                    }
                    break;
            }
        }));
        collector.on('end', () => __awaiter(void 0, void 0, void 0, function* () {
            message.delete();
        }));
    })
};
/**
 * TODO:
 * Сделать инвентарь частью профиля
 * Сделать работы (Шахтер: идет в шахту и у него появляются на выбор действия, в шахте можно копать руду и дратсья с мобами ну короче ты вспомнишь наверно)
 * Сделать систему опыта
 */
