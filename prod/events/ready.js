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
exports.event = void 0;
const db_1 = require("../db");
const Client_1 = require("../Client");
exports.event = {
    name: 'ready',
    once: true,
    exec: (client) => __awaiter(void 0, void 0, void 0, function* () {
        for (const guild of client.guilds.cache) {
            for (const member of guild[1].members.cache) {
                (0, db_1.addUser)(client.pool, member[1].id);
                client.cooldowns.set(member[1].id, new Client_1.CooldownController());
            }
            console.log('Running on guild: ' + guild[1].name);
        }
        console.log('Bot is ready!');
    })
};
