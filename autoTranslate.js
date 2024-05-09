const fs = require('fs');
const path = require('path');

// 源目录和目标目录
const sourceDir = path.join(__dirname, 'content', 'zh'); // default
const targetDirs = [
	'ar',
	'be',
	'bg',
	// 'bn',
	// 'ca',
	// 'ckb',
	// 'cs',
	// 'da',
	// 'de',
	// 'el',

	// 'en',

	// 'eo',
	// 'es',
	// 'fa',
	// 'fr',
	// 'he',
	// 'hi',
	// 'hr',
	// 'hu',
	// 'id',
	// 'it',
	// 'ja',
	// 'ko',
	// 'ku',
	// 'mn',
	// 'ms',
	// 'nl',
	// 'no',
	// 'pa',
	// 'pl',
	// 'pnb',
	// 'pt',
	// 'ro',
	// 'ru',
	// 'sk',
	// 'sv',
	// 'sw',
	// 'th',
	// 'tr',
	// 'uk',
	// 'uz',
	// 'vi',

	// 'zh-tw',
	// 'zh',
];

// 处理函数，这里只是简单地返回原内容
function processContent(content) {
  // 你可以在这里添加你的处理逻辑
  return content;
}

// 递归复制目录和文件
function copyDirectory(src, dest) {
  // 确保目标目录存在
  fs.mkdirSync(dest, { recursive: true });

  // 读取源目录内容
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // 如果是目录，递归复制
      copyDirectory(srcPath, destPath);
    } else if (entry.isFile()) {
      // 如果是文件，读取内容并处理
      const content = fs.readFileSync(srcPath, 'utf-8');
      const processedContent = processContent(content);
      // 将处理后的内容写入目标文件
      fs.writeFileSync(destPath, processedContent);
    }
  }
}

// 开始复制
// copyDirectory(sourceDir, targetDir);
function main() {
	// copy all target dirs
	(async () => {
		for (const el of targetDirs) {
			const targetPath = path.join(__dirname, 'content', el);
			console.info('targetPath is: ', targetPath);
			await copyDirectory(sourceDir, targetPath);
		}
	})();
}

main();