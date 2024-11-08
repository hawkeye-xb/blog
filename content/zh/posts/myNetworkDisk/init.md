---
title: Electron-forge + Vite + Typescript + Vue3 初始化项目
date: 2024-11-07
draft: false
descritpion: ''
categories: ['Electron']
tags: ['Electron-forge', 'Vite', 'Typescript', 'Vue3']
series: ['我的网盘']
---
### 初始化 Electron
[Vite + TypeScript](https://www.electronforge.io/templates/vite-+-typescript)
```shell
npm init electron-app@latest my-new-app -- --template=vite-typescript
```

### 安装 Vue3
```shell
npm install vue@latest
```
### 安装 Vue3 插件
```shell
npm install @vitejs/plugin-vue
```

### 修改 renderer 配置
`vite.renderer.config.ts`
```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config
export default defineConfig({
	plugins: [vue()],
});

```

### 调整目录(按需)
```sh
├── main.ts
├── preload.ts
├── renderer
│   ├── App.vue
│   └── index.ts
└── types
```

### 调整 index.html 入口文件
`src="/src/renderer/index.ts"`

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Hello World!</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/renderer/index.ts"></script>
  </body>
</html>
```

### 调整脚本入口文件
/src/renderer/index.ts
```ts
// ...
// import './index.css';
import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
console.log('👋 This message is being logged by "renderer.ts", included via Vite');

```

App.vue 随便写些内容。

### 运行代码
就能看到效果了

### Vue 文件不被 TS 识别
如：找不到模块“./App.vue”或其相应的类型声明。
```shell
npm install vue-tsc @vue/cli-plugin-typescript
```
配置tsconfig
```json
{
  "compilerOptions": {
		...
    "types": ["vite/client", "vue"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
}
```

### ESLint 代码报错
如：Parsing error: ';' expected.
```shell
npm install eslint-plugin-vue
```
配置.eslintrc
```json
{
  "extends": ["plugin:vue/vue3-essential"],
}
```

### Vue3 支持
#### 问题
count 提示，已声明“__VLS_template”，但从未读取其值。
```Vue
<template>
	<div>
		<button @click="count++">{{ count }}</button>
	</div>
</template>
<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>
```
#### 解决
```shell
npm install @vue/eslint-config-typescript
```
配置.eslintrc
```json
{
  "extends": [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/typescript/recommended"
  ],
}
```

### 最后
结束啦，`--save-dev` 按需求加吧。
