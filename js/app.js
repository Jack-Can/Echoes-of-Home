// ========== 全局状态 ==========
let CURRENT_USER = 'child';
let LATEST_INPUT_TEXT = '';
let pendingBufferMsg = null;
let CHAT_TIMELINE = [];
let CURRENT_VIEW = 'chat';

// ========== DOM 引用 ==========
const chatStream = document.getElementById('chatStream');
const msgInput = document.getElementById('msgInput');
const inputChat = document.getElementById('inputChat');
const inputVoice = document.getElementById('inputVoice');
const btnChild = document.getElementById('btn-child');
const btnParent = document.getElementById('btn-parent');
const letterBtn = document.getElementById('letterBtn');
const headerPeerName = document.querySelector('.header-title strong');
const headerTitle = document.getElementById('headerTitle');
const navChat = document.getElementById('navChat');
const navCalendar = document.getElementById('navCalendar');
const chatWrapper = document.getElementById('chatWrapper');
const calWrapper = document.getElementById('calWrapper');
let letterOverlay = null;
let letterScene = null;
let letterPaperContent = null;
let letterPaperMeta = null;
let letterPaperImages = null;
let composerOverlay = null;
let composerPanel = null;
let composeTextInput = null;
let composeImageInput = null;
let composeImagesWrap = null;
let composeAiBtn = null;
let composePackBtn = null;
let composeSendBtn = null;
let composeHintText = null;
let composeImages = [];
let composePacked = false;
let composeSealing = false;
let emotionOverlay = null;
let emotionPreviewText = null;

// ========== 初始化 ==========
function init() {
  setupLetterComposer();
  setupEmotionModal();
  setupLetterViewer();
  initChatTimeline();
  updateHeaderByIdentity();
  renderChatHistory();
  bindEvents();
}

function getCurrentRole() {
  return CURRENT_USER === 'child' ? 'child' : 'parent';
}

function getOppositeRole(role) {
  return role === 'child' ? 'parent' : 'child';
}

function getRoleByFrom(from) {
  if (CURRENT_USER === 'child') {
    return from === 'me' ? 'child' : 'parent';
  }
  return from === 'me' ? 'parent' : 'child';
}

function initChatTimeline() {
  CHAT_TIMELINE = MOCK_CHAT_HISTORY
    .filter((msg) => msg.type !== 'buffer')
    .map((msg) => {
    const senderRole = msg.from === 'me' ? 'child' : 'parent';
    return {
      id: msg.id,
      type: msg.type,
      senderRole,
      sender: getNameByRole(senderRole),
      content: msg.content || '',
      images: Array.isArray(msg.images) ? msg.images.slice() : [],
      timestamp: msg.timestamp || ''
    };
  });
}

function resolveEntryForCurrentUser(entry) {
  const from = entry.senderRole === getCurrentRole() ? 'me' : 'them';
  return {
    id: entry.id,
    type: entry.type,
    from,
    sender: entry.sender || getNameByRole(entry.senderRole),
    content: entry.content || '',
    images: Array.isArray(entry.images) ? entry.images.slice() : [],
    timestamp: entry.timestamp || ''
  };
}

function getAvatarByRole(role) {
  return role === 'parent' ? '👵' : '👨‍💻';
}

function getNameByRole(role) {
  return role === 'parent' ? '老妈' : '孩子';
}

function getLetterPreview(content) {
  const normalized = String(content || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '轻轻折起的一句心里话';
  if (normalized.length <= 28) return normalized;
  return normalized.slice(0, 28) + '…';
}

function updateHeaderByIdentity() {
  if (!headerPeerName) return;
  headerPeerName.textContent = CURRENT_USER === 'child' ? '老妈' : '孩子';
}

function bindEvents() {
  msgInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  msgInput.addEventListener('input', (e) => {
    LATEST_INPUT_TEXT = e.target.value;
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLetterViewer();
      closeLetterComposer();
    }
  });
}

