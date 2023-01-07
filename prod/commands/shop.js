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
const data_1 = require("./standBattles/data");
exports.command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('shop')
        .setDescription('shop'),
    exec: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
        if (!interaction.member)
            return;
        const member = interaction.member;
        const emb = new discord_js_1.EmbedBuilder()
            .setTitle('Магазин');
        const menu = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.SelectMenuBuilder()
            .setCustomId('shop')
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder('Выберите, чтобы купить')
            .addOptions([{ label: 'Текстовый канал', description: 'Цена: 6000', value: 'text' },
            { label: 'Стрела', description: 'Цена: 10000', value: 'arrow' },
            { label: 'Легендарная стрела', description: 'Цена: 1000000', value: 'legendary_arrow' }]));
        const message = yield interaction.reply({ components: [menu], embeds: [emb], fetchReply: true });
        const collector = message.createMessageComponentCollector({ time: 60000 * 5 });
        collector.on('collect', (i) => __awaiter(void 0, void 0, void 0, function* () {
            if (i.user.id !== member.id)
                return;
            switch (i.values[0]) {
                case 'text':
                    if ((yield (0, db_1.getBalance)(client.pool, member.id)) >= 6000) {
                        try {
                            const everyone = member.guild.roles.cache.find(r => r.name === '@everyone');
                            const channel = yield member.guild.channels.create({
                                name: member.user.username,
                                parent: '1039149287524806688',
                                permissionOverwrites: [{ id: everyone.id, deny: ['ViewChannel'] }, { id: member.id, allow: ['ViewChannel'] }]
                            });
                            (0, db_1.addElementInv)(client.pool, member.id, 'channels', channel.id);
                            yield (0, db_1.updateBalance)(client.pool, member.id, (yield (0, db_1.getBalance)(client.pool, member.id)) - 6000);
                            i.reply({ content: 'Канал создан', ephemeral: true });
                        }
                        catch (e) {
                            i.reply({ content: 'Недостаточно прав', ephemeral: true });
                        }
                    }
                    else {
                        i.reply({ content: 'У вас недостаточно средств', ephemeral: true });
                    }
                    break;
                case 'arrow':
                    if ((yield (0, db_1.getBalance)(client.pool, member.id)) >= 10000) {
                        const userStands = yield (0, db_1.getStands)(client.pool, member.id);
                        const stands = Object.keys(data_1.standList);
                        stands.filter((standName => {
                            for (const stand of userStands) {
                                if (stand.name === standName)
                                    return false;
                            }
                            return true;
                        }));
                        if (stands.length == 0) {
                            i.reply({ content: 'У вас уже есть все стенды', ephemeral: true });
                        }
                        else {
                            const standName = stands[Math.round(Math.random() * stands.length - 1)];
                            const stand = new data_1.standList[standName];
                            yield (0, db_1.updateBalance)(client.pool, member.id, (yield (0, db_1.getBalance)(client.pool, member.id)) - 10000);
                            yield (0, db_1.addStand)(client.pool, member.id, stand);
                            i.reply({ content: 'Вы получили: ' + standName, ephemeral: true });
                        }
                    }
                    break;
            }
        }));
    })
};
