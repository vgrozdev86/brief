'use strict';

/* ============================================================
   НАСТРОЙКИ (меняются здесь)
   ============================================================ */
const DOC_VERSION = '04.10.2026';          // версия политики и согласия, пишется в заявку
const REPLY_TIME = 'в течение 1–2 рабочих дней'; // сроки ответа на финальном экране
const TG_URL = 'https://t.me/vgrozdev';
const MAX_FILES = 10;
const MAX_FILE_MB = 18;
const DRAFT_KEY = 'brief_draft_v1';
const SEND_TIMEOUT_MS = 90000;

/* ============================================================
   ВОПРОСЫ. Поля: id, key, label, hint, required, important, type
   type: short | long | links | files | consent
   key — короткое название для сводки и сообщений в Telegram.
   ============================================================ */
const STAGES = [
  {
    id: 'goal', num: '01', title: 'Бизнес-задача',
    desc: 'Зачем нужен сайт и что он должен приносить бизнесу.',
    fields: [
      { id: 'why', key: 'Зачем сайт сейчас', type: 'long', required: true,
        label: 'Зачем бизнесу сайт именно сейчас?',
        hint: 'Что изменилось или чего не хватает: новый продукт, мало заявок, старый сайт не работает. Пишите как есть.' },
      { id: 'action', key: 'Целевое действие', type: 'long',
        label: 'Какое действие сайт должен приводить чаще: запись, звонок, расчёт, покупка?',
        hint: 'Выберите главное. Если их несколько — расставьте по важности.' },
      { id: 'focus', key: 'Приоритет', type: 'long',
        label: 'Какое направление, география или сегмент в приоритете?',
        hint: 'Например: «сначала Москва и онлайн-курсы для новичков».' }
    ]
  },
  {
    id: 'product', num: '02', title: 'Продукт и фокус',
    desc: 'Что именно вы продаёте и что хотите продавать больше.',
    fields: [
      { id: 'sells', key: 'Что продаёт', type: 'long', required: true,
        label: 'Что именно продаёт бизнес?',
        hint: 'Своими словами, как объяснили бы знакомому.' },
      { id: 'formats', key: 'Продукты и форматы', type: 'long',
        label: 'Какие продукты или форматы можно купить?',
        hint: 'Список: названия, форматы, примерные цены, если готовы назвать.' },
      { id: 'bestseller', key: 'Что покупают чаще всего', type: 'long',
        label: 'Что покупают чаще всего?' },
      { id: 'grow', key: 'Что продавать больше', type: 'long',
        label: 'Что бизнес хочет продавать больше?' },
      { id: 'includes', key: 'Состав и ограничения', type: 'long',
        label: 'Что входит в продукт? Какие есть ограничения?',
        hint: 'Что клиент получает и чего не получает: сроки, регионы, условия.' }
    ]
  },
  {
    id: 'client', num: '03', title: 'Клиент: первая гипотеза',
    desc: 'Кто покупает и как принимает решение. Это ваша первая версия, потом уточним.',
    fields: [
      { id: 'who', key: 'Кто покупает', type: 'long', required: true,
        label: 'Кто обычно покупает?',
        hint: 'Кто эти люди: возраст, роль, задача. Достаточно рабочей гипотезы.' },
      { id: 'trigger', key: 'Ситуация поиска', type: 'long',
        label: 'В какой ситуации он начинает искать решение?',
        hint: 'Что случилось перед тем, как человек начал искать такой продукт.' },
      { id: 'criteria', key: 'Что важно при выборе', type: 'long',
        label: 'Что для него, предположительно, важно при выборе?',
        hint: 'Цена, срок, доверие, опыт, результат — расставьте как думаете.' }
    ]
  },
  {
    id: 'path', num: '04', title: 'Путь продажи',
    desc: 'Как человек доходит от первого касания до покупки и где теряется.',
    fields: [
      { id: 'first', key: 'Кто общается первым', type: 'long',
        label: 'Кто первым общается с человеком?',
        hint: 'Менеджер, владелец, чат-бот, администратор.' },
      { id: 'flow', key: 'Путь до покупки', type: 'long',
        label: 'Как выглядит путь от первого обращения до покупки?',
        hint: 'Шаги по порядку: заявка, звонок, расчёт, встреча, договор, оплата.' },
      { id: 'afterLead', key: 'После заявки', type: 'long',
        label: 'Что происходит сразу после заявки?',
        hint: 'Кто, когда и как отвечает.' },
      { id: 'breaks', key: 'Где рвутся сделки', type: 'long', required: true, important: true,
        label: 'Где сделки чаще всего рвутся?',
        hint: 'Самый важный ответ. На каком шаге люди пропадают и почему вы так думаете. Он определяет, что поставить в начало сайта.' }
    ]
  },
  {
    id: 'value', num: '05', title: 'Ценность и доказательства',
    desc: 'За что вас выбирают и чем это можно подтвердить.',
    fields: [
      { id: 'valued', key: 'За что ценят', type: 'long',
        label: 'За что клиенты особенно ценят компанию?' },
      { id: 'different', key: 'Чем отличаетесь', type: 'long',
        label: 'Что компания делает иначе и чем это доказать?' },
      { id: 'recommend', key: 'За что рекомендуют', type: 'long',
        label: 'За что компанию рекомендуют?' },
      { id: 'proof', key: 'Чем доказываем', type: 'long', required: true, important: true,
        label: 'Чем доказываем — что реально есть на руках?',
        hint: 'Отзывы, кейсы, цифры, сертификаты, награды, фото. Только то, что действительно есть.' },
      { id: 'missing', key: 'Чего нет', type: 'long', required: true, important: true,
        label: 'Чего нет — обещать нельзя',
        hint: 'Чего нет или что нельзя обещать: гарантии, сроки, результаты. Это защита от выдумок на сайте.' }
    ]
  },
  {
    id: 'materials', num: '06', title: 'Материалы и доступы',
    desc: 'Что уже есть, на что опереться, что можно приложить.',
    fields: [
      { id: 'access', key: 'Доступы и данные', type: 'long',
        label: 'Есть ли доступ к CRM, звонкам, перепискам, причинам отказа?',
        hint: 'Сами доступы здесь не пишите. Достаточно сказать, что они есть.' },
      { id: 'existing', key: 'Отзывы, FAQ, переписки', type: 'long',
        label: 'Какие отзывы, FAQ, звонки или переписки уже есть?' },
      { id: 'assets', key: 'Сайт, презентации, фото', type: 'long',
        label: 'Есть ли сайт, презентации, прайс, документы, фото, рендеры?' },
      { id: 'links', key: 'Ссылки', type: 'links',
        label: 'Ссылки',
        hint: 'Одна ссылка на строку: сайт, соцсети, облако с материалами.' },
      { id: 'files', key: 'Файлы', type: 'files',
        label: 'Файлы',
        hint: 'Не загружайте пароли, паспортные данные и персональные данные третьих лиц без их согласия.' }
    ]
  },
  {
    id: 'contacts', num: '07', title: 'Контакты',
    desc: 'Как с вами связаться. Последний шаг.',
    fields: [
      { id: 'name', key: 'Имя', type: 'short', required: true,
        label: 'Как вас зовут?', placeholder: 'Имя и фамилия' },
      { id: 'company', key: 'Компания или проект', type: 'short',
        label: 'Компания или проект', placeholder: 'Название' },
      { id: 'contact', key: 'Контакт', type: 'short', required: true,
        label: 'Телеграм, телефон или почта',
        hint: 'Один способ, по которому вам удобно отвечать.', placeholder: '@username, +… или name@mail.com' },
      { id: 'extra', key: 'Ещё', type: 'long',
        label: 'Что-то ещё, о чём я не спросил?',
        hint: 'Любые пожелания и вопросы.' },
      { id: 'consent', key: 'Согласие', type: 'consent', required: true }
    ]
  }
];

