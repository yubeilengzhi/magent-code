// ==================== magent — AI 编程工作台 ====================
// 设计规范：Linear + Claude Desktop + VS Code + Notion 融合
// 三栏 IDE 布局 / 极简主义 / 轻量专业 / 克制高级

const API_BASE = window.location.origin;
const REFRESH_INTERVAL = 8000;

const State = {
  providers: [],
  models: [],
  sessions: [],
  memories: [],
  routingHistory: [],
  skills: [],

  // UI
  activeProject: 'magent-code',
  activeView: 'chat', // chat | sessions | memories | routing | models | skills
  selectedProvider: 'codex',
  selectedModel: 'qwen3.7-plus',
  isLoading: false,
  messages: [],
  searchQuery: '',
  showAddMemory: false,
  newMemoryContent: '',
  newMemoryCategory: 'general',
  routingFilter: 'all',
  skillsSearch: '',
  theme: 'light',
};

// ==================== Icons (Lucide 风格 1.5px stroke)====================
const Icons = {
  // Navigation
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',
  brain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>',
  route: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="15" cy="5" r="3"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 12.18-9.17 4.16a2 2 0 0 1-1.66 0L2 12.18"/><path d="m22 17.18-9.17 4.16a2 2 0 0 1-1.66 0L2 17.18"/></svg>',
  zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  bot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  hash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>',
  command: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
};

// ==================== Utility ====================
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  if (props.class) node.className = props.class;
  Object.keys(props).forEach((k) => {
    if (k === 'class' || k === 'event') return;
    if (k === 'html') node.innerHTML = props[k];
    else if (k.startsWith('on') && typeof props[k] === 'function') {
      node.addEventListener(k.slice(2).toLowerCase(), props[k]);
      // DEBUG
      if (k === 'onclick' && tag === 'button') {
        console.log('[el] bound', k, 'on', tag, 'id=', node.id);
      }
    } else if (k.startsWith('data-')) node.setAttribute(k, props[k]);
    else node[k] = props[k];
  });
  children.forEach((c) => {
    if (c == null || c === false) return;
    if (typeof c === 'string' || typeof c === 'number') {
      node.appendChild(document.createTextNode(String(c)));
    } else {
      node.appendChild(c);
    }
  });
  return node;
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return Math.floor(diff / 60) + ' 分钟前';
  if (diff < 86400) return Math.floor(diff / 3600) + ' 小时前';
  if (diff < 7 * 86400) return Math.floor(diff / 86400) + ' 天前';
  return d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function renderMarkdown(text) {
  if (!text) return '';
  if (typeof marked !== 'undefined') {
    try {
      const html = marked.parse(text);
      return typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(html) : html;
    } catch (e) {
      return escapeHtml(text);
    }
  }
  return escapeHtml(text);
}

function showToast(msg, type = 'info') {
  const existing = $('#toast');
  if (existing) existing.remove();
  const colors = {
    info: 'bg-d-bg-secondary text-d-text-primary border border-d-border',
    success: 'bg-white text-green-700 border border-green-200',
    error: 'bg-white text-red-700 border border-red-200',
  };
  const t = el('div', {
    id: 'toast',
    class: `fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-btn text-sm shadow-popover animate-slide ${colors[type] || colors.info}`,
  }, [msg]);
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2400);
}

// ==================== Reusable Components ====================

// IconButton
function IconButton({ icon, onClick, title, className = '' }) {
  return el('button', {
    class: `w-8 h-8 inline-flex items-center justify-center rounded-btn text-text-secondary hover:text-text-primary hover:bg-active dark:hover:bg-d-active transition-colors ${className}`,
    html: icon,
    title: title || '',
    onclick: onClick,
  });
}

// SearchInput
function SearchInput({ placeholder, value, onInput, className = '' }) {
  const wrap = el('div', { class: `relative ${className}` });
  // 直接创建 input（不用 innerHTML + setTimeout）
  const input = el('input', {
    type: 'text',
    placeholder,
    value: value || '',
    class: 'w-full pl-8 pr-3 py-1.5 text-sm bg-bg-secondary dark:bg-d-bg-secondary border border-border dark:border-d-border rounded-input placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors',
  });
  if (onInput) {
    input.addEventListener('input', e => onInput(e.target.value));
  }
  wrap.appendChild(el('span', {
    class: 'absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none w-4 h-4',
    html: Icons.search,
  }));
  wrap.appendChild(input);
  return wrap;
}

// EmptyState
function EmptyState({ icon, title, description, hint }) {
  return el('div', { class: 'flex flex-col items-center justify-center text-center max-w-md mx-auto py-16 animate-fade' }, [
    el('div', { class: 'w-12 h-12 mb-5 text-text-tertiary', html: icon }),
    el('h3', { class: 'text-title text-text-primary dark:text-d-text-primary mb-2' }, [title]),
    el('p', { class: 'text-sm text-text-secondary mb-8 leading-relaxed' }, [description]),
    hint ? el('div', {
      class: 'w-full px-4 py-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-card text-sm text-text-secondary',
    }, [hint]) : null,
  ]);
}

