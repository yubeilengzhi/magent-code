// ==================== magent Web UI ====================
// 现代化、专业的 AI 编程助手界面
// 参考：cc-connect (React + Vite + Tailwind) / OpenHands (HeroUI) / CloudCLI (shadcn-like)

const API_BASE = window.location.origin;
const REFRESH_INTERVAL = 5000;

const state = {
  // 数据
  providers: [],
  models: [],
  sessions: [],
  memories: [],
  routingHistory: [],
  skills: [],

  // UI 状态
  currentView: 'chat',
  selectedProvider: 'codex',
  selectedModel: 'qwen3.7-plus',
  isLoading: false,
  messages: [], // 聊天消息
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  showSettings: false,
  memorySearch: '',
  showAddMemory: false,
  newMemoryContent: '',
  newMemoryCategory: 'general',
  routingFilter: 'all',
};

// ==================== API ====================
async function apiGet(path) {
  const res = await fetch(API_BASE + path);
  if (!res.ok) throw new Error('API Error: ' + res.status);
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.details || 'API Error: ' + res.status);
  }
  return res.json();
}

// ==================== 工具函数 ====================
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }
function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  if (props.class) node.className = props.class;
  Object.keys(props).forEach(k => {
    if (k === 'class' || k === 'on') return;
    if (k.startsWith('data-')) node.setAttribute(k, props[k]);
    else if (k === 'html') node.innerHTML = props[k];
    else node[k] = props[k];
  });
  children.forEach(c => {
    if (c == null) return;
    if (typeof c === 'string' || typeof c === 'number') {
      node.appendChild(document.createTextNode(String(c)));
    } else {
      node.appendChild(c);
    }
  });
  return node;
}

