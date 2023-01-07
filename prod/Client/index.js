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
exports.CooldownController = void 0;
const discord_js_1 = require("discord.js");
const pg_1 = require("pg");
const pgClient = new pg_1.Pool({
    host: 'localhost',
    user: 'capslock',
    password: '',
    database: 'mydb',
    port: 5432
});
class CooldownController {
    constructor() {
        this.cooldowns = [];
    }
    addCooldown(name, time) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.cooldowns.includes(name)) {
                this.cooldowns.push(name);
                setTimeout(() => {
                    this.cooldowns.filter((value) => value !== name);
                }, time * 1000);
            }
        });
    }
    findCooldown(name) {
        return this.cooldowns.includes(name);
    }
}
exports.CooldownController = CooldownController;
class MuteImmune {
    constructor() {
        this.members = [];
    }
    addMuteImmune(id, time) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.members.includes(id)) {
                this.members.push(id);
                setTimeout(() => {
                    this.members.filter((value) => value !== id);
                }, time * 1000);
            }
        });
    }
}
class Bot extends discord_js_1.Client {
    constructor() {
        super(...arguments);
        this.commands = new discord_js_1.Collection();
        this.pool = pgClient;
        this.cooldowns = new discord_js_1.Collection();
        this.muteImmune = new MuteImmune();
    }
}
exports.default = Bot;