/* ============================================================
   СОСТОЯНИЕ
   ============================================================ */
const CFG = (window.BRIEF_CONFIG || {});
const state = {
  stage: -1,            // -1 вступление, 0..6 этапы, 7 финал
  answers: {},          // id → текст
  files: [],            // File[] (в черновик не сохраняются)
  consent: false,       // в черновик не сохраняется: согласие даётся заново
  lastPayload: null,    // последний собранный текст ответов (для скачивания)
  sending: false
};

const $ = (s, r = document) => r.querySelector(s);
const el = {
  intro: $('#intro'), stage: $('#stage'), final: $('#final'),
  side: $('#stageSide'), body: $('#stageBody'),
  nav: $('#nav'), dots: $('#dots'), back: $('#backBtn'), next: $('#nextBtn'),
  bar: $('#progressBar'), toast: $('#toast')
};

/* ============================================================
   УТИЛИТЫ
   ============================================================ */
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const fmtSize = (b) => b < 1024 * 1024 ? Math.max(1, Math.round(b / 1024)) + ' КБ' : (b / 1024 / 1024).toFixed(1) + ' МБ';
const trunc = (s, n) => (s.length > n ? s.slice(0, n).trimEnd() + '…' : s);
const val = (id) => (state.answers[id] || '').trim();

