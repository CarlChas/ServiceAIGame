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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const openai_1 = require("openai");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
// Create OpenAI client
const openai = new openai_1.OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
console.log('API Key:', process.env.OPENAI_API_KEY);
const goblinMoves = {
    "Normal Attack": { damage: 10, staminaCost: 10 },
    "Strong Attack": { damage: 20, staminaCost: 20 },
    "Weak Attack": { damage: 5, staminaCost: 0 },
    "Rest": { damage: 0, staminaCost: -10 },
};
function getGoblinMove(availableMoves, enemyHp, enemySta) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        let prompt = "";
        if (enemyHp <= 0) {
            prompt = "You are a defeated goblin. Say something as you fall in battle.";
        }
        else if (enemySta <= 0) {
            prompt = 'You are a tired goblin with no stamina left. Say something while doing a Weak Attack.';
        }
        else {
            prompt = `You are a goblin with ${enemyHp} HP and ${enemySta} stamina. Choose one of these moves: ${availableMoves.join(', ')}. Include goblin-like dialogue.`;
        }
        const response = yield openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: prompt }
            ],
            max_tokens: 50,
            temperature: 0.8
        });
        const goblinResponse = (_e = (_d = (_c = (_b = (_a = response.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.trim()) !== null && _e !== void 0 ? _e : 'Goblin seems confused.';
        const goblinMove = availableMoves.find(move => goblinResponse.includes(move)) || 'Weak Attack';
        return { goblinMove, goblinResponse }; // Return move and dialogue
    });
}
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Welcome to the Goblin Battle API!");
});
app.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const battleData = req.body;
    let { playerAction, playerDamage, playerHp, playerSta, enemyHp, enemySta } = battleData;
    if (typeof enemyHp === 'string') {
        enemyHp = parseFloat(enemyHp);
    }
    if (isNaN(enemyHp)) {
        return res.status(400).json({ error: "'enemyHp' is required." });
    }
    const newGoblinHp = Math.max(0, enemyHp - playerDamage);
    let availableMoves = ["Normal Attack", "Strong Attack", "Weak Attack"];
    if (enemySta < 40) {
        availableMoves.push("Rest");
    }
    // Get the goblin's move from OpenAI
    const { goblinMove, goblinResponse } = yield getGoblinMove(availableMoves, newGoblinHp, enemySta);
    // Check if goblin has enough stamina to perform the chosen move
    const move = goblinMoves[goblinMove];
    if (enemySta < move.staminaCost) {
        return res.json({
            goblinHp: newGoblinHp,
            goblinAction: 'Goblin is too tired to attack!',
            goblinDamage: 0, // No damage if not enough stamina
            playerHp: playerHp,
            playerDamage: playerDamage,
            goblinSta: enemySta,
            goblinDialogue: goblinResponse
        });
    }
    // Goblin performs the move and loses stamina
    const goblinDamage = move.damage;
    const newPlayerHp = Math.max(0, playerHp - goblinDamage); // Player can't have less than 0 HP
    const newGoblinSta = Math.max(0, enemySta - move.staminaCost); // Goblin loses stamina for the move
    console.log(`Goblin used ${goblinMove} and lost ${move.staminaCost} stamina. New stamina: ${newGoblinSta}`); // Debugging: Stamina after move
    // Respond with updated goblin HP, player HP, damage, and stamina
    res.json({
        goblinHp: newGoblinHp,
        goblinAction: `Goblin uses ${goblinMove}!`,
        goblinDamage: goblinDamage, // Goblin's damage to player
        playerHp: newPlayerHp,
        playerDamage: playerDamage, // Player's damage to goblin
        goblinSta: newGoblinSta, // Goblin's remaining stamina
        goblinDialogue: goblinResponse
    });
}));
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
