export class Inventory {
    array: string[] = []
    constructor(array: string[]) {
        this.array = array.filter(val => val != '')
    }
    filterArray(filter: PossibleItems) {
        filter += ':'
        return this.array.filter(el => {return el.startsWith(filter)}).map((el) => {
            return el.slice(filter.length)
        })
    }
    push(el: string) {
        this.array.push(el)
    }
}

export type PossibleItems = 'roles' | 'channels' | 'badges'
