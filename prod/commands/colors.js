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
const hexColors = [{ name: 'Pale Violet', hex: '#A387D7' }];
const colors = [];
function updateShopMenu(client, interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const member = interaction.member;
        const colorList = [];
        const buyedRoles = (yield (0, db_1.getInventory)(client.pool, member.id)).filterArray('roles');
        for (const role of colors) {
            const description = !buyedRoles || buyedRoles.includes(role.id) ? 'Куплено' : 'Цена: 5000';
            colorList.push({ label: role.name, description: description, value: role.id });
        }
        const shopMenuEmb = new discord_js_1.EmbedBuilder()
            .setTitle('Магазин цветных ролей')
            .setDescription('При выборе роли откроется меню покупки');
        const productMenu = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
            .setCustomId('colors')
            .setPlaceholder('Выберите роль')
            .setMaxValues(1)
            .setMinValues(1)
            .addOptions(colorList));
        const returnBtn = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId('escape')
            .setLabel('Закрыть')
            .setStyle(discord_js_1.ButtonStyle.Danger));
        return { components: [productMenu, returnBtn], embeds: [shopMenuEmb], fetchReply: true };
    });
}
function prepareColorRoles(interaction) {
    hexColors.forEach((hexColor) => __awaiter(this, void 0, void 0, function* () {
        let exists = false;
        for (const guildRole of interaction.guild.roles.cache) {
            if (guildRole[1].name == hexColor.name) {
                colors.push({ name: hexColor.name, id: guildRole[1].id });
                exists = true;
                break;
            }
        }
        if (!exists) {
            const newRole = yield interaction.guild.roles.create({ name: hexColor.name, color: hexColor.hex, reason: "doesn't exists" });
            colors.push({ name: hexColor.name, id: newRole.id });
        }
    }));
}
exports.command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('colors')
        .setDescription('Цвета'),
    exec: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
        prepareColorRoles(interaction);
        const member = interaction.member;
        const roleList = [];
        colors.map((el) => {
            roleList.push(el.id);
        });
        let buyedRoles = (yield (0, db_1.getInventory)(client.pool, member.id)).filterArray('roles');
        let shopMenu = yield updateShopMenu(client, interaction);
        const message = yield interaction.reply(shopMenu);
        let chosenRole;
        const collector = message.createMessageComponentCollector({ time: 60000 * 5 });
        collector.on('collect', (i) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            if (i.user.id !== interaction.user.id && i.guild)
                return;
            // Обновление списка купленных ролей
            buyedRoles = (yield (0, db_1.getInventory)(client.pool, member.id)).filterArray('roles');
            // Обновление меню магазина
            shopMenu = yield updateShopMenu(client, interaction);
            switch (i.componentType) {
                case discord_js_1.ComponentType.Button:
                    switch (i.customId) {
                        case 'buy':
                            const bal = yield (0, db_1.getBalance)(client.pool, member.id);
                            // Если нет купленных ролей или роль не куплена
                            if (!buyedRoles || !buyedRoles.includes(chosenRole.id)) {
                                if (bal > 5000) {
                                    yield (0, db_1.updateBalance)(client.pool, member.id, bal - 5000);
                                    if (!member.roles.cache.find(r => r.id === chosenRole.id))
                                        member.roles.add(chosenRole);
                                    (0, db_1.addElementInv)(client.pool, member.id, 'roles', chosenRole.id);
                                    i.reply({ content: `Вы купили роль ` + chosenRole.name, ephemeral: true });
                                    message.edit(shopMenu);
                                }
                                else {
                                    i.reply({ content: `У вас недостаточно средств`, ephemeral: true });
                                }
                            }
                            else {
                                i.reply({ content: `У вас уже есть эта роль`, ephemeral: true });
                            }
                            break;
                        case 'try':
                            if (!member.roles.cache.find(role => role.id === chosenRole.id)) {
                                member.roles.add(chosenRole);
                                const roleToRemove = chosenRole;
                                setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                                    const buyedRoles = (yield (0, db_1.getInventory)(client.pool, member.id)).filterArray('roles');
                                    // У юзера все еще есть роль и она не куплена
                                    if (member.roles.cache.find(role => role.id === roleToRemove.id) && (!buyedRoles || !buyedRoles.includes(roleToRemove.id))) {
                                        member.roles.remove(roleToRemove);
                                    }
                                }), 15000);
                            }
                            break;
                        case 'return':
                            message.edit(shopMenu);
                            break;
                        case 'escape':
                            collector.stop();
                            break;
                    }
                    break;
                case discord_js_1.ComponentType.StringSelect:
                    let colorRoleId = i.values[0];
                    const userRoles = (yield (0, db_1.getInventory)(client.pool, member.id)).filterArray('roles');
                    if (!userRoles || !userRoles.includes(colorRoleId)) {
                        chosenRole = (yield ((_a = i.guild) === null || _a === void 0 ? void 0 : _a.roles.fetch(colorRoleId)));
                        if (!chosenRole) {
                            message.reply({ content: `Colors error: ${colorRoleId} doesn't exists` });
                            return;
                        }
                        const roleMenu = new discord_js_1.ActionRowBuilder()
                            .addComponents(new discord_js_1.ButtonBuilder()
                            .setCustomId('buy')
                            .setLabel('Купить')
                            .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
                            .setCustomId('try')
                            .setLabel('Попробовать')
                            .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
                            .setCustomId('return')
                            .setLabel('Вернуться')
                            .setStyle(discord_js_1.ButtonStyle.Danger));
                        const roleMenuEmb = new discord_js_1.EmbedBuilder()
                            .setTitle(`Купить роль ${chosenRole.name}`)
                            .setDescription('Цвет: <@&' + colorRoleId + '>\nЦена: 5000');
                        const roleMenuMsg = { components: [roleMenu], embeds: [roleMenuEmb] };
                        i.deferUpdate();
                        message.edit(roleMenuMsg);
                    }
                    else {
                        i.reply({ content: 'У вас уже есть эта роль', ephemeral: true });
                    }
                    break;
            }
        }));
        collector.on('end', (i) => __awaiter(void 0, void 0, void 0, function* () {
            message.delete();
        }));
    })
};
