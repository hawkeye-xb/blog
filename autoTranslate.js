const fs = require('fs');
const path = require('path');

// ---- ai translate ----
const https = require('https');

// 读取API密钥
const apiKeys = JSON.parse(fs.readFileSync('./apikeys.json'));
const apiKey = apiKeys.deepseek;

// 设置请求选项
const options = {
  hostname: 'api.deepseek.com',
  path: '/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  }
};

function deepseekTranslate (content, targetLang) {
	content = content + '\n\n__[文档由AI翻译](/posts/blog/autotranslate/)__\n\n';
	const dsPrompt = `
	你是全宇宙最厉害的翻译大师，没有你不会的语言。
	下面你需要将输入的Markdown文档，翻译成${targetLang}语言，格式原封不动的返回，文档内容可以适当的优化语句表述，但不能改变意思。
	注意：按照格式返回翻译后的文档即可。
	`;
	return new Promise((resolve, reject) => {
		// 设置请求体
		const data = JSON.stringify({
			"model": "deepseek-chat",
			"messages": [
				{"role": "system", "content": dsPrompt},
				{"role": "user", "content": content}
			]
		});
		// 发送请求
		const req = https.request(options, (res) => {
			let responseData = '';
			res.on('data', (chunk) => {
				responseData += chunk;
			});

			res.on('end', () => {
				resolve(responseData);
				/**
				 * {
						id: 'c66908eb-50d8-4803-9bd7-d23fd68a3d83',
						choices: [
							{
								index: 0,
								message: {
									content: '',
									"role": "assistant"
								},
								finish_reason: 'stop',
								logprobs: null
							}
						],
						created: 1715264801,
						model: 'deepseek-chat',
						system_fingerprint: null,
						object: 'chat.completion',
						usage: { prompt_tokens: 193, completion_tokens: 134, total_tokens: 327 }
					}
				 * **/
			});
		});

		req.on('error', (error) => {
			console.error(error);
			reject(error);
		});

		// 写入请求体
		req.write(data);
		req.end();
	});
}
// ----

// 源目录和目标目录
const sourceDir = path.join(__dirname, 'content', 'zh'); // default
const targetDirs = [
	// 'ar',
	// 'be',
	// 'bg',
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

	'zh-tw',
	// 'zh',
];

let targetLang = null;
// 处理函数，这里只是简单地返回原内容
async function processContent(content) {
	if (targetLang != null) {
		try {
			const translateStr = await deepseekTranslate(content, targetLang);
			const obj = JSON.parse(translateStr);
			return obj.choices[0].message.content;
		} catch (error) {
			return content;
		}
	}
  // 你可以在这里添加你的处理逻辑
  return content;
}

// 递归复制目录和文件
async function copyDirectory(src, dest) {
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
      const processedContent = await processContent(content);
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
			targetLang = el;
			await copyDirectory(sourceDir, targetPath);
		}
	})();
}

main();
// function testtranslate () {
// 	deepseekTranslate('关于我：94巨蟹dian人，反复横跳大师。切图仔、前端、软件研发... 搞过网页，做过APP（移动、桌面），写过服务，调过AI(Openai API)，就...很不少。报菜名：Web、Electron、cordova(PhoneGap)、Weex、Flutter、Node...各种端类开发，Rust开发过些小插件。', 'en');
// }
// testtranslate()