// ========== 渲染模拟历史 ==========
function renderChatHistory() {
  chatStream.innerHTML = '';

  // 日期分隔线
  chatStream.appendChild(createDateDivider('今天'));

  CHAT_TIMELINE.forEach((entry) => {
    const resolved = resolveEntryForCurrentUser(entry);
    const el = createMsgElement(resolved);
    if (el) {
      chatStream.appendChild(el);
    }
  });

  chatStream.scrollTop = chatStream.scrollHeight;
}

// ========== 构造消息元素 ==========
function createMsgElement(msg) {
  const wrap = document.createElement('div');
  wrap.className = 'msg-wrap';
  if (msg.from) {
    wrap.classList.add(msg.from === 'me' ? 'from-me' : 'from-them');
  }
  wrap.dataset.id = msg.id;

  if (msg.type === 'chat') {
    const meta = document.createElement('div');
    meta.className = 'msg-meta';

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = getAvatarByRole(getRoleByFrom(msg.from));

    const bubble = document.createElement('div');
    bubble.className = 'msg-chat';
    bubble.textContent = msg.content;

    meta.appendChild(avatar);
    if (msg.from === 'them') {
      const sender = document.createElement('div');
      sender.className = 'msg-sender';
      sender.textContent = msg.sender || getNameByRole(getRoleByFrom('them'));
      meta.appendChild(sender);
    }

    wrap.appendChild(meta);
    wrap.appendChild(bubble);
    return wrap;
  }

  if (msg.type === 'letter') {
    wrap.classList.add('msg-letter-wrap');

    const meta = document.createElement('div');
    meta.className = 'msg-meta';

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = getAvatarByRole(getRoleByFrom(msg.from));

    const isIncomingLetter = msg.from === 'them';

    const card = document.createElement('div');
    card.className = `msg-envelope-card ${isIncomingLetter ? 'incoming' : 'outgoing'}`;
    card.dataset.content = encodeURIComponent(msg.content || '');
    card.dataset.sender = msg.sender || getNameByRole(getRoleByFrom(msg.from));
    card.dataset.timestamp = msg.timestamp || '';
    card.dataset.images = encodeURIComponent(JSON.stringify(msg.images || []));
    card.dataset.from = msg.from;
    card.onclick = () => openLetterFromCard(card);

    const letterPreview = getLetterPreview(msg.content || '');
    const currentUserName = getNameByRole(getCurrentRole());
    const targetName = card.dataset.sender;

    card.innerHTML = `
      <div class="envelope-shell">
        <div class="envelope-paper-peek"></div>
        <div class="envelope-lining"></div>
        <div class="envelope-top"></div>
        <div class="envelope-address">
          <div class="envelope-address-label">FROM</div>
          <div class="envelope-address-name">${isIncomingLetter ? targetName : currentUserName}</div>
          <div class="envelope-address-route">TO ${isIncomingLetter ? currentUserName : targetName}</div>
        </div>
        <div class="envelope-stamp-mark">AIR MAIL</div>
        <div class="envelope-front">
          <div class="envelope-front-inner">
            <div class="envelope-tag">家书</div>
            <div class="envelope-kicker">${isIncomingLetter ? '寄给你的信件' : '你寄出的信件'}</div>
            <div class="envelope-recipient-label">${isIncomingLetter ? '发信人' : '收信人'}</div>
            <div class="envelope-recipient-name">${targetName}</div>
            <div class="envelope-divider"></div>
            <div class="envelope-preview-label">信封摘要</div>
            <div class="envelope-preview">${letterPreview}</div>
            <div class="envelope-meta-row">
              <div class="envelope-time">${msg.timestamp || ''}</div>
              <div class="envelope-status">${isIncomingLetter ? '已送达，可拆阅' : '已送达，可重读'}</div>
            </div>
          </div>
          <div class="envelope-postmark">${msg.timestamp || '刚刚封缄'}</div>
        </div>
        <div class="envelope-seal"></div>
      </div>
      <div class="envelope-hint">${isIncomingLetter ? '这封家书已经送达，点击信封拆阅' : '这封家书已经妥投，点击信封重读'}</div>
    `;

    meta.appendChild(avatar);
    if (msg.from === 'them') {
      const sender = document.createElement('div');
      sender.className = 'msg-sender';
      sender.textContent = msg.sender || getNameByRole(getRoleByFrom('them'));
      meta.appendChild(sender);
    }

    wrap.appendChild(meta);
    wrap.appendChild(card);
    return wrap;
  }

  return null;
}

