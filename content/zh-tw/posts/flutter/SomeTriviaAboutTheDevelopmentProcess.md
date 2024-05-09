 +++
title = '零基礎實戰Flutter：一些開發過程'
date = 2024-04-03
draft = false

categories = ['flutter']
series = ['零基礎實戰Flutter']
+++

完成整個專案後，Flutter應該算是會了吧，但感覺什麼也沒學會，基本上所有問題和內容都是通過GPT的幫助完成的，用不著腦子，根本用不著🐶。
Flutter的組件特性、如何使用就不做過多說明了，簡單展示下通過直接詢問GPT，得到幾個例如路由、本地數據存儲等關鍵點的代碼，AI使用好了可以快速的讓人在某些沒接觸過的內容上達到一定的水準，但不一定對，得思考和質疑。

### **路由：**
鑒於功能簡單，僅有一個頁面跳轉場景，也就是首頁跳轉編輯頁。回到列表頁面時候更新展示數據

```Dart
Navigator.push(context, MaterialPageRoute(builder: (context) {
  return DetailsPage(defaultCardInfo: value,);
})).then((_) => {
  // 在這裡獲取新的數據並更新狀態
});
```

再增加路由返回之前攔截，做原始數據的改動檢測；

```Dart
WillPopScope(onWillPop: _onWillPop, child:）
```

### **本地持久化：**

GPT給出了SharedPreferences、SQLite、文件存儲等不少方案。

雖然功能簡單，需要的數據結構也不複雜，鍵 - 值對的本地存儲結構也能滿足，出於如果要轉成多平台、設備數據同步，就少不了使用服務器了（當然印象中IOS可以使用iCloud的api做到數據同步，後續探索），出於這個考慮選擇了SQLite。

DB的操作GPT給出代碼基本可用。

這裡節選部分代碼，在DB版本升級，需要新增字段的時候給得不太清晰，但自己稍微試試也能得到結果。

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
    '''); // 結尾逗號不能要
  }
  void _onUpgrade(Database db, int oldVersion, int newVersion) async {
    // 如果舊版本小於2，那麼添加favorite字段
    if (oldVersion < 2) {
      await db.execute('ALTER TABLE CardType ADD COLUMN favorite INTEGER DEFAULT 0');
    }
  }

  // ...
}
```

### 顏色：

Flutter的顏色管理方式很系統（印象中使用antd做web後台管理系統時候處理過，但是有沒有這麼系統不太確認），所以單獨作為一個功能項來講述，後續可以調研在web開發中可以怎麼參照。

Flutter中可以非常簡單的只設定一個主題色，直接影響整個系統的各種顏色，代碼如下。

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

理論上Web也有類似的。

大部分公司有設計師的情況下，顏色體系（使用Material3或者其它）都由設計師標定，再通過全局統一的css文件給出名稱。但是在個人開發或者企業定制化的後台管理系統開發等場景下，這個顏色方案無比的適合。

### 無障礙功能：

不知道有多少APP會主動考慮這些無障礙功能，我也是在Google Play發布前測試報告提示的時候才想起，可能發布很多平台，都不會有這樣的提示。不管發布什麼平台，雖然可能這部分群體較少，但是我还是希望更多人在做APP的時候，能兼顧到常規之外的群體。

AI提示Flutter 裡面使用Semantics 組件包裹，可以為內容提供標籤。

```Dart
Semantics(
  button: true,
  label: '保存修改',
  child: const Icon(Icons.check),
),
```

（但是嘗試給Scaffold 的 Appbar添加title，包裹到Semantics 組件，頁面也依舊沒有內容標籤，有待後續研究。或者有大佬能給解答下，先行謝過）

更多Flutter相關內容，會嘗試整理出來，但是可能目前專案上用到的Flutter知識並沒有這麼需要由我來再講述。針對語料較多的代碼，直接詢問AI，都能得到挺好的結果的，甚至都不需要對AI進行PUA，調各種各樣的提示詞，如果非得這樣，還不如直接自己去查找答案更來得省心。
後續也將會斗膽談談這些時間做AI應用，和對AI的理解。
<!-- 
----
[上一篇：環境搭建](https://juejin.cn/post/7352763168902889526)    
[下一篇：打包構建](https://juejin.cn/post/7355525978595868724) -->

__[文檔由AI翻譯](/posts/blog/autotranslate/)__