"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inventory = void 0;
class Inventory {
    constructor(array) {
        this.array = [];
        this.array = array.filter(val => val != '');
    }
    filterArray(filter) {
        filter += ':';
        return this.array.filter(el => { return el.startsWith(filter); }).map((el) => {
            return el.slice(filter.length);
        });
    }
    push(el) {
        this.array.push(el);
    }
}
exports.Inventory = Inventory;