// ==================== Sidebar (Left Nav - 240px) ====================
function Sidebar() {
  // 导航项
  const navItems = [
    { id: 'chat', label: '聊天', icon: Icons.chat },
    { id: 'sessions', label: '会话', icon: Icons.folder, badge: State.sessions.length },
    { id: 'memories', label: '记忆', icon: Icons.brain, badge: State.memories.length },
    { id: 'routing', label: '路由', icon: Icons.route },
    { id: 'models', label: '模型', icon: Icons.layers },
    { id: 'skills', label: '技能', icon: Icons.zap, badge: State.skills.length },
  ];

  // 项目列表（mock 数据 + 真实项目）
  const projects = [
    { id: 'magent-code', name: 'magent-code', path: '/data/root/magent-code', active: true },
    { id: 'ai-zhineng', name: 'ai-zhineng', path: '/data/root/ai-zhineng' },
    { id: 'claudeuser', name: 'claudeuser', path: '/home/claudeuser' },
    { id: 'cloudcli', name: 'cloudcli', path: '/data/root/cloudcli' },
  ];

  return el('aside', { class: 'w-60 bg-bg-tertiary dark:bg-d-bg-secondary border-r border-border dark:border-d-border flex flex-col h-full select-none' }, [
    // Logo Header
    el('div', { class: 'h-12 px-4 flex items-center border-b border-border dark:border-d-border' }, [
      el('div', { class: 'w-7 h-7 rounded-md bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm mr-2.5' }, ['M']),
      el('div', { class: 'flex-1' }, [
        el('div', { class: 'text-sm font-semibold text-text-primary dark:text-d-text-primary leading-none mb-0.5' }, ['magent']),
        el('div', { class: 'text-[11px] text-text-tertiary leading-none' }, ['AI 工作台']),
      ]),
      IconButton({ icon: Icons.settings, title: '设置' }),
    ]),

    // Search
    el('div', { class: 'p-3' }, [
      SearchInput({
        placeholder: '搜索项目、文件...',
        value: State.searchQuery,
        onInput: (v) => { State.searchQuery = v; renderApp(); },
      }),
    ]),

    // 项目列表
    el('div', { class: 'px-3 mb-2' }, [
      el('div', { class: 'flex items-center justify-between px-1.5 mb-1.5' }, [
        el('div', { class: 'text-[11px] font-semibold text-text-tertiary uppercase tracking-wider' }, ['项目']),
        IconButton({ icon: Icons.plus, title: '新建项目', className: '!w-6 !h-6' }),
      ]),
      el('div', { class: 'space-y-0.5' },
        projects
          .filter((p) => !State.searchQuery || p.name.toLowerCase().includes(State.searchQuery.toLowerCase()))
          .map((p) => {
            const isActive = State.activeProject === p.id;
            return el('button', {
              class: `w-full text-left px-2 py-1.5 rounded-btn transition-colors ${
                isActive
                  ? 'bg-active dark:bg-d-active'
                  : 'hover:bg-active/50 dark:hover:bg-d-active/50'
              }`,
              onclick: () => { State.activeProject = p.id; renderApp(); },
            }, [
              el('div', { class: 'flex items-center gap-1.5' }, [
                el('span', { class: `w-3.5 h-3.5 ${isActive ? 'text-text-primary dark:text-d-text-primary' : 'text-text-secondary'}`, html: Icons.folder }),
                el('span', { class: `text-sm truncate ${isActive ? 'font-medium text-text-primary dark:text-d-text-primary' : 'text-text-primary dark:text-d-text-primary'}` }, [p.name]),
                if_exists(Icons.star, p.starred, 'ml-auto w-3 h-3 text-amber-400 fill-current'),
              ]),
              el('div', { class: 'pl-5 text-[11px] text-text-tertiary truncate font-mono' }, [p.path]),
            ]);
          })
      ),
    ]),

    // 导航菜单
    el('div', { class: 'px-3 mb-2' }, [
      el('div', { class: 'px-1.5 mb-1.5' }, [
        el('div', { class: 'text-[11px] font-semibold text-text-tertiary uppercase tracking-wider' }, ['工作区']),
      ]),
      el('div', { class: 'space-y-0.5' },
        navItems.map((item) => {
          const isActive = State.activeView === item.id;
          return el('button', {
            class: `w-full flex items-center gap-2 px-2 py-1.5 rounded-btn text-sm transition-colors ${
              isActive
                ? 'bg-active dark:bg-d-active text-text-primary dark:text-d-text-primary font-medium'
                : 'text-text-secondary hover:text-text-primary hover:bg-active/50 dark:hover:bg-d-active/50 dark:hover:text-d-text-primary'
            }`,
            onclick: () => { State.activeView = item.id; renderApp(); },
          }, [
            el('span', { class: 'w-4 h-4', html: item.icon }),
            el('span', { class: 'flex-1 text-left' }, [item.label]),
            item.badge ? el('span', { class: 'text-[10px] px-1.5 py-0.5 rounded-full bg-bg-secondary dark:bg-d-bg-tertiary text-text-tertiary' }, [String(item.badge)]) : null,
          ]);
        })
      ),
    ]),

    // 弹性空间
    el('div', { class: 'flex-1' }),

    // 底部
    el('div', { class: 'p-3 border-t border-border dark:border-d-border' }, [
      el('div', { class: 'flex items-center gap-2 px-1.5' }, [
        el('div', { class: 'w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-xs font-medium' }, ['U']),
        el('div', { class: 'flex-1 min-w-0' }, [
          el('div', { class: 'text-xs font-medium text-text-primary dark:text-d-text-primary truncate' }, ['user@magent']),
        ]),
        IconButton({ icon: State.theme === 'dark' ? Icons.sun : Icons.moon, onClick: toggleTheme, title: '主题切换' }),
      ]),
    ]),
  ]);
}

