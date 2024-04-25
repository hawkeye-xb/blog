+++
title = '零基础实战Flutter：打包APK、AAB'
date = 2024-04-04
draft = false

categories = ['flutter']
+++

## .apk和.aab 的区别

.apk（Android Package）和.aab（Android App Bundle）是Android应用程序的两种不同的发布格式。

.apk是一个静态的文件，意味着它包含了应用程序的所有可能变体，不论设备的配置如何，所有用户都会下载和安装相同的APK文件。

.aab文件是由Google推出，用于更高效地分发应用程序的发布格式。开发者上传一个包含应用程序所有编译代码和资源的捆绑包到Google Play，然后用户只会下载他们需要的代码和资源，这通常会导致更小的应用程序下载大小和更高效的应用程序安装。

较为明显的区别有：

-   apk可以任何渠道分发。aab只能在Google Play分发，国内平台目前好像只有华为有类似的。
-   apk需要自己管理不同的“变体”，比如Flutter构建的**app-armeabi-v7a-release.apk、app-arm64-v8a-release.apk。** aab则是由Google Play自动处理。

## 打包构建

打包构建apk、aab的过程都能在Flutter找到文档。[Build and release an Android app](https://docs.flutter.dev/deployment/android)

打包构建之前需要到 `android/app/build.gradle` 修改 `applicationId`。

### 创建.jks文件

`.jks` 是 Java KeyStore 的缩写，它是由 Java 提供的密钥库文件格式，用于存储密钥和证书。它帮助用户保护密钥库中的密钥（私钥）和证书链，以便安全地管理密钥和证书。

#### 配置Java环境变量

我本地依赖是通过Android studio安装的，没有export到环境变量，所以无法直接终端`java --version`这种操作；可以通过在`build tool > Gradle > Default Gradle JDK`的地址中，找到类似`/Applications/Android\ Studio.app/Contents/jbr/Contents/Home/bin/java --version` 的调用，查看openjdk。

还是建议导出java，后续其它情况使用也更方便。

```
 # vim ~/.zshrc
export JAVA_HOME=/Applications/Android\ Studio.app/Contents/jbr/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
# source ~/.zshrc
```

#### Android studio 创建.jks

菜单找到 `build > Generate Signed Bundle or APK > apk > next` 即可。

[Android studio创建jks](https://developer.android.com/studio/publish/app-signing#generate-key)

#### 终端创建.jks

macOS\linux

```
keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA \
        -keysize 2048 -validity 10000 -alias upload
```

-   `keystore`: 指定密钥库的存储路径和文件名。
-   `keyalg`: 指定密钥算法。在这个例子中，使用的是 rsa 算法。
-   `validity`: 指定密钥的有效期，单位是天。在这个例子中，密钥的有效期被设置为 10000 天。
-   `alias`: 指定密钥条目的别名。注意这个配置文件会用到。

  


Windows

```
keytool -genkey -v -keystore %userprofile%\upload-keystore.jks ^
        -storetype JKS -keyalg RSA -keysize 2048 -validity 10000 ^
        -alias upload
```

### 构建apk

#### 创建keystore文件和修改gradle

创建`[project]/android/key.properties` 文件，为打包提供加密信息。**注意需要将密码和jks文件私有，尽量不上传公开平台。**

```
storePassword=密码
keyPassword=密码
keyAlias=别名upload
storeFile=jks文件路径
```

给`[project]/android/app/build.gradle`添加代码

```
// 引入文件
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

// 使用文件信息签名
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

默认使用Release配置，当然有不同环境需要也可以添加不同配置。

会在`[project]/build/app/outputs/apk/release/` 下生成`app-armeabi-v7a-release`、`app-arm64-v8a-release`、`app-x86_64-release` 三个apk文件。分别对应arm32（旧版手机，兼容性分发）、arm64（现代正常的手机）、x86三种架构。

删除`--split-per-abi` 指令参数会打包兼容三种架构的，可以简单理解为三合一。建议还是分开管理，也回到开头，aab和apk的区别了，apk需要自行管理多种架构。

### 构建aab

打包aab就简单多了，做完前置步骤，直接`flutter build appbundle` 就能在`[project]/build/app/outputs/bundle/release/app.aab`路径下看到产出的文件了。可以发现文件大小是拆包apk后的三倍，其实就是三合一，在Google Play下的时候会处理。

<!-- ----
[上一篇：项目开发的一些过程](https://juejin.cn/post/7355389990531416116)
[下一篇：在Github分发APK](https://juejin.cn/post/7355677638880509987) -->