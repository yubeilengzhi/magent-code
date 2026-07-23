---
name: chinese-git-workflow
description: "中文团队 git 工作流：分支命名规范、commit 格式、PR 流程、code review 文化。"
metadata:
  trigger: "中文 git, 中国团队 git, 国内 git 规范, 中文工作流"
  origin: superpowers-zh
  category: workflow
  version: 1.0
---

# 中文 Git 工作流

## 分支命名

```
<类型>/<作者>-<简短描述>

类型：
- feat/   新功能
- fix/    修复
- refactor/  重构
- docs/   文档
- hotfix/ 紧急修复
```

### 示例

```
feat/zhangsan-user-auth
fix/lisi-bug-in-payment
refactor/wangwu-cleanup-api
```

## Commit 规范

参考 `chinese-commit-conventions` skill：
- 用 emoji + 中文描述
- 一个 commit 一个变更
- 写清楚 *为什么* 而不是 *做了什么*

## PR 流程

1. **创建 PR 前**
   - 确保本地分支基于最新 main
   - rebase 或 merge 最新代码
   - 跑完所有测试

2. **PR 描述模板**
   ```markdown
   ## 改动说明
   - 解决了什么问题
   - 改动了什么
   
   ## 测试
   - [ ] 单元测试
   - [ ] 集成测试
   - [ ] 手动测试
   
   ## 截图（如适用）
   
   ## 关联 Issue
   Closes #xxx
   ```

3. **Code Review 文化**
   - 24 小时内响应
   - 用建议性语气（不是命令）
   - 解释 *为什么*，不只是 *改这个*
   - 赞赏好的改动
   - 区分 "必须修改" 和 "建议修改"

## 国内团队常见问题

- ❌ 直接 push 到 main
- ❌ PR 描述写 "fix" 三个字
- ❌ 不跑测试就提 PR
- ❌ Review 只说 "改成 X" 不说为什么
- ❌ 长期不合并的 feature 分支

## 合并策略

- **Squash merge**: 适合 feature 分支（一个干净的 commit）
- **Merge commit**: 适合多人协作的分支
- **Rebase**: 适合个人分支保持线性历史

## Checklist

- [ ] 分支命名规范
- [ ] Commit 信息完整
- [ ] PR 描述清晰
- [ ] 通过 CI 检查
- [ ] 至少 1 人 review
- [ ] Squash 合并（或保留分支历史）