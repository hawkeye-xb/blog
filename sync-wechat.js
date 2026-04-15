#!/usr/bin/env node
/**
 * sync-wechat.js - 同步微信公众号文章到 Hugo 博客
 *
 * Usage:
 *   node sync-wechat.js <url>                          # 同步单篇文章
 *   node sync-wechat.js <url> --category other         # 指定分类
 *   node sync-wechat.js <url> --tags "CF,debug"        # 指定标签
 *   node sync-wechat.js --file urls.txt                # 批量同步(每行一个URL)
 *   node sync-wechat.js --check <url>                  # 检查是否已同步
 *   node sync-wechat.js --list                         # 列出已同步的文章
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const yaml = require('js-yaml');
const matter = require('gray-matter');

// ========== 配置 ==========
const BLOG_ROOT = __dirname;
const CONTENT_DIR = path.join(BLOG_ROOT, 'content/zh/posts');
const HISTORY_FILE = path.join(BLOG_ROOT, '.sync-history.json');

const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// 分类关键词映射 — 按优先级排列，越靠前的越具体
// 注意: 只在标题中匹配，避免正文提及某关键词导致误分类
const CATEGORY_RULES = [
  { name: 'flutter', keywords: ['flutter', 'dart'] },
  { name: 'electron', keywords: ['electron', 'electron-forge', 'asar'] },
  { name: 'chromeExtensionDev', keywords: ['chrome 扩展', 'chrome extension', '浏览器插件', 'manifest'] },
  { name: 'studyFigma', keywords: ['figma'] },
  { name: 'myNetworkDisk', keywords: ['网盘', 'webrtc', 'peer', 'p2p 传输'] },
  { name: 'blog', keywords: ['hugo', '博客搭建', '建站'] },
  { name: 'travel', keywords: ['旅行', '游记', '旅游', '自驾', '环线'] },
  { name: 'deepInMemory', keywords: ['随笔', '感悟', '回忆', '三十岁'] },
  { name: 'job', keywords: ['面试', '手写题', 'javascript基础', '事件循环', '原型链'] },
  { name: 'AI-and-life', keywords: ['ai ', 'gpt', 'llm', 'claude', 'deepseek', '大模型', '人工智能', 'chatgpt', 'openai', 'copilot', 'vibe coding', 'ai编程', 'ai agent'] },
];

// ========== HTTP 请求 ==========
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': BROWSER_UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    };

    const req = https.request(options, (res) => {
      // 处理重定向
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf-8');
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 200)}`));
        } else {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('请求超时')); });
    req.end();
  });
}

// ========== HTML → Markdown ==========
function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function htmlToMarkdown(html) {
  let md = html;

  // 移除 script 和 style
  md = md.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  md = md.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // 代码块: <pre> 内的内容
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, code) => {
    const clean = code.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
    return '\n\n```\n' + decodeEntities(clean).trim() + '\n```\n\n';
  });

  // 行内代码
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, (_, code) => {
    return '`' + decodeEntities(code.replace(/<[^>]+>/g, '')) + '`';
  });

  // 标题
  for (let i = 6; i >= 1; i--) {
    const hashes = '#'.repeat(i);
    md = md.replace(new RegExp(`<h${i}[^>]*>([\\s\\S]*?)<\\/h${i}>`, 'gi'), (_, text) => {
      return `\n\n${hashes} ${text.replace(/<[^>]+>/g, '').trim()}\n\n`;
    });
  }

  // 加粗
  md = md.replace(/<(strong|b)(?:\s[^>]*)?>([^<]*(?:<(?!\/?(?:strong|b))[^>]*>[^<]*)*)<\/(strong|b)>/gi, (_, _t1, text, _t2) => {
    const clean = text.replace(/<[^>]+>/g, '').trim();
    return clean ? `**${clean}**` : '';
  });

  // 斜体
  md = md.replace(/<(em|i)(?:\s[^>]*)?>([^<]*(?:<(?!\/?(?:em|i))[^>]*>[^<]*)*)<\/(em|i)>/gi, (_, _t1, text, _t2) => {
    const clean = text.replace(/<[^>]+>/g, '').trim();
    return clean ? `*${clean}*` : '';
  });

  // 图片: 微信用 data-src
  md = md.replace(/<img[^>]*data-src="([^"]*)"[^>]*>/gi, '\n\n![]($1)\n\n');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '\n\n![]($1)\n\n');

  // 链接
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    const clean = text.replace(/<[^>]+>/g, '').trim();
    if (!clean || href.startsWith('javascript:')) return clean;
    return `[${clean}](${href})`;
  });

  // 引用块
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
    const text = content.replace(/<[^>]+>/g, '').trim();
    const lines = text.split('\n').map(l => '> ' + l.trim()).join('\n');
    return '\n\n' + lines + '\n\n';
  });

  // 列表项
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, text) => {
    return '- ' + text.replace(/<[^>]+>/g, '').trim() + '\n';
  });
  md = md.replace(/<\/?[uo]l[^>]*>/gi, '\n');

  // 段落和换行
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, text) => {
    const clean = text.replace(/<(?!img)[^>]+>/g, '').trim();
    return clean ? '\n\n' + clean + '\n\n' : '\n\n';
  });

  // 移除其余 HTML 标签(保留已转换的 Markdown)
  md = md.replace(/<[^>]+>/g, '');

  // 解码 HTML 实体
  md = decodeEntities(md);

  // 清理微信平台残留
  md = md.replace(/预览时标签不可点/g, '');
  md = md.replace(/微信扫一扫[\s\S]*?关注该公众号/g, '');
  md = md.replace(/轻触阅读原文/g, '');
  md = md.replace(/阅读原文/g, '');
  md = md.replace(/^收录于合集.*$/gm, '');

  // 修复列表项重复符号 "- •" → "-"
  md = md.replace(/^-\s*•\s*/gm, '- ');

  // 清理多余空行和空格
  md = md.replace(/[ \t]+$/gm, '');          // 行尾空格
  md = md.replace(/\n{3,}/g, '\n\n');         // 多余空行
  md = md.trim();

  return md;
}