// ========== 身份切换 ==========
function switchIdentity(identity) {
  CURRENT_USER = identity;
  LATEST_INPUT_TEXT = '';
  msgInput.value = '';
  pendingBufferMsg = null;
  closeLetterComposer();
  closeEmotionModal();

  const parentInput = document.getElementById('parentMsgInput');
  if (parentInput) {
    parentInput.value = '';
  }

  if (identity === 'child') {
    btnChild.classList.add('active');
    btnParent.classList.remove('active');
    inputChat.classList.remove('hidden');
    inputVoice.classList.add('hidden');
  } else {
    btnChild.classList.remove('active');
    btnParent.classList.add('active');
    inputChat.classList.add('hidden');
    inputVoice.classList.remove('hidden');
    // 重置父母端为语音模式
    switchParentInput('voice');
  }

  updateHeaderByIdentity();
  updateComposeHeader();
  renderChatHistory();
}

// ========== 父母端输入模式切换 ==========
let currentParentMode = 'voice';

function switchParentInput(mode) {
  currentParentMode = mode;
  const tabVoice = document.getElementById('tabVoice');
  const tabText = document.getElementById('tabText');
  const voiceArea = document.getElementById('parentVoiceArea');
  const textArea = document.getElementById('parentTextArea');

  if (mode === 'voice') {
    tabVoice.classList.add('active');
    tabText.classList.remove('active');
    voiceArea.classList.remove('hidden');
    textArea.classList.add('hidden');
  } else {
    tabVoice.classList.remove('active');
    tabText.classList.add('active');
    voiceArea.classList.add('hidden');
    textArea.classList.remove('hidden');
    document.getElementById('parentMsgInput').focus();
  }
}

// ========== 发送消息 ==========
function sendMessage() {
  const text = msgInput.value.trim();
  if (!text) return;

  // 演示版硬条件：仅检测完整关键词“你好烦啊”
  if (CURRENT_USER === 'child' && containsEmotionKeyword(text)) {
    pendingBufferMsg = text;
    openEmotionModal(text);
    return;
  }

  if (CURRENT_USER === 'child') {
    appendChatBubble('me', text);
    msgInput.value = '';
    LATEST_INPUT_TEXT = '';
  }
}

// ========== 父母端发送消息 ==========
function sendMessageParent() {
  const input = document.getElementById('parentMsgInput');
  const text = input.value.trim();
  if (!text) return;

  if (CURRENT_USER === 'parent') {
    appendChatBubble('me', text);
    input.value = '';
  }
}

// ========== 追加元素到聊天流 ==========
function appendChatBubble(from, content) {
  const senderRole = from === 'me' ? getCurrentRole() : getOppositeRole(getCurrentRole());
  const timestamp = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  const entry = {
    id: 'msg-' + Date.now(),
    type: 'chat',
    senderRole,
    sender: getNameByRole(senderRole),
    content: content,
    images: [],
    timestamp
  };
  CHAT_TIMELINE.push(entry);

  const msg = {
    id: entry.id,
    type: 'chat',
    from,
    sender: entry.sender,
    content: content,
    timestamp
  };
  const el = createMsgElement(msg);
  if (el) {
    chatStream.appendChild(el);
    chatStream.scrollTop = chatStream.scrollHeight;
  }
}

