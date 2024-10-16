import express from 'express'
import { OpenAI } from 'openai'
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()

// Create OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

console.log('API Key:', process.env.OPENAI_API_KEY)

interface BattleReq {
    playerAction: string
    playerDamage: number
    playerHp: number
    playerMp: number
    playerSta: number

    enemyAction: string
    enemyDamage: number
    enemyHp: number | string
    enemyMp: number
    enemySta: number
}

const goblinMoves = {
    "Normal Attack": { damage: 10, staminaCost: 10 },
    "Strong Attack": { damage: 20, staminaCost: 20 },
    "Weak Attack": { damage: 5, staminaCost: 0 },
    "Rest": { damage: 0, staminaCost: -10 },
} as const

async function getGoblinMove(availableMoves: string[], enemyHp: number, enemySta: number): Promise<{ goblinMove: string, goblinResponse: string }> {
    let prompt = ""

    if (enemyHp <= 0) {
        prompt = "You are a defeated goblin. Say something as you fall in battle."
    } else if (enemySta <= 0) {
        prompt = 'You are a tired goblin with no stamina left. Say something while doing a Weak Attack.';
    } else {
        prompt = `You are a goblin with ${enemyHp} HP and ${enemySta} stamina. Choose one of these moves: ${availableMoves.join(', ')}. Include goblin-like dialogue.`;
    }

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: prompt }
        ],
        max_tokens: 50,
        temperature: 0.8
    })

    const goblinResponse = response.choices?.[0]?.message?.content?.trim() ?? 'Goblin seems confused.'
    const goblinMove = availableMoves.find(move => goblinResponse.includes(move)) || 'Weak Attack'

    return { goblinMove, goblinResponse }  // Return move and dialogue
}


const app = express()

app.use(cors())

app.use(express.json())

app.get("/", (req, res) => {
    res.send("Welcome to the Goblin Battle API!")
})



app.post("/", async (req, res) => {
    const battleData: BattleReq = req.body

    let { playerAction, playerDamage, playerHp, playerSta, enemyHp, enemySta } = battleData

    if (typeof enemyHp === 'string') {
        enemyHp = parseFloat(enemyHp)
    }

    if (isNaN(enemyHp)) {
        return res.status(400).json({ error: "'enemyHp' is required." })
    }

    const newGoblinHp = Math.max(0, enemyHp - playerDamage)

    let availableMoves = ["Normal Attack", "Strong Attack", "Weak Attack"]
    if (enemySta < 40) {
        availableMoves.push("Rest")
    }

    // Get the goblin's move from OpenAI
    const { goblinMove, goblinResponse } = await getGoblinMove(availableMoves, newGoblinHp, enemySta);

    // Check if goblin has enough stamina to perform the chosen move
    const move = goblinMoves[goblinMove as keyof typeof goblinMoves]
    if (enemySta < move.staminaCost) {
        return res.json({
            goblinHp: newGoblinHp,
            goblinAction: 'Goblin is too tired to attack!',
            goblinDamage: 0,  // No damage if not enough stamina
            playerHp: playerHp,
            playerDamage: playerDamage,
            goblinSta: enemySta,
            goblinDialogue: goblinResponse

        })
    }

    // Goblin performs the move and loses stamina
    const goblinDamage = move.damage
    const newPlayerHp = Math.max(0, playerHp - goblinDamage) // Player can't have less than 0 HP
    const newGoblinSta = Math.max(0, enemySta - move.staminaCost) // Goblin loses stamina for the move

    console.log(`Goblin used ${goblinMove} and lost ${move.staminaCost} stamina. New stamina: ${newGoblinSta}`)  // Debugging: Stamina after move

    // Respond with updated goblin HP, player HP, damage, and stamina
    res.json({
        goblinHp: newGoblinHp,
        goblinAction: `Goblin uses ${goblinMove}!`,
        goblinDamage: goblinDamage,  // Goblin's damage to player
        playerHp: newPlayerHp,
        playerDamage: playerDamage,  // Player's damage to goblin
        goblinSta: newGoblinSta,      // Goblin's remaining stamina
        goblinDialogue: goblinResponse
    })
})

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000')
})