// ========== 微信文章解析 ==========
function parseWechatArticle(html) {
  const get = (pattern) => {
    const m = html.match(pattern);
    return m ? m[1].trim() : '';
  };

  // 元数据
  const title = decodeEntities(
    get(/var msg_title = "([^"]*)"/) ||
    get(/<meta property="og:title" content="([^"]*)"/) ||
    get(/rich_media_title[^>]*>([\s\S]*?)<\/h/)
  ).replace(/<[^>]+>/g, '').trim();

  const author = decodeEntities(
    get(/var nickname = "([^"]*)"/) ||
    get(/<meta name="author" content="([^"]*)"/)
  );

  const desc = decodeEntities(
    get(/<meta property="og:description" content="([^"]*)"/) ||
    get(/var msg_desc = "([^"]*)"/)
  );

  // 时间戳
  let date = '';
  const ctMatch = html.match(/var ct = "(\d+)"/);
  if (ctMatch) {
    const d = new Date(parseInt(ctMatch[1]) * 1000);
    date = d.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  // 去重 ID 组件
  const biz = get(/var biz = "([^"]*)"/);
  const mid = get(/var mid = "([^"]*)"/);
  const idx = get(/var idx = "([^"]*)"/);
  const sn = get(/var sn = "([^"]*)"/);
  const sourceId = biz && mid ? `wx_${biz}_${mid}_${idx || '1'}` : '';

  // 正文 HTML
  let contentHtml = '';
  // 排除 js_content_container 等变体，只匹配 id="js_content"
  const contentMatch = html.match(/id="js_content"(?!_)[^>]*>([\s\S]*?)(?:<\/div>\s*<div class="rich_media_tool|<div id="js_tags"|<div class="rich_media_area_extra")/);
  if (contentMatch && contentMatch[1].replace(/<[^>]+>/g, '').trim().length > 20) {
    contentHtml = contentMatch[1];
  } else {
    // 尝试宽松匹配
    const fallback = html.match(/id="js_content"(?!_)[^>]*>([\s\S]{100,}?)(?:<script|<div class="qr_code_area")/);
    if (fallback && fallback[1].replace(/<[^>]+>/g, '').trim().length > 20) {
      contentHtml = fallback[1];
    }
  }

  // 图片列表
  const images = [];
  const imgPattern = /data-src="(https?:\/\/mmbiz[^"]+)"/g;
  let imgMatch;
  while ((imgMatch = imgPattern.exec(html)) !== null) {
    images.push(imgMatch[1]);
  }

  // 转 Markdown
  let content = '';
  if (contentHtml) {
    content = htmlToMarkdown(contentHtml);
  } else if (desc) {
    // 短图文: 没有 js_content，用 og:description 作为正文
    // 解码 \x0a 换行符和 \x26 等转义
    content = desc
      .replace(/\\x0a/g, '\n')
      .replace(/\\x26quot;/g, '"')
      .replace(/\\x26lt;/g, '<')
      .replace(/\\x26gt;/g, '>')
      .replace(/\\x26amp;/g, '&')
      .replace(/\\x26#\d+;/g, '')
      .replace(/<a[^>]*>#([^<]+)<\/a>/g, '')  // 移除话题标签 HTML
      .replace(/<[^>]+>/g, '')                  // 移除残留 HTML
      .trim();
  }

  return { title, author, date, desc, biz, mid, idx, sn, sourceId, content, images };
}

// ========== 自动分类 ==========
function categorize(title, content) {
  const titleLower = title.toLowerCase();

  // 优先匹配标题
  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      if (titleLower.includes(kw.toLowerCase())) {
        return rule.name;
      }
    }
  }

  // 标题没命中，再看正文(只看前 500 字，减少误匹配)
  const contentHead = content.slice(0, 500).toLowerCase();
  for (const rule of CATEGORY_RULES) {
    let hitCount = 0;
    for (const kw of rule.keywords) {
      if (contentHead.includes(kw.toLowerCase())) hitCount++;
    }
    // 正文需要命中 2 个以上关键词才算
    if (hitCount >= 2) return rule.name;
  }

  return 'other';
}

