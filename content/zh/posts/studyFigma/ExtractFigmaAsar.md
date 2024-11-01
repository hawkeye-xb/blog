---
title: 学习和研究Figma：直接看代码(Extract Asar)
date: 2024-07-03T02:09:26.000Z
draft: false
ShowReadingTime: true
ShowWordCount: true
isCJKLanguage: true
categories:
  - 学习
tags:
  - Asar
  - Figma
series:
  - 学习和研究Figma
description: ''
---

大家好呀，时隔两月，今天又来学习和研究figma客户端了。不管是从什么角度去揣测，分析，今天不如更直接一些，看代码！虽然是压缩混淆过的。     
**过程仅供交流学习**    
**过程仅供交流学习**    
**过程仅供交流学习**    

那么，我们需要做些什么呢？
### 项目结构
在Window系统中，右键跳转到文件所在目录，就可以很清晰的看到应用的结构，有exe入口执行文件，依赖的资源和动态链接库等等，可是在MacOS呢？    
**打开访达（finder）—— 左侧选中应用程序 —— 右键对应的应用（如Figma）—— 显示包内容**    
就可以看到应用的构成了，接着打开终端，把Content拖到终端里面，可以看到类似`/Applications/Figma.app/Contents`的路径，也就是说，通过移动到`Applications`的安装方式，会出现在这里，使用.app后缀的目录。    
用`tree`指令输出下`Content`
```shell
.
├── CodeResources
├── Info.plist
├── MacOS
│   └── DynamicUniversalApp
├── PkgInfo
├── Resources
│   ├── App.nib
│   ├── en.lproj
│   ├── icon.icns
│   └── ja.lproj
└── _CodeSignature
    └── CodeResources
```
(这里是还未第一次启动的figma，在启动 DynamicUniversalApp 之后，才会真正的去下载客户端的应用。猜测是为了避免用户安装到其它的文件目录，导致持久化信息、目录访问受限、FigmaAgent无法安装等问题。毕竟在应用拖往Application的弹窗中直接双击启动，对应的根目录和正常启动的是不一致的)    
安装好之后的tree结构如下
```shell
.
├── CodeResources
├── Frameworks
│   ├── Electron Framework.framework
│   ├── Figma Helper (GPU).app
│   ├── Figma Helper (Plugin).app
│   ├── Figma Helper (Renderer).app
│   ├── Figma Helper.app
│   ├── Mantle.framework
│   ├── ReactiveObjC.framework
│   └── Squirrel.framework
├── Info.plist
├── Library
│   ├── FigmaAgent.app
│   └── QuickLook
├── MacOS
│   ├── DynamicUniversalApp
│   └── Figma
├── PkgInfo
├── Resources
│   ├── App.nib
│   ├── af.lproj
│   ├── ...
│   ├── app.asar
│   ├── app.asar.unpacked
│   ├── ...
└── _CodeSignature
    └── CodeResources
```
可以看到在MacOS下增加了客户端的入口文件，Resource多出了`app.asar`、`app.asar.unpacked`文件和目录。
### asar是什么？
简单来说，是在 Electron 里用来打包应用资源文件的一种特殊格式。它能把好多文件和文件夹合成一个文件，这样能让应用的资源分发和加载更便捷高效。而且它能保持原来文件系统的结构和内容，既能减少文件数量，又能在使用时快速读取文件，~~还能增加应用资源的安全性~~。

其实就是业务逻辑代码，会集中在这里，也就是今天讨论的重点。   

