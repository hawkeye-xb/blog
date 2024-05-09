 +++
title = '零基礎實戰Flutter：環境搭建(macOS M晶片)'
date = 2024-04-02
draft = false
+++

搭載MacOS M1晶片的機器。

[開始在macOS上建立Flutter iOS應用程式](https://docs.flutter.dev/get-started/install/macos/mobile-ios?tab=download)

直接按照文件操作也能完成，M系列晶片在安裝某些依賴時略顯麻煩。

### Rosetta

M晶片執行x86_64指令集的相容層，使用softwareupdate安裝Rosetta並接受協議。

```jsx
sudo softwareupdate --install-rosetta --agree-to-license
```

### **初始化 Flutter SDK**

下載對應的SDK包，建立並解壓到`~/development/`目錄，將bin檔案PATH導出（如果想換目錄，修改導出的路徑即可）。下面這些步驟官網都挺齊全。

1. 下載位置：https://docs.flutter.dev/release/archive?tab=macos 
2. 建立目錄 ~/development/ 
3. 解壓SDK（注意替換包名）

```jsx
unzip ~/development/flutter_sdk_v1.0.0.zip -d ~/development/
```

1. 建立或修改 ~/.zshenv 檔案
2. 最後添加bin導出

```jsx
export PATH=$HOME/development/flutter/bin:$PATH
```

1. 重新打開新的終端

### 開發環境

建議直接下載xcode、Android studio，使用工具鏈方便。過程可以多次`flutter doctor`檢查缺失的工具。如果不做IOS或者Android開發，可以無視flutter doctor的相關錯誤。

M系列下載 CocoaPod參考：

[如何在Apple Silicon (M1)上運行CocoaPods](https://stackoverflow.com/questions/64901180/how-to-run-cocoapods-on-apple-silicon-m1)

### 開發工具

安裝對應開發工具的Flutter開發插件，使用對應方法建立並啟動專案。

### CMD

```jsx
flutter create my_app
cd my_app
flutter pub get
flutter run
```

終端每次啟動之後會輸出以下內容：

```jsx
Installing build/app/outputs/flutter-apk/app-debug.apk...           9.3s
Syncing files to device sdk gphone64 arm64...                      147ms

Flutter run key commands.
r Hot reload. 🔥🔥🔥
R Hot restart.
h List all available interactive commands.
d Detach (terminate "flutter run" but leave application running).
c Clear the screen
q Quit (terminate the application on the device).

A Dart VM Service on sdk gphone64 arm64 is available at: http://127.0.0.1:56456/1Aldd0I28OM=/
The Flutter DevTools debugger and profiler on sdk gphone64 arm64 is available at: http://127.0.0.1:9100?uri=http://127.0.0.1:56456/1Aldd0I28OM=/
```
至此，就可以進行專案的開發，想法的實現了~

稍微需要注意的是：

r熱更新，vscode啟動的save代碼會自動執行 r熱更新；部分需要重啟專案，R，在終端輸入就可以。

還有可以看到最後一行輸出的地址，在瀏覽器輸入，能看到devTool，調試使用。

----
<!-- [下一篇：專案開發的一些過程](https://juejin.cn/post/7355389990531416116) -->

__[文件由AI翻譯](/posts/blog/autotranslate/)__