function formatTime(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return Math.floor(diff / 60) + ' 分钟前';
  if (diff < 86400) return Math.floor(diff / 3600) + ' 小时前';
  if (diff < 7 * 86400) return Math.floor(diff / 86400) + ' 天前';
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function truncate(str, len = 80) {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '...' : str;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderMarkdown(text) {
  if (!text) return '';
  if (typeof marked !== 'undefined') {
    try {
      const html = marked.parse(text);
      if (typeof DOMPurify !== 'undefined') {
        return DOMPurify.sanitize(html);
      }
      return html;
    } catch (e) {
      return escapeHtml(text);
    }
  }
  return escapeHtml(text);
}

function showToast(message, type = 'info') {
  const existing = $('#toast');
  if (existing) existing.remove();

  const colors = {
    info: 'bg-slate-800 text-white',
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
  };

  const toast = el('div', {
    id: 'toast',
    class: `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-2xl ${colors[type]} animate-slide-up`,
  }, [message]);
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ==================== 图标库（Lucide 风格 SVG）====================
const Icons = {
  chat: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  folder: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',
  brain: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>',
  routing: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="15" cy="5" r="3"/></svg>',
  model: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  zap: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  settings: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
  send: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
  plus: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  search: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  moon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
  sun: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
  trash: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
  user: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  bot: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>',
  menu: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>',
  check: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  x: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  alert: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>',
};

// ==================== 侧边栏 ====================
function renderSidebar() {
  const navItems = [
    { id: 'chat', label: '聊天', icon: Icons.chat, color: 'from-indigo-500 to-purple-500' },
    { id: 'sessions', label: '会话', icon: Icons.folder, color: 'from-amber-500 to-orange-500' },
    { id: 'memories', label: '记忆', icon: Icons.brain, color: 'from-pink-500 to-rose-500' },
    { id: 'routing', label: '路由', icon: Icons.routing, color: 'from-cyan-500 to-blue-500' },
    { id: 'models', label: '模型', icon: Icons.model, color: 'from-emerald-500 to-teal-500' },
    { id: 'skills', label: '技能', icon: Icons.zap, color: 'from-yellow-500 to-amber-500' },
  ];

  const sidebar = el('aside', {
    class: `w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all ${state.sidebarCollapsed ? '-ml-64' : ''}`,
  });

  // Logo
  const logo = el('div', {
    class: 'p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between',
  });
  logo.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-lg shadow-lg">
        M
      </div>
      <div>
        <h1 class="font-bold text-slate-900 dark:text-white text-base">magent</h1>
        <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI 编程助手</p>
      </div>
    </div>
    <button id="close-sidebar" class="md:hidden p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
      ${Icons.x}
    </button>
  `;
  sidebar.appendChild(logo);

  // 搜索
  const search = el('div', { class: 'p-3' });
  search.innerHTML = `
    <div class="relative">
      <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">${Icons.search}</span>
      <input id="search-input" type="text" placeholder="搜索..."
        class="w-full pl-9 pr-12 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-0 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400" />
      <kbd class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">Ctrl K</kbd>
    </div>
  `;
  sidebar.appendChild(search);

  // 导航
  const nav = el('nav', { class: 'flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-thin' });
  navItems.forEach(item => {
    const isActive = state.currentView === item.id;
    const navItem = el('button', {
      class: `nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
        isActive
          ? 'bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20 text-brand-700 dark:text-brand-300 font-medium'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`,
      'data-view': item.id,
    });
    navItem.innerHTML = `
      <span class="w-5 h-5 ${isActive ? 'text-brand-500' : 'text-slate-400'}">${item.icon}</span>
      <span>${item.label}</span>
      ${item.id === 'sessions' ? `<span class="ml-auto text-[10px] text-slate-400">${state.sessions.length}</span>` : ''}
      ${item.id === 'memories' ? `<span class="ml-auto text-[10px] text-slate-400">${state.memories.length}</span>` : ''}
      ${item.id === 'skills' ? `<span class="ml-auto text-[10px] text-slate-400">${state.skills.length}</span>` : ''}
    `;
    navItem.addEventListener('click', () => {
      state.currentView = item.id;
      state.mobileSidebarOpen = false;
      renderApp();
    });
    nav.appendChild(navItem);
  });
  sidebar.appendChild(nav);

  // 底部
  const footer = el('div', { class: 'p-3 border-t border-slate-200 dark:border-slate-800' });
  footer.innerHTML = `
    <div class="flex items-center justify-between px-2 py-1.5">
      <span class="text-xs text-slate-500 dark:text-slate-400">主题</span>
      <button id="theme-toggle" class="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
        <span class="dark:hidden">${Icons.moon}</span>
        <span class="hidden dark:inline">${Icons.sun}</span>
      </button>
    </div>
  `;
  sidebar.appendChild(footer);

  // 事件绑定
  const themeBtn = footer.querySelector('#theme-toggle');
  themeBtn.addEventListener('click', toggleTheme);

  const closeBtn = logo.querySelector('#close-sidebar');
  closeBtn.addEventListener('click', () => {
    state.mobileSidebarOpen = false;
    renderApp();
  });

  return sidebar;
}

// ==================== 顶部栏 ====================
function renderHeader() {
  const header = el('div', {
    class: 'h-14 px-4 md:px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 glass flex items-center justify-between flex-shrink-0',
  });

  const titles = {
    chat: { title: '聊天', sub: '与 AI 助手对话' },
    sessions: { title: '会话', sub: '历史会话记录' },
    memories: { title: '记忆', sub: '长期记忆库' },
    routing: { title: '路由', sub: '智能路由历史' },
    models: { title: '模型池', sub: '可用模型列表' },
    skills: { title: '技能库', sub: '内置技能' },
  };

  const t = titles[state.currentView] || titles.chat;

  const left = el('div', { class: 'flex items-center gap-3' });
  left.innerHTML = `
    <button id="mobile-menu" class="md:hidden p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
      ${Icons.menu}
    </button>
    <div>
      <h2 class="text-base font-semibold text-slate-900 dark:text-white">${t.title}</h2>
      <p class="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">${t.sub}</p>
    </div>
  `;

  const right = el('div', { class: 'flex items-center gap-2' });
  if (state.currentView === 'chat') {
    // 选 provider
    const providerSelect = el('select', {
      id: 'header-provider',
      class: 'px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500',
    });
    state.providers.forEach(p => {
      const opt = el('option', { value: p.name }, [p.name]);
      if (p.name === state.selectedProvider) opt.selected = true;
      providerSelect.appendChild(opt);
    });
    providerSelect.addEventListener('change', e => {
      state.selectedProvider = e.target.value;
    });
    right.appendChild(providerSelect);

    // 选 model
    const modelInput = el('input', {
      id: 'header-model',
      type: 'text',
      value: state.selectedModel,
      class: 'px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 w-32',
    });
    modelInput.addEventListener('change', e => {
      state.selectedModel = e.target.value;
    });
    right.appendChild(modelInput);
  } else {
    // 操作按钮
    if (state.currentView === 'memories') {
      const addBtn = el('button', {
        id: 'add-memory-btn',
        class: 'flex items-center gap-1.5 px-3 py-1.5 btn-primary text-white rounded-lg text-sm font-medium',
      });
      addBtn.innerHTML = `<span class="w-4 h-4">${Icons.plus}</span> 添加记忆`;
      addBtn.addEventListener('click', () => {
        state.showAddMemory = true;
        renderMain();
      });
      right.appendChild(addBtn);
    }
  }

  header.appendChild(left);
  header.appendChild(right);

  // 事件
  const mobileMenu = left.querySelector('#mobile-menu');
  mobileMenu.addEventListener('click', () => {
    state.mobileSidebarOpen = !state.mobileSidebarOpen;
    renderApp();
  });

  return header;
}

// ==================== 主内容 ====================
function renderMain() {
  const main = el('div', { class: 'flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950' });
  main.appendChild(renderHeader());
  main.appendChild(rerenderContent());
  return main;
}

function rerenderContent() {
  const content = el('div', { class: 'flex-1 overflow-y-auto scrollbar-thin' });
  switch (state.currentView) {
    case 'chat': content.appendChild(renderChatView()); break;
    case 'sessions': content.appendChild(renderSessionsView()); break;
    case 'memories': content.appendChild(renderMemoriesView()); break;
    case 'routing': content.appendChild(renderRoutingView()); break;
    case 'models': content.appendChild(renderModelsView()); break;
    case 'skills': content.appendChild(renderSkillsView()); break;
  }
  return content;
}

// ==================== 聊天视图 ====================
function renderChatView() {
  const container = el('div', { class: 'flex flex-col h-full' });

  // 消息区
  const messages = el('div', { id: 'messages', class: 'flex-1 overflow-y-auto scrollbar-thin px-4 md:px-6 py-6' });

  if (state.messages.length === 0) {
    const empty = el('div', { class: 'flex flex-col items-center justify-center h-full empty-state' });
    empty.innerHTML = `
      <div class="w-20 h-20 mb-4 rounded-2xl gradient-bg flex items-center justify-center shadow-xl">
        <span class="w-10 h-10 text-white">${Icons.bot}</span>
      </div>
      <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">开始对话</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">选择一个 provider 和 model，然后输入任务</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
        <button class="suggestion p-3 text-left text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-brand-500 hover:shadow-md transition-all" data-suggestion="帮我写一个 Python 快速排序函数">
          <div class="font-medium text-slate-700 dark:text-slate-200 mb-1">💡 代码生成</div>
          <div class="text-xs text-slate-500">帮我写一个 Python 快速排序函数</div>
        </button>
        <button class="suggestion p-3 text-left text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-brand-500 hover:shadow-md transition-all" data-suggestion="解释这段代码的作用">
          <div class="font-medium text-slate-700 dark:text-slate-200 mb-1">🔍 代码解释</div>
          <div class="text-xs text-slate-500">解释这段代码的作用</div>
        </button>
        <button class="suggestion p-3 text-left text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-brand-500 hover:shadow-md transition-all" data-suggestion="重构这个函数，让它更易读">
          <div class="font-medium text-slate-700 dark:text-slate-200 mb-1">♻️ 代码重构</div>
          <div class="text-xs text-slate-500">重构这个函数，让它更易读</div>
        </button>
        <button class="suggestion p-3 text-left text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-brand-500 hover:shadow-md transition-all" data-suggestion="为这个函数写单元测试">
          <div class="font-medium text-slate-700 dark:text-slate-200 mb-1">🧪 测试生成</div>
          <div class="text-xs text-slate-500">为这个函数写单元测试</div>
        </button>
      </div>
    `;
    messages.appendChild(empty);

    // 绑定建议按钮
    setTimeout(() => {
      $$('.suggestion').forEach(btn => {
        btn.addEventListener('click', () => {
          const input = $('#chat-input');
          if (input) {
            input.value = btn.dataset.suggestion;
            input.focus();
          }
        });
      });
    }, 0);
  } else {
    state.messages.forEach(msg => {
      messages.appendChild(renderMessage(msg));
    });
  }

  container.appendChild(messages);

  // 输入区
  const inputArea = el('div', {
    class: 'border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-6 py-4 flex-shrink-0',
  });
  inputArea.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <div class="flex gap-2 items-end">
        <div class="flex-1 relative">
          <textarea id="chat-input" rows="1" placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
            class="w-full px-4 py-3 pr-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none max-h-32"></textarea>
        </div>
        <button id="chat-send" class="flex-shrink-0 w-11 h-11 rounded-xl btn-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
          <span class="w-5 h-5">${state.isLoading ? '<div class="flex gap-1"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>' : Icons.send}</span>
        </button>
      </div>
      <div class="mt-2 text-[11px] text-slate-400 text-center">
        ${state.selectedProvider} · ${state.selectedModel} · AI 生成内容仅供参考
      </div>
    </div>
  `;
  container.appendChild(inputArea);

  // 事件
  setTimeout(() => {
    const sendBtn = $('#chat-send');
    const input = $('#chat-input');
    if (sendBtn) sendBtn.addEventListener('click', handleSend);
    if (input) {
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      });
      // 自动调整高度
      input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 128) + 'px';
      });
    }
  }, 0);

  // 自动滚动到底部
  setTimeout(() => {
    if (messages) messages.scrollTop = messages.scrollHeight;
  }, 0);

  return container;
}