既然在运行时候需要获取app.asar的内容，那么Electron是怎么做到的呢？找到[Electron package.json](https://github.com/electron/electron/blob/main/package.json)，devDependencies依赖了`"@electron/asar": "^3.2.1"`这个包，再去[npm搜索](https://www.npmjs.com/package/@electron/asar)，对应的是[github.com/electron/asar](https://github.com/electron/asar)远端项目。    

当然，现在需要单独的处理asar，而不是在Electron下。找了下社区，就有方案，使用`asar`这个包即可，去[npm查看](https://www.npmjs.com/package/asar)，对应的同一个远端项目。这里就没问题，直接全局安装`npm install asar -g`。

![asar npm address.png](https://s2.loli.net/2024/07/04/KjuQPeSpwWfiBDX.png)

### 解压asar
这样我们就可以参照文档，尝试解压figma的asar了。
```shell
# 进入目录
cd /Applications/Figma.app/Contents/Resources
# 解压
asar extract app.asar ./app
```
#### 不出意外，就会有意外。报错了
##### Error: EPERM: operation not permitted, mkdir './app'
这个是没有授权终端创建目录。在【隐私与安全性】的【APP管理】，允许更新删除就好
##### The value of "size" is out of range
```shell
node:internal/errors:541
      throw error;
      ^

RangeError [ERR_OUT_OF_RANGE]: The value of "size" is out of range. It must be >= 0 && <= 4294967296. Received -1000
    at Function.alloc (node:buffer:389:3)
    at module.exports.readFileSync (/xxx/.nvm/versions/node/v20.12.2/lib/node_modules/asar/lib/disk.js:106:23)
    at module.exports.extractAll (/xxx/.nvm/versions/node/v20.12.2/lib/node_modules/asar/lib/asar.js:204:28)
```
直接就被硬控了，难道包出问题了？！    
#### 其它项目尝试
拿了个其它项目来尝试
```shell
# 解压
asar extract app.asar ./app
# 备份
mv app.asar app-backup.asar 
# 压缩
asar pack ./app ./app.asar
```
执行这个过程没有任何报错，执行MacOS的入口文件也都能正常的运行。只是app.asar比原有的包更大了（有app.asar.unpacked），原因是解压的目录会包含unpack，重新打包的时候包含进去。

### 修改 asar 包代码
没办法，只好去查看报错的代码了。
```js
module.exports.readFileSync = function (filesystem, filename, info) {
  let buffer = Buffer.alloc(info.size)
  if (info.size <= 0) { return buffer }
  // ...
  return buffer
}
```
申请buffer时候超出范围了。`info.size`是传入的参数，继续往下
```js
  // ...
  const filesystem = disk.readFilesystemSync(archive)
  // ...
  for (const fullPath of filenames) {
    // Remove leading slash
    const filename = fullPath.substr(1)
    const destFilename = path.join(dest, filename)
    const file = filesystem.getFile(filename, followLinks)
    if (file.files) {
      // ...
    } else {
      // it's a file, extract it
      const content = disk.readFileSync(filesystem, filename, file)
      // ...
    }
  }
```
file信息是通过`filesystem.getFile(filename, followLinks)`到的，filesystem又是通过`const filesystem = disk.readFilesystemSync(archive)`得到的。
这下好好看看，这一步到底做了什么事情。    
几次console调整之后。
```js
module.exports.readFilesystemSync = function (archive) {
  if (!filesystemCache[archive]) {
    const header = this.readArchiveHeaderSync(archive)
    console.info('获取到的header元数据:', JSON.parse(header.headerString));
    const filesystem = new Filesystem(archive)
    // ...
  }
  return filesystemCache[archive]
}
// 重新跑 asar extract app.asar ./app ，得到输出
// 获取到的header元数据: {
//   files: {
//     '.codesign': { size: -1000, offset: '0', integrity: [Object] },
//     assets: { files: [Object] },
//     'bindings.node': { size: 139808, unpacked: true, integrity: [Object] },
//     'build.json': { size: 26, offset: '477349', integrity: [Object] },
//     'desktop_rust.node': { size: 2280008, unpacked: true, integrity: [Object] },
//     'desktop_shell.css': { size: 323004, offset: '477375', integrity: [Object] },
//     'desktop_shell.js': { size: 373725, offset: '800379', integrity: [Object] },
//     i18n: { files: [Object] },
//     loading_screen: { files: [Object] },
//     'main.js': { size: 467065, offset: '1200404', integrity: [Object] },
//     node_modules: { files: [Object] },
//     'package-lock.json': { size: 16134, offset: '2069716', integrity: [Object] },
//     'package.json': { size: 536, offset: '2085850', integrity: [Object] },
//     'shell_app_binding_renderer.js': { size: 2180, offset: '2086386', integrity: [Object] },
//     tray: { files: [Object] },
//     'web_app_binding_renderer.js': { size: 16626, offset: '2089567', integrity: [Object] }
//   }
// }
```
好你个浓眉大眼的.codesign，还是个隐藏文件。看偏移量`offset: '0'`，打头的就是size出错的数据。    
为避免其它情况下使用asar出错，判断下这个filename，直接给你丫跳过。    
这样就可以解压出来内容了，虽然是压缩混淆的，有需要的硬翻也可以翻出来不少东西，后续怎么处理？**过程仅供交流学习**。

到这里，过程就结束了，也就是为啥前面描述asar的时候，我把安全这个给划掉了，安全不了一点儿啊。但是figma的这个做法，确实也能增加一道门槛，文件名都非常直白了。
### 最后
总的来说，就是用了个asar工具去解压包，碰到了个小错误，改完之后就能解压了。    
今天研究asar代码就到这儿，希望对你有帮助😉

### 更多一点儿
#### .codesign 真实 size 有多大？
很简单，offset从0开始，只要找到了第二个文件的起始点，那它就是这个文件的大小。    
通过上面获取到的元数据信息，发现有的包含了offset，而有的没有。没有的是因为unpack了，没有存在app.asar这个包。   
但是，这第二个`assets`是个目录！刚想递归遍历，但是直接输出下这个详情就好了。
```shell
# console
  'Inter.var.woff2': {
    size: 319784,
    offset: '0',
    integrity: {
      algorithm: 'SHA256',
      hash: '0f409d1d652d526bcfd7fd0c2cae003cd1b32a009e71f7f9e614f644bd1d8f52',
      blockSize: 4194304,
      blocks: [Array]
    }
  },
```
offset依旧是0，惊不惊喜意不意外~。

<!-- xattr相关 -->
----

**过程仅供交流学习**    
**过程仅供交流学习**    
**过程仅供交流学习**    
