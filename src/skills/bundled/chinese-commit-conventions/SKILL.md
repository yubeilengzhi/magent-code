---
name: chinese-commit-conventions
description: "中文项目 commit 规范：使用中文描述、emoji 前缀、清晰分类。"
metadata:
  trigger: "中文 commit, Chinese commit, 中文提交规范, emoji commit"
  origin: superpowers-zh
  category: workflow
  version: 1.0
---

# 中文 Commit 规范

## 格式

```
<emoji> <type>: <中文描述>

<中文详细说明>

<footer>
```

## 常用 Emoji + Type

| Emoji | Type | 用途 |
|-------|------|------|
| ✨ | feat | 新功能 |
| 🐛 | fix | Bug 修复 |
| 📝 | docs | 文档 |
| 💄 | style | 格式 |
| ♻️ | refactor | 重构 |
| ⚡️ | perf | 性能 |
| ✅ | test | 测试 |
| 🔧 | chore | 工具/构建 |
| 📦 | build | 构建系统 |
| 🎨 | style | 代码风格 |
| 🔥 | remove | 删除代码/文件 |
| 🚀 | deploy | 部署 |
| 💡 | doc | 注释改进 |

## 示例

```
✨ feat: 添加用户登录功能

实现 OAuth2.0 登录流程，支持 Google 和 GitHub 第三方登录。
使用 PKCE 流程保证安全性，添加 100 req/min 限流。

关联 #123
```

```
🐛 fix: 修复 profile 接口空指针异常

之前访问 /api/users/{id}/profile 时，如果用户已被删除但缓存
未过期，会导致崩溃。现在增加空值检查。

修复 #456
```

```
📝 docs: 更新 README 添加快速开始指南

补充安装步骤、配置说明、常见问题。
```

## 中文项目最佳实践

- 用简洁的中文表达（不要硬翻译英文）
- 关联 Issue / PR 用 `#xxx`
- 重大变更（BREAKING CHANGE）在 footer 标注
- 保持原子性（一个 commit 一个变更）

## 反模式

- ❌ 中英文混用不清晰
- ❌ 描述过长不精炼
- ❌ "fix" "update" 这种无意义描述
- ❌ WIP 提交混入主分支
- ❌ 提交中包含密钥

## Checklist

- [ ] 用 emoji 前缀
- [ ] 中文描述清晰
- [ ] 包含必要上下文
- [ ] 一个 commit 一个变更
- [ ] 关联 issue / PR