function renderMessage(msg) {
  const isUser = msg.role === 'user';
  const wrapper = el('div', {
    class: `flex gap-3 mb-6 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`,
  });

  const avatar = el('div', {
    class: `flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow ${
      isUser ? 'bg-slate-200 dark:bg-slate-700' : 'gradient-bg'
    }`,
  });
  avatar.innerHTML = `<span class="w-4 h-4 ${isUser ? 'text-slate-600 dark:text-slate-300' : 'text-white'}">${isUser ? Icons.user : Icons.bot}</span>`;

  const bubble = el('div', {
    class: `flex-1 max-w-[85%] ${isUser ? 'text-right' : ''}`,
  });
  const content = el('div', {
    class: `inline-block px-4 py-3 rounded-2xl ${
      isUser
        ? 'bg-gradient-to-br from-brand-500 to-purple-600 text-white'
        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
    } message-content text-left`,
  });
  if (isUser) {
    content.textContent = msg.content;
  } else {
    content.innerHTML = renderMarkdown(msg.content);
  }
  bubble.appendChild(content);

  if (msg.meta) {
    const meta = el('div', {
      class: `mt-1 text-[11px] text-slate-400 ${isUser ? 'text-right' : ''}`,
    }, [msg.meta]);
    bubble.appendChild(meta);
  }

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  return wrapper;
}