// 自动生成标签: 从内容中提取高频技术关键词
function generateTags(title, content) {
  const text = title + ' ' + content;
  const TAG_POOL = [
    'Cloudflare', 'Vercel', 'Docker', 'Nginx', 'Node.js', 'Python',
    'JavaScript', 'TypeScript', 'React', 'Vue', 'Flutter', 'Dart',
    'Electron', 'Chrome', 'Figma', 'Hugo', 'Git', 'GitHub', 'CI/CD',
    'macOS', 'Linux', 'Windows', 'iOS', 'Android',
    'AI', 'GPT', 'LLM', 'Claude', 'Deepseek', 'Cursor',
    'API', 'REST', 'GraphQL', 'WebSocket', 'WebRTC',
    'DNS', 'CDN', 'SSL', 'HTTPS', 'Zero Trust',
    'debug', '性能优化', '独立开发',
  ];

  const found = TAG_POOL.filter(tag => {
    const pattern = new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    return pattern.test(text);
  });

  return found.length > 0 ? found.slice(0, 5) : ['技术'];
}

// ========== 文件名生成 ==========
function generateFileName(title) {
  // 提取英文单词和数字
  const englishWords = title.match(/[A-Za-z0-9]+/g);
  if (englishWords && englishWords.length >= 2) {
    // 有足够英文词时，用 PascalCase
    return englishWords
      .slice(0, 4)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('');
  }

  // 否则用拼音首字母或简化标题
  // 简单策略: 取标题中所有非标点字符，截取前30字符，用连字符连接
  const clean = title
    .replace(/[^\u4e00-\u9fa5A-Za-z0-9\s]/g, '')
    .trim()
    .slice(0, 30);

  // 尝试用英文部分
  const parts = clean.match(/[A-Za-z0-9]+/g);
  if (parts && parts.length > 0) {
    return parts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  }

  // 兜底: 用时间戳
  return 'post-' + Date.now();
}