function if_exists(icon, condition, className) {
  return condition ? el('span', { class: className || '', html: icon }) : null;
}

// ==================== Header (Top - 48px) ====================
function Header() {
  const titles = {
    chat: { title: '新会话', sub: 'magent-code' },
    sessions: { title: '会话', sub: '历史记录' },
    memories: { title: '记忆库', sub: '长期记忆' },
    routing: { title: '路由历史', sub: '智能路由' },
    models: { title: '模型池', sub: '可用模型' },
    skills: { title: '技能库', sub: '内置技能' },
  };
  const t = titles[State.activeView] || titles.chat;

  // 右侧的视图特定控件（不用三元嵌入 children array，避免 hoisting 边界问题）
  const rightChildren = [];
  if (State.activeView === 'chat') {
    rightChildren.push(el('div', { class: 'flex items-center gap-2 mr-2' }, [
      ModelSelector(),
      ProviderSelector(),
    ]));
  } else if (State.activeView === 'memories') {
    rightChildren.push(el('div', { class: 'mr-1' }, [
      el('button', {
        class: 'h-8 px-3 text-sm font-medium rounded-btn text-white bg-accent hover:bg-accent-hover transition-colors inline-flex items-center gap-1.5',
        onclick: () => { State.showAddMemory = true; renderApp(); },
      }, [
        el('span', { class: 'w-3.5 h-3.5', html: Icons.plus }),
        '添加',
      ])
    ]));
  }
  rightChildren.push(IconButton({
    icon: Icons.refresh,
    title: '刷新',
    onClick: () => { loadAll(); renderApp(); showToast('已刷新', 'success'); }
  }));

  return el('header', {
    class: 'h-12 px-4 flex items-center justify-between border-b border-border dark:border-d-border bg-white/80 dark:bg-d-bg-primary/80 backdrop-blur-md'
  }, [
    el('div', { class: 'flex items-center gap-3' }, [
      el('div', {}, [
        el('div', { class: 'text-sm font-semibold text-text-primary dark:text-d-text-primary leading-tight' }, [t.title]),
        el('div', { class: 'text-[11px] text-text-tertiary leading-tight' }, [t.sub]),
      ]),
    ]),
    el('div', { class: 'flex items-center gap-1' }, rightChildren),
  ]);
}

