"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fight = void 0;
const discord_js_1 = require("discord.js");
const StandUser_1 = require("./StandUser");
class Fight {
    constructor(member1, stands1, dm1, member2, stands2, dm2) {
        this.p1 = new StandUser_1.StandUser(member1, stands1, dm1, this);
        this.p2 = new StandUser_1.StandUser(member2, stands2, dm2, this);
    }
    fight() {
        if (this.fieldEffect) {
            this.fieldEffect.use(this);
            this.sendBattleLog('На поле действует' + this.fieldEffect.name, this.p1.chosenStand, this.p2.chosenStand);
        }
        if (this.p1.chosenSpell && this.p2.chosenSpell) {
            const first = this.getFastest();
            const second = this.anotherPlayer(first);
            first.useSpell();
            second.useSpell();
        }
        else {
            const array = [this.p1, this.p2].filter((player) => { var _a, _b; return player.chosenMove != 'Skill' && ((_b = (_a = player.chosenStand) === null || _a === void 0 ? void 0 : _a.status) === null || _b === void 0 ? void 0 : _b.hp) != 0; });
            if (array.length == 1) {
                const player = this.anotherPlayer(array[0]);
                player.useSpell();
            }
        }
        const players = [this.p1, this.p2];
        players.forEach(p => {
            var _a;
            p.update();
            if ((_a = p.chosenStand) === null || _a === void 0 ? void 0 : _a.isDead) {
                p.sendSwapMenu(true);
            }
            else {
                p.sendMainMenu();
            }
        });
    }
    readyCheck() {
        if (this.p1.ready && this.p2.ready) {
            this.p1.ready = false;
            this.p2.ready = false;
            this.fight();
        }
    }
    getFastest() {
        const array = [this.p1, this.p2];
        array.filter((user) => {
            var _a;
            return (_a = user.chosenSpell) === null || _a === void 0 ? void 0 : _a.counterAttack;
        });
        if (array.length == 1) {
            return array[0];
        }
        else {
            const stand1 = this.p1.chosenStand;
            const stand2 = this.p2.chosenStand;
            if (stand1.speed > stand2.speed) {
                return this.p1;
            }
            else if (stand2.speed < stand1.speed) {
                return this.p2;
            }
            else {
                return [this.p1, this.p2][Math.round(Math.random())];
            }
        }
    }
    anotherPlayer(player) {
        if (player instanceof StandUser_1.StandUser) {
            return [this.p1, this.p2].filter(user => user != player)[0];
        }
        else {
            return [this.p1, this.p2].filter(user => user.member.id != player)[0];
        }
    }
    sendBoth(content) {
        this.p1.dm.send({ embeds: [content] });
        this.p2.dm.send({ embeds: [content] });
    }
    sendBattleLog(text, stand1Before, stand2Before) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const stand1 = { past: this.p1.chosenStand, before: stand1Before };
        const stand2 = { past: this.p2.chosenStand, before: stand2Before };
        const stands = [stand1, stand2];
        const fields = [];
        for (const stand of stands) {
            fields.push({
                name: stand.past.name,
                value: `HP: ${this.calcValue((_a = stand.past.status) === null || _a === void 0 ? void 0 : _a.hp, (_b = stand.before.status) === null || _b === void 0 ? void 0 : _b.hp)}\n 
                        Defence: ${this.calcValue((_c = stand.past.status) === null || _c === void 0 ? void 0 : _c.defence, (_d = stand.before.status) === null || _d === void 0 ? void 0 : _d.defence)}\n 
                        Speed: ${this.calcValue((_e = stand.past.status) === null || _e === void 0 ? void 0 : _e.speed, (_f = stand.before.status) === null || _f === void 0 ? void 0 : _f.speed)}\n 
                        Damage: ${this.calcValue((_g = stand.past.status) === null || _g === void 0 ? void 0 : _g.damage, (_h = stand.before.status) === null || _h === void 0 ? void 0 : _h.damage)}\n 
                        Buff: ${(_j = stand.past.status) === null || _j === void 0 ? void 0 : _j.buff}\n 
                        Effect: ${(_k = stand.past.status) === null || _k === void 0 ? void 0 : _k.effect}\n`
            });
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setDescription(text[0])
            .setTitle('Битва')
            .setFields(fields)
            .setThumbnail('https://media.discordapp.net/attachments/966392406662586458/1041374682072490045/unknown.png?width=649&height=618');
        this.sendBoth(embed);
    }
    calcValue(val1, val2) {
        const val = val1 - val2;
        const a = val < 0 ? '+' : '';
        return `${val2} (${a}${val})`;
    }
    end(reason, user) {
        let desc = "";
        switch (reason) {
            case "run":
                desc = `${user.member.user.username} сбежал.\nБой окончен`;
                break;
            case "dead":
                desc = `${user.member.user.username} выиграл`;
                break;
        }
        const emb = new discord_js_1.EmbedBuilder()
            .setTitle('Битва')
            .setDescription(desc)
            .setThumbnail('https://media.discordapp.net/attachments/966392406662586458/1041374682072490045/unknown.png?width=649&height=618');
        this.sendBoth(emb);
        this.p1.collector.stop();
        this.p2.collector.stop();
    }
}
exports.Fight = Fight;