let toastTimer;
function toast(text, ms = 3200) {
  el.toast.textContent = text;
  el.toast.hidden = false;
  el.toast.style.animation = 'none'; void el.toast.offsetWidth; el.toast.style.animation = '';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.toast.hidden = true; }, ms);
}

function autoGrow(t) { t.style.height = 'auto'; t.style.height = (t.scrollHeight + 2) + 'px'; }

/* ============================================================
   ЧЕРНОВИК (localStorage; если недоступен — просто работаем без него)
   ============================================================ */
let saveTimer;
function saveDraft() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ stage: state.stage, answers: state.answers, t: Date.now() })); } catch (e) { /* без черновика */ }
  }, 250);
}
function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch (e) { /* ничего */ } }
function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    if (!d || typeof d.answers !== 'object') return false;
    const filled = Object.values(d.answers).some((v) => String(v).trim());
    if (!filled) return false;
    state.answers = d.answers;
    state.stage = Number.isInteger(d.stage) && d.stage >= 0 && d.stage < STAGES.length ? d.stage : 0;
    return true;
  } catch (e) { return false; }
}

/* ============================================================
   ОТРИСОВКА
   ============================================================ */
function fieldHtml(f) {
  const req = f.required ? '' : '<span class="field__req">· по желанию</span>';
  const badge = f.important ? '<span class="badge">Важно</span>' : '';
  const hint = f.hint ? `<p class="field__hint" id="h-${f.id}">${esc(f.hint)}</p>` : '';
  const err = '<p class="field__error" role="alert">Заполните это поле</p>';
  const aria = f.hint ? ` aria-describedby="h-${f.id}"` : '';

  if (f.type === 'consent') {
    return `<div class="field" data-field="${f.id}">
      <label class="consent">
        <input type="checkbox" id="f-consent">
        <span>Я согласен(на) на обработку моих персональных данных, в том числе на их передачу за рубеж (Cloudflare, Telegram), на условиях
          <a href="soglasie.html" target="_blank" rel="noopener">Согласия</a>
          и ознакомлен(а) с
          <a href="politika.html" target="_blank" rel="noopener">Политикой обработки персональных данных</a>.</span>
      </label>
      <p class="field__error" role="alert">Без согласия отправить бриф нельзя</p>
    </div>`;
  }
  const head = `<label class="field__label" for="f-${f.id}"><span>${esc(f.label)}</span>${badge}${req}</label>`;
  if (f.type === 'short') {
    return `<div class="field" data-field="${f.id}">${head}${hint}
      <input class="input" id="f-${f.id}" type="text" autocomplete="off" placeholder="${esc(f.placeholder || '')}"${aria}>${err}</div>`;
  }
  if (f.type === 'files') {
    return `<div class="field" data-field="${f.id}">
      <span class="field__label">${esc(f.label)}<span class="field__req">· по желанию</span></span>${hint}
      <div class="dropzone" id="drop" tabindex="0" role="button" aria-label="Добавить файлы">
        <strong>Перетащите файлы сюда или нажмите</strong>
        <span>До ${MAX_FILES} файлов, каждый до ${MAX_FILE_MB} МБ. В черновике файлы не сохраняются.</span>
        <input type="file" id="f-files" multiple hidden>
      </div>
      <ul class="files" id="fileList"></ul></div>`;
  }
  // long и links
  const ph = f.type === 'links' ? 'https://…' : 'Напишите здесь. Поле растёт по мере набора.';
  return `<div class="field" data-field="${f.id}">${head}${hint}
    <textarea class="textarea" id="f-${f.id}" rows="3" placeholder="${esc(ph)}"${aria}></textarea>${err}</div>`;
}

