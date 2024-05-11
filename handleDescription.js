const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const toml = require('@iarna/toml');
// const yaml = require('js-yaml');
const util = require('util');

// 将fs.readdir和fs.stat转换为Promise版本
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// ---- AI 生成description ----
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

function generateDescription(content) {
	const dsPrompt = `
	你是世界上SEO大师，需要总结下面的Markdown文件，生成80-160字，用于html网站SEO的meta content描述信息。
	注意：仅返回description描述信息。
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

// 目标目录路径
const directoryPath = path.join(__dirname, 'content');

function replacePlusPlusPlus(str) {
  let count = 0;
  return str.replace(/^\+\+\+\n/gm, function(match) {
      count++;
      if (count === 1) {
          return '---toml\n';
      } else if (count === 2) {
          return '---\n';
      } else {
          return match;
      }
  });
}
const parseFrontMatter = (content) => {
  if (content.startsWith('+++')) {
    return matter(
      replacePlusPlusPlus(content),
      {
        engines: {
          toml: toml.parse.bind(toml)
        }
      }
    );
  }
  return matter(content);
};

async function traverseDirectory(dirPath) {
  try {
    const files = await readdir(dirPath, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(dirPath, file.name);
      const stats = await stat(filePath);

      if (stats.isDirectory()) {
        // 如果是目录，递归处理子目录
        await traverseDirectory(filePath);
      } else if (path.extname(filePath) === '.md' && filePath.includes('/posts/')) {
        // 如果是.md文件，读取内容并处理
        const data = await readFile(filePath, 'utf8');

				try {
					const parsedContent = parseFrontMatter(data);
					if (
						!parsedContent.data.draft
						&& !parsedContent.data.description
						&& parsedContent.content.length > 200
					) {
						console.info(`${filePath}，无description`);
						
						const res = await generateDescription(parsedContent.content)
						try {
							const obj = JSON.parse(res);
							parsedContent.data.description = obj.choices[0].message.content;
							const newContent = matter.stringify(parsedContent.content, parsedContent.data);
							fs.writeFileSync(filePath, newContent, 'utf8');
							
							console.log(`Updated: ${filePath}`, newContent);
						} catch (error) {
							throw error;
						}
					}
				} catch (error) {
					throw error;
				}

        // // 处理文件内容（这里只是简单地打印出来，你可以根据需要进行修改）
        // console.log(`文件内容: ${data}`);

        // // 重新写入文件（如果你需要修改内容，可以在这里进行操作）
        // await writeFile(filePath, data, 'utf8');
        // console.log(`成功写入文件: ${filePath}`);
      }
    }
  } catch (err) {
    console.error('处理文件时出错:', err);
  }
}


// 开始遍历目录
traverseDirectory(directoryPath);