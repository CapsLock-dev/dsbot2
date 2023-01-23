import { Pool } from "pg";
import { Inventory, PossibleItems } from "../commands/classes/Inventory";
import { Stand, Skill } from "../commands/standBattles/Stand";
import { standList } from "../commands/standBattles/data"

export async function addUser(pool: Pool, id: string): Promise<void> {
    await pool.query(`INSERT INTO users (id, balance, inventory) VALUES (${id}, 150, ARRAY['']) ON CONFLICT DO NOTHING`)
}

export async function getBalance(pool: Pool, id: string): Promise<number> {
    const result = await pool.query(`SELECT balance FROM users WHERE id='${id}'`)
    return result.rows[0].balance;
}

export async function updateBalance(pool: Pool, id: string, balance: number): Promise<void> {
    await pool.query(`UPDATE users SET balance=${balance} WHERE id='${id}'`)
}

export async function updateLvl(pool: Pool, id: string, lvl: number) {
    await pool.query(`UPDATE users SET lvl=${lvl} WHERE id='${id}'`)
}

export async function updateExp(pool: Pool, id: string, exp: number) {
    await pool.query(`UPDATE users SET exp=${exp} WHERE id='${id}'`)
}
export async function getLvl(pool: Pool, id: string) {
    const result = await pool.query(`SELECT lvl FROM users WHERE id='${id}'`)
    return result.rows[0].lvl;
}
export async function getExp(pool: Pool, id: string) {
    const result = await pool.query(`SELECT exp FROM users WHERE id='${id}'`)
    return result.rows[0].exp;
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

export async function addElementInv(pool: Pool, id: string, type: PossibleItems, element: string) {
    const inv = (await getInventory(pool, id))
    element = type + ":" + element
    inv.push(element)
    let str = '['
    for (let i = 0; i < inv.array.length-1; i++) {
        str += i + 1 >= inv.array.length ? "'" + inv.array[i] + "'" : "'" + inv.array[i] + "',"
    }
    str += ']'
    await pool.query(`UPDATE users SET inventory=ARRAY${str} WHERE id='${id}'`)
}

export async function getStands(pool: Pool, id: string): Promise<Stand[]> {
    const stands = await pool.query(`SELECT * FROM stands WHERE user_id='${id}'`)
    const array: Stand[] = []
    for (const stand of stands.rows) {
        array.push(new standList[stand.name as keyof typeof standList](stand.maxhp, stand.lvl, stand.exp, stand.speed, stand.defence, stand.damage, stand.expPerLvl, stand.usedSkills))
    }
    return array
}

export async function addStand(pool: Pool, id: string, stand: Stand) {
    let team = true
    if ((await getStands(pool, id)).length >= 5) {
        team = false
    }
    await pool.query(`INSERT INTO stands (user_id, name, maxhp, lvl, exp, speed, defence, damage, expPerLvl, usedSkills, team) VALUES ` +
        `(${id}, '${stand.name}', ${stand.maxhp}, ${stand.lvl}, ${stand.exp}, ${stand.speed}, ${stand.defence}, ${stand.damage}, ${stand.expPerLvl}, ARRAY${skillsToArray(stand.usedSkills)}, ${team})`)
}

export async function updateStand(pool: Pool, id: string, stand: Stand) {
    await pool.query(`UPDATE stands SET (user_id, name, maxhp, lvl, exp, speed, defence, damage, expPerLvl, usedSkills, team) ` +
        `(${stand.maxhp}, ${stand.lvl}, ${stand.exp}, ${stand.speed}, ${stand.defence}, ${stand.damage}, ${stand.expPerLvl}, ${skillsToArray(stand.usedSkills)}) ` +
        `WHERE user_id='${id}' AND name=${stand.name}`)
}

export async function updateStandTeam(pool: Pool, id: string, name: string, team: boolean) {
    await pool.query(`UPDATE stands SET team=${team} WHERE user_id='${id}' AND name=${name}`)
}

function skillsToArray(skills: Skill[]) {
    let str = '['
    for (let i = 0; i<=skills.length-1; i++) {
        str += "'" + (i+1>=skills.length ? skills[i].name : skills[i].name) + "'"
        if (i+1 <= skills.length-1) {
            str += ','
        }
    }
    str += ']'
    console.log(str)
    return str
}