function appendLetterMessage(content, images = []) {
  const senderRole = getCurrentRole();
  const timestamp = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  const entry = {
    id: 'letter-' + Date.now(),
    type: 'letter',
    senderRole,
    sender: getNameByRole(senderRole),
    content,
    images: Array.isArray(images) ? images.slice() : [],
    timestamp
  };
  CHAT_TIMELINE.push(entry);

  const msg = {
    id: entry.id,
    type: 'letter',
    from: 'me',
    sender: entry.sender,
    content,
    images: entry.images,
    timestamp
  };

  const el = createMsgElement(msg);
  if (el) {
    chatStream.appendChild(el);
    chatStream.scrollTop = chatStream.scrollHeight;
  }
}

// ========== AI 情绪检测弹窗 ==========
function containsEmotionKeyword(text) {
  return text.includes('你好烦啊');
}

function setupEmotionModal() {
  const overlay = document.createElement('div');
  overlay.className = 'emotion-overlay hidden';
  overlay.id = 'emotionOverlay';
  overlay.innerHTML = `
    <div class="emotion-backdrop"></div>
    <div class="emotion-card" role="dialog" aria-modal="true" aria-label="AI 情绪检测提示">
      <div class="emotion-icon">🛡️</div>
      <div class="emotion-title">AI 检测到可能的负向情绪</div>
      <div class="emotion-desc" id="emotionPreview"></div>
      <div class="emotion-actions">
        <button class="emotion-btn polish" onclick="confirmEmotionPolish()">确定润色</button>
        <button class="emotion-btn send" onclick="confirmEmotionSend()">继续发送</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  emotionOverlay = overlay;
  emotionPreviewText = document.getElementById('emotionPreview');
}

function openEmotionModal(text) {
  if (!emotionOverlay || !emotionPreviewText) return;
  emotionPreviewText.textContent = `检测关键词："${text}"`;
  emotionOverlay.classList.remove('hidden');
  document.body.classList.add('emotion-checking');
}

function closeEmotionModal() {
  if (!emotionOverlay || emotionOverlay.classList.contains('hidden')) return;
  emotionOverlay.classList.add('hidden');
  document.body.classList.remove('emotion-checking');
}

function confirmEmotionPolish() {
  if (!pendingBufferMsg) return;
  const polished = polishText(pendingBufferMsg);
  appendChatBubble('me', polished);
  msgInput.value = '';
  LATEST_INPUT_TEXT = '';
  pendingBufferMsg = null;
  closeEmotionModal();
}

function confirmEmotionSend() {
  if (!pendingBufferMsg) return;
  appendChatBubble('me', pendingBufferMsg);
  msgInput.value = '';
  LATEST_INPUT_TEXT = '';
  pendingBufferMsg = null;
  closeEmotionModal();
}

// ========== 文字润色 ==========
function polishText(text) {
  return text
    .replace(/烦/g, '有些操心')
    .replace(/累/g, '需要休息')
    .replace(/讨厌/g, '有些不喜欢')
    .replace(/恨/g, '感到有些无奈')
    .replace(/气/g, '需要冷静一下')
    .replace(/死/g, '有些困扰');
}

// ========== 一键成书 ==========
function openLetterMode() {
  openLetterComposer(msgInput.value.trim());
}

function setupLetterComposer() {
  const overlay = document.createElement('div');
  overlay.className = 'compose-overlay hidden';
  overlay.id = 'composeOverlay';
  overlay.innerHTML = `
    <div class="compose-backdrop" onclick="closeLetterComposer()"></div>
    <div class="compose-panel" id="composePanel" role="dialog" aria-modal="true" aria-label="写信">
      <button class="compose-close" onclick="closeLetterComposer()" aria-label="关闭">×</button>
      <div class="compose-main">
        <div class="compose-paper-stage">
          <div class="compose-envelope-slot">
            <div class="compose-envelope-shell">
              <div class="compose-envelope-paper-peek"></div>
              <div class="compose-envelope-lining"></div>
              <div class="compose-envelope-top"></div>
              <div class="compose-envelope-address">
                <div class="compose-envelope-address-label">TO</div>
                <div class="compose-envelope-address-name">${getNameByRole(CURRENT_USER === 'child' ? 'parent' : 'child')}</div>
                <div class="compose-envelope-address-route">这封心意正在认真封装</div>
              </div>
              <div class="compose-envelope-front"></div>
              <div class="compose-envelope-seal"></div>
              <div class="compose-envelope-stamp">AIR MAIL</div>
            </div>
          </div>
          <div class="compose-paper" id="composePaper">
            <div class="compose-paper-head">给${getNameByRole(CURRENT_USER === 'child' ? 'parent' : 'child')}：</div>
            <textarea id="composeText" class="compose-textarea" placeholder="写下你想说的话..."></textarea>
            <div class="compose-images" id="composeImages"></div>
          </div>
        </div>
        <div class="compose-actions">
          <button class="compose-add-image" onclick="triggerComposeImagePick()">＋ 贴图片</button>
          <input id="composeImageInput" class="compose-image-input" type="file" accept="image/*" multiple>
          <button class="compose-ai-btn" id="composeAiBtn" onclick="handleComposePolish()">一键成书</button>
          <button class="compose-pack-btn" id="composePackBtn" onclick="handleComposePack()" disabled>装入信封</button>
          <button class="compose-send-btn" id="composeSendBtn" onclick="handleComposeSend()" disabled>寄给对方</button>
          <div class="compose-hint" id="composeHint">先写好内容，再点击一键成书。</div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  composerOverlay = overlay;
  composerPanel = document.getElementById('composePanel');
  composeTextInput = document.getElementById('composeText');
  composeImageInput = document.getElementById('composeImageInput');
  composeImagesWrap = document.getElementById('composeImages');
  composeAiBtn = document.getElementById('composeAiBtn');
  composePackBtn = document.getElementById('composePackBtn');
  composeSendBtn = document.getElementById('composeSendBtn');
  composeHintText = document.getElementById('composeHint');

  if (composeImageInput) {
    composeImageInput.addEventListener('change', handleComposeImagePick);
  }

  if (composeTextInput) {
    composeTextInput.addEventListener('input', () => {
      updateComposeActions();
    });
  }
}

