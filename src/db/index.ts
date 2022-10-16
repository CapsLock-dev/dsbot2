import { Pool } from "pg";
import { Inventory } from "../commands/classes/Inventory";
import { Stand, standList, Skill } from "../commands/standBattles/Stand";
import { StandUser } from "../commands/standBattles/StandUser";

export async function addUser(pool: Pool, id: string): Promise<void> {
    await pool.query(`INSERT INTO users (id, balance, inventory) VALUES (${id}, 150, ARRAY[['']]) ON CONFLICT DO NOTHING`)
}

export async function getBalance(pool: Pool, id: string): Promise<number> {
    const result = await pool.query(`SELECT balance FROM users WHERE id='${id}'`)
    return result.rows[0].balance;
}

export async function updateBalance(pool: Pool, id: string, balance: number): Promise<void> {
    await pool.query(`UPDATE users SET balance=${balance} WHERE id='${id}'`)
}

export async function removeUser(pool: Pool, id: string) {
    await pool.query(`DELETE FROM users WHERE id='${id}'`)
}

export async function getInventory(pool: Pool, id: string): Promise<Inventory> {
    let result = await pool.query(`SELECT inventory FROM users WHERE id='${id}'`)
    if (!result.rows[0].inventory) {
        await pool.query(`UPDATE users SET inventory=ARRAY[['']] WHERE id='${id}'`)
        result = await pool.query(`SELECT inventory FROM users WHERE id='${id}'`)
    }
    return new Inventory(result.rows[0].inventory)
}

export async function addRoleInv(pool: Pool, id: string, roleId: string) {
    const inv = (await getInventory(pool, id))
    let str = '['
    inv.roles.push(roleId)
    for (const arr of inv.array) {
        str += '['
        for (let i = 0; i < arr.length; i++) {
            str += i + 1 >= arr.length ? "'" + arr[i] + "'" : "'" + arr[i] + "',"
        }
        str += ']'
    }
    str += ']'
    await pool.query(`UPDATE users SET inventory=ARRAY${str} WHERE id='${id}'`)
}

export async function addChannelInv(pool: Pool, id: string, channelId: string) {
    const inv = (await getInventory(pool, id))
    let str = '['
    inv.channels.push(channelId)
    for (const arr of inv.array) {
        str += '['
        for (let i = 0; i < arr.length; i++) {
            str += i + 1 >= arr.length ? "'" + arr[i] + "'" : "'" + arr[i] + "',"
        }
        str += ']'
    }
    str += ']'
    await pool.query(`UPDATE users SET inventory=ARRAY${str} WHERE id='${id}'`)
}

export async function getStands(pool: Pool, id: string): Promise<Stand[]> {
    const stands = await pool.query(`SELECT * FROM stands WHERE id='${id}'`)
    const array: Stand[] = []
    for (const stand of stands.rows as Stand[]) {
        array.push(new standList[stand.name](stand.maxhp, stand.lvl, stand.exp, stand.speed, stand.defence, stand.damage, stand.expPerLvl, stand.usedSkills))
    }
    return array
}

export async function addStand(pool: Pool, id: string, stand: Stand) {
    let team = true
    if ((await getStands(pool, id)).length >= 5) {
        team = false
    }
    await pool.query(`INSERT INTO stands SET (maxhp, lvl, exp, speed, defence, damage, expPerLvl, usedSkills) VALUES ` +
        `(${id}, ${stand.name}, ${stand.maxhp}, ${stand.lvl}, ${stand.exp}, ${stand.speed}, ${stand.defence}, ${stand.damage}, ${stand.expPerLvl}, ${skillsToArray(stand.usedSkills)}, ${team})`)
}

export async function updateStand(pool: Pool, id: string, stand: Stand) {
    await pool.query(`UPDATE stands SET (maxhp, lvl, exp, speed, defence, damage, expPerLvl, usedSkills, team) ` +
        `(${stand.maxhp}, ${stand.lvl}, ${stand.exp}, ${stand.speed}, ${stand.defence}, ${stand.damage}, ${stand.expPerLvl}, ${skillsToArray(stand.usedSkills)}) ` +
        `WHERE id='${id}' AND name=${stand.name}`)
}

export async function updateStandTeam(pool: Pool, id: string, name: string, team: boolean) {
    await pool.query(`UPDATE stands SET team=${team} WHERE id='${id}' AND name=${name}`)
}

function skillsToArray(skills: Skill[]) {
    let str = '['
    for (let i = 0; i<=skills.length; i++) {
        str += i+1>=skills.length ? skills[i].name : skills[i].name + ', '
    }
    str += ']'
    console.log(str)
    return str
}