const path = require('path');
const express = require('express');
const { askOllama, healthCheck, MODEL } = require('./ollama');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, '..', 'frontend')));

function validAnswer(data) {
  return data && typeof data.response === 'string' && typeof data.verdict === 'string' &&
    Number.isFinite(Number(data.uselessness_score)) && Number.isFinite(Number(data.chaos_score));
}

app.get('/health', async (_req, res) => {
  try {
    res.json({ ok: await healthCheck(), model: MODEL });
  } catch {
    res.status(503).json({ ok: false, model: MODEL });
  }
});

app.post('/chat', async (req, res) => {
  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
  if (!question || question.length > 1200) {
    return res.status(400).json({ error: 'Please ask one small, completely unnecessary question.' });
  }
  try {
    const answer = await askOllama(question);
    if (!validAnswer(answer)) throw new Error('Malformed model response');
    res.json({
      response: answer.response.trim(),
      uselessness_score: Math.max(0, Math.min(100, Math.round(Number(answer.uselessness_score)))),
      chaos_score: Math.max(0, Math.min(100, Math.round(Number(answer.chaos_score)))),
      verdict: answer.verdict.trim()
    });
  } catch (error) {
    console.error('Chat request failed:', error.message);
    res.status(503).json({ error: 'VerutheAI is currently contemplating its existence. Please make sure the local AI server is running.' });
  }
});

app.listen(PORT, () => console.log(`VerutheAI is growing at http://localhost:${PORT}`));