function openLetterComposer(initialText = '') {
  if (!composerOverlay || !composerPanel || !composeTextInput) return;

  resetLetterComposer();
  composeTextInput.value = initialText || '';
  composerOverlay.classList.remove('hidden');
  document.body.classList.add('letter-composing');
  updateComposeHeader();
  updateComposeActions();
  composeTextInput.focus();
}

function closeLetterComposer() {
  if (!composerOverlay || composerOverlay.classList.contains('hidden')) return;
  composerOverlay.classList.add('hidden');
  document.body.classList.remove('letter-composing');
}

function resetLetterComposer() {
  composeImages = [];
  composePacked = false;
  composeSealing = false;

  if (composerPanel) {
    composerPanel.classList.remove('polished', 'packing', 'packed', 'sealing');
  }

  if (composeTextInput) {
    composeTextInput.value = '';
    composeTextInput.disabled = false;
  }

  if (composeImageInput) {
    composeImageInput.value = '';
  }

  renderComposeImages();

  if (composeAiBtn) {
    composeAiBtn.disabled = false;
    composeAiBtn.textContent = '一键成书';
  }

  if (composePackBtn) {
    composePackBtn.style.display = 'none';
  }

  if (composeSendBtn) {
    composeSendBtn.style.display = 'none';
  }

  if (composeHintText) {
    composeHintText.textContent = '先写好内容，再点击一键成书。';
  }
}

function updateComposeHeader() {
  const head = composerPanel ? composerPanel.querySelector('.compose-paper-head') : null;
  if (!head) return;
  const targetName = getNameByRole(CURRENT_USER === 'child' ? 'parent' : 'child');
  head.textContent = `给${targetName}：`;
}