function ModelSelector() {
  const wrap = el('div', { class: 'relative' });
  // 直接创建 button（不用 innerHTML + setTimeout）
  const btn = el('button', {
    id: 'model-selector',
    class: 'h-8 px-2.5 text-sm bg-bg-secondary dark:bg-d-bg-secondary border border-border dark:border-d-border rounded-btn inline-flex items-center gap-1.5 hover:border-text-tertiary transition-colors',
  }, [
    el('span', { class: 'w-3.5 h-3.5 text-text-secondary', html: Icons.layers }),
    el('span', {}, [State.selectedModel]),
    el('span', { class: 'w-3 h-3 text-text-tertiary', html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>' }),
  ]);
  // 同时用 addEventListener 绑定（防止 onclick 没生效）
  btn.addEventListener('click', () => {
    console.log('[ModelSelector] clicked!');
    State.activeView = 'models';
    renderApp();
  });
  wrap.appendChild(btn);
  return wrap;
}

function ProviderSelector() {
  const wrap = el('div', { class: 'relative' });
  // 直接创建 select（不用 innerHTML + setTimeout）
  const sel = el('select', {
    id: 'provider-selector',
    class: 'h-8 pl-2.5 pr-7 text-sm bg-bg-secondary dark:bg-d-bg-secondary border border-border dark:border-d-border rounded-btn appearance-none cursor-pointer focus:outline-none focus:border-accent',
  });
  State.providers.forEach(p => {
    const opt = el('option', { value: p.name }, [p.name]);
    if (p.name === State.selectedProvider) opt.selected = true;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', e => {
    State.selectedProvider = e.target.value;
  });
  wrap.appendChild(sel);
  // 下拉箭头
  const arrow = el('span', {
    class: 'absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-tertiary pointer-events-none',
    html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>',
  });
  wrap.appendChild(arrow);
  return wrap;
}

// ==================== Main Content ====================
function MainContent() {
  return el('main', { class: 'flex-1 flex flex-col bg-white dark:bg-d-bg-primary overflow-hidden' }, [
    Header(),
    ContentArea(),
  ]);
}

function ContentArea() {
  const area = el('div', { class: 'flex-1 overflow-y-auto scrollbar-thin' });
  switch (State.activeView) {
    case 'chat': area.appendChild(ChatView()); break;
    case 'sessions': area.appendChild(SessionsView()); break;
    case 'memories': area.appendChild(MemoriesView()); break;
    case 'routing': area.appendChild(RoutingView()); break;
    case 'models': area.appendChild(ModelsView()); break;
    case 'skills': area.appendChild(SkillsView()); break;
  }
  return area;
}

// ==================== Chat View ====================
function ChatView() {
  if (State.messages.length === 0) {
    return el('div', { class: 'flex-1 flex items-center justify-center' }, [
      EmptyState({
        icon: Icons.bot,
        title: '选择您的 AI 助手',
        description: '选择一个 Provider 和 Model，开始与 AI 助手对话',
        hint: el('div', { class: 'flex items-start gap-2' }, [
          el('span', { class: 'w-3.5 h-3.5 mt-0.5 text-accent flex-shrink-0', html: Icons.command }),
          el('div', {}, [
            el('div', { class: 'font-medium text-text-primary dark:text-d-text-primary mb-1' }, ['快捷键']),
            el('div', { class: 'text-xs text-text-secondary space-y-0.5' }, [
              el('div', {}, ['Enter 发送 · Shift + Enter 换行']),
              el('div', {}, ['Ctrl + K 命令面板 · / 斜杠命令']),
            ]),
          ]),
        ]),
      }),
    ]);
  }

  // 有消息时
  const wrap = el('div', { class: 'flex-1 flex flex-col' });
  const messages = el('div', { class: 'flex-1 overflow-y-auto scrollbar-thin' });
  // 用 DOMParser 解析 HTML 字符串（避免 XSS 风险）
  const inner = el('div', { class: 'max-w-3xl mx-auto px-6 py-8' });
  State.messages.forEach(m => {
    const bubble = el('div', { html: MessageBubble(m) });
    // MessageBubble 返回的 HTML 字符串已经 escapeHtml 过，可以安全使用
    while (bubble.firstChild) inner.appendChild(bubble.firstChild);
  });
  messages.appendChild(inner);
  wrap.appendChild(messages);
  wrap.appendChild(ChatInput());
  // 滚动到底部（在元素插入 DOM 后同步执行）
  requestAnimationFrame(() => {
    if (messages) messages.scrollTop = messages.scrollHeight;
  });
  return wrap;
}

function MessageBubble(msg) {
  const isUser = msg.role === 'user';
  return `
    <div class="flex gap-3 mb-6 animate-fade">
      <div class="flex-shrink-0 w-7 h-7 rounded-md ${isUser ? 'bg-bg-secondary dark:bg-d-bg-secondary' : 'bg-accent'} flex items-center justify-center text-${isUser ? 'text-secondary' : 'white'}">
        <span class="w-3.5 h-3.5">${isUser ? Icons.user : Icons.bot}</span>
      </div>
      <div class="flex-1 min-w-0 pt-0.5">
        <div class="text-xs text-text-tertiary mb-1.5 flex items-center gap-2">
          <span class="font-medium text-text-secondary">${isUser ? 'You' : 'AI 助手'}</span>
          ${msg.meta ? `<span>·</span><span>${msg.meta}</span>` : ''}
        </div>
        <div class="md text-sm text-text-primary dark:text-d-text-primary leading-relaxed">
          ${isUser ? escapeHtml(msg.content) : renderMarkdown(msg.content)}
        </div>
      </div>
    </div>
  `;
}

function ChatInput() {
  const wrap = el('div', { class: 'border-t border-border dark:border-d-border bg-white dark:bg-d-bg-primary' });

  // 直接用 el() 构建，不依赖 innerHTML + setTimeout
  const inner = el('div', { class: 'max-w-3xl mx-auto px-6 py-4' });
  const inputRow = el('div', {
    class: 'relative flex items-end gap-2 px-3 py-2.5 bg-bg-secondary dark:bg-d-bg-secondary border border-border dark:border-d-border rounded-input focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/20 transition-colors',
  });

  const textarea = el('textarea', {
    id: 'chat-input',
    rows: 1,
    placeholder: '输入消息...',
    class: 'flex-1 resize-none bg-transparent text-sm text-text-primary dark:text-d-text-primary placeholder:text-text-tertiary focus:outline-none max-h-32',
  });

  const sendBtn = el('button', {
    id: 'chat-send',
    class: 'flex-shrink-0 w-7 h-7 rounded-btn bg-accent hover:bg-accent-hover text-white inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors',
    onclick: handleSend,
  }, [
    el('span', {
      class: 'w-3.5 h-3.5',
      html: State.isLoading
        ? '<div class="flex gap-0.5"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>'
        : Icons.arrowRight,
    }),
  ]);

  // 绑定事件（直接绑定，不用 setTimeout）
  textarea.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
  });

  inputRow.appendChild(textarea);
  inputRow.appendChild(sendBtn);
  inner.appendChild(inputRow);

  // 底部信息
  const info = el('div', { class: 'mt-2 text-[11px] text-text-tertiary flex items-center justify-center gap-2' }, [
    el('span', {}, [State.selectedProvider]),
    el('span', {}, ['·']),
    el('span', {}, [State.selectedModel]),
    el('span', {}, ['·']),
    el('span', {}, ['AI 生成内容仅供参考']),
  ]);
  inner.appendChild(info);

  wrap.appendChild(inner);
  return wrap;
}

