 +++
title = '零基礎實戰Flutter：打包APK、AAB'
date = 2024-04-04
draft = false
+++

## .apk和.aab 的區別

.apk（Android Package）和.aab（Android App Bundle）是Android應用程式的兩種不同的發布格式。

.apk是一個靜態的文件，意味著它包含了應用程式的所有可能變體，不論設備的配置如何，所有用戶都會下載和安裝相同的APK文件。

.aab文件是由Google推出，用於更高效地分發應用程式的發布格式。開發者上傳一個包含應用程式所有編譯代碼和資源的捆綁包到Google Play，然後用戶只會下載他們需要的代碼和資源，這通常會導致更小的應用程式下載大小和更高效應用程式安裝。

較為明顯的區別有：

-   apk可以任何渠道分發。aab只能在Google Play分發，國內平台目前好像只有華為有類似的。
-   apk需要自己管理不同的“變體”，比如Flutter構建的**app-armeabi-v7a-release.apk、app-arm64-v8a-release.apk。** aab則是由Google Play自動處理。

## 打包構建

打包構建apk、aab的過程都能在Flutter找到文檔。[Build and release an Android app](https://docs.flutter.dev/deployment/android)

打包構建之前需要到 `android/app/build.gradle` 修改 `applicationId`。

### 創建.jks文件

`.jks` 是 Java KeyStore 的縮寫，它是由 Java 提供的密鑰庫文件格式，用於存儲密鑰和證書。它幫助用戶保護密鑰庫中的密鑰（私鑰）和證書鏈，以便安全地管理密鑰和證書。

#### 配置Java環境變量

我本地依賴是通過Android studio安裝的，沒有export到環境變量，所以無法直接終端`java --version`這種操作；可以通過在`build tool > Gradle > Default Gradle JDK`的地址中，找到類似`/Applications/Android\ Studio.app/Contents/jbr/Contents/Home/bin/java --version` 的調用，查看openjdk。

還是建議導出java，後續其它情況使用也更方便。

```
 # vim ~/.zshrc
export JAVA_HOME=/Applications/Android\ Studio.app/Contents/jbr/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
# source ~/.zshrc
```

#### Android studio 創建.jks

菜單找到 `build > Generate Signed Bundle or APK > apk > next` 即可。

[Android studio創建jks](https://developer.android.com/studio/publish/app-signing#generate-key)

#### 終端創建.jks

macOS\linux

```
keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA \
        -keysize 2048 -validity 10000 -alias upload
```

-   `keystore`: 指定密鑰庫的存儲路徑和文件名。
-   `keyalg`: 指定密鑰算法。在這個例子中，使用的是 rsa 算法。
-   `validity`: 指定密鑰的有效期，單位是天。在這個例子中，密鑰的有效期被設置為 10000 天。
-   `alias`: 指定密鑰條目的別名。注意這個配置文件會用到。

  


Windows

```
keytool -genkey -v -keystore %userprofile%\upload-keystore.jks ^
        -storetype JKS -keyalg RSA -keysize 2048 -validity 10000 ^
        -alias upload
```

### 構建apk

#### 創建keystore文件和修改gradle

創建`[project]/android/key.properties` 文件，為打包提供加密信息。**注意需要將密碼和jks文件私有，盡量不上傳公開平台。**

```
storePassword=密碼
keyPassword=密碼
keyAlias=別名upload
storeFile=jks文件路徑
```

給`[project]/android/app/build.gradle`添加代碼

```
// 引入文件
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

// 使用文件信息簽名
signingConfigs {
   release {
       keyAlias keystoreProperties['keyAlias']
       keyPassword keystoreProperties['keyPassword']
       storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
       storePassword keystoreProperties['storePassword']
   }
}

buildTypes {
    release {
        // TODO: Add your own signing config for the release build.
        // Signing with the debug keys for now, so `flutter run --release` works.
        // signingConfig signingConfigs.debug
        signingConfig signingConfigs.release // 使用上面release的配置，可以配置debug的
    }
}
```

#### 打包

`flutter build apk --split-per-abi`.

默認使用Release配置，當然有不同環境需要也可以添加不同配置。

會在`[project]/build/app/outputs/apk/release/` 下生成`app-armeabi-v7a-release`、`app-arm64-v8a-release`、`app-x86_64-release` 三個apk文件。分別對應arm32（舊版手機，兼容性分發）、arm64（現代正常的手機）、x86三種架構。

刪除`--split-per-abi` 指令參數會打包兼容三種架構的，可以簡單理解為三合一。建議還是分開管理，也回到開頭，aab和apk的區別了，apk需要自行管理多種架構。

### 構建aab

打包aab就簡單多了，做完前置步驟，直接`flutter build appbundle` 就能在`[project]/build/app/outputs/bundle/release/app.aab`路徑下看到產出的文件了。可以發現文件大小是拆包apk後的三倍，其實就是三合一，在Google Play下的時候會處理。

<!-- ----
[上一篇：項目開發的一些過程](https://juejin.cn/post/7355389990531416116)
[下一篇：在Github分發APK](https://juejin.cn/post/7355677638880509987) -->

__[文檔由AI翻譯](/posts/blog/autotranslate/)__