function updateComposeActions() {
  const hasText = !!(composeTextInput && composeTextInput.value.trim());
  const polished = !!(composerPanel && composerPanel.classList.contains('polished'));

  if (composeAiBtn) {
    composeAiBtn.disabled = !hasText || composePacked;
  }

  if (composePackBtn) {
    composePackBtn.disabled = !hasText || !polished || composePacked;
  }

  if (composeSendBtn) {
    composeSendBtn.disabled = !composePacked || composeSealing;
  }
}

function triggerComposeImagePick() {
  if (composePacked || !composeImageInput) return;
  composeImageInput.click();
}

function handleComposeImagePick(event) {
  const files = Array.from((event.target && event.target.files) || []);
  if (!files.length) return;

  files.forEach((file) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target && e.target.result ? String(e.target.result) : '';
      if (!src) return;
      composeImages.push(src);
      renderComposeImages();
    };
    reader.readAsDataURL(file);
  });

  event.target.value = '';
}

function renderComposeImages() {
  if (!composeImagesWrap) return;
  composeImagesWrap.innerHTML = '';

  composeImages.forEach((src, index) => {
    const item = document.createElement('div');
    item.className = 'compose-image-item';
    item.innerHTML = `
      <img src="${src}" alt="贴图${index + 1}">
      <button class="compose-image-remove" onclick="removeComposeImage(${index})" aria-label="删除图片">×</button>
    `;
    composeImagesWrap.appendChild(item);
  });
}

function removeComposeImage(index) {
  if (composePacked) return;
  composeImages.splice(index, 1);
  renderComposeImages();
}

function handleComposePolish() {
  if (!composeTextInput || !composeTextInput.value.trim() || !composerPanel) return;

  composerPanel.classList.add('polished');
  if (composeAiBtn) {
    composeAiBtn.textContent = '已整理（示意）';
  }
  if (composeHintText) {
    composeHintText.textContent = '已完成一键成书（示意），现在可以装入信封。';
  }

  if (composePackBtn) {
    composePackBtn.style.display = 'inline-flex';
  }

  updateComposeActions();
}

function handleComposePack() {
  if (!composerPanel || composePacked) return;
  if (!composeTextInput || !composeTextInput.value.trim()) return;

  composerPanel.classList.add('packing');
  if (composeHintText) {
    composeHintText.textContent = '正在将信纸装入信封...';
  }

  setTimeout(() => {
    composerPanel.classList.remove('packing');
    composerPanel.classList.add('packed');
    composePacked = true;

    if (composeTextInput) {
      composeTextInput.disabled = true;
    }

    if (composeHintText) {
      composeHintText.textContent = '装入完成，点击“寄给对方”发送。';
    }

    if (composeSendBtn) {
      composeSendBtn.style.display = 'inline-flex';
    }

    updateComposeActions();
  }, 1600);
}

function handleComposeSend() {
  if (!composerPanel || !composePacked || composeSealing || !composeTextInput) return;

  const content = composeTextInput.value.trim();
  if (!content) return;

  composeSealing = true;
  composerPanel.classList.add('sealing');
  if (composeHintText) {
    composeHintText.textContent = '正在盖蜡封与邮戳，准备寄出...';
  }
  updateComposeActions();

  setTimeout(() => {
    appendLetterMessage(content, composeImages.slice());
    closeLetterComposer();
    resetLetterComposer();
    msgInput.value = '';
    LATEST_INPUT_TEXT = '';
  }, 1500);
}

