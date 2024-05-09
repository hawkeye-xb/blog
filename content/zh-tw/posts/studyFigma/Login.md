 +++
title = '學習和研究Figma：登入功能'
date = 2024-04-30T10:09:26+08:00
draft = false

ShowReadingTime = true
ShowWordCount = true
isCJKLanguage = true

categories = ['學習']
tags = ['Electron', 'Figma']
series = ['學習和研究Figma']
+++

大家好。

今天我們來學習和研究Figma的登入功能，畢竟這是APP所有功能的核心基礎。

當我們作為前端研究某個網頁時，下意識地就是打開chrome devtool，Figma也保留了這個快捷鍵，在MacOS環境下，`command + option + i`就可以喚起。

### 加載遠端登入頁
打開Figma客戶端，一陣“白屏”之後，加載出簡單的登入頁面。切到Network快捷鍵`command + shift + R`強制刷新頁面。Doc加載的是`https://www.figma.com/login?locale=en&is_not_gen_0=true`的資源，果然加載的是遠端資源，一生要強的前端er們，時常和白屏做鬥爭。這裡登入頁面猜測都在Web專案維護，做了拆包，查看整體Network資源加載，總共3M多。

#### 白屏
即使只有3M多資源大小，對於現在國內網路環境，如果有插著網線的機器，更是微不足道。但是個人認為，這個頁面更新頻率不高，可以被劃分到本地的渲染進程裡，獨有的登入頁。隨安裝包分發到本地，通過loadFile加載更為合適。

也可能出於專案管理上的考慮，這麼小的內容不值得單獨管理，並再為之引入埋點、數據分析監控。

再回到Network，看到除了加載js文件，還加載了登入狀態對應提示資訊的JSON、兩種數據分析監控，甚至還連接了兩個ws。

![figma login load res 2024-04-30 11.27.30.png](https://s2.loli.net/2024/04/30/2APMHYSunZzb1Iv.png)

### 發起登入請求
不管點擊login還是create account，獲取該次登入的hash。
```
https://www.figma.com/api/session/app_auth
```
```json
{
  "meta": {
    "id": "auth_code_1",
    "app_type": "desktop"
  },
}
```
### Web授權
這時候會喚起默認瀏覽器，打開授權頁面，如: `https://www.figma.com/app_auth/{{ auth_code_1 }}/grant?desktop_protocol=figma&locale=en`。

打開的地址會攜帶重新喚起APP的協議頭`desktop_protocol=figma`。

#### electron喚起默認瀏覽器打開URL
框架默認支援功能。
```js
const { shell } = require('electron');

// 在默認瀏覽器中打開URL
shell.openExternal('https://www.example.com').then(() => {
  console.log('網頁已在瀏覽器中打開！');
}).catch(err => {
  console.error('打開瀏覽器失敗:', err);
});
```
##### 跨平台實現
在Windows上，可以使用ShellExecute或ShellExecuteEx函數。MacOS則是NSWorkspace的openURL方法，Linux有xdg-open。印象中幾個平台都支援，只是在Linux反向喚起APP的時候，設置比較麻煩。

#### 授權登入
到這裡完全就託管給web端去實現登入了，不管是未註冊、未登入還是直接授權，能都夠復用現有的Web能力了。為什麼要這麼做呢？直接將登入頁面嵌入客戶端，不更好嗎？如果登入與後續綁定倒是挺合適的，但是如果涉及到三方、單點登入這些場景，就不這麼好處理了。

舉個例子，假設需要接入第三方內部OA系統的授權登入，出於安全考慮，不允許在非安全客戶端環境下登入，這樣則需要接入該三方提供的SDK，或者將客戶端環境，設置成為可以被校驗安全的環境（比如固定的UA字段）。不管是修改環境還是接入SDK，都需要對客戶端做出兼容修改。一旦接入的客戶量足夠多，這種方案根本管理不過來，無法維護。況且，Web端也需要進行相應的兼容。

這裡跳轉到瀏覽器，使用Web的登入狀態，不管叫中介、代理還是什麼模式都好，就將客戶端和三方隔離開了。

再結合Figma面向團隊、組織這類ToB模式的產品，就更好理解客戶端為什麼選擇了這種登入方式了。

#### 同意授權
回到Figma登入流程，在web端有登入狀態之後，點擊授權，發起請求驗證登入。
```
https://www.figma.com/api/session/app_auth/{{ auth_code_1 }}/grant
```
```
{
  "error": false,
  "status": 200,
  "meta": {
    "id": "auth_code_1",
    "app_type": "desktop",
    "g_secret": "auth_code_2"
  },
  "i18n": null
}
```

#### URL Scheme，瀏覽器喚起electron客戶端
獲得g_secret資訊後，流程就需要重新喚起客戶端APP了。不管是桌面端還是移動端，外部喚起APP，都需要再URL Scheme表註冊內容，在協議請求的時候，會去校驗這個表，如存在對應協議，則會獲取協議的啟動路徑，執行APP的啟動文件。

electron 可以通過[protocol](https://www.electronjs.org/zh/docs/latest/api/protocol)模塊設置URL Scheme。
```js
const { app, protocol, net } = require('electron')

app.whenReady().then(() => {
  protocol.handle('atom', (request) =>
    net.fetch('file://' + request.url.slice('atom://'.length)))
})
```
或者通過構建工具如[electron builder](https://www.electron.build/api/programmatic-usage.html)配置。不太建議自行管理，需要兼容多平台。**另外需要注意殺毒軟件，可能會導致註冊失敗**.

接著我們將Network過濾狀態調整為過濾剛才請求頭的協議`figma://`。很明顯，將二次驗證的g_secret在喚起APP的時候傳遞過去了。
```
figma://app_auth/redeem?g_secret=auth_code_2
```

### 登入
流程回到客戶端，在授權之前把Network網路調成3G，方便我們觀察數據。直接的就能看到，客戶端使用`g_secret`請求接口，換取用戶id。
```
https://www.figma.com/api/session/app_auth/redeem

{
  g_secret: "auth_code_2"
}
```
```json
{
    "error": false,
    "status": 200,
    "meta": {
        "workspace": {
            "userId": "userId",
            "orgId": null
        }
    },
    "i18n": null
}
```

最終時序圖如下
![figma login time picture.png](https://s2.loli.net/2024/04/30/p3xLJrX2We1nvFj.png)

對著這完整的流程，為什麼要設計這麼多授權相關的code呢？直接將web端的登入狀態保持資訊（Cookie）給到客戶端不就可以了嗎？

首先在產品形態上，客戶端和Web不應該共用Cookie，也不能在URL通過明文傳輸（前端之間加密可以說是加寂寞），所以設計的`g_secret`，回看喚起客戶端的URL，這個值其實也很不安全，按道理客戶端需要保有用來處理`g_secret`值的資訊，並且在獲取用戶資訊的時候同時提供。換言之，第一步的id和g_secret對應不上也是不允許的。這裡Figma使用了一個臨時的回話，Cookie裡的figma.session來做這件事情，再進一步釋放了客戶端的複雜度。這裡沒做`g_secret`存活時間、在另外機器使用的驗證，原理都有做時效和使用次數的限制的。

在這整個流程中，目前還沒有認識到會是哪種具名的授權方式。大家如果知道，還望告知。

### 最後
最後總結下，本文主要拆解了Figma客戶端的登入整個流程，並且對Electron喚起瀏覽器、瀏覽器喚起Electron做了個簡單的介紹。

學習和研究Figma的登入功能，就先到這裡了，希望對您有幫助。

__[文檔由AI翻譯](/posts/blog/autotranslate/)__