const { systemPrompt } = require('./prompt');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'gemma3:4b';

async function askOllama(question) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);
  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        format: 'json',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        options: { temperature: 0.9 }
      })
    });
    if (!response.ok) throw new Error(`Ollama returned ${response.status}`);
    const data = await response.json();
    return JSON.parse(data?.message?.content || '');
  } finally {
    clearTimeout(timeout);
  }
}

async function healthCheck() {
  const response = await fetch(`${OLLAMA_URL}/api/tags`);
  return response.ok;
}

module.exports = { askOllama, healthCheck, MODEL };