function setupLetterViewer() {
  const overlay = document.createElement('div');
  overlay.className = 'letter-overlay hidden';
  overlay.id = 'letterOverlay';
  overlay.innerHTML = `
    <div class="letter-backdrop" onclick="closeLetterViewer()"></div>
    <div class="letter-stage" role="dialog" aria-modal="true" aria-label="家书阅读">
      <button class="letter-close" onclick="closeLetterViewer()" aria-label="关闭">×</button>
      <div class="letter-scene" id="letterScene">
        <div class="open-envelope">
          <div class="open-envelope-back"></div>
          <div class="open-paper" id="openPaper">
            <div class="open-paper-fold"></div>
            <div class="open-paper-body">
              <div class="open-paper-header">家书</div>
              <div class="open-paper-meta" id="openPaperMeta"></div>
              <div class="open-paper-content" id="openPaperContent"></div>
              <div class="open-paper-images" id="openPaperImages"></div>
            </div>
          </div>
          <div class="open-envelope-front"></div>
          <div class="open-envelope-flap"></div>
          <div class="open-envelope-seal"></div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  letterOverlay = overlay;
  letterScene = document.getElementById('letterScene');
  letterPaperContent = document.getElementById('openPaperContent');
  letterPaperMeta = document.getElementById('openPaperMeta');
  letterPaperImages = document.getElementById('openPaperImages');
}

function openLetterFromCard(card) {
  const content = decodeURIComponent(card.dataset.content || '');
  const sender = card.dataset.sender || '';
  const timestamp = card.dataset.timestamp || '';
  let images = [];
  try {
    images = JSON.parse(decodeURIComponent(card.dataset.images || '%5B%5D'));
  } catch (err) {
    images = [];
  }
  openLetterViewer({ content, sender, timestamp, images });
}

function openLetterViewer(letter) {
  if (!letterOverlay || !letterScene || !letterPaperContent || !letterPaperMeta) return;
  if (!letterOverlay.classList.contains('hidden')) return;

  letterPaperContent.textContent = letter.content || '';
  letterPaperMeta.textContent = `${letter.sender || ''} ${letter.timestamp || ''}`.trim();
  if (letterPaperImages) {
    letterPaperImages.innerHTML = '';
    (letter.images || []).forEach((src, index) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = `家书图片${index + 1}`;
      letterPaperImages.appendChild(img);
    });
  }

  letterOverlay.classList.remove('hidden');
  document.body.classList.add('letter-reading');

  letterScene.classList.remove('play');
  void letterScene.offsetWidth;
  letterScene.classList.add('play');
}

function closeLetterViewer() {
  if (!letterOverlay || letterOverlay.classList.contains('hidden')) return;
  if (letterOverlay.classList.contains('closing')) return;

  letterOverlay.classList.add('closing');
  setTimeout(() => {
    letterOverlay.classList.add('hidden');
    letterOverlay.classList.remove('closing');
    if (letterScene) {
      letterScene.classList.remove('play');
    }
    document.body.classList.remove('letter-reading');
  }, 800);
}

function htmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function jsEscape(str) {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

// ========== 辅助 ==========
function createDateDivider(text) {
  const div = document.createElement('div');
  div.className = 'date-divider';
  div.innerHTML = `<span>${text}</span>`;
  return div;
}

// ========== 视图切换 ==========
function switchView(view) {
  CURRENT_VIEW = view;
  
  if (view === 'chat') {
    navChat.classList.add('active');
    navCalendar.classList.remove('active');
    chatWrapper.style.display = 'flex';
    calWrapper.style.display = 'none';
    if (headerTitle) {
      headerTitle.innerHTML = '正在与 <strong>老妈</strong> <span class="header-dot">沟通中...</span>';
    }
  } else {
    navChat.classList.remove('active');
    navCalendar.classList.add('active');
    chatWrapper.style.display = 'none';
    calWrapper.style.display = 'block';
    if (headerTitle) {
      headerTitle.innerHTML = '<strong>📅</strong> 温情日历';
    }
    // 初始化日历视图
    if (typeof CalendarApp !== 'undefined' && CalendarApp.render && CalendarApp.render.init) {
      CalendarApp.render.init();
    }
  }
}

// ========== 启动 ==========
init();
