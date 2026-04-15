# Blog Project

Hugo 静态博客，主题 Terminal-Hub，双语（中文为主，英文为辅）。

## 同步微信公众号文章

用户在微信公众号「沙拉米拉」发布文章后，需要同步到博客。

```bash
# 同步单篇文章（最常用）
node sync-wechat.js <url>

# 指定分类和标签
node sync-wechat.js <url> --category AI-and-life --tags "AI,独立开发"

# 检查是否已同步
node sync-wechat.js --check <url>

# 查看已同步列表
node sync-wechat.js --list

# 批量同步（每行一个 URL）
node sync-wechat.js --file urls.txt
```

脚本会自动：抓取文章、转 Markdown、生成 frontmatter、按关键词分类、去重检查、写入 `content/zh/posts/{category}/`。

同步完成后如果分类或标签不准，手动调整即可。

## 内容分类

| 分类 | 用途 |
|------|------|
| `AI-and-life` | AI 产品、独立开发思考、AI 使用心得 |
| `blog` | 博客搭建相关 |
| `chromeExtensionDev` | Chrome 扩展开发 |
| `electron` | Electron 开发 |
| `flutter` | Flutter 开发 |
| `job` | 前端面试/技术基础 |
| `myNetworkDisk` | 网盘项目 |
| `studyFigma` | Figma 研究 |
| `travel` | 旅行游记 |
| `deepInMemory` | 深度思考、随笔 |
| `other` | 其他技术文章 |

## 文章 Frontmatter 格式

```yaml
---
title: "标题"
date: YYYY-MM-DD
draft: false
description: "80-160 字 SEO 描述"
categories:
  - 分类名
tags:
  - 标签
source_url: "原文链接（同步文章必填）"
source_id: "去重 ID（同步文章必填）"
source_platform: "wechat"
ShowReadingTime: true
ShowWordCount: true
---
```

## 其他脚本

- `autoTranslate.js` — 用 DeepSeek API 自动翻译文章
- `handleDescription.js` — 用 DeepSeek API 生成 SEO 描述
- `update-front-matter.js` — 批量更新 frontmatter 元数据

## 构建

```bash
hugo serve     # 本地预览
hugo           # 构建到 public/
```
