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
exports.event = {
    name: 'interactionCreate',
    once: false,
    exec: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (interaction.isChatInputCommand()) {
            const { commandName } = interaction;
            if (client.commands.has(commandName)) {
                if (process.env.TOKEN == "NzA5NDU5MDQyMjQ5OTk4Mzk2.GQgv9r.isnEFlVTuW_fpAUic3nhiBD5O0k1-1ZKKqB4Io") {
                    if (interaction.user.id == '470188760777359361') {
                        (_a = client.commands.get(commandName)) === null || _a === void 0 ? void 0 : _a.exec(client, interaction);
                    }
                }
                else {
                    (_b = client.commands.get(commandName)) === null || _b === void 0 ? void 0 : _b.exec(client, interaction);
                }
            }
        }
    })
};