function renderDots() {
  el.dots.innerHTML = STAGES.map((s, i) =>
    `<li><button type="button" data-i="${i}" aria-label="Этап ${s.num}: ${esc(s.title)}"></button></li>`).join('');
}
function updateDots() {
  el.dots.querySelectorAll('button').forEach((b, i) => {
    b.classList.toggle('is-active', i === state.stage);
    b.classList.toggle('is-done', i < state.stage);
    if (i === state.stage) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
  });
}

function bindFields(root) {
  root.querySelectorAll('textarea.textarea, input.input').forEach((n) => {
    const id = n.id.replace(/^f-/, '');
    n.value = state.answers[id] || '';
    if (n.tagName === 'TEXTAREA') autoGrow(n);
    n.addEventListener('input', () => {
      state.answers[id] = n.value;
      if (n.tagName === 'TEXTAREA') autoGrow(n);
      n.closest('.field').classList.remove('field--invalid');
      saveDraft();
    });
  });
  const cb = $('#f-consent', root);
  if (cb) {
    cb.checked = state.consent;
    cb.addEventListener('change', () => { state.consent = cb.checked; cb.closest('.field').classList.remove('field--invalid'); });
  }
  const drop = $('#drop', root);
  if (drop) bindDropzone(drop);
  renderFileList();
}

function bindDropzone(drop) {
  const input = $('#f-files');
  drop.addEventListener('click', (e) => { if (e.target !== input) input.click(); });
  drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
  input.addEventListener('change', () => { addFiles(input.files); input.value = ''; });
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('is-over'); }));
  drop.addEventListener('drop', (e) => addFiles(e.dataTransfer.files));
}

function addFiles(list) {
  const limit = MAX_FILE_MB * 1024 * 1024;
  let skipped = 0, tooMany = false;
  for (const f of Array.from(list || [])) {
    if (f.size > limit) { skipped++; continue; }
    if (state.files.some((x) => x.name === f.name && x.size === f.size)) continue;
    if (state.files.length >= MAX_FILES) { tooMany = true; break; }
    state.files.push(f);
  }
  if (skipped) toast(`Файл больше ${MAX_FILE_MB} МБ не добавлен`);
  else if (tooMany) toast(`Можно приложить не больше ${MAX_FILES} файлов`);
  renderFileList();
}

function renderFileList() {
  const ul = $('#fileList');
  if (!ul) return;
  ul.innerHTML = state.files.map((f, i) =>
    `<li><span class="files__name">${esc(f.name)}</span><span class="files__size">${fmtSize(f.size)}</span>
     <button type="button" class="files__del" data-del="${i}" aria-label="Убрать файл ${esc(f.name)}">×</button></li>`).join('');
}

