---
title: koa 快速开发一个文件服务器
date: 2024-11-13
draft: false
descritpion: '介绍了使用 koa 使用 ws 模块快速开发一个文件服务器。与碰到 Multer 无法获取 formData file 之外其他数据问题的解释。'
tags: ['Multer', 'Node', 'Koa']
series: ['我的网盘']
---

一个网盘类型的项目，肯定离不开文件系统。用于快速验证流程，这里使用了 node koa 作为文件系统服务，运行在本地。

### 初始化项目
照着[ koa 官方文档](https://koajs.com/)来，当然是没有错的。但是为了更好的开发，我们需要引入更多的依赖，后续逐步添加也可以。

#### 添加 ts、nodemon 依赖
```shell
npm install --save-dev @types/koa typescript ts-node nodemon
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

```json
// nodemon.json
{
  "ignore": [
    "*.log",
    "data.json",
    "dist/",
    "node_modules/",
    "src/tests/"
  ],
  "watch": [
    "src"
  ],
  "ext": "js,ts"
}
```

#### 添加 koa 常用几个依赖
```shell
npm install koa-bodyparser koa-router koa-static log4js
npm install --save-dev @types/koa-bodyparser @types/koa-router @types/koa-static
```

#### 组织目录结构
controllers 用于处理 routes 的请求，DB 相关操作，复杂业务逻辑在 services 中，utils 用于存放一些工具函数，types 用于存放类型声明。middles 可以用于存放统一处理路由等。
```shell
.
├── __test__
│   └── utils.test.ts   # 测试文件
├── config # 配置文件
├── controllers # 控制器
│   ├── dir.ts 
├── index.ts # 入口文件
├── middles # 中间件
│   ├── format.ts
│   └── reqLog.ts
├── public # 静态文件
│   ├── index.html
├── routes # 路由
├── services # 服务
├── types # 类型声明
└── utils # 工具函数
```

### 项目开发
基本内容准备完毕之后，进入开发之前，因为我希望能够监听本地文件的变化，及时的通知到客户端，所以需要使用 ws 模块。
```shell
npm install ws chokidar fs-extra
npm install --save-dev @types/ws @types/chokidar @types/fs-extra
```

#### 使用 ws
```ts
// ...
// 启动服务
const server = app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});

initWs(server);
function initWs (server: Server) {
  // 初始化 WebSocket 服务
  new WSServerController(server);
}
```

#### 路由编写，使用 Joi 校验参数
这里简单给出一个 post 请求 Joi 校验的例子。
```ts
// router.post('/dir', postDir);

const postDirSchema = Joi.object({
  root: Joi.string().required(),
  name: Joi.string().required(),
})
export const postDir = (ctx: Context) => {
  const { error, value } = postDirSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: error.details[0].message,
    };
    return;
  }

  const { root, name } = value;

  try {
    // 检查路径是否存在
    // 检查文件夹是否存在
    // 创建文件夹
    fs.mkdirSync(path.join(root, name));

    ctx.body = {};
  } catch (error) {
    return;
  }

}
```
#### 使用 @koa/multer 处理文件上传
需要注意的是在客户端上传文件的时候，目标 path 或者其他的参数，通过 body 获取需要写在 formData file 参数的前面。否则文件存储完成才能解析到 body 中的数据。
因为 multer 在做文件接收的时候，为了尽快的将文件写入磁盘，会按照顺序处理传递过来的文件流。

```ts
export const upload = multer({
  storage: multer.diskStorage({
    destination: (req: any, file, cb) => {
      const targetPath = req.body?.path || '';
      const uploadDir = targetPath; //path.join(uploadPath, targetPath);
      cb(null, uploadDir);
    },
    filename: (req: IncomingMessage & {
      body: {
        path?: string;
      };
    }, file, cb) => {
      const targetPath = req.body?.path || '';
      const uploadDir = targetPath; //path.join(uploadPath, targetPath);

      const originalname = file.originalname;
      const ext = path.extname(originalname);
      const baseName = path.basename(originalname, ext);

      let fileName = originalname;
      let count = 1;

      // 检查文件是否存在，如果存在则增加后缀
      while (fs.existsSync(path.join(uploadDir, fileName))) {
        fileName = `${baseName}_${count}${ext}`;
        count++;
      }
      
      cb(null, fileName);
    }
  })
})
```

### 构建
到这里简单的 koa 项目就开发完成了。由于需要被 Electron 项目 fork启动，所以需要构建。
```shell
# npm run build
npx tsc	
```
