const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const toml = require('@iarna/toml');
const yaml = require('js-yaml');

// 定义内容和 front matter 配置的目录
const contentDir = path.join(__dirname, './content');
const frontMatterDir = path.join(__dirname, './front-matter');
console.info('contentDir, frontMatterDir', contentDir, frontMatterDir);

// 读取 front matter 配置文件
function readFrontMatterConfig(filePath) {
  const ext = path.extname(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  if (ext === '.toml') {
    return toml.parse(content);
  } else if (ext === '.yaml' || ext === '.yml') {
    return yaml.load(content);
  } else {
    throw new Error(`Unsupported front matter config format: ${ext}`);
  }
}

// 更新指定目录下的 Markdown 文件的 front matter
function updateDirectoryFrontMatter(dirPath, frontMatterConfig) {
  const updateFile = () => {
    if (fs.existsSync(`${dirPath}.md`)) {
      updateFrontMatter(`${dirPath}.md`, frontMatterConfig); // 更新文件
    }
  };
  try {
    if (fs.lstatSync(dirPath).isDirectory()) {
      fs.readdirSync(dirPath).forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
          updateDirectoryFrontMatter(fullPath, frontMatterConfig); // 递归子目录
        } else if (path.extname(fullPath) === '.md') {
          updateFrontMatter(fullPath, frontMatterConfig); // 更新文件
        }
      });
    } else {
      console.info('这里到得了？？？');
      updateFile();
    }
  } catch (error) {
    updateFile();
  }
}

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

// 读取并更新 Markdown 文件的 front matter
function updateFrontMatter(filePath, frontMatterConfig) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const parsedContent = parseFrontMatter(fileContent);
  console.info('parsedContent.data', parsedContent.data);

  // 使用配置文件更新 front matter 数据
  Object.assign(parsedContent.data, frontMatterConfig);

  const newContent = matter.stringify(parsedContent.content, parsedContent.data);
  // fs.writeFileSync(filePath, newContent, 'utf8');
  
  console.log(`Updated: ${filePath}`, newContent);
}

// 遍历 front matter 配置目录
function traverseFrontMatterConfigDir(dir) {
  // 获取所有文件和目录
  const items = fs.readdirSync(dir);
  // 先处理所有文件
  console.info(`处理 ${dir} 下的所有文件:`, items.filter(item => !fs.lstatSync(path.join(dir, item)).isDirectory()));
  items.filter(item => !fs.lstatSync(path.join(dir, item)).isDirectory()).forEach(file => {
    const fullPath = path.join(dir, file);
    const relativePath = fullPath.substring(frontMatterDir.length + 1);
    const contentPath = path.join(contentDir, relativePath);

    // 获取配置文件的内容
    const frontMatterConfig = readFrontMatterConfig(fullPath); // 读取失败
    // 构建对应的内容目录路径
    const dirToUpdate = contentPath.replace(path.extname(contentPath), '');

    console.table({
      fullPath, relativePath, contentPath,
      frontMatterConfig: JSON.stringify(frontMatterConfig),
      dirToUpdate,
    })

    if (dirToUpdate) {
      updateDirectoryFrontMatter(dirToUpdate, frontMatterConfig); // 更新对应目录
    }
  });

  // 然后递归处理所有目录
  items.filter(item => fs.lstatSync(path.join(dir, item)).isDirectory()).forEach(subDir => {
    traverseFrontMatterConfigDir(path.join(dir, subDir)); // 递归子目录
  });
}

// 开始遍历 front matter 配置目录
traverseFrontMatterConfigDir(frontMatterDir);
