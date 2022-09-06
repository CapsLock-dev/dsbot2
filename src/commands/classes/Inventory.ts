export class Inventory {
    roles: string[] = []
    channels: string[] = []
    badges: string[] = []
    array: string[][] = []
    constructor(array: string[][]) {
        const newArr: string[][] = []
        for (const arr of array) {
            newArr.push(arr.filter(el=>el!=''))
        }
        this.array = newArr
        this.roles = newArr[0]
        this.channels = newArr[1]
        this.badges = newArr[2]
    }
}