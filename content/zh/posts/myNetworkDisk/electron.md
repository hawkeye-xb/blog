---
title: Electron 客户端项目从搭建到分发的全流程（含pipeline）
date: 2025-02-04
draft: false
descritpion: '利用 Electron、Webpack 和 TypeScript 构建客户端项目。从依赖安装到项目分发，每个步骤都为你剖析到位，助你轻松应对开发难题'
categories: ['Electron']
tags: ['Electron', 'Webpack', 'Typescript']
series: ['P-Pass File']
---
最近在开发基于 WebRTC 做数据传输的文件管理工具，[P-Pass File](https://p-pass-file-website.deno.dev/) 需要对本地文件做读写操作，大量的操作干脆就直接以本地服务的方式去处理了。

之前为了快速开发客户端，[使用 electron-forge vite ts 模板快速创建项目](https://hawkeye-xb.xyz/zh/posts/mynetworkdisk/init/)。可不曾想在主进程中使用 `fork、child_process` 启动 node 服务，vite 构建出来的产物会循环的启动 app，直接导致设备无法使用（ [issue 地址](https://github.com/electron/forge/issues/3686) ）。找不出解决的办法，无奈只能使用老一套的方案处理了。

幸运的是，当时模块拆分对此影响比较小。
### 模块拆分方案
Electron 主进程作为启动器，fork 启动文件读写服务的子进程，ui 部分使用 hash 路由，构建之后作为资源随包分发。

与 electron-forge vite 等现有实现方式对比，初始直觉很容易就惯性的认为，electron 项目，不管是子进程还是渲染进程的内容，都应该归属于客户端大项目来管理[ electron, [ child_process , ui_process ] ]。因为基础的 electron 模板不提供现代的 UI 构建方式（Vue、 React等），开发过程又需要频繁的编辑、重启，所以在项目 package.json 引入相关依赖，vite.renderer.config.ts（在之前的模板中） 做相关的配置。    
其实也是开发的时候启动了 electron 与 ui 相关的 dev server，在模板代码中也有体现。
```js
if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
   mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
} else {
   mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
}
```
在得到项目管理上的方便的同时，也相应的需要更多初始化配置、依赖的兼容。

所以在做权衡之后，将 electron 与渲染进程分离。electron 作为类服务端的一个启动器、进程管理器，更方便的隔离和选择技术栈。通过 preload 注入 apis；渲染进程当做 web 项目开发，通过 preload 环境参数区分接口调用，前期还能通过直接 loadURL 访问远端资源，达到更快速的项目迭代。
<a href="/images/other/p-pass-file/electron.png" data-lightbox="electron" data-title="electron">
  <img src="/images/other/p-pass-file/electron.png" alt="chat1">
</a>


#### 项目搭建
初始化项目
首先，创建一个新的项目目录并初始化 package.json。
```shell
mkdir my-electron-app
cd my-electron-app
npm init -y
```

#### 安装依赖
安装 Electron、Webpack、TypeScript 和其他必要的依赖。
```shell
npm install electron --save-dev
npm install webpack webpack-cli webpack-dev-server ts-loader typescript --save-dev
npm install electron-builder --save-dev
```

初步依赖如下
```json
"devDependencies": {
    "copy-webpack-plugin": "^12.0.2",
    "electron": "^34.0.1",
    "electron-builder": "^25.1.8",
    "ts-loader": "^9.5.2",
    "typescript": "^5.7.3",
    "webpack": "^5.97.1",
    "webpack-cli": "^6.0.1",
    "webpack-dev-server": "^5.2.0"
  },
  "dependencies": {
    "electron-log": "^5.2.4",
    "esm": "^3.2.25"
  }
```

#### 配置 TypeScript
在项目根目录下创建 tsconfig.json 文件，配置 TypeScript 编译选项。
```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "ESNext", // 使用 ESM 模块
    "moduleResolution": "node",
    "outDir": "./dist", // 输出目录
    "rootDir": "./src", // 源代码目录
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```
#### 配置 Webpack
在项目根目录下创建 webpack.config.js 文件，配置 Webpack。
如果不需要处理本地资源，CopyPlugin 不用配置。
```js
import webpack from 'webpack';
import path from 'path';
import { fileURLToPath } from 'url';
import CopyPlugin from 'copy-webpack-plugin';

// 解决 __dirname 在 ESM 下的问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env) => {
  return {
    entry: {
      main: './src/main.ts',
      preload: './src/preload.ts',
    },
    target: 'electron-main',
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: './src/server', to: 'server' },
          { from: './src/ui', to: 'ui' },
        ],
      }),
    ],
  };
};
```

#### 创建 Electron 主进程文件
在 src 目录下创建 main.ts 文件，这是 Electron 的主进程入口文件。
没有渲染进程，也就不需要 index.html 和 renderer.ts。
创建 preload apis 注入文件。
在 src 目录下创建 preload.ts 文件。例子如下：
```js
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // 唤起文件选择器，返回所选择的目录或者文件地址
  openFileSelector: (options: any) => ipcRenderer.invoke('open-resource-selector', {
    properties: ['openFile', 'openDirectory', 'multiSelections'], // 允许选择文件和目录
    ...options,
  }),
  showItemInFolder: (path: string) => ipcRenderer.send('show-item-in-folder', path),
  systemInfo: {
    platform: process.platform,
    arch: process.arch,
    electron: process.versions.electron,
    node: process.versions.node,
    appVersion: process.env.APP_VERSION,
  }
});
```

#### 配置 package.json 运行指令
```json
"scripts": {
    "compile": "webpack --config webpack.config.js",
    "start": "npm run compile && electron .",
    "pack": "npm run compile && electron-builder --dir",
    "dist": "npm run compile && electron-builder"
  },
```

这里构建的逻辑就是使用 Webpack 将 ts 打包输出到 dist，后续再启动或者构建 Release。主进程代码量较少，就不使用文件监听的方式。

项目结构
```shell
├── build
│   └── icons
├── dist
│   ├── main.js
│   ├── preload.js
│   ├── server
│   └── ui
├── electron-builder.json
├── package-lock.json
├── package.json
├── release
├── src
│   ├── ipcListeners.ts
│   ├── main.ts
│   ├── preload.ts
│   ├── server
│   └── ui
├── tsconfig.json
└── webpack.config.js
```

### 项目构建与分发
将所需的 Node 服务构建输出到 Webpack 配置的 ` { from: './src/server', to: 'server' } ` 中，配置 icons 后在本地打包 dmg。将其上传至 Github Release，即可进行下载分发。

#### 环境初始化、定义构建的平台、Node 版本等
```yml
name: Build and Release Electron App

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    
    strategy:
      matrix:
        os: [macos-latest, windows-latest]
        
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        
      - name: Setup Node.js and npm
        uses: actions/setup-node@v4
        with:
          node-version: '18.19.0'
          npm-version: '10.2.3'
```
#### 构建依赖的服务
前面说了，这里依赖了另外的服务资源，需要优先打包，不直接使用产物的原因是避免构建Node版本不一致等问题。
使用同样的授权 `secrets.AUTH_TOKEN` token，克隆仓库，安装依赖，构建服务。   
PS：Window 平台下的 Path 处理格式。
```yml
# 构建服务端依赖
      - name: Build Server Dependency
        shell: bash
        run: |
          echo "Cloning server repository..."
          git clone https://x-access-token:${{ secrets.AUTH_TOKEN }}@github.com/hawkeye-xb/p-pass-file-server.git temp-server
          cd temp-server
          
          echo "Installing dependencies..."
          npm install --no-audit --no-fund --include=dev
          
          echo "Rebuilding native modules..."
          npm rebuild
          
          echo "Building server..."
          npx cross-env NODE_ENV=production node esbuild.config.js && node copy-node-files.js
          
          echo "Copying build artifacts..."
          cd ..
          mkdir -p src/server
          if [ "$RUNNER_OS" == "Windows" ]; then
            cp -r temp-server/dist/* src/server/ 2>/dev/null || powershell -Command "Copy-Item 'temp-server/dist/*' -Destination 'src/server' -Recurse -Force"
          else
            cp -r temp-server/dist/* src/server/
          fi
          
          rm -rf temp-server
        env:
          GIT_TERMINAL_PROMPT: 0
          CI: true
          NODE_ENV: production
```
之后就是常规的 Electron 构建任务了。
#### 上传
这里多给出上传的代码，会将 `latest.yml`、`.blockmap` 自动更新需要的资源也上传到 Release 中。
```yml
      - name: Upload Release Assets
        uses: softprops/action-gh-release@v1
        if: startsWith(github.ref, 'refs/tags/')
        with:
          files: |
            release/*-win-x64.exe
            release/*-mac-x64.dmg
            release/*-mac-arm64.dmg
          draft: false
          prerelease: ${{ contains(github.ref, '-beta') || contains(github.ref, '-alpha') }}
          name: Release ${{ github.ref_name }}
          tag_name: ${{ github.ref_name }}
        env:
          GITHUB_TOKEN: ${{ secrets.AUTH_TOKEN }}
```

[完整的 CICD 文件查看](https://github.com/hawkeye-xb/p-pass-file-electron-client/blob/main/.github/workflows/electron-build.yml)