---
title: 用了这么多年的字体，你知道它是怎么解析的吗？
date: 2024-08-06
draft: true
descritpion: '对字体相关内容学习的整理'
weight: 1
categories:
  - other
---

大家好呀。

因为之前有过字体解析的相关代码开发，一直想把这个过程记录下来，总觉得这个并不是很难，自认为了解得不算全面，就一拖再拖了。今天仅做简单的抛砖引玉，通过本篇文章，可以知道[Opentype.js](https://opentype.js.org/)是如何解析字体的。在遇到对应问题的时候，可以有其它的思路去解决。比如：.ttc的解析。又或者好奇我们开发软件过程中字体是如何解析的。

### Opentype.js 使用
看官方[readme](https://github.com/opentypejs/opentype.js)也可以，这里直接将github代码下载，使用自动化测试目录里的字体文件。

需要注意的是load方法已经被废弃。
```js
function load() {
  console.error('DEPRECATED! migrate to: opentype.parse(buffer, opt) See: https://github.com/opentypejs/opentype.js/issues/675');
}
```
将`package.json`设置为`type: module`，然后就可以直接使用`import`了。
```js
import { parse } from './src/opentype.mjs';
import fs from 'fs';
// test/fonts/AbrilFatface-Regular.otf
const buffer = fs.promises.readFile('./test/fonts/AbrilFatface-Regular.otf');
// if not running in async context:
buffer.then(data => {
  const font = parse(data);
  console.log(font.tables);
})
```

### Opentype源码阅读
#### parseBuffer：解析的入口
通过简单的调用入口，我们可以反查源码。传入文件的ArrayBuffer并返回Font结构的对象，当不清楚会有什么结构的时候，可以通过Font查看，当然了，直接consolelog查看更方便。
```js
// Public API ///////////////////////////////////////////////////////////

/**
 * Parse the OpenType file data (as an ArrayBuffer) and return a Font object.
 * Throws an error if the font could not be parsed.
 * @param  {ArrayBuffer}
 * @param  {Object} opt - options for parsing
 * @return {opentype.Font}
 */
function parseBuffer(buffer, opt={}) {
    // ...
    // should be an empty font that we'll fill with our own data.
    const font = new Font({empty: true});
}
export {
// ...
    parseBuffer as parse,
// ...
};
```
#### 字体类型判断
接着往下阅读。    
根据`signature`的值，去确认字体类型。粗略看来，这里仅支持了`TrueType`(.ttf)、`CFF`(.otf)、`WOFF`、`WOFF2`。
```js
    const signature = parse.getTag(data, 0);
    if (signature === String.fromCharCode(0, 1, 0, 0) || signature === 'true' || signature === 'typ1') {
    } else if (signature === 'OTTO') {
    } else if (signature === 'wOFF') {
    } else if (signature === 'wOF2') {
    } else {
        throw new Error('Unsupported OpenType signature ' + signature);
    }
```
还需要注意的是，`signature`的值是的获取。从指定偏移位置开始，读取 4 个字节的数据，并将每个字节转换为字符，最终返回一个 4 字符的字符串标签。
```js
// Retrieve a 4-character tag from the DataView.
// Tags are used to identify tables.
function getTag(dataView, offset) {
    let tag = '';
    for (let i = offset; i < offset + 4; i += 1) {
        tag += String.fromCharCode(dataView.getInt8(i));
    }

    return tag;
}
```
#### 表入口信息获取
再看`TrueType`和`CFF`字体的处理，除了对`font.outlinesFormat`属性的设置之外。剩余的处理方式都是：获取表的个数`numTables`，再获取表的入口偏移信息。
```js
numTables = parse.getUShort(data, 4);
tableEntries = parseOpenTypeTableEntries(data, numTables);
```
```js
// Table Directory Entries //////////////////////////////////////////////
/**
 * Parses OpenType table entries.
 * @param  {DataView}
 * @param  {Number}
 * @return {Object[]}
 */
function parseOpenTypeTableEntries(data, numTables) {
    const tableEntries = [];
    let p = 12;
    for (let i = 0; i < numTables; i += 1) {
        const tag = parse.getTag(data, p);
        const checksum = parse.getULong(data, p + 4);
        const offset = parse.getULong(data, p + 8);
        const length = parse.getULong(data, p + 12);
        tableEntries.push({tag: tag, checksum: checksum, offset: offset, length: length, compression: false});
        p += 16;
    }

    return tableEntries;
}
```
```js
function getUShort(dataView, offset) {
    return dataView.getUint16(offset, false);
}
// Retrieve an unsigned 32-bit long from the DataView.
// The value is stored in big endian.
function getULong(dataView, offset) {
    return dataView.getUint32(offset, false);
}
```
留意到`tableEntries`获取的offset是从12开始的，而获取`numTables`是从4开始的，也仅仅是`getUnit16`。
#### 表信息标准描述
微软排版文档描述，[Microsoft Typography documentation: Organization of an OpenType Font](https://learn.microsoft.com/en-us/typography/opentype/otspec181/otff#organization-of-an-opentype-font)。
![Organization of an Opentype Font.png](https://s2.loli.net/2024/08/07/VhS8GrNTDQ3Aenw.png)
后续的描述就是`parseOpenTypeTableEntries`的结构信息了。

#### 表入口数据
以选择的AbrilFatface-Regular.otf 为例。我们可以打断点看看，这两步骤得到的结果，这里Opentype提供了网址，就直接在上面断点了。
![parse opentype.png](https://s2.loli.net/2024/08/07/HzeZS4gYq52sbOK.png)
这里有11个表，在入口分别有对应的名称、偏移量、长度、校验和。

#### 表数据解析
有了表入口信息，就可以通过`tableEntries`获取表的数据了。接下来的代码就是通过对应的`tag(name)`去选择对应的解析方式。有些表的信息需要依赖于别的表，则先暂时存起来。比如: name表需要依赖language表。
```js
    case 'ltag':
      table = uncompressTable(data, tableEntry);
      ltagTable = ltag.parse(table.data, table.offset);
      break;
		// ...
    case 'name':
      nameTableEntry = tableEntry;
      break;
		// ...
    const nameTable = uncompressTable(data, nameTableEntry);
    font.tables.name = _name.parse(nameTable.data, nameTable.offset, ltagTable);
    font.names = font.tables.name;
```
这里就简单看下`ltag`表的解析，`table = uncompressTable(data, tableEntry);`判断是否有压缩，比如WOFF压缩字体，这里没有entry数据就还是原来的。
#### ltag表的解析
```js
function parseLtagTable(data, start) {
    const p = new parse.Parser(data, start);
    const tableVersion = p.parseULong();
    check.argument(tableVersion === 1, 'Unsupported ltag table version.');
    // The 'ltag' specification does not define any flags; skip the field.
    p.skip('uLong', 1);
    const numTags = p.parseULong();

    const tags = [];
    for (let i = 0; i < numTags; i++) {
        let tag = '';
        const offset = start + p.parseUShort();
        const length = p.parseUShort();
        for (let j = offset; j < offset + length; ++j) {
            tag += String.fromCharCode(data.getInt8(j));
        }

        tags.push(tag);
    }

    return tags;
}
```
创了`p`这个`Parser`实例，包含各种长度`parseShort`、`parseULong`等。自动移动offset，避免每次手动传入位置。获取了table的version信息，而后就是循环的获取表内容了。找了好些个字体，都没有ltag表🤦🏻‍♀️

#### 解析小结
这里我们可以初步的了解到整个字体的解析过程，如需获取最终字形信息，可能需要经过多个表联合查询，比如loca获取字形数据的偏移量，glyf获取字形数据，又或者camp获取字符代码对应的字形索引。

### TTC字体集合的解析
回到前面提出的，ttc字体集合，应该怎么解析呢？参照文档对字体集合的处理 [Font Collections](https://learn.microsoft.com/en-us/typography/opentype/otspec181/otff#font-collections)，相信大家已经有办法解析了。
![TTC header.png](https://s2.loli.net/2024/08/07/AgdC4a6HYp3ZlJ9.png)
**注意：这里截图给出的是1.0的结构，更多的查看文档。**

### 最后
这次的分享就到这里了，对一些有按需解析，自定义解析的场景下，希望对大家有帮助。
