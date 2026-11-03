// ===== Reading progress bar =====
const progressFill = document.getElementById('progressFill');
function updateProgress(){
  const h = document.documentElement;
  const scrolled = h.scrollTop;
  const max = h.scrollHeight - h.clientHeight;
  const pct = max > 0 ? (scrolled / max) * 100 : 0;
  progressFill.style.width = pct + '%';
}
document.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// ===== Mobile TOC toggle =====
const menuToggle = document.getElementById('menuToggle');
const toc = document.getElementById('toc');
menuToggle.addEventListener('click', () => {
  const open = toc.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
toc.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    toc.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

// ===== Scrollspy =====
const sections = Array.from(document.querySelectorAll('main section[id]'));
const tocLinks = Array.from(document.querySelectorAll('.toc a'));
const spy = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const link = tocLinks.find(l => l.dataset.target === entry.target.id);
    if (!link) return;
    if (entry.isIntersecting){
      tocLinks.forEach(l => l.classList.remove('is-active'));
      link.classList.add('is-active');
    }
  });
}, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
sections.forEach(s => spy.observe(s));

// ===== Collapsible toggles =====
document.querySelectorAll('.detail-toggle').forEach(box => {
  const btn = box.querySelector('.toggle-btn');
  btn.addEventListener('click', () => {
    const open = box.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = (open ? '− ' : '+ ') + btn.textContent.slice(2);
  });
});

// ===== Value-forms tabs (chương 05) =====
const vfTabs = document.querySelectorAll('.vf-tab');
const vfPanels = document.querySelectorAll('.vf-panel');
vfTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const idx = tab.dataset.form;
    vfTabs.forEach(t => t.classList.remove('is-active'));
    vfPanels.forEach(p => p.classList.remove('is-active'));
    tab.classList.add('is-active');
    document.querySelector(`.vf-panel[data-panel="${idx}"]`).classList.add('is-active');
  });
});

// ===== Scroll reveal (hiện dần khi cuộn tới) =====
const revealGroups = [
  '.hero-stats .stat',
  '.chapter-head',
  '.lead',
  '.compare-row .compare-card',
  '.dual-grid .prop-card',
  '.labor-block',
  '.craft-grid .craft-card',
  '.example-box',
  '.factor-grid .factor-card',
  '.value-forms',
  '.gold-grid .gold-card',
  '.func-list .func-card',
  '.value-price',
  '.table-wrap',
  '.exchange-grid .exchange-item',
  '.callout',
  '.chapter-photo',
  '.quiz-root',
  '.quiz-actions',
  '.essay-root',
  '.site-footer'
];

