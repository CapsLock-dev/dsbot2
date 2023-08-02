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
const Stand_1 = require("./standBattles/Stand");
function sendRoleMenu(client, interaction) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const member = interaction.member;
        const roleList = (yield (0, db_1.getInventory)(client.pool, member.id)).filterArray('roles');
        const roleOptions = [];
        for (const roleId of roleList) {
            const role = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.roles.cache.find(r => r.id === roleId);
            if (role) {
                roleOptions.push({ label: role.name, description: 'Включить/Выключить', value: role.id });
            }
            else {
                let channel = interaction.channel;
                channel.send(`Роли: ${roleId} не существует`);
            }
        }
        const emb = new discord_js_1.EmbedBuilder()
            .setTitle(member.displayName)
            .setDescription('Ваши роли: ' + roleList.map(role => `<@&${role}>`).join(', '))
            .setColor("#dacaa4");
        const roleMenu = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.StringSelectMenuBuilder()
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
        return { embeds: [emb], components: [roleMenu, returnBtn] };
    });
}
function sendStandMenu(client, interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const member = interaction.member;
        const standList = yield (0, db_1.getStands)(client.pool, member.id);
        const options = [];
        for (const stand of standList) {
            options.push({ label: stand.name, description: 'Нажмите, чтобы редактировать', value: stand.name });
        }
        const standTeam = yield (0, db_1.getTeamStands)(client.pool, member.id);
        const team = standTeam.map(stand => stand.name);
        const emb = new discord_js_1.EmbedBuilder()
            .setTitle(member.displayName)
            .setDescription('Команда: ' + team.join(', '))
            .setColor("#dacaa4");
        const standMenu = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.StringSelectMenuBuilder()
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
        return { embeds: [emb], components: [standMenu, returnBtn] };
    });
}
function sendProfileMenu(client, interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const member = interaction.member;
        const inv = yield (0, db_1.getInventory)(client.pool, member.id);
        const bal = yield (0, db_1.getBalance)(client.pool, member.id);
        const serverDays = Math.round((Date.now() - member.joinedAt) / 1000 / 60 / 60 / 24).toString();
        const exp = yield (0, db_1.getExp)(client.pool, member.id);
        const lvl = yield (0, db_1.getLvl)(client.pool, member.id);
        const emb = new discord_js_1.EmbedBuilder()
            .setTitle(member.displayName)
            .setDescription(`Награды: \nБаланс: ${bal}\nУровень: ${lvl}\nОпыт: ${exp}\nНа сервере: ${serverDays} дней`)
            .setThumbnail(member.avatarURL())
            .setColor("#dacaa4");
        const menu = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.StringSelectMenuBuilder()
            .setCustomId('menu')
            .setPlaceholder('Выберите опцию')
            .setMaxValues(1)
            .setMinValues(1)
            .addOptions([{ label: 'Роли', description: 'Вкл/Выкл ролей', value: 'roles' },
            { label: 'Стенды', description: 'Ваши стенды', value: 'stands' }]));
        const closeButton = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId('close')
            .setLabel('Закрыть')
            .setStyle(discord_js_1.ButtonStyle.Danger));
        return { embeds: [emb], components: [menu, closeButton] };
    });
}
exports.command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('profile')
        .setDescription('profile'),
    exec: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
        const member = interaction.member;
        if (!member || !member.joinedAt)
            return;
        const inv = yield (0, db_1.getInventory)(client.pool, member.id);
        const bal = yield (0, db_1.getBalance)(client.pool, member.id);
        const message = yield interaction.reply(yield sendProfileMenu(client, interaction));
        const collector = message.createMessageComponentCollector({ time: 60000 * 5 });
        let chosenStand;
        collector.on('collect', (i) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            if (((_a = i.member) === null || _a === void 0 ? void 0 : _a.user.id) !== interaction.user.id)
                return;
            const member = i.member;
            switch (i.componentType) {
                case discord_js_1.ComponentType.StringSelect:
                    switch (i.customId) {
                        case "menu":
                            switch (i.values[0]) {
                                case 'roles':
                                    if (inv.filterArray('roles').length > 0) {
                                        message.edit(yield sendRoleMenu(client, interaction));
                                        i.deferUpdate();
                                    }
                                    else {
                                        i.reply({ content: 'У вас нет ни одной купленной роли', ephemeral: true });
                                        i.deferUpdate();
                                    }
                                    break;
                                case 'stands':
                                    const stands = yield (0, db_1.getStands)(client.pool, member.id);
                                    if (stands.length > 0) {
                                        message.edit(yield sendStandMenu(client, interaction));
                                        i.deferUpdate();
                                    }
                                    else {
                                        i.reply({ content: 'У вас нет ни одного стенда', ephemeral: true });
                                    }
                                    break;
                            }
                            break;
                        case 'roleMenu':
                            const value = i.values[0];
                            if (member.roles.cache.find(r => r.id === value)) {
                                console.log("role removed");
                                member.roles.remove(value);
                                i.deferUpdate();
                            }
                            else {
                                member.roles.add(value);
                                console.log("role added");
                                i.deferUpdate();
                            }
                            break;
                        case 'standMenu':
                            const standName = i.values[0];
                            chosenStand = standName;
                            const stand = (yield (0, db_1.getStands)(client.pool, member.id)).filter(stand => stand.name == standName)[0];
                            const skills = stand.usedSkills.map(skill => {
                                return {
                                    name: skill.name,
                                    value: `Описание: ${skill.description}\n КД: ${skill.cooldown}\n Тип: ${skill.type == Stand_1.SkillType.Special ? 'Спец' : 'Физ'}`, inline: true
                                };
                            });
                            const emb = new discord_js_1.EmbedBuilder()
                                .setTitle(stand.name)
                                .setDescription(`HP: ${stand.maxhp}\nDamage: ${stand.damage}\nSpeed: ${stand.speed}\nDefence: ${stand.defence}`)
                                .addFields(skills);
                            if (stand.image) {
                                emb.setImage(stand.image);
                            }
                            const team = (yield (0, db_1.getTeamStands)(client.pool, member.id)).find(stand => stand.name == standName);
                            let buttonName = team ? 'Убрать из команды' : 'Добавить в команду';
                            let buttonId = team ? 'removeTeam' : 'addTeam';
                            let buttonStyle = team ? discord_js_1.ButtonStyle.Danger : discord_js_1.ButtonStyle.Success;
                            const btns = new discord_js_1.ActionRowBuilder()
                                .addComponents(new discord_js_1.ButtonBuilder()
                                .setCustomId('returnStand')
                                .setLabel('Назад')
                                .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
                                .setCustomId(buttonId)
                                .setLabel(buttonName)
                                .setStyle(buttonStyle));
                            message.edit({ components: [btns], embeds: [emb] });
                            i.deferUpdate();
                            break;
                    }
                case discord_js_1.ComponentType.Button:
                    switch (i.customId) {
                        case 'return':
                            message.edit(yield sendProfileMenu(client, interaction));
                            i.deferUpdate();
                            break;
                        case 'returnStand':
                            message.edit(yield sendStandMenu(client, interaction));
                            i.deferUpdate();
                            break;
                        case 'removeTeam':
                            if ((yield (0, db_1.getTeamStands)(client.pool, member.id)).length <= 0) {
                                yield (0, db_1.updateStandTeam)(client.pool, member.id, chosenStand, false);
                                i.reply({ ephemeral: true, content: `${chosenStand} убран из команды` });
                            }
                            else {
                                i.reply({ ephemeral: true, content: `Команда пуста` });
                            }
                            const team = (yield (0, db_1.getTeamStands)(client.pool, member.id)).find(stand => stand.name == chosenStand);
                            let buttonName = team ? 'Убрать из команды' : 'Добавить в команду';
                            let buttonId = team ? 'removeTeam' : 'addTeam';
                            let buttonStyle = team ? discord_js_1.ButtonStyle.Danger : discord_js_1.ButtonStyle.Success;
                            const btns = new discord_js_1.ActionRowBuilder()
                                .addComponents(new discord_js_1.ButtonBuilder()
                                .setCustomId('returnStand')
                                .setLabel('Назад')
                                .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
                                .setCustomId(buttonId)
                                .setLabel(buttonName)
                                .setStyle(buttonStyle));
                            message.edit({ components: [btns] });
                            break;
                        case 'addTeam':
                            if ((yield (0, db_1.getTeamStands)(client.pool, member.id)).length < 5) {
                                yield (0, db_1.updateStandTeam)(client.pool, member.id, chosenStand, true);
                                i.reply({ ephemeral: true, content: `${chosenStand} добавлен в команду` });
                            }
                            else {
                                i.reply({ ephemeral: true, content: `Команда заполнена` });
                            }
                            const team1 = (yield (0, db_1.getTeamStands)(client.pool, member.id)).find(stand => stand.name == chosenStand);
                            let buttonName1 = team ? 'Убрать из команды' : 'Добавить в команду';
                            let buttonId1 = team ? 'removeTeam' : 'addTeam';
                            let buttonStyle1 = team ? discord_js_1.ButtonStyle.Danger : discord_js_1.ButtonStyle.Success;
                            const btns1 = new discord_js_1.ActionRowBuilder()
                                .addComponents(new discord_js_1.ButtonBuilder()
                                .setCustomId('returnStand')
                                .setLabel('Назад')
                                .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
                                .setCustomId(buttonId1)
                                .setLabel(buttonName1)
                                .setStyle(buttonStyle1));
                            message.edit({ components: [btns1] });
                            message.edit(yield sendStandMenu(client, interaction));
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