// ==================== Sessions View ====================
function SessionsView() {
  if (State.sessions.length === 0) {
    return el('div', { class: 'flex-1 flex items-center justify-center' }, [
      EmptyState({
        icon: Icons.folder,
        title: '暂无会话',
        description: '运行任务后，会话会自动记录在这里',
      }),
    ]);
  }

  const list = el('div', { class: 'max-w-5xl mx-auto px-6 py-8' });
  // 用 el() 直接构建（不用 innerHTML + setTimeout）
  list.appendChild(el('div', { class: 'mb-4 flex items-center justify-between' }, [
    el('div', { class: 'text-sm text-text-secondary' }, [State.sessions.length + ' 个会话']),
  ]));
  const space = el('div', { class: 'space-y-2' });
  State.sessions.forEach(s => {
    const card = el('div', {
      class: 'px-4 py-3 bg-white dark:bg-d-bg-primary border border-border dark:border-d-border rounded-card hover:border-text-tertiary transition-colors',
    });
    const header = el('div', { class: 'flex items-center gap-2 mb-1.5' });
    header.appendChild(el('span', { class: 'px-1.5 py-0.5 rounded text-[10px] font-medium bg-bg-secondary dark:bg-d-bg-secondary text-text-secondary' }, [s.provider]));
    header.appendChild(el('span', { class: 'text-xs text-text-secondary' }, [s.model]));
    header.appendChild(el('span', { class: 'text-xs text-text-tertiary ml-auto' }, [formatDate(s.createdAt)]));
    card.appendChild(header);
    card.appendChild(el('div', { class: 'text-sm text-text-primary dark:text-d-text-primary line-clamp-2' }, [s.task || '']));
    space.appendChild(card);
  });
  list.appendChild(space);
  return list;
}

// ==================== Memories View ====================
function MemoriesView() {
  const wrap = el('div', { class: 'max-w-4xl mx-auto px-6 py-8' });
  wrap.appendChild(SearchInput({
    placeholder: '搜索记忆...',
    value: State.searchQuery,
    onInput: (v) => { State.searchQuery = v; renderApp(); },
    className: 'mb-4',
  }));

  const filtered = State.searchQuery
    ? State.memories.filter(m => m.content.toLowerCase().includes(State.searchQuery.toLowerCase()))
    : State.memories;

  if (filtered.length === 0) {
    wrap.appendChild(EmptyState({
      icon: Icons.brain,
      title: State.searchQuery ? '未找到匹配的记忆' : '暂无记忆',
      description: State.searchQuery ? '试试其他关键词' : '点击右上角"添加"开始记录',
    }));
  } else {
    const list = el('div', { class: 'space-y-2' });
    list.innerHTML = filtered.map(m => {
      const catColors = {
        preference: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-900/50',
        project: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/50',
        decision: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/50',
        general: 'bg-bg-secondary text-text-secondary border-border',
      };
      const catClass = catColors[m.category] || catColors.general;
      return `
        <div class="px-4 py-3 bg-white dark:bg-d-bg-primary border border-border dark:border-d-border rounded-card hover:border-text-tertiary transition-colors">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-medium border ${catClass}">${escapeHtml(m.category || 'general')}</span>
            <span class="text-xs text-text-tertiary ml-auto">${formatDate(m.createdAt)}</span>
          </div>
          <div class="text-sm text-text-primary dark:text-d-text-primary">${escapeHtml(m.content)}</div>
        </div>
      `;
    }).join('');
    wrap.appendChild(list);
  }

  // 添加记忆弹窗
  if (State.showAddMemory) {
    wrap.appendChild(AddMemoryModal());
  }

  return wrap;
}

