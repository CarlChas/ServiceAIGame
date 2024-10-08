import express from 'express'
import { OpenAI } from 'openai'
import dotenv from 'dotenv'

dotenv.config()

// Create OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

async function getSkillResponse(prompt: string): Promise<string> {
    const response = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4', // or 'gpt-3.5-turbo'
        max_tokens: 1,  // Limit response to a single word
    })
    return response.choices?.[0]?.message?.content?.trim() ?? 'Unknown'
}

const app = express()

app.use(express.static('public')) // Serve static files from 'public' directory

app.get('/choose-skill', async (req, res) => {
    const skill = await getSkillResponse('Choose a battle skill:')
    res.json({ skill })
})

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000')
})
