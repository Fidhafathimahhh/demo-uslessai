const form = document.querySelector('#chat-form');
const input = document.querySelector('#question');
const messages = document.querySelector('#messages');
const empty = document.querySelector('#empty-state');
const sendButton = form.querySelector('button');
const zones = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'side-left', 'side-right'];
let placed = 0;

document.querySelectorAll('.suggestions button').forEach(button => button.addEventListener('click', () => {
  input.value = button.textContent; input.focus();
}));

const esc = value => String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
const time = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
function scrollLatest() { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }
function userMessage(question) { messages.insertAdjacentHTML('beforeend', `<article class="message user-message"><div class="bubble">${esc(question)}</div><time class="time">${time()}</time></article>`); }
function loading() { messages.insertAdjacentHTML('beforeend', '<div id="loading" class="loading">VerutheAI is taking this unnecessarily seriously...</div>'); scrollLatest(); }
function answerMessage(answer) {
  const score = Number(answer.uselessness_score);
  messages.insertAdjacentHTML('beforeend', `<article class="message ai-message"><img class="mascot-inline" src="assets/mascot/mascot.svg" alt=""><div class="response-text">${esc(answer.response)}</div><div class="score-box"><div class="score-row"><span>Uselessness Level</span><strong>${score}%</strong></div><div class="progress"><i data-score="${score}"></i></div><p class="chaos">Chaos score: <b>${Number(answer.chaos_score)}%</b></p></div><p class="verdict"><b>Verdict:</b> ${esc(answer.verdict)}</p></article>`);
  requestAnimationFrame(() => { const bar = messages.querySelector('.progress i:last-child'); if (bar) bar.style.width = `${score}%`; });
  if (score >= 90 && placed < 8) unlock();
  scrollLatest();
}
function unlock() {
  const note = document.createElement('section'); note.className = 'unlock';
  note.innerHTML = '<strong>🌸 A flower has appeared!</strong><p>Place it somewhere in your space?</p><button>Place now</button><button class="later">Maybe later</button>';
  note.querySelector('button').onclick = () => { placeFlower(); note.remove(); };
  note.querySelector('.later').onclick = () => note.remove();
  messages.append(note); scrollLatest();
}
function placeFlower() {
  if (placed >= 8) return;
  const flower = document.createElement('img'); flower.src = 'assets/decorations/flower.svg'; flower.alt = ''; flower.className = `placed-decoration zone-${zones[placed % zones.length]}`; document.body.append(flower); placed++;
}
form.addEventListener('submit', async event => {
  event.preventDefault(); const question = input.value.trim(); if (!question || sendButton.disabled) return;
  if (empty) empty.remove(); userMessage(question); input.value = ''; input.disabled = true; sendButton.disabled = true; loading();
  try {
    const response = await fetch('/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question }) });
    const data = await response.json(); document.querySelector('#loading')?.remove();
    if (!response.ok) throw new Error(data.error); answerMessage(data);
  } catch (error) {
    document.querySelector('#loading')?.remove(); messages.insertAdjacentHTML('beforeend', `<p class="loading">${esc(error.message || 'VerutheAI is currently contemplating its existence. Please make sure the local AI server is running.')}</p>`); scrollLatest();
  } finally { input.disabled = false; sendButton.disabled = false; input.focus(); }
});