function AddMemoryModal() {
  const overlay = el('div', { class: 'fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-fade' });
  const modal = el('div', { class: 'w-full max-w-md bg-white dark:bg-d-bg-secondary border border-border dark:border-d-border rounded-container shadow-popover' });

  // Header
  const header = el('div', { class: 'px-5 py-4 border-b border-border dark:border-d-border flex items-center justify-between' });
  header.appendChild(el('h3', { class: 'text-sm font-semibold text-text-primary dark:text-d-text-primary' }, ['添加记忆']));
  const closeBtn = el('button', {
    class: 'w-6 h-6 inline-flex items-center justify-center rounded text-text-secondary hover:text-text-primary hover:bg-active transition-colors',
    onclick: () => { overlay.remove(); State.showAddMemory = false; },
  }, [el('span', { class: 'w-3.5 h-3.5', html: Icons.x })]);
  header.appendChild(closeBtn);
  modal.appendChild(header);

  // Body
  const body = el('div', { class: 'p-5 space-y-4' });

  const catLabel = el('label', { class: 'block text-xs font-medium text-text-secondary mb-1.5' }, ['分类']);
  const catSelect = el('select', {
    id: 'memory-cat',
    class: 'w-full h-9 px-3 text-sm bg-bg-secondary dark:bg-d-bg-tertiary border border-border dark:border-d-border rounded-input focus:outline-none focus:border-accent',
  });
  ['general', 'preference', 'project', 'decision'].forEach(c => {
    const labels = { general: '通用', preference: '偏好', project: '项目', decision: '决策' };
    catSelect.appendChild(el('option', { value: c }, [labels[c]]));
  });
  body.appendChild(el('div', {}, [catLabel, catSelect]));

  const contentLabel = el('label', { class: 'block text-xs font-medium text-text-secondary mb-1.5' }, ['内容']);
  const contentInput = el('textarea', {
    id: 'memory-content',
    rows: 4,
    placeholder: '记忆内容...',
    class: 'w-full px-3 py-2 text-sm bg-bg-secondary dark:bg-d-bg-tertiary border border-border dark:border-d-border rounded-input placeholder:text-text-tertiary focus:outline-none focus:border-accent resize-none',
  });
  body.appendChild(el('div', {}, [contentLabel, contentInput]));
  modal.appendChild(body);

  // Footer
  const footer = el('div', { class: 'px-5 py-3 border-t border-border dark:border-d-border flex items-center justify-end gap-2' });
  const cancelBtn = el('button', {
    class: 'h-8 px-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-active rounded-btn transition-colors',
    onclick: () => { overlay.remove(); State.showAddMemory = false; },
  }, ['取消']);
  const saveBtn = el('button', {
    class: 'h-8 px-4 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-btn transition-colors',
    onclick: async () => {
      const content = contentInput.value.trim();
      const category = catSelect.value;
      if (!content) { showToast('内容不能为空', 'error'); return; }
      try {
        await apiPost('/api/memories/add', { content, category });
        overlay.remove();
        State.showAddMemory = false;
        await loadMemories();
        renderApp();
        showToast('已保存', 'success');
      } catch (e) {
        showToast('保存失败: ' + e.message, 'error');
      }
    },
  }, ['保存']);
  footer.appendChild(cancelBtn);
  footer.appendChild(saveBtn);
  modal.appendChild(footer);

  // 点击外部关闭
  overlay.addEventListener('click', e => {
    if (e.target === overlay) { overlay.remove(); State.showAddMemory = false; }
  });
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // MemoriesView 还会查找 #memory-search（如果是 memories 视图）
  // 不需要额外返回元素
  return el('div');
}

// ==================== Routing View ====================
function RoutingView() {
  const wrap = el('div', { class: 'max-w-5xl mx-auto px-6 py-8' });

  // 过滤栏
  const filterBar = el('div', { class: 'mb-4 flex items-center gap-1' }, [
    el('span', { class: 'text-xs text-text-tertiary mr-2' }, ['筛选：']),
    ...['all', 'success', 'failure'].map(f => {
      const isActive = State.routingFilter === f;
      const labels = { all: '全部', success: '成功', failure: '失败' };
      return el('button', {
        class: `h-7 px-3 text-xs font-medium rounded-btn transition-colors ${
          isActive
            ? 'bg-active dark:bg-d-active text-text-primary dark:text-d-text-primary'
            : 'text-text-secondary hover:text-text-primary hover:bg-active/50'
        }`,
        onclick: () => { State.routingFilter = f; renderApp(); },
      }, [labels[f]]);
    }),
  ]);
  wrap.appendChild(filterBar);

  let filtered = State.routingHistory;
  if (State.routingFilter === 'success') filtered = filtered.filter(r => r.success);
  if (State.routingFilter === 'failure') filtered = filtered.filter(r => !r.success);

  if (filtered.length === 0) {
    wrap.appendChild(EmptyState({
      icon: Icons.route,
      title: '暂无路由历史',
      description: '运行任务后会在这里记录路由决策',
    }));
    return wrap;
  }

  const list = el('div', { class: 'space-y-2' });
  list.innerHTML = filtered.map(r => `
    <div class="px-4 py-3 bg-white dark:bg-d-bg-primary border border-border dark:border-d-border rounded-card">
      <div class="flex items-center gap-2 mb-1.5 flex-wrap">
        <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
          r.success
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/50'
            : 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/50'
        }">
          <span class="w-2.5 h-2.5">${r.success ? Icons.check : Icons.x}</span>
          ${r.success ? '成功' : '失败'}
        </span>
        <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-bg-secondary dark:bg-d-bg-secondary text-text-secondary">${escapeHtml(r.provider)}</span>
        <span class="text-xs text-text-secondary">${escapeHtml(r.model)}</span>
        <span class="text-xs text-text-tertiary ml-auto">${formatDate(r.timestamp)}</span>
      </div>
      <div class="text-sm text-text-primary dark:text-d-text-primary mb-1.5 line-clamp-2">${escapeHtml(r.taskDescription || '')}</div>
      <div class="flex items-center gap-3 text-[11px] text-text-tertiary">
        <span class="flex items-center gap-1">
          <span class="w-3 h-3">${Icons.clock}</span>
          ${(r.duration || 0).toFixed(2)}s
        </span>
        <span>·</span>
        <span>${r.tokensUsed || 0} tokens</span>
      </div>
    </div>
  `).join('');
  wrap.appendChild(list);
  return wrap;
}

