// ===== Chatbot AI =====
// Đổi URL này thành địa chỉ backend proxy của bạn (xem worker.js)
const CHAT_API_URL = 'https://chatbot-hoc-tap.congtoai122007.workers.dev/';

(function () {
  const GREETING = 'Xin chào! Mình là trợ lý AI của trang này. Bạn có thể hỏi mình về hàng hóa, giá trị, lao động, tiền tệ… trong nội dung bài học.';
  const SUGGESTIONS = [
    'Hàng hóa khác sản phẩm ở điểm nào?',
    'Lao động cụ thể và trừu tượng khác nhau thế nào?',
    'Vì sao vàng trở thành tiền tệ?'
  ];
  const MAX_HISTORY = 10;

  // Lấy nội dung bài học từ chính trang web để làm ngữ cảnh cho AI
  function getPageContext() {
    const main = document.querySelector('main');
    return main ? main.innerText.replace(/\s+/g, ' ').trim().slice(0, 15000) : '';
  }

  // ---- Dựng giao diện ----
  const fab = document.createElement('button');
  fab.className = 'cb-fab';
  fab.setAttribute('aria-label', 'Mở trợ lý AI');
  fab.setAttribute('aria-expanded', 'false');
  fab.innerHTML = `
    <svg class="cb-icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.5-4.6A8 8 0 1 1 21 12z"/></svg>
    <svg class="cb-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`;

  const panel = document.createElement('section');
  panel.className = 'cb-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Trợ lý AI');
  panel.innerHTML = `
    <div class="cb-header">
      <div class="cb-avatar">AI</div>
      <div><div class="cb-title">Trợ lý học tập</div><div class="cb-sub">Hỏi đáp theo nội dung trang</div></div>
      <button class="cb-clear" type="button">Xóa chat</button>
    </div>
    <div class="cb-messages" aria-live="polite"></div>
    <div class="cb-form">
      <textarea class="cb-input" rows="1" placeholder="Nhập câu hỏi…" aria-label="Nhập câu hỏi"></textarea>
      <button class="cb-send" type="button" aria-label="Gửi">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
      </button>
    </div>`;

  document.body.append(panel, fab);

  const box = panel.querySelector('.cb-messages');
  const input = panel.querySelector('.cb-input');
  const sendBtn = panel.querySelector('.cb-send');
  const clearBtn = panel.querySelector('.cb-clear');

  let history = [];
  let busy = false;

  // ---- Hàm tiện ích ----
  function addMsg(text, who, extraClass) {
    const el = document.createElement('div');
    el.className = 'cb-msg ' + who + (extraClass ? ' ' + extraClass : '');
    el.textContent = text; // textContent để tránh chèn HTML
    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
    return el;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'cb-msg bot';
    el.innerHTML = '<span class="cb-typing"><i></i><i></i><i></i></span>';
    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
    return el;
  }

  function showSuggestions() {
    const wrap = document.createElement('div');
    wrap.className = 'cb-chips';
    SUGGESTIONS.forEach(s => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cb-chip';
      b.textContent = s;
      b.addEventListener('click', () => { wrap.remove(); send(s); });
      wrap.appendChild(b);
    });
    box.appendChild(wrap);
  }

  function reset() {
    history = [];
    box.innerHTML = '';
    addMsg(GREETING, 'bot');
    showSuggestions();
  }

  function setOpen(open) {
    panel.classList.toggle('is-open', open);
    fab.classList.toggle('is-open', open);
    fab.setAttribute('aria-expanded', String(open));
    fab.setAttribute('aria-label', open ? 'Đóng trợ lý AI' : 'Mở trợ lý AI');
    if (open) setTimeout(() => input.focus(), 220);
  }

  // ---- Gửi tin nhắn ----
  async function send(text) {
    text = (text || '').trim();
    if (!text || busy) return;
    busy = true;
    sendBtn.disabled = true;
    input.value = '';
    input.style.height = 'auto';

    box.querySelectorAll('.cb-chips').forEach(c => c.remove());
    addMsg(text, 'user');
    history.push({ role: 'user', content: text });
    const typing = showTyping();

    try {
      const res = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.slice(-MAX_HISTORY),
          context: getPageContext()
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.reply) throw new Error(data.error || 'Lỗi ' + res.status);
      typing.remove();
      addMsg(data.reply, 'bot');
      history.push({ role: 'assistant', content: data.reply });
    } catch (err) {
      typing.remove();
      addMsg('Xin lỗi, mình chưa trả lời được lúc này. Bạn thử lại sau nhé.', 'bot', 'error');
      history.pop(); // bỏ câu hỏi lỗi để lịch sử vẫn hợp lệ
      console.error('Chatbot error:', err);
    } finally {
      busy = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  // ---- Sự kiện ----
  fab.addEventListener('click', () => setOpen(!panel.classList.contains('is-open')));
  sendBtn.addEventListener('click', () => send(input.value));
  clearBtn.addEventListener('click', reset);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { // isComposing: tránh gửi nhầm khi đang gõ tiếng Việt
      e.preventDefault();
      send(input.value);
    }
  });
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 96) + 'px';
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) setOpen(false);
  });

  reset();
})();
