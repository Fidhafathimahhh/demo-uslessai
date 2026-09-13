# വെറുതെ AI

A deliberately useless local AI: calm botanical interface, unnecessary analysis.

## Run locally

1. Install [Ollama](https://ollama.com) and run `ollama pull gemma3:4b`.
2. In this folder, run `npm install`.
3. Start the app with `npm start`.
4. Visit `http://localhost:3000`.

The browser talks only to the Express server. The server calls the local Ollama API using `gemma3:4b`.
