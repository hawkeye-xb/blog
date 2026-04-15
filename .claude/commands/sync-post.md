---
description: "同步外部平台内容到博客 — 告诉我你在哪里发了什么，我去抓取并同步到 Hugo 博客"
---

# 同步外部文章到博客

用户告诉你他在某个平台发布了新内容，你需要帮他同步到 Hugo 博客中。

## 微信公众号

直接用脚本完成，不需要 AI 处理：

```bash
# 同步单篇
node sync-wechat.js <url>

# 指定分类和标签
node sync-wechat.js <url> --category other --tags "Cloudflare,debug"

# 批量同步 (urls.txt 每行一个链接)
node sync-wechat.js --file urls.txt

# 检查是否已同步
node sync-wechat.js --check <url>

# 查看已同步列表
node sync-wechat.js --list
```

执行脚本后，向用户展示结果。如果分类或标签不满意，用户可以要求调整。

## 其他平台 (小红书、掘金等)

脚本暂不支持，用 AI 手动处理：

1. 使用 WebFetch 抓取内容
2. 转为 Markdown
3. 按照 `sync-wechat.js` 相同的 frontmatter 格式写入文件
4. frontmatter 中必须包含 `source_url`、`source_id`、`source_platform` 字段用于去重