function render() {
  const s = state.stage;
  el.intro.hidden = s !== -1;
  el.stage.hidden = !(s >= 0 && s < STAGES.length);
  el.final.hidden = s !== STAGES.length;
  el.nav.hidden = !(s >= 0 && s < STAGES.length);
  document.body.classList.toggle('has-nav', !el.nav.hidden);

  if (s >= 0 && s < STAGES.length) {
    const st = STAGES[s];
    el.side.innerHTML = `<p class="stage__count"><b>${st.num}</b> / ${pad(STAGES.length)}</p>
      <h2 class="stage__title">${esc(st.title)}</h2><p class="stage__desc">${esc(st.desc)}</p>`;
    el.body.innerHTML = st.fields.map(fieldHtml).join('') + '<div id="sendAlert"></div>';
    bindFields(el.body);
    el.next.textContent = s === STAGES.length - 1 ? 'Отправить' : 'Далее';
    el.next.disabled = false;
    el.back.textContent = 'Назад';
    updateDots();
    // анимация появления этапа
    el.stage.style.animation = 'none'; void el.stage.offsetWidth; el.stage.style.animation = '';
  }
  const pct = s < 0 ? 0 : s >= STAGES.length ? 100 : ((s + 1) / STAGES.length) * 100;
  el.bar.style.width = pct + '%';
}

function go(i, { scroll = true } = {}) {
  state.stage = i;
  saveDraft();
  render();
  if (scroll) window.scrollTo({ top: 0, behavior: 'auto' });
}

/* ============================================================
   ВАЛИДАЦИЯ
   ============================================================ */
function isMissing(f) {
  if (!f.required) return false;
  if (f.type === 'consent') return !state.consent;
  return !val(f.id);
}
function firstMissing(stageIdx) {
  const from = stageIdx === undefined ? 0 : stageIdx;
  const to = stageIdx === undefined ? STAGES.length - 1 : stageIdx;
  for (let i = from; i <= to; i++) {
    const f = STAGES[i].fields.find(isMissing);
    if (f) return { stage: i, field: f };
  }
  return null;
}
function highlight(fieldId) {
  const wrap = $(`[data-field="${fieldId}"]`);
  if (!wrap) return;
  STAGES[state.stage].fields.forEach((f) => { if (isMissing(f)) { const w = $(`[data-field="${f.id}"]`); if (w) w.classList.add('field--invalid'); } });
  wrap.scrollIntoView({ block: 'center', behavior: 'smooth' });
  const inp = wrap.querySelector('input, textarea');
  if (inp) setTimeout(() => inp.focus({ preventScroll: true }), 350);
}

/* ============================================================
   СБОРКА ОТВЕТОВ
   ============================================================ */
