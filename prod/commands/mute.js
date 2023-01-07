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
        .setName('mute')
        .setDescription('Мут. КД: 60 сек. Цена: 10 за сек')
        .addUserOption(option => option.setName('user').setDescription('Цель').setRequired(true))
        .addNumberOption(option => option.setName('time').setDescription('Время в секундах. Стоимость: 10 за сек.').setRequired(true)),
    exec: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (!interaction.member)
            return;
        const member = interaction.member;
        const target = interaction.options.getMember('user');
        const time = interaction.options.getNumber('time', true);
        if ((_a = client.cooldowns.get(member.id)) === null || _a === void 0 ? void 0 : _a.findCooldown('mute')) {
            interaction.reply({ ephemeral: true, content: 'Вы не можете сейчас использовать мут' });
            return;
        }
        if ((yield (0, db_1.getBalance)(client.pool, member.id)) >= time * 10) {
            const muteRole = yield ((_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.roles.fetch('1012129124778786817'));
            if (!muteRole) {
                interaction.reply({ ephemeral: true, content: 'Мут роли не существует' });
            }
            else {
                if (!target.roles.cache.find(role => role.id === muteRole.id)) {
                    const balance = yield (0, db_1.getBalance)(client.pool, member.id);
                    (0, db_1.updateBalance)(client.pool, member.id, balance - time * 10);
                    const deletedRoles = [];
                    for (const role of target.roles.cache) {
                        try {
                            console.log(role[1].id);
                            yield target.roles.remove(role[1]);
                            deletedRoles.push(role[1]);
                        }
                        catch (error) { }
                    }
                    yield target.roles.add(muteRole);
                    setTimeout((target) => {
                        target.roles.add(deletedRoles);
                    }, time * 1000, target);
                    interaction.reply({ ephemeral: true, content: 'Цель получила мут на ' + time + ' секунд' });
                }
                else {
                    interaction.reply({ ephemeral: true, content: 'Цель уже в муте' });
                }
            }
        }
        else {
            interaction.reply({ ephemeral: true, content: 'У вас недостатчно средств' });
        }
    })
};
