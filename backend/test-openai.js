require('dotenv').config();
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
    try {
        console.log('Testing OpenAI API...');
        console.log('API Key loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
        console.log('API Key length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);
        
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'user', content: 'Hello! Can you give me a brief test response?' }
            ],
            max_tokens: 50
        });
        
        console.log('✅ OpenAI API test successful!');
        console.log('Response:', completion.choices[0].message.content);
        
    } catch (error) {
        console.error('❌ OpenAI API test failed!');
        console.error('Error:', error.message);
        console.error('Full error:', error);
    }
}

testOpenAI(); 