function nowStamp() {
  const d = new Date();
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const tz = `UTC${sign}${pad(Math.floor(Math.abs(off) / 60))}:${pad(Math.abs(off) % 60)}`;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())} (${tz})`;
}

/* Один блок на этап, вопросы жирным, пустые не показываем.
   Текст в формате HTML для Telegram (parse_mode=HTML), всё экранировано. */
function buildBlocks() {
  const blocks = [];
  STAGES.forEach((st) => {
    const parts = [];
    st.fields.forEach((f) => {
      if (f.type === 'consent' || f.type === 'files') return;
      const v = val(f.id);
      if (v) parts.push(`<b>${esc(f.label)}</b>\n${esc(v)}`);
    });
    if (st.id === 'materials' && state.files.length) {
      parts.push(`<b>Файлы</b>\n${state.files.map((f) => esc(f.name) + ' (' + fmtSize(f.size) + ')').join('\n')}`);
    }
    if (parts.length) blocks.push(`<b>${st.num} · ${esc(st.title.toUpperCase())}</b>\n\n${parts.join('\n\n')}`);
  });
  return blocks;
}

function buildSummary(stamp) {
  const lines = ['📋 <b>Новый бриф</b>', ''];
  lines.push(`<b>Имя:</b> ${esc(val('name'))}`);
  if (val('company')) lines.push(`<b>Компания:</b> ${esc(val('company'))}`);
  lines.push(`<b>Контакт:</b> ${esc(val('contact'))}`);
  const main = [['why', 'Зачем сайт сейчас'], ['sells', 'Что продаёт'], ['breaks', 'Где рвутся сделки']];
  const shown = main.filter(([id]) => val(id));
  if (shown.length) lines.push('');
  shown.forEach(([id, k]) => lines.push(`<b>${k}:</b> ${esc(trunc(val(id).replace(/\s+/g, ' '), 300))}`));
  lines.push('');
  if (state.files.length) lines.push(`📎 Файлов: ${state.files.length}`);
  lines.push(`✅ Согласие на обработку ПД: да, ${esc(stamp)}, версия документов ${DOC_VERSION}`);
  return lines.join('\n');
}

/* Чистый текст для скачивания копии ответов */
function buildPlainText(stamp) {
  const out = [`БРИФ · ${stamp}`, ''];
  STAGES.forEach((st) => {
    const parts = [];
    st.fields.forEach((f) => {
      if (f.type === 'consent' || f.type === 'files') return;
      const v = val(f.id);
      if (v) parts.push(`${f.label}\n${v}`);
    });
    if (st.id === 'materials' && state.files.length) {
      parts.push(`Файлы (приложите к письму сами)\n${state.files.map((f) => f.name).join('\n')}`);
    }
    if (parts.length) out.push(`=== ${st.num} · ${st.title.toUpperCase()} ===`, '', parts.join('\n\n'), '');
  });
  if (state.consent) out.push(`Согласие на обработку персональных данных: да, ${stamp}, версия документов ${DOC_VERSION}`);
  return out.join('\n');
}

function downloadAnswers() {
  const stamp = (state.lastPayload && state.lastPayload.stamp) || nowStamp();
  const text = (state.lastPayload && state.lastPayload.plain) || buildPlainText(stamp);
  const blob = new Blob(['﻿' + text], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  const who = (val('name') || 'brief').replace(/[^\p{L}\p{N}]+/gu, '_').slice(0, 30);
  a.href = URL.createObjectURL(blob);
  a.download = `brief_${who}.txt`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ============================================================
   ОТПРАВКА. Главное правило: ответы не теряются ни при какой ошибке —
   черновик остаётся, копию можно скачать в один клик.
   ============================================================ */
function showSendError(message) {
  const box = $('#sendAlert');
  if (!box) return;
  box.innerHTML = `<div class="alert" role="alert">
    <p><strong>Не получилось отправить.</strong> ${esc(message)} Ваши ответы сохранены на этой странице, ничего не потеряно.</p>
    <p>Скачайте копию и пришлите её мне в Telegram, либо попробуйте ещё раз.</p>
    <div class="alert__actions">
      <button type="button" class="btn btn--ghost btn--nav" id="errDownload">Скачать ответы</button>
      <button type="button" class="btn btn--nav" id="errRetry">Повторить</button>
    </div></div>`;
  $('#errDownload').addEventListener('click', downloadAnswers);
  $('#errRetry').addEventListener('click', submit);
  box.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function showFinal(mode) {
  const title = $('#finalTitle'), lead = $('#finalLead'), next = $('#finalNext'), note = $('#finalNote');
  // Финал всегда один и тот же, как его увидит клиент.
  // Тестовая плашка показывается только пока адрес приёмника в config.js пустой.
  title.textContent = 'Спасибо!';
  lead.textContent = 'Я получил ваш бриф и скоро с вами свяжусь.';
  next.innerHTML = `<p><strong>Что будет дальше</strong></p>
    <ol><li>Я изучу ответы и материалы.</li>
    <li>Отвечу ${esc(REPLY_TIME)} и пришлю уточняющие вопросы или предложение.</li>
    <li>Если захотите что-то добавить, просто напишите в Telegram.</li></ol>`;
  note.hidden = mode === 'ok';
  go(STAGES.length);
}

async function submit() {
  if (state.sending) return;
  const miss = firstMissing();
  if (miss) {
    if (miss.stage !== state.stage) { go(miss.stage, { scroll: false }); }
    setTimeout(() => highlight(miss.field.id), 60);
    toast('Заполните обязательные поля');
    return;
  }
  const stamp = nowStamp();
  state.lastPayload = { stamp, plain: buildPlainText(stamp) };

  // приёмник не подключён: предлагаем скачать файл, ничего не теряем
  if (!CFG.endpoint) {
    showFinal('offline');
    downloadAnswers();
    return;
  }

  state.sending = true;
  el.next.disabled = true; el.next.textContent = 'Отправляем…';
  const fd = new FormData();
  fd.append('summary', buildSummary(stamp));
  buildBlocks().forEach((b) => fd.append('blocks', b));
  state.files.forEach((f) => fd.append('files', f, f.name));
  fd.append('website', ''); // приманка для ботов, у людей всегда пустая

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), SEND_TIMEOUT_MS);
  try {
    const res = await fetch(CFG.endpoint, { method: 'POST', body: fd, signal: ctrl.signal });
    let data = {};
    try { data = await res.json(); } catch (e) { /* не JSON */ }
    if (!res.ok || !data.ok) throw new Error(data.error ? `Ответ сервера: ${data.error}.` : `Сервер ответил кодом ${res.status}.`);
    clearDraft();
    showFinal('ok');
  } catch (e) {
    const msg = e.name === 'AbortError' ? 'Соединение слишком долгое.' : (e.message && !/Failed to fetch|NetworkError|Load failed/i.test(e.message) ? e.message : 'Нет связи с сервером.');
    showSendError(msg);
    if (state.stage === STAGES.length - 1) { el.next.disabled = false; el.next.textContent = 'Отправить'; }
  } finally {
    clearTimeout(timer);
    state.sending = false;
  }
}

/* ============================================================
   СОБЫТИЯ
   ============================================================ */
$('#startBtn').addEventListener('click', () => go(0));

el.next.addEventListener('click', () => {
  const last = state.stage === STAGES.length - 1;
  if (last) { submit(); return; }
  const miss = firstMissing(state.stage);
  if (miss) { highlight(miss.field.id); return; }
  go(state.stage + 1);
});
el.back.addEventListener('click', () => go(state.stage - 1));
el.dots.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-i]');
  if (b) go(Number(b.dataset.i));
});
el.body.addEventListener('click', (e) => {
  const d = e.target.closest('[data-del]');
  if (d) { state.files.splice(Number(d.dataset.del), 1); renderFileList(); }
});
$('#finalDownload').addEventListener('click', downloadAnswers);

// фото: если файла нет, показываем монограмму, а не битую картинку
document.querySelectorAll('img[data-fallback]').forEach((img) => {
  const swap = () => {
    const f = document.createElement('div');
    f.className = 'photo-fallback'; f.setAttribute('role', 'img'); f.setAttribute('aria-label', img.alt);
    f.textContent = img.dataset.fallback;
    img.replaceWith(f);
  };
  img.addEventListener('error', swap, { once: true });
  if (img.complete && img.naturalWidth === 0) swap();
});

// не терять набранное при случайном закрытии, пока идёт отправка
window.addEventListener('beforeunload', (e) => { if (state.sending) { e.preventDefault(); e.returnValue = ''; } });

/* ============================================================
   СТАРТ
   ============================================================ */
renderDots();
if (loadDraft()) {
  render();
  toast('Черновик восстановлен');
} else {
  render();
}
