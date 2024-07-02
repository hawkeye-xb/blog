---
title: 在没有设计师的时候，怎么拥有自己的颜色主题
date: 2024-07-02
draft: false
descritpion: '对于当前互联网产品开发中，协调的颜色设计至关重要，甚至决定用户是否愿意主动使用产品。一些独立开发者、中小微企业，在没有设计师的时候，是否就无法拥有至少合理、方便使用的配色方案呢？更多...https://hawkeye-xb.xyz/zh/posts/other/mycolors/'
categories:
  - other
---

对于当前互联网产品开发中，协调的颜色设计至关重要，甚至决定用户是否愿意主动使用产品。一些独立开发者、中小微企业，在没有设计师的时候，是否就无法拥有至少合理、方便使用的配色方案呢？当然不了。我们可以使用很多现成的组件库，解决方案等等，但是如果在不引入组件库的时候呢？[material-color-utilities](https://github.com/material-foundation/material-color-utilities?tab=readme-ov-file)给我们提供了方案。

### 什么是 Material Color Utilities
Material Design 是 Google 的设计语言，旨在提供一致、直观和美观的用户界面设计。Material Color Utilities 特别关注颜色的动态和适应性，使得开发者和设计师能够更容易地为不同的用户界面元素和主题创建和调整颜色方案。[material-color-utilities](https://github.com/material-foundation/material-color-utilities?tab=readme-ov-file)提供了颜色生成（整体色板）、颜色切换（亮暗色）、颜色协调和主题生成。

<!-- ### 答案就是：[material-color-utilities](https://github.com/material-foundation/material-color-utilities?tab=readme-ov-file)
支持的是 Material Design 3 颜色系统算法，可以从图像中选择主题颜色和创建色调。可以看到支持C++、Dart、Java、Swift、TypeScript，基本覆盖大部分的端开发。 -->
从Readme的这个图片的介绍，简单直接。
![](https://github.com/material-foundation/material-color-utilities/raw/main/cheat_sheet.png)
- 获得颜色
  - 可以从图片中获取主题颜色
  - 或者从一个颜色的集合
- 生成内容
  - 颜色主题（高抽象等级）
  - 色板（自定义主题，通过色板中获取）
  - HCT（低等级）


### 如何使用 Material Color Utilities（TypeScript）
Readme中可以看到支持C++、Dart、Java、Swift、TypeScript，基本覆盖大部分端开发语言。但是在使用上没有提供太多的Demo和文档，通过查阅代码类型、函数描述信息会更详细。    

#### Flutter部分
针对Dart语言，Flutter在开发的时候默认就引入了该工具，`ColorScheme.fromSeed`点开函数文件，就能看到`import 'package:material_color_utilities/material_color_utilities.dart';`的引入。

#### TypeScript部分
[npm address](https://www.npmjs.com/package/@material/material-color-utilities)。

描述内容给出了颜色生成主题，如何使用部分，没有给出获取颜色，这里稍作补充。
首先是Quantize获取颜色，依赖并导出了这么些方法。
```ts
export * from './quantize/quantizer_celebi.js';
export * from './quantize/quantizer_map.js';
export * from './quantize/quantizer_wsmeans.js';
export * from './quantize/quantizer_wu.js';
```
入参需要包含ARGB格式化的Number类型数据，和最大可返回的颜色个数。阅读头部描述，其实就是将图片上的每个pixel，转成ARGB之后，使用K-Means算法（一种无监督学习的聚类算法）来聚合像素信息。   
返回Map，key是ARGB，value是个数。这里正好可以使用Score函数了。
```ts
export declare class QuantizerCelebi {
    /**
     * @param pixels Colors in ARGB format.
     * @param maxColors The number of colors to divide the image into. A lower
     *     number of colors may be returned.
     * @return Map with keys of colors in ARGB format, and values of number of
     *     pixels in the original image that correspond to the color in the
     *     quantized image.
     */
    static quantize(pixels: number[], maxColors: number): Map<number, number>;
}
```
##### 获取图片的ARGB信息
这里给出获取图片ARGB Number[]的代码，省得去找了。格式转换的代码在`export * from './utils/image_utils.js';`基本都有。
```ts
imageElement.onload = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  canvas.width = imageElement.width; canvas.height = imageElement.height;

  ctx.drawImage(imageElement, 0, 0);

  const imageData = ctx.getImageData(0, 0, imageElement.width, imageElement.height);
  const pixels = imageData.data;
  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3];
    const red = pixels[i + 0];
    const green = pixels[i + 1];
    const blue = pixels[i + 2];

    const argbValue = (alpha << 24) | (red << 16) | (green << 8) | blue;
    // save argb value
  }
};
```
##### sourceColorFromImage
再仔细看看代码，会发现直接就有提供`sourceColorFromImage`，ummm。
```ts
let imageDom: HTMLImageElement | null ;
  const element = document.getElementById('vueIcon');
  if (element instanceof HTMLImageElement) {
    imageDom = element;
    if (imageDom) {
      const res = await sourceColorFromImage(imageDom);
      // Get the theme from a hex color
      const theme = themeFromSourceColor(res);

      // Print out the theme as JSON
      console.log(JSON.stringify(theme, null, 2));

      // Check if the user has dark mode turned on
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

      // Apply the theme to the body by updating custom properties for material tokens
      applyTheme(theme, {target: document.body, dark: systemDark});
    }
  }
```
##### 应用效果
通过控制台能看到输出的主题颜色，打开Element，body(`target: document.body`)添加了非常多的变量，如：--md-sys-color-primary。    
<!-- ![color-scheme.png](https://s2.loli.net/2024/07/02/giLPGQ7jJ1wrsyn.png) -->
<a href="https://s2.loli.net/2024/07/02/giLPGQ7jJ1wrsyn.png" data-lightbox="image-preview" data-title="preview">
  <img src="https://s2.loli.net/2024/07/02/giLPGQ7jJ1wrsyn.png" alt="preview">
</a>
同时满足了CSS 和JS的使用。同时也可以切换系统的深浅色模式，刷新后切换当前页面的颜色。

### 最后
可以看到我们仅提供了单个主题色，如果使用了这些主题变量，后续我们直接切换主题色，就能快速的切换整个系统的颜色了。如果再往后，团队里面有设计师加入了（这里就先恭喜啦），我们也可以降低生成的等级，去调整数据内容。当然如果有实践过程，也会更新到这里。