// ==================== 会话视图 ====================
function renderSessionsView() {
  const container = el('div', { class: 'p-4 md:p-6 max-w-6xl mx-auto' });

  if (state.sessions.length === 0) {
    const empty = el('div', { class: 'flex flex-col items-center justify-center py-20 text-center' });
    empty.innerHTML = `
      <div class="w-16 h-16 mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <span class="w-8 h-8 text-slate-400">${Icons.folder}</span>
      </div>
      <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">暂无会话</h3>
      <p class="text-sm text-slate-500">运行任务后，会话会自动保存到这里</p>
    `;
    container.appendChild(empty);
    return container;
  }

  // 网格
  const grid = el('div', { class: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3' });
  state.sessions.forEach(s => {
    const card = el('div', {
      class: 'p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all cursor-pointer group',
    });
    card.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-brand-500 to-purple-500 text-white text-[10px] font-medium">
          ${s.provider}
        </span>
        <span class="text-[10px] text-slate-400">${formatTime(s.createdAt)}</span>
      </div>
      <div class="text-xs text-slate-500 dark:text-slate-400 mb-2">${s.model}</div>
      <div class="text-sm text-slate-700 dark:text-slate-200 line-clamp-3">${escapeHtml(s.task)}</div>
    `;
    grid.appendChild(card);
  });
  container.appendChild(grid);
  return container;
}

// ==================== 记忆视图 ====================
function renderMemoriesView() {
  const container = el('div', { class: 'p-4 md:p-6 max-w-5xl mx-auto' });

  // 搜索框
  const search = el('div', { class: 'mb-4' });
  search.innerHTML = `
    <div class="relative">
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4">${Icons.search}</span>
      <input id="memory-search" type="text" placeholder="搜索记忆..." value="${state.memorySearch}"
        class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
    </div>
  `;
  container.appendChild(search);

  // 过滤
  const filtered = state.memorySearch
    ? state.memories.filter(m => m.content.toLowerCase().includes(state.memorySearch.toLowerCase()))
    : state.memories;

  if (filtered.length === 0) {
    const empty = el('div', { class: 'flex flex-col items-center justify-center py-20 text-center' });
    empty.innerHTML = `
      <div class="w-16 h-16 mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <span class="w-8 h-8 text-slate-400">${Icons.brain}</span>
      </div>
      <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">${state.memorySearch ? '未找到匹配的记忆' : '暂无记忆'}</h3>
      <p class="text-sm text-slate-500">${state.memorySearch ? '试试其他关键词' : '点击右上角"添加记忆"开始记录'}</p>
    `;
    container.appendChild(empty);
  } else {
    const list = el('div', { class: 'space-y-2' });
    filtered.forEach(m => {
      const item = el('div', {
        class: 'p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 transition-all',
      });
      const catColors = {
        preference: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        project: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        decision: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        general: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
      };
      const catClass = catColors[m.category] || catColors.general;
      item.innerHTML = `
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-medium ${catClass}">${m.category || 'general'}</span>
          <span class="text-[10px] text-slate-400 ml-auto">${formatTime(m.createdAt)}</span>
        </div>
        <div class="text-sm text-slate-700 dark:text-slate-200">${escapeHtml(m.content)}</div>
      `;
      list.appendChild(item);
    });
    container.appendChild(list);
  }

  // 添加记忆弹窗
  if (state.showAddMemory) {
    const overlay = el('div', { class: 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4' });
    const modal = el('div', { class: 'bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl' });
    modal.innerHTML = `
      <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">添加记忆</h3>
      <div class="mb-3">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">分类</label>
        <select id="new-memory-category" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
          <option value="general">通用 (general)</option>
          <option value="preference">偏好 (preference)</option>
          <option value="project">项目 (project)</option>
          <option value="decision">决策 (decision)</option>
        </select>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">内容</label>
        <textarea id="new-memory-content" rows="4" placeholder="记忆内容..."
          class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm resize-none"></textarea>
      </div>
      <div class="flex gap-2 justify-end">
        <button id="cancel-memory" class="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm">取消</button>
        <button id="save-memory" class="px-4 py-2 btn-primary text-white rounded-lg text-sm font-medium">保存</button>
      </div>
    `;
    overlay.appendChild(modal);
    container.appendChild(overlay);

    setTimeout(() => {
      $('#cancel-memory').addEventListener('click', () => {
        state.showAddMemory = false;
        renderMain();
      });
      $('#save-memory').addEventListener('click', async () => {
        const content = $('#new-memory-content').value.trim();
        const category = $('#new-memory-category').value;
        if (!content) {
          showToast('内容不能为空', 'error');
          return;
        }
        try {
          await apiPost('/api/memories/add', { content, category });
          state.showAddMemory = false;
          state.newMemoryContent = '';
          await loadMemories();
          renderMain();
          showToast('记忆已保存', 'success');
        } catch (e) {
          showToast('保存失败: ' + e.message, 'error');
        }
      });
      $('#memory-search').addEventListener('input', e => {
        state.memorySearch = e.target.value;
        renderMain();
      });
    }, 0);
  } else {
    setTimeout(() => {
      const ms = $('#memory-search');
      if (ms) ms.addEventListener('input', e => {
        state.memorySearch = e.target.value;
        renderMain();
      });
    }, 0);
  }

  return container;
}

// ==================== 路由视图 ====================
function renderRoutingView() {
  const container = el('div', { class: 'p-4 md:p-6 max-w-6xl mx-auto' });

  // 过滤
  const filterBar = el('div', { class: 'mb-4 flex gap-2' });
  ['all', 'success', 'failure'].forEach(f => {
    const btn = el('button', {
      class: `px-3 py-1.5 rounded-lg text-sm font-medium ${
        state.routingFilter === f
          ? 'bg-brand-500 text-white'
          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
      }`,
    }, [f === 'all' ? '全部' : f === 'success' ? '成功' : '失败']);
    btn.addEventListener('click', () => {
      state.routingFilter = f;
      renderMain();
    });
    filterBar.appendChild(btn);
  });
  container.appendChild(filterBar);

  let filtered = state.routingHistory;
  if (state.routingFilter === 'success') filtered = filtered.filter(r => r.success);
  if (state.routingFilter === 'failure') filtered = filtered.filter(r => !r.success);

  if (filtered.length === 0) {
    const empty = el('div', { class: 'flex flex-col items-center justify-center py-20 text-center' });
    empty.innerHTML = `
      <div class="w-16 h-16 mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <span class="w-8 h-8 text-slate-400">${Icons.routing}</span>
      </div>
      <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">暂无路由历史</h3>
      <p class="text-sm text-slate-500">运行任务后会在这里记录路由决策</p>
    `;
    container.appendChild(empty);
    return container;
  }

  // 列表
  const list = el('div', { class: 'space-y-2' });
  filtered.forEach(r => {
    const item = el('div', {
      class: 'p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700',
    });
    item.innerHTML = `
      <div class="flex items-center gap-2 mb-2 flex-wrap">
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${
          r.success ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
        }">
          ${r.success ? '✓ 成功' : '✗ 失败'}
        </span>
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 text-[10px] font-medium">
          ${r.provider}
        </span>
        <span class="text-xs text-slate-500">${r.model}</span>
        <span class="text-[10px] text-slate-400 ml-auto">${formatTime(r.timestamp)}</span>
      </div>
      <div class="text-sm text-slate-700 dark:text-slate-200 mb-2 line-clamp-2">${escapeHtml(r.taskDescription || '')}</div>
      <div class="flex gap-4 text-[11px] text-slate-500">
        <span>⏱ ${(r.duration || 0).toFixed(2)}s</span>
        <span>🎫 ${r.tokensUsed || 0} tokens</span>
        ${r.taskType ? `<span>📋 ${r.taskType}</span>` : ''}
      </div>
    `;
    list.appendChild(item);
  });
  container.appendChild(list);
  return container;
}

// ==================== 模型视图 ====================
function renderModelsView() {
  const container = el('div', { class: 'p-4 md:p-6 max-w-7xl mx-auto' });

  if (state.models.length === 0) {
    const empty = el('div', { class: 'flex flex-col items-center justify-center py-20 text-center' });
    empty.innerHTML = `
      <div class="w-16 h-16 mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <span class="w-8 h-8 text-slate-400">${Icons.model}</span>
      </div>
      <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">暂无模型</h3>
      <p class="text-sm text-slate-500">请在 ~/.magent/models/pool.yml 配置模型</p>
    `;
    container.appendChild(empty);
    return container;
  }

  // 按 provider 分组
  const groups = {};
  state.models.forEach(m => {
    (m.compatibility || []).forEach(c => {
      if (!groups[c.provider]) groups[c.provider] = [];
      groups[c.provider].push({ ...m, viaModel: c.model_name });
    });
  });

  Object.keys(groups).forEach(provider => {
    const section = el('div', { class: 'mb-6' });
    section.innerHTML = `
      <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">${provider}</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"></div>
    `;
    const grid = section.querySelector('div');
    groups[provider].forEach(m => {
      const card = el('div', {
        class: 'p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all cursor-pointer',
      });
      card.innerHTML = `
        <div class="flex items-start justify-between mb-2">
          <div class="font-semibold text-slate-900 dark:text-white">${m.name}</div>
          <span class="text-[10px] text-slate-400 font-mono">${m.viaModel}</span>
        </div>
        <div class="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">${escapeHtml(m.description || '')}</div>
        <div class="flex flex-wrap gap-1">
          ${(m.aliases || []).slice(0, 3).map(a => `<span class="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">${a}</span>`).join('')}
        </div>
      `;
      card.addEventListener('click', () => {
        state.selectedModel = m.name;
        state.currentView = 'chat';
        showToast('已选择模型: ' + m.name, 'success');
        renderApp();
      });
      grid.appendChild(card);
    });
    container.appendChild(section);
  });

  return container;
}

// ==================== 技能视图 ====================
function renderSkillsView() {
  const container = el('div', { class: 'p-4 md:p-6 max-w-7xl mx-auto' });

  // 搜索框
  const searchBar = el('div', { class: 'mb-4' });
  searchBar.innerHTML = `
    <div class="relative">
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4">${Icons.search}</span>
      <input id="skills-search" type="text" placeholder="搜索技能..." value="${state.skillsSearch || ''}"
        class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
    </div>
  `;
  container.appendChild(searchBar);

  if (state.skills.length === 0) {
    const empty = el('div', { class: 'flex flex-col items-center justify-center py-20 text-center' });
    empty.innerHTML = `
      <div class="w-16 h-16 mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <span class="w-8 h-8 text-slate-400">${Icons.zap}</span>
      </div>
      <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">暂无技能</h3>
      <p class="text-sm text-slate-500">内置技能应该自动加载</p>
    `;
    container.appendChild(empty);
    return container;
  }

  // 过滤
  const searchQuery = (state.skillsSearch || '').toLowerCase();
  const filteredSkills = searchQuery
    ? state.skills.filter(s =>
        s.name.toLowerCase().includes(searchQuery) ||
        (s.description || '').toLowerCase().includes(searchQuery) ||
        (s.triggers || []).some(t => t.toLowerCase().includes(searchQuery))
      )
    : state.skills;

  // 按分类分组
  const groups = {};
  filteredSkills.forEach(s => {
    const cat = s.category || 'general';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(s);
  });

  const categoryMeta = {
    planning: { icon: '📐', color: 'from-blue-500 to-cyan-500', label: '规划' },
    testing: { icon: '🧪', color: 'from-green-500 to-emerald-500', label: '测试' },
    debugging: { icon: '🐛', color: 'from-red-500 to-orange-500', label: '调试' },
    review: { icon: '👀', color: 'from-purple-500 to-pink-500', label: '审查' },
    workflow: { icon: '🔧', color: 'from-amber-500 to-yellow-500', label: '工作流' },
    engineering: { icon: '⚙️', color: 'from-indigo-500 to-blue-500', label: '工程' },
    communication: { icon: '💬', color: 'from-pink-500 to-rose-500', label: '沟通' },
    project: { icon: '📊', color: 'from-teal-500 to-cyan-500', label: '项目' },
    general: { icon: '📦', color: 'from-slate-500 to-slate-600', label: '通用' },
  };

  const totalCount = filteredSkills.length;
  const categoryCount = Object.keys(groups).length;

  // 统计摘要
  const summary = el('div', { class: 'mb-4 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400' });
  summary.innerHTML = `
    <span>共 <strong class="text-slate-900 dark:text-white">${totalCount}</strong> 个技能</span>
    <span>·</span>
    <span><strong class="text-slate-900 dark:text-white">${categoryCount}</strong> 个分类</span>
  `;
  container.appendChild(summary);

  if (filteredSkills.length === 0) {
    const empty = el('div', { class: 'flex flex-col items-center justify-center py-20 text-center' });
    empty.innerHTML = `
      <div class="text-4xl mb-2">🔍</div>
      <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">未找到匹配的技能</h3>
      <p class="text-sm text-slate-500">试试其他关键词</p>
    `;
    container.appendChild(empty);

    setTimeout(() => {
      const ss = $('#skills-search');
      if (ss) ss.addEventListener('input', e => {
        state.skillsSearch = e.target.value;
        renderMain();
      });
    }, 0);

    return container;
  }

  // 按 category 顺序输出
  const categoryOrder = ['planning', 'testing', 'debugging', 'review', 'workflow', 'engineering', 'communication', 'project', 'general'];
  categoryOrder.forEach(cat => {
    if (!groups[cat] || groups[cat].length === 0) return;

    const meta = categoryMeta[cat] || categoryMeta.general;
    const section = el('div', { class: 'mb-6' });
    section.innerHTML = `
      <div class="flex items-center gap-2 mb-3">
        <span class="text-xl">${meta.icon}</span>
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200">${meta.label}</h3>
        <span class="px-2 py-0.5 text-[10px] rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">${groups[cat].length}</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"></div>
    `;
    const grid = section.querySelector('div');
    groups[cat].forEach(s => {
      const card = el('div', {
        class: 'p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all group',
      });
      card.innerHTML = `
        <div class="flex items-start gap-2 mb-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br ${meta.color} flex-shrink-0 flex items-center justify-center text-white text-sm">
            ${meta.icon}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-sm text-slate-900 dark:text-white truncate">${s.name}</div>
            ${s.origin && s.origin !== 'magent' ? `<div class="text-[10px] text-slate-400 mt-0.5">via ${s.origin}</div>` : ''}
          </div>
        </div>
        <div class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">${escapeHtml(s.description || '')}</div>
        ${s.triggers && s.triggers.length > 0 ? `
          <div class="flex flex-wrap gap-1">
            ${s.triggers.slice(0, 3).map(t => `<span class="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">${escapeHtml(t.trim().substring(0, 12))}</span>`).join('')}
            ${s.triggers.length > 3 ? `<span class="text-[10px] text-slate-400">+${s.triggers.length - 3}</span>` : ''}
          </div>
        ` : ''}
      `;
      grid.appendChild(card);
    });
    container.appendChild(section);
  });

  // 绑定搜索
  setTimeout(() => {
    const ss = $('#skills-search');
    if (ss) ss.addEventListener('input', e => {
      state.skillsSearch = e.target.value;
      renderMain();
    });
  }, 0);

  return container;
}

// ==================== 事件处理 ====================
async function handleSend() {
  const input = $('#chat-input');
  if (!input) return;
  const task = input.value.trim();
  if (!task || state.isLoading) return;

  // 添加用户消息
  state.messages.push({ role: 'user', content: task });
  state.isLoading = true;
  input.value = '';
  input.style.height = 'auto';
  rerenderMain();

  try {
    const result = await apiPost('/api/run', {
      task,
      provider: state.selectedProvider,
      model: state.selectedModel,
    });

    // 解析结果
    let content = '';
    if (result.success && result.result) {
      if (typeof result.result === 'string') {
        content = result.result;
      } else {
        content = JSON.stringify(result.result, null, 2);
      }
    } else {
      content = result.error || JSON.stringify(result, null, 2);
    }

    state.messages.push({
      role: 'assistant',
      content,
      meta: `${state.selectedProvider} · ${state.selectedModel}`,
    });
  } catch (err) {
    state.messages.push({
      role: 'assistant',
      content: `❌ 错误: ${err.message}`,
      meta: 'error',
    });
  } finally {
    state.isLoading = false;
    rerenderMain();
  }
}

function toggleTheme() {
  document.documentElement.classList.toggle('dark');
  const isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// ==================== 数据加载 ====================
async function loadProviders() {
  try { state.providers = await apiGet('/api/providers'); }
  catch (e) { state.providers = [{ name: 'codex', enabled: true }]; }
}

async function loadModels() {
  try { state.models = await apiGet('/api/models'); }
  catch (e) { state.models = []; }
}

async function loadSessions() {
  try { state.sessions = await apiGet('/api/sessions'); }
  catch (e) { state.sessions = []; }
}

async function loadMemories() {
  try { state.memories = await apiGet('/api/memories'); }
  catch (e) { state.memories = []; }
}

async function loadRouting() {
  try { state.routingHistory = await apiGet('/api/routing'); }
  catch (e) { state.routingHistory = []; }
}

function loadSkills() {
  state.skills = window.MAGENT_SKILLS || [];
}

async function loadAll() {
  await Promise.all([loadProviders(), loadModels(), loadSessions(), loadMemories(), loadRouting()]);
  loadSkills();
}

// ==================== 渲染 ====================
function renderApp() {
  const app = $('#app');
  if (!app) return;

  app.innerHTML = '';

  // 移动端侧边栏遮罩
  if (state.mobileSidebarOpen) {
    const overlay = el('div', {
      class: 'fixed inset-0 bg-black/50 z-30 md:hidden',
    });
    overlay.addEventListener('click', () => {
      state.mobileSidebarOpen = false;
      renderApp();
    });
    app.appendChild(overlay);
  }

  // 侧边栏（桌面始终显示，移动端可隐藏）
  const sidebar = renderSidebar();
  if (window.innerWidth < 768) {
    if (state.mobileSidebarOpen) {
      sidebar.classList.remove('-ml-64');
      sidebar.classList.add('fixed', 'inset-y-0', 'left-0', 'z-40', 'shadow-2xl');
    } else {
      sidebar.classList.add('-ml-64');
    }
  }
  app.appendChild(sidebar);

  // 主区域
  const main = renderMain();
  app.appendChild(main);
}

function rerenderMain() {
  // 重新渲染主区域（用于消息更新等）
  const main = $('#app > div:nth-child(2)');
  if (main) {
    main.replaceWith(renderMain());
  }
}

// ==================== 初始化 ====================
async function init() {
  // 主题
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }

  await loadAll();
  renderApp();

  // 定期刷新数据
  setInterval(async () => {
    if (state.currentView === 'sessions') {
      await loadSessions();
      renderApp();
    } else if (state.currentView === 'memories') {
      await loadMemories();
      renderApp();
    } else if (state.currentView === 'routing') {
      await loadRouting();
      renderApp();
    }
  }, REFRESH_INTERVAL);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