// ==================== Models View ====================
function ModelsView() {
  if (State.models.length === 0) {
    return el('div', { class: 'flex-1 flex items-center justify-center' }, [
      EmptyState({ icon: Icons.layers, title: '暂无模型', description: '请在 ~/.magent/models/pool.yml 配置模型' }),
    ]);
  }

  const list = el('div', { class: 'max-w-6xl mx-auto px-6 py-8' });

  const grid = el('div', { class: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3' });
  State.models.forEach(m => {
    const card = el('button', {
      class: 'text-left p-4 bg-white dark:bg-d-bg-primary border border-border dark:border-d-border rounded-card hover:border-accent transition-colors group',
    });
    card.appendChild(el('div', { class: 'flex items-start justify-between mb-2' }, [
      el('div', { class: 'font-medium text-sm text-text-primary dark:text-d-text-primary' }, [m.name]),
    ]));
    card.appendChild(el('div', { class: 'text-xs text-text-secondary mb-3 line-clamp-2' }, [m.description || '']));
    const aliases = el('div', { class: 'flex flex-wrap gap-1 mb-2' });
    (m.aliases || []).slice(0, 3).forEach(a => {
      aliases.appendChild(el('span', { class: 'px-1.5 py-0.5 text-[10px] rounded bg-bg-secondary dark:bg-d-bg-secondary text-text-secondary' }, [a]));
    });
    card.appendChild(aliases);
    const compat = (m.compatibility || []).map(c => c.provider).join(', ');
    card.appendChild(el('div', { class: 'text-[10px] text-text-tertiary' }, ['兼容: ' + compat]));
    // 绑定事件
    card.addEventListener('click', () => {
      State.selectedModel = m.name;
      State.activeView = 'chat';
      showToast('已选择: ' + m.name, 'success');
      renderApp();
    });
    grid.appendChild(card);
  });

  list.appendChild(el('div', { class: 'text-sm text-text-secondary mb-4' }, [State.models.length + ' 个模型']));
  list.appendChild(grid);

  return list;
}

// ==================== Skills View ====================
function SkillsView() {
  const wrap = el('div', { class: 'max-w-6xl mx-auto px-6 py-8' });
  wrap.appendChild(SearchInput({
    placeholder: '搜索技能...',
    value: State.skillsSearch,
    onInput: (v) => { State.skillsSearch = v; renderApp(); },
    className: 'mb-4',
  }));

  const searchQuery = (State.skillsSearch || '').toLowerCase();
  const filtered = searchQuery
    ? State.skills.filter(s =>
        s.name.toLowerCase().includes(searchQuery) ||
        (s.description || '').toLowerCase().includes(searchQuery)
      )
    : State.skills;

  if (filtered.length === 0) {
    wrap.appendChild(EmptyState({
      icon: Icons.zap,
      title: '未找到技能',
      description: '试试其他关键词',
    }));
    return wrap;
  }

  // 按分类分组
  const groups = {};
  filtered.forEach(s => {
    const cat = s.category || 'general';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(s);
  });

  const catMeta = {
    planning: { label: '规划', icon: '📐' },
    testing: { label: '测试', icon: '🧪' },
    debugging: { label: '调试', icon: '🐛' },
    review: { label: '审查', icon: '👀' },
    workflow: { label: '工作流', icon: '🔧' },
    engineering: { label: '工程', icon: '⚙️' },
    communication: { label: '沟通', icon: '💬' },
    project: { label: '项目', icon: '📊' },
    general: { label: '通用', icon: '📦' },
  };

  const order = ['planning', 'testing', 'debugging', 'review', 'workflow', 'engineering', 'communication', 'project', 'general'];
  order.forEach(cat => {
    if (!groups[cat] || groups[cat].length === 0) return;
    const meta = catMeta[cat];
    const section = el('div', { class: 'mb-6' });
    // 用 el() 直接构建（不用 innerHTML + setTimeout）
    const headerRow = el('div', { class: 'flex items-center gap-2 mb-3 px-1' });
    headerRow.appendChild(el('span', { class: 'text-base' }, [meta.icon]));
    headerRow.appendChild(el('span', { class: 'text-sm font-semibold text-text-primary dark:text-d-text-primary' }, [meta.label]));
    headerRow.appendChild(el('span', { class: 'text-xs text-text-tertiary' }, [String(groups[cat].length)]));
    section.appendChild(headerRow);
    const grid = el('div', { class: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2' });
    groups[cat].forEach(s => {
      const card = el('div', {
        class: 'px-3.5 py-2.5 bg-white dark:bg-d-bg-primary border border-border dark:border-d-border rounded-card hover:border-text-tertiary transition-colors',
      });
      card.appendChild(el('div', { class: 'flex items-center gap-1.5 mb-1' }, [
        el('span', { class: 'font-medium text-sm text-text-primary dark:text-d-text-primary truncate' }, [s.name]),
      ]));
      card.appendChild(el('div', { class: 'text-xs text-text-secondary line-clamp-2 leading-relaxed' }, [s.description || '']));
      grid.appendChild(card);
    });
    section.appendChild(grid);
    wrap.appendChild(section);
  });

  return wrap;
}

// ==================== Event Handlers ====================
async function handleSend() {
  const input = $('#chat-input');
  if (!input) return;
  const task = input.value.trim();
  if (!task || State.isLoading) return;

  State.messages.push({ role: 'user', content: task });
  State.isLoading = true;
  input.value = '';
  input.style.height = 'auto';
  rerenderMain();

  try {
    const result = await apiPost('/api/run', {
      task,
      provider: State.selectedProvider,
      model: State.selectedModel,
    });
    let content = '';
    if (result.success && result.result) {
      content = typeof result.result === 'string' ? result.result : JSON.stringify(result.result, null, 2);
    } else {
      content = result.error || JSON.stringify(result, null, 2);
    }
    State.messages.push({ role: 'assistant', content, meta: `${State.selectedProvider} · ${State.selectedModel}` });
  } catch (err) {
    State.messages.push({ role: 'assistant', content: `❌ 错误: ${err.message}`, meta: 'error' });
  } finally {
    State.isLoading = false;
    rerenderMain();
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  State.theme = isDark ? 'dark' : 'light';
  localStorage.setItem('theme', State.theme);
  renderApp();
}

// ==================== API ====================
async function apiGet(path) {
  const res = await fetch(API_BASE + path);
  if (!res.ok) throw new Error('API ' + res.status);
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
    throw new Error(err.error || 'API ' + res.status);
  }
  return res.json();
}

// ==================== Data Loading ====================
async function loadProviders() {
  try { State.providers = await apiGet('/api/providers'); }
  catch (e) {
    State.providers = [
      { name: 'codex', enabled: true },
      { name: 'claude-code', enabled: true },
      { name: 'opencode', enabled: true },
      { name: 'pi', enabled: true },
    ];
  }
}
async function loadModels() { try { State.models = await apiGet('/api/models'); } catch (e) { State.models = []; } }
async function loadSessions() { try { State.sessions = await apiGet('/api/sessions'); } catch (e) { State.sessions = []; } }
async function loadMemories() { try { State.memories = await apiGet('/api/memories'); } catch (e) { State.memories = []; } }
async function loadRouting() { try { State.routingHistory = await apiGet('/api/routing'); } catch (e) { State.routingHistory = []; } }
function loadSkills() { State.skills = window.MAGENT_SKILLS || []; }

async function loadAll() {
  await Promise.all([loadProviders(), loadModels(), loadSessions(), loadMemories(), loadRouting()]);
  loadSkills();
}

// ==================== Render ====================
function renderApp() {
  const app = $('#app');
  if (!app) return;
  app.innerHTML = '';
  app.appendChild(Sidebar());
  app.appendChild(MainContent());
}

function rerenderMain() {
  const main = $('main');
  if (main) {
    const fresh = MainContent();
    main.replaceWith(fresh);
  }
}

// ==================== Init ====================
async function init() {
  // 主题
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    State.theme = 'dark';
  }

  await loadAll();
  renderApp();

  // 暴露调试接口
  window.magent = { State, renderApp, loadAll, apiGet, apiPost, rerenderMain, Header, ModelSelector };

  // 定时刷新
  setInterval(async () => {
    if (State.activeView === 'sessions') { await loadSessions(); renderApp(); }
    else if (State.activeView === 'memories') { await loadMemories(); renderApp(); }
    else if (State.activeView === 'routing') { await loadRouting(); renderApp(); }
  }, REFRESH_INTERVAL);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