// ========== 去重检查 ==========
function loadHistory() {
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
  } catch {
    return { articles: [] };
  }
}

function saveHistory(history) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
}

function findExistingPost(sourceId) {
  if (!sourceId) return null;

  // 在所有文章中搜索 source_id
  const categories = fs.readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const cat of categories) {
    const catDir = path.join(CONTENT_DIR, cat);
    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.md'));

    for (const file of files) {
      const filePath = path.join(catDir, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(raw);
      if (data.source_id === sourceId) {
        return filePath;
      }
    }
  }

  return null;
}

// ========== 生成文章 ==========
function generatePost(article, options = {}) {
  const category = options.category || categorize(article.title, article.content);
  const tags = options.tags || generateTags(article.title, article.content);
  const fileName = generateFileName(article.title);

  // 确保分类目录存在
  const catDir = path.join(CONTENT_DIR, category);
  if (!fs.existsSync(catDir)) {
    fs.mkdirSync(catDir, { recursive: true });
  }

  const filePath = path.join(catDir, `${fileName}.md`);

  // SEO 描述: 优先用正文前 150 字(更干净)，其次用 og:description
  let description = article.content
    .replace(/[#*`>\[\]()!]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 150);
  if (description.length > 10) {
    description = description + '...';
  } else if (article.desc) {
    description = article.desc.replace(/\\x[0-9a-f]{2}/gi, ' ').replace(/\s+/g, ' ').trim().slice(0, 150) + '...';
  }

  // 构建 frontmatter
  const frontmatter = {
    title: article.title,
    date: article.date || new Date().toISOString().split('T')[0],
    draft: false,
    description: description,
    categories: [category],
    tags: tags,
    source_url: article.url,
    source_id: article.sourceId,
    source_platform: 'wechat',
    ShowReadingTime: true,
    ShowWordCount: true,
  };

  const content = '---\n' + yaml.dump(frontmatter, {
    quotingType: '"',
    forceQuotes: false,
    lineWidth: -1,
  }) + '---\n\n' + article.content + '\n';

  return { filePath, content, category, tags, fileName };
}

// ========== 核心同步逻辑 ==========
async function syncArticle(url, options = {}) {
  console.log(`\n🔄 正在抓取: ${url}`);

  // 1. 抓取
  let html;
  try {
    html = await fetchUrl(url);
  } catch (err) {
    console.error(`❌ 抓取失败: ${err.message}`);
    return null;
  }

  // 检查是否被验证拦截
  if (html.includes('环境异常') && !html.includes('js_content')) {
    console.error('❌ 被微信验证拦截，请稍后重试或使用其他网络');
    return null;
  }

  // 2. 解析
  const article = parseWechatArticle(html);
  article.url = url;

  if (!article.title) {
    console.error('❌ 无法解析文章标题');
    return null;
  }
  if (!article.content) {
    console.error('❌ 无法解析文章正文');
    return null;
  }

  console.log(`   标题: ${article.title}`);
  console.log(`   作者: ${article.author}`);
  console.log(`   日期: ${article.date}`);

  // 3. 去重
  if (article.sourceId) {
    const existing = findExistingPost(article.sourceId);
    if (existing) {
      console.log(`⚠️  文章已存在: ${path.relative(BLOG_ROOT, existing)}`);
      if (!options.force) {
        console.log('   使用 --force 强制覆盖');
        return null;
      }
    }
  }

  // 4. 生成文件
  const post = generatePost(article, options);

  // 5. 写入
  fs.writeFileSync(post.filePath, post.content, 'utf-8');

  // 6. 记录历史
  const history = loadHistory();
  history.articles.push({
    title: article.title,
    url: url,
    sourceId: article.sourceId,
    category: post.category,
    filePath: path.relative(BLOG_ROOT, post.filePath),
    syncedAt: new Date().toISOString(),
  });
  saveHistory(history);

  // 7. 输出结果
  console.log(`✅ 同步成功!`);
  console.log(`   文件: ${path.relative(BLOG_ROOT, post.filePath)}`);
  console.log(`   分类: ${post.category}`);
  console.log(`   标签: ${post.tags.join(', ')}`);
  console.log(`   ID:   ${article.sourceId}`);

  return post;
}

// ========== CLI ==========
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
微信公众号文章同步工具

Usage:
  node sync-wechat.js <url>                        同步单篇文章
  node sync-wechat.js <url> --category <cat>       指定分类
  node sync-wechat.js <url> --tags "tag1,tag2"     指定标签
  node sync-wechat.js <url> --force                强制覆盖已存在的文章
  node sync-wechat.js --file <urls.txt>            批量同步 (每行一个URL)
  node sync-wechat.js --check <url>                检查文章是否已同步
  node sync-wechat.js --list                       列出已同步的文章

分类列表:
  AI-and-life, blog, chromeExtensionDev, deepInMemory,
  electron, flutter, job, myNetworkDisk, other,
  studyFigma, travel

示例:
  node sync-wechat.js https://mp.weixin.qq.com/s/xxx
  node sync-wechat.js https://mp.weixin.qq.com/s/xxx --category other --tags "Cloudflare,debug"
  node sync-wechat.js --file my-articles.txt
`);
    return;
  }

  // 解析参数
  const options = { force: args.includes('--force') };
  const catIdx = args.indexOf('--category');
  if (catIdx !== -1 && args[catIdx + 1]) options.category = args[catIdx + 1];

  const tagsIdx = args.indexOf('--tags');
  if (tagsIdx !== -1 && args[tagsIdx + 1]) options.tags = args[tagsIdx + 1].split(',').map(t => t.trim());

  // --list: 列出已同步文章
  if (args.includes('--list')) {
    const history = loadHistory();
    if (history.articles.length === 0) {
      console.log('还没有同步过任何文章');
      return;
    }
    console.log(`已同步 ${history.articles.length} 篇文章:\n`);
    for (const a of history.articles) {
      console.log(`  ${a.syncedAt.split('T')[0]} [${a.category}] ${a.title}`);
      console.log(`    → ${a.filePath}`);
    }
    return;
  }

  // --check: 检查是否已同步
  const checkIdx = args.indexOf('--check');
  if (checkIdx !== -1) {
    const url = args[checkIdx + 1];
    if (!url) { console.error('请提供 URL'); process.exit(1); }
    try {
      const html = await fetchUrl(url);
      const article = parseWechatArticle(html);
      if (article.sourceId) {
        const existing = findExistingPost(article.sourceId);
        if (existing) {
          console.log(`✅ 已同步: ${path.relative(BLOG_ROOT, existing)}`);
        } else {
          console.log('❌ 未同步');
        }
      }
    } catch (err) {
      console.error(`抓取失败: ${err.message}`);
    }
    return;
  }

  // --file: 批量同步
  const fileIdx = args.indexOf('--file');
  if (fileIdx !== -1) {
    const filePath = args[fileIdx + 1];
    if (!filePath || !fs.existsSync(filePath)) {
      console.error(`文件不存在: ${filePath}`);
      process.exit(1);
    }
    const urls = fs.readFileSync(filePath, 'utf-8')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#') && l.startsWith('http'));

    console.log(`📋 批量同步 ${urls.length} 篇文章\n`);

    let success = 0, skip = 0, fail = 0;
    for (const url of urls) {
      const result = await syncArticle(url, options);
      if (result) success++;
      else skip++;

      // 每篇文章之间稍等一下，避免被限流
      if (urls.indexOf(url) < urls.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    console.log(`\n📊 完成! 成功: ${success}, 跳过: ${skip}, 失败: ${fail}`);
    return;
  }

  // 单篇同步: 第一个非 -- 参数作为 URL
  const url = args.find(a => a.startsWith('http'));
  if (!url) {
    console.error('请提供文章 URL');
    process.exit(1);
  }

  await syncArticle(url, options);
}

main().catch(err => {
  console.error(`错误: ${err.message}`);
  process.exit(1);
});