const revealTargets = new Set();
revealGroups.forEach(selector => {
  // Nhóm theo cha để so le (stagger) các phần tử anh em trong cùng lưới/khối
  const groups = new Map();
  document.querySelectorAll(selector).forEach(el => {
    const parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });
  groups.forEach(list => {
    list.forEach((el, i) => {
      if (revealTargets.has(el)) return;
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', Math.min(i * 70, 280) + 'ms');
      revealTargets.add(el);
    });
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    // Vào khung nhìn -> hiện; rời khỏi khung nhìn -> ẩn lại,
    // nên hiệu ứng lặp lại mỗi lần cuộn tới (không unobserve nữa)
    entry.target.classList.toggle('is-visible', entry.isIntersecting);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

revealTargets.forEach(el => revealObserver.observe(el));


const QUIZ = [
  {
    q: 'Điểm khác biệt cơ bản giữa "sản phẩm" và "hàng hóa" là gì?',
    options: [
      'Sản phẩm luôn có giá trị cao hơn hàng hóa',
      'Hàng hóa được tạo ra nhằm mục đích trao đổi, mua bán, còn sản phẩm thì không nhất thiết',
      'Hàng hóa không cần lao động để tạo ra',
      'Sản phẩm và hàng hóa là hai khái niệm hoàn toàn không liên quan'
    ],
    correct: 1,
    explain: 'Mọi hàng hóa đều là sản phẩm, nhưng chỉ sản phẩm được làm ra để đem trao đổi, mua bán mới là hàng hóa.'
  },
  {
    q: 'Lao động trừu tượng tạo ra thuộc tính nào của hàng hóa?',
    options: ['Giá trị sử dụng', 'Giá trị', 'Giá cả', 'Cả giá trị sử dụng và giá trị'],
    correct: 1,
    explain: 'Lao động trừu tượng là sự tiêu hao sức lao động nói chung, không phân biệt hình thức cụ thể — chính là nhân tố tạo ra giá trị.'
  },
  {
    q: 'Lượng giá trị của hàng hóa được đo bằng gì?',
    options: [
      'Thời gian lao động cá biệt của từng người sản xuất',
      'Thời gian lao động xã hội cần thiết',
      'Giá bán trên thị trường',
      'Số lượng hàng hóa được sản xuất ra'
    ],
    correct: 1,
    explain: 'Không phải thời gian của riêng một người, mà là thời gian cần thiết trong điều kiện sản xuất bình thường của toàn xã hội.'
  },
  {
    q: 'Vì sao vàng được chọn làm vật ngang giá chung (tiền tệ)?',
    options: [
      'Vì vàng dễ tìm thấy ở khắp mọi nơi',
      'Vì vàng có tính đồng nhất, dễ chia nhỏ/gộp lại, tốn nhiều công khai thác và không bị oxy hóa',
      'Vì nhà nước quy định vàng phải là tiền',
      'Vì vàng có giá trị sử dụng cao nhất trong mọi hàng hóa'
    ],
    correct: 1,
    explain: 'Bốn đặc tính tự nhiên này khiến vàng phù hợp để trở thành vật ngang giá chung, bền vững qua thời gian.'
  },
  {
    q: 'Chức năng nào của tiền thể hiện qua việc "mua trước, trả tiền sau" (trả góp)?',
    options: ['Thước đo giá trị', 'Phương tiện lưu thông', 'Phương tiện cất trữ', 'Phương tiện thanh toán'],
    correct: 3,
    explain: 'Phương tiện thanh toán cho phép việc trả tiền tách khỏi thời điểm nhận hàng/dịch vụ.'
  }
];

const quizRoot = document.getElementById('quizRoot');
const submitBtn = document.getElementById('submitQuiz');
const retryBtn = document.getElementById('retryQuiz');
const resultBox = document.getElementById('quizResult');

function renderQuiz(){
  quizRoot.innerHTML = '';
  QUIZ.forEach((item, qi) => {
    const wrap = document.createElement('div');
    wrap.className = 'qz-item';
    wrap.dataset.index = qi;

    const prompt = document.createElement('p');
    prompt.className = 'qz-prompt';
    prompt.innerHTML = `<span class="qz-index">${String(qi + 1).padStart(2, '0')}</span><span>${item.q}</span>`;
    wrap.appendChild(prompt);

    const opts = document.createElement('div');
    opts.className = 'qz-options';
    item.options.forEach((opt, oi) => {
      const label = document.createElement('label');
      label.className = 'qz-option';
      label.innerHTML = `<input type="radio" name="q${qi}" value="${oi}"><span>${opt}</span>`;
      opts.appendChild(label);
    });
    wrap.appendChild(opts);

    const explain = document.createElement('p');
    explain.className = 'qz-explain';
    explain.textContent = item.explain;
    wrap.appendChild(explain);

    quizRoot.appendChild(wrap);
  });
}
renderQuiz();

// ===== Câu hỏi tự luận =====
const ESSAY = {
  q: 'Nhà vua Midas đã từng ước mọi thứ ông ta chạm vào đều biến thành vàng, có phải trong mọi nền kinh tế có càng nhiều vàng và tiền thì càng tốt không?',
  minChars: 10, // số ký tự tối thiểu để được xem câu trả lời gợi ý
  suggestion: [
    'Không, vì khi có quá nhiều tiền, vàng → tiền, vàng mất dần giá trị do không còn giữ được độ hiếm (một trong những yếu tố quyết định đến giá trị của tiền, vàng), vì thế rất khó để làm vật ngang giá chung khi giá trị không ổn định.',
    'Nếu vẫn dùng tiền, vàng làm vật ngang giá chung thì phải thay đổi giá cả của những hàng hóa khác do giá trị của tiền, vàng đã thay đổi.'
  ],
  example: [
    'Khi giá trị của tiền, vàng đang ổn định thì 1 chỉ vàng = 1 chiếc điện thoại.',
    'Khi có quá nhiều tiền, vàng → tiền, vàng không “có giá” như trước thì 1 chỉ vàng không còn đủ giá trị để đổi ngang với 1 chiếc điện thoại, vì vậy “sức mua” của tiền, vàng giảm, dẫn đến đời sống nhân dân bị ảnh hưởng do công việc, tiền lương không thay đổi nhiều nhưng lại mua được ít sản phẩm hơn.'
  ]
};

const essayRoot = document.getElementById('essayRoot');

function renderEssay(){
  essayRoot.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'qz-item qz-essay';

  const prompt = document.createElement('p');
  prompt.className = 'qz-prompt';
  prompt.innerHTML = '<span class="qz-index">TL</span><span></span>';
  prompt.lastChild.textContent = ESSAY.q;
  wrap.appendChild(prompt);

  const area = document.createElement('textarea');
  area.className = 'qz-textarea';
  area.rows = 5;
  area.placeholder = 'Nhập câu trả lời của bạn tại đây…';
  area.setAttribute('aria-label', 'Câu trả lời tự luận');
  wrap.appendChild(area);

  const bar = document.createElement('div');
  bar.className = 'qz-essay-bar';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn-primary';
  btn.textContent = 'Gửi câu trả lời';
  btn.disabled = true;
  const hint = document.createElement('span');
  hint.className = 'qz-essay-hint';
  hint.textContent = 'Viết ít nhất ' + ESSAY.minChars + ' ký tự để xem câu trả lời gợi ý.';
  bar.append(btn, hint);
  wrap.appendChild(bar);

  const box = document.createElement('div');
  box.className = 'qz-suggest';
  box.hidden = true;
  const title = document.createElement('h4');
  title.className = 'qz-suggest-title';
  title.textContent = 'Câu trả lời gợi ý';
  box.appendChild(title);
  ESSAY.suggestion.forEach(t => {
    const p = document.createElement('p');
    p.textContent = t;
    box.appendChild(p);
  });
  const ex = document.createElement('div');
  ex.className = 'qz-suggest-example';
  const exLabel = document.createElement('strong');
  exLabel.textContent = 'VD:';
  ex.appendChild(exLabel);
  ESSAY.example.forEach(t => {
    const p = document.createElement('p');
    p.textContent = t;
    ex.appendChild(p);
  });
  box.appendChild(ex);
  wrap.appendChild(box);

  area.addEventListener('input', () => {
    btn.disabled = area.value.trim().length < ESSAY.minChars;
  });

  btn.addEventListener('click', () => {
    if (area.value.trim().length < ESSAY.minChars) return;
    area.readOnly = true;
    btn.hidden = true;
    hint.hidden = true;
    wrap.classList.add('is-answered');
    box.hidden = false;
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  essayRoot.appendChild(wrap);
}
renderEssay();

submitBtn.addEventListener('click', () => {
  let score = 0;
  let unanswered = 0;

  QUIZ.forEach((item, qi) => {
    const wrap = quizRoot.querySelector(`.qz-item[data-index="${qi}"]`);
    const checked = wrap.querySelector('input:checked');
    const labels = wrap.querySelectorAll('.qz-option');

    if (!checked){ unanswered++; }
    else {
      const chosen = parseInt(checked.value, 10);
      if (chosen === item.correct) score++;
      labels[chosen].classList.add(chosen === item.correct ? 'is-correct' : 'is-wrong');
    }
    labels[item.correct].classList.add('is-correct');
    wrap.classList.add('is-graded');
  });

  const pct = Math.round((score / QUIZ.length) * 100);
  let msg;
  if (pct === 100) msg = 'Xuất sắc! Bạn đã nắm vững toàn bộ nội dung.';
  else if (pct >= 70) msg = 'Khá tốt! Xem lại phần giải thích ở những câu sai nhé.';
  else if (pct >= 40) msg = 'Cần ôn lại một số phần — thử đọc lại các mục liên quan rồi làm lại.';
  else msg = 'Nên đọc lại nội dung phía trên trước khi làm lại bài kiểm tra.';

  resultBox.innerHTML = `
    <p class="quiz-result-score">${score} / ${QUIZ.length} câu đúng (${pct}%)</p>
    <p class="quiz-result-msg">${msg}${unanswered ? ` — còn ${unanswered} câu chưa trả lời (tính là sai).` : ''}</p>
  `;
  resultBox.hidden = false;
  submitBtn.hidden = true;
  retryBtn.hidden = false;
  resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

retryBtn.addEventListener('click', () => {
  renderQuiz();
  renderEssay();
  resultBox.hidden = true;
  retryBtn.hidden = true;
  submitBtn.hidden = false;
  document.getElementById('quiz').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
