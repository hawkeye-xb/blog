---
title: turborepo 快速入门
date: 2025-08-29
draft: true
descritpion: '关于 monorepo turborepo 库快速入门，官方文档总结'
categories:
  - other
---

# Why Turborepo
# Quick start
## 依赖关系 与 package.json
通过最基础创建项目的指令`pnpm dlx create-turbo@latest` ，得到的 demo 项目。
目录结构需要注意：（以下说的每个，指的都是 apps 和 packages）
Using this configuration, every directory with a package.json in the apps or packages directories will be considered a package.

Ui 项目作为被依赖的 packages，package.json 中 name 的作用类似 appid，建议在前面加命名空间前缀。demo 是 "name": "@repo/ui", 再辅助以 export 将文件资源导出。通过即时打包的方式导出（非Build之后）
```json
{
  "name": "@repo/ui",
  "private": true,
  "exports": {
    "./*": "./src/*.tsx"
  },
}
```
```
// apps/docs/app/page.tsx 使用用例
import { Button } from "@repo/ui/button";
```

Using exports this way provides three major benefits:
- Avoiding barrel files: Barrel files are files that re-export other files in the same package, creating one entrypoint for the entire package. While they might appear convenient, they're difficult for compilers and bundlers to handle and can quickly lead to performance problems.
- More powerful features: exports also has other powerful features compared to the main field like Conditional Exports. In general, we recommend using exports over main whenever possible as it is the more modern option.
- IDE autocompletion: By specifying the entrypoints for your package using exports, you can ensure that your code editor can provide auto-completion for the package's exports.

当然如果需要 publish 到公网，再按照目录独立的构建出 dist 即可，我猜没有什么难度。
```json
// packages/typescript-config/package.json
"publishConfig": {
  "access": "public"
}
```

## 公共配置文件（tsconfig）
再一个，不同项目会有相同和定制的 config 信息，拿 demo 中 ts `packages/typescript-config` 来举例。
我们不再需要再在根目录保留，而是作为单独的依赖包在 packages 中导出。
在 demo 中，会有 base.js，和针对定制的 next.js 文件，apps 中，tsconfig.ts 使用 `"extends": "@repo/typescript-config/nextjs.json"`, 这里因为 extends 是 TypeScript 编译器的内置功能，不依赖 package.json 的 export 字段也能找到。对应的，`packages/eslint-config/package.json` 就需要指明文件的导出了。

## 外部依赖管理（pnpm）
幽灵依赖对 monorepo 来说是很容易出现的问题，并且要求所有项目使用统一版本依赖是不现实的。
建议就近初始化依赖，在每个项目 package.json 中声明，turborepo 也是通过声明来限制 apps 中依赖的访问。但是也没有彻底的限制幽灵依赖，可以增加 .npmrc 配置限制。
```sh
shamefully-hoist=false
strict-peer-dependencies=true
```

包管理方式使用了 pnpm，对于重复的依赖，会提升到根目录，再以软链的方式指向文件，避免产生 node modules 黑洞。demo 项目可以通过依赖的指向验证
```sh
ls -la apps/docs/node_modules/react
ls -la apps/web/node_modules/react

/*
apps/docs/node_modules/react -> ../../../node_modules/.pnpm/react@19.1.0/node_modules/react
apps/web/node_modules/react -> ../../../node_modules/.pnpm/react@19.1.0/node_modules/react
*/
```

## 任务规划（启动指令配置）
[看文档！看文档！看文档！](https://turborepo.com/docs/crafting-your-repository/configuring-tasks#depending-on-a-specific-task-in-a-specific-package)
https://turborepo.com/docs/crafting-your-repository/configuring-tasks#depending-on-a-specific-task-in-a-specific-package

### 默认执行
和其他的 monorepo 项目一样，通过执行 turbo run dev，会自动查找包 script 下的 dev 指令，同步（是否同步？）执行。
如果需要定制执行任务，则需要在 turbo.json 中配置 tasks。
dependsOn 需要注意的是：
- ^build: 会根据依赖逐级往上查找，并且执行 build 任务，直到依赖构建完成，再运行该指令（内容为以上，自动查找 script 执行）。
- build: 无【 ^ 】符号，意思是当前指令依赖当前项目的 build 行为。比如：test 之前，需要构建项目。
- utils#build: 运行指定指令之前，优先执行 utils 包下的 build 指令

### 根任务（新项目基本用不上）
正常执行 turbo run 只会针对 apps 和 packages 的包执行，而根执行，则是所有目录都执行。场景是在项目迁移，需要执行一些 lint pretty 指令啥的。

### 更定制的配置
项目内部的 turbo.json 会覆盖根目录的配置。

### 更多配置
等等更多请查看官方文档
- 任务过程中长任务（不终止）
- 不缓存
- 依赖并行执行

## Cache ! 
### 缓存的规则
基于包的，会处理每个包输出的。
```json
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**"]
    }
  }
```
类似写代码一样，inputs 相当于依赖，比如 .env 内容发生了变更，则不使用缓存。否则检测到缓存内容，该执行会返回缓存，用于提高速度。
而 outputs 则相当需要缓存内容的配置。如上的意思：缓存 .next/* （next 的构建产物），忽略其中 cache 目录。
[更多规范](https://turborepo.com/docs/reference/globs) https://turborepo.com/docs/reference/globs

私有包的缓存？
https://turborepo.com/docs/crafting-your-repository/creating-an-internal-package#create-an-empty-directory

## 环境参数
类似：mode=dev；globalEnv 是什么？Task env 字段是什么？

Turborepo 不做环境变量的处理，可以理解为只做任务的启动器，但是为什么 turbo.json 有配置？因为 turbo 很重要的缓存功能，避免出现环境变量发生了更新，而继续使用缓存内容的问题（dev 和 prod，导致使用了dev 缓存等等），所以需要做“依赖更新”的配置。

好在 turbo 也允许 “--” 透穿参数：（待验证）
"passThroughArgs": true,  // 允许透传参数给下游 scripts

## 参考文档
依赖关系、公共配置文件；参考：https://turborepo.com/docs/crafting-your-repository/structuring-a-repository#anatomy-of-a-package    
外部依赖管理；参考：https://turborepo.com/docs/crafting-your-repository/managing-dependencies    
任务规划；参考：https://turborepo.com/docs/crafting-your-repository/configuring-tasks    
缓存配置；参考：https://turborepo.com/docs/crafting-your-repository/caching    
环境变量；参考：https://turborepo.com/docs/crafting-your-repository/using-environment-variables    
# Cache
# Add Electron Project(Webpack)
# Add Vue3 Project(Vite)