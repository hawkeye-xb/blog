+++
title = '零基础实战Flutter：一些开发过程'
date = 2024-04-03
draft = false

categories = ['Flutter']
series = ['零基础实战Flutter']
+++

写完这整个项目，Flutter算是会了吧，但感觉啥也没学会，基本所有的问题和内容，都是通过GPT的帮助完成的，用不着脑子，根本用不着🐶。    
Flutter的组件特性、如何使用就不做过多说明了，简单展示下通过直接询问GPT，得到几个例如路由、本地数据存储等关键点的代码，AI使用好了可以快速的让人在某些没接触过的内容上到达一定的水准，但不一定对，得思考和质疑。

### **路由：**
鉴于功能简单，仅有一个页面跳转场景，也就是首页跳转编辑页。回到列表页面时候更新展示数据

```Dart
Navigator.push(context, MaterialPageRoute(builder: (context) {
  return DetailsPage(defaultCardInfo: value,);
})).then((_) => {
  // 在这里获取新的数据并更新状态
});
```

再增加路由返回之前拦截，做原始数据的改动检测；

```Dart
WillPopScope(onWillPop: _onWillPop, child:）
```

### **本地持久化：**

GPT给出了SharedPreferences、SQLite、文件存储等不少方案。

虽然功能简单，需要的数据结构也不复杂，键 - 值对的本地存储结构也能满足，出于如果要转成多平台、设备数据同步，就少不了使用服务器了（当然印象中IOS可以使用iCloud的api做到数据同步，后续探索），出于这个考虑选择了SQLite。

DB的操作GPT给出代码基本可用。

这里节选部分代码，在DB版本升级，需要新增字段的时候给得不太清晰，但自己稍微试试也能得到结果。

```Dart
class DatabaseHelper {
  static final DatabaseHelper _instance = DatabaseHelper.internal();
  factory DatabaseHelper() => _instance;
  DatabaseHelper.internal();
  static Database? _db;
  Future<Database> get db async {
    _db ??= await initDb();
    return _db!;
  }
  initDb() async {
    var databasesPath = await getDatabasesPath();
    String path = join(databasesPath, 'card_type_db.db');
    var db = await openDatabase(path, version: 2, onCreate: _onCreate, onUpgrade: _onUpgrade);
    return db;
  }
  void _onCreate(Database db, int newVersion) async {
    await db.execute('''
      CREATE TABLE CardType (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        contentList TEXT,
        created_at INTEGER,
        updated_at INTEGER,
        favorite INTEGER DEFAULT 0
      )
    '''); // 结尾逗号不能要
  }
  void _onUpgrade(Database db, int oldVersion, int newVersion) async {
    // 如果旧版本小于2，那么添加favorite字段
    if (oldVersion < 2) {
      await db.execute('ALTER TABLE CardType ADD COLUMN favorite INTEGER DEFAULT 0');
    }
  }

  // ...
}
```

### 颜色：

Flutter的颜色管理方式很系统（印象中使用antd做web后台管理系统时候处理过，但是有没有这么系统不太确认），所以单独作为一个功能项来讲述，后续可以调研在web开发中可以怎么参照。

Flutter中可以非常简单的只设定一个主题色，直接影响整个系统的各种颜色，代码如下。

```Dart
 @override
  Widget build(BuildContext context) {
    final ColorScheme colorScheme = ColorScheme.fromSeed(
      seedColor: Colors.deepPurple,
      // background: backgroundColor,
    );

    return MaterialApp(
      theme: ThemeData(
        colorScheme: colorScheme,
        useMaterial3: true,
        // scaffoldBackgroundColor: backgroundColor,
      ),
      home: const MyHomePage(),
    );
  }
```

```Dart
color: Theme.of(context).colorScheme.surfaceVariant,
```

理论上Web也有类似的。

大部分公司有设计师的情况下，颜色体系（使用Material3或者其它）都由设计师标定，再通过全局统一的css文件给出名称。但是在个人开发或者企业定制化的后台管理系统开发等场景下，这个颜色方案无比的适合。

### 无障碍功能：

不知道有多少APP会主动考虑这些无障碍功能，我也是在Google Play发布前测试报告提示的时候才想起，可能发布很多平台，都不会有这样的提示。不管发布什么平台，虽然可能这部分群体较少，但是我还是希望更多人在做APP的时候，能兼顾到常规之外的群体。

AI提示Flutter 里面使用Semantics 组件包裹，可以为内容提供标签。

```Dart
Semantics(
  button: true,
  label: '保存修改',
  child: const Icon(Icons.check),
),
```

（但是尝试给Scaffold 的 Appbar添加title，包裹到Semantics 组件，页面也依旧没有内容标签，有待后续研究。或者有大佬能给解答下，先行谢过）

更多Flutter相关内容，会尝试整理出来，但是可能目前项目上用到的Flutter知识并没有这么需要由我来再讲述。针对语料较多的代码，直接询问AI，都能得到挺好的结果的，甚至都不需要对AI进行PUA，调各种各样的提示词，如果非得这样，还不如直接自己去查找答案更来得省心。
后续也将会斗胆谈谈这些时间做AI应用，和对AI的理解。
<!-- 
----
[上一篇：环境搭建](https://juejin.cn/post/7352763168902889526)    
[下一篇：打包构建](https://juejin.cn/post/7355525978595868724) -->