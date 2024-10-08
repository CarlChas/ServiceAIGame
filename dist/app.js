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
dotenv_1.default.config();
// Create OpenAI client
const openai = new openai_1.OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
console.log('API Key:', process.env.OPENAI_API_KEY);
function getSkillResponse(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        const response = yield openai.chat.completions.create({
            messages: [
                { role: 'user', content: prompt },
                { role: 'system', content: 'You are a goblin in a battle. Respond by choosing one of the following battle moves: "Normal Attack", "Strong Attack", or "Weak Attack". As a goblin, include a small dialogue with your choice, for example: "Goblin snarls and attacks with a Weak Attack!"' }
            ],
            model: 'gpt-4o-mini', // or 'gpt-3.5-turbo'
            max_tokens: 30, // Limit response to a single word
            temperature: 0.8, // Thanks GPT <3
        });
        const allowedSkills = ["Normal Attack", "Strong Attack", "Weak Attack"];
        const goblinResponse = (_e = (_d = (_c = (_b = (_a = response.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.trim()) !== null && _e !== void 0 ? _e : 'Goblin seems confused and makes no move...';
        if (!allowedSkills.some(skill => goblinResponse.includes(skill))) {
            return 'Goblin seems confused and makes no move...';
        }
        return goblinResponse;
    });
}
const app = (0, express_1.default)();
app.use(express_1.default.static('public')); // Serve static files from 'public' directory
app.get('/choose-skill', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const skill = yield getSkillResponse('Choose a battle skill:');
    res.json({ skill });
}));
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
