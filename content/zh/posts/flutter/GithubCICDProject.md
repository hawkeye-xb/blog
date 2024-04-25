+++
title = '零基础实战Flutter：Github自动构建APK Release分发'
date = 2024-04-05
draft = false

categories = ['flutter']
+++

#### Github Actions是什么

GitHub Actions 是 GitHub 的持续集成和持续部署（CI/CD）平台，允许用户自动化他们的构建、测试和部署工作流程。通过在 GitHub 仓库中创建工作流程，开发者可以在每次提交代码、创建拉取请求（PR）、或者定义的其他事件发生时自动运行这些工作流程。

GitHub Actions 的工作流程是通过 YAML 文件定义的，这些文件位于仓库的 `.github/workflows` 目录中。

#### Github Release是什么

GitHub Release 是 GitHub 提供的一个功能，它允许项目维护者和开发者将软件的特定状态作为“发布版”（Release）标记和管理。这通常用于分发项目的特定版本给最终用户，包括编译好的二进制文件、源代码压缩包和其他相关资料。

正常github代码托管和版本控制，仓库不上传保存构建产物，原因有体积大、diff不了、构建产物多变等。所以提供了Release的方式发布构建产物。对于静态网站，github还提供了github page托管。

  


### 触发条件

Release作为稳定的分发版本，建议与Tag相对应。

打tag才算是完整的版号。`v1.0.0, v0.1.0-beta.1, v0.1.0-alpha.1`

```yaml
on:
  push:
    tags:
      - 'v*.*.*-*' # This will match tags like v1.0.0, v0.1.0-beta.1, v0.1.0-alpha.1
```

### 构建环境设置

运行环境设置为`ubuntu-latest` 通过 `java --version` 获取本地构建的JDK版本。

```yaml
jobs:
  build:
    # This job will run on ubuntu virtual machine
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'adopt'
```

### **创建依赖文件**

一些不允许公开的信息（比如：远端服务器的Key、jks文件的密码），yml文件如何获取。可以预先维护在` Github > settings > Secrets and variables > Actions > * secrets  `中，就可以通过 `${{ secrets.* }}` 获取。

```yaml
#...
      - name: Create Keystore Properties
        run: |
          echo "storePassword=${{ secrets.STORE_PASSWORD }}" > key.properties
          echo "keyPassword=${{ secrets.KEY_PASSWORD }}" >> key.properties
          echo "keyAlias=${{ secrets.KEY_ALIAS }}" >> key.properties
          echo "storeFile=../upload-keystore.jks" >> key.properties
          ls -laq
          cat key.properties
        working-directory: android
#...
```

JKS文件则，将文件转换成base64格式，使用时候decode成文件即可。

```yaml
#...
      - name: Decode Keystore
        run: echo ${{ secrets.KEY_STORE_BASE64 }} | base64 --decode > android/upload-keystore.jks
#...
```

### 构建

至此，前置的依赖设置完毕。正常执行`  flutter build apk --split-per-abi ` 后，就能在该环境下看到构建的产物，而后我们需要发布到Github Release上。

### **创建Release**

后续针对Github openapi进行调用，需要申请Github 授权token才有权限操作。

**申请 Github token 个人头像 > settings > developer settings > personal access tokens**

使用tag name作为release name，方便对应版本。release有是否存为draft 和设置pre字段，就直接发布不存draft，pre可以根据是否包含-beta等字段判断。body作为release发布的描述，由于获取tag msg较麻烦，直接使用当前tag commit msg，如果是feature功能合入main，再打tag，commit msg也合适作为release更新信息。

通过id将操作返回提供给下一个步骤。

```yaml
#...
      - name: Create Release
        id: create_release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.AUTH_TOKEN }}
        with:
          tag_name: ${{ github.ref_name }}
          release_name: ${{ github.ref_name }}
          draft: false
          prerelease: ${{ contains(github.ref, '-alpha') || contains(github.ref, '-beta') }}
          body: ${{ github.event.head_commit.message }}
#...
```

### **上传到Release**

这里只给出了一个apk的上传。

```yaml
      - name: Upload arm64-v8a Release Asset 
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.AUTH_TOKEN }}
        with:
          upload_url: ${{ steps.create_release.outputs.upload_url }}
          asset_path: ./build/app/outputs/flutter-apk/app-arm64-v8a-release.apk
          asset_name: app-arm64-v8a-release.apk
          asset_content_type: application/vnd.android.package-archive
```

### 最终代码文件

```yaml

name: Flutter CI

# This workflow is triggered on pushes to the repository.

on:
  push:
    tags:
      - 'v*.*.*-*' # This will match tags like v1.0.0, v0.1.0-beta.1, v0.1.0-alpha.1, etc.
    
# on: push    # Default will running for every branch.
    
jobs:
  build:
    # This job will run on ubuntu virtual machine
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'adopt'

      - name: Create Keystore Properties
        run: |
          echo "storePassword=${{ secrets.STORE_PASSWORD }}" > key.properties
          echo "keyPassword=${{ secrets.KEY_PASSWORD }}" >> key.properties
          echo "keyAlias=${{ secrets.KEY_ALIAS }}" >> key.properties
          echo "storeFile=../upload-keystore.jks" >> key.properties
          ls -laq
          cat key.properties
        working-directory: android

      - name: Decode Keystore
        run: echo ${{ secrets.KEY_STORE_BASE64 }} | base64 --decode > android/upload-keystore.jks
      
      - name: Ls Android Directory
        run: ls -laq
        working-directory: android
      
      - name: Install Flutter
        uses: subosito/flutter-action@v1
        with:
          flutter-version: '3.19.0'
          
      - name: Get dependencies
        run: flutter pub get
   
      - name: Build APK
        run: flutter build apk --split-per-abi

      - name: Ls output directory
        run: ls -laq build/app/outputs/flutter-apk/

      - name: Create Release
        id: create_release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.AUTH_TOKEN }}
        with:
          tag_name: ${{ github.ref_name }}
          release_name: ${{ github.ref_name }}
          draft: false
          prerelease: ${{ contains(github.ref, '-alpha') || contains(github.ref, '-beta') }}
          body: ${{ github.event.head_commit.message }}

      - name: Upload arm64-v8a Release Asset 
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.AUTH_TOKEN }}
        with:
          upload_url: ${{ steps.create_release.outputs.upload_url }}
          asset_path: ./build/app/outputs/flutter-apk/app-arm64-v8a-release.apk
          asset_name: app-arm64-v8a-release.apk
          asset_content_type: application/vnd.android.package-archive
      
      - name: Upload armeabi-v7a Release Asset 
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.AUTH_TOKEN }}
        with:
          upload_url: ${{ steps.create_release.outputs.upload_url }}
          asset_path: ./build/app/outputs/flutter-apk/app-armeabi-v7a-release.apk
          asset_name: app-armeabi-v7a-release.apk
          asset_content_type: application/vnd.android.package-archive

      - name: Upload x86_64 Release Asset 
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.AUTH_TOKEN }}
        with:
          upload_url: ${{ steps.create_release.outputs.upload_url }}
          asset_path: ./build/app/outputs/flutter-apk/app-x86_64-release.apk
          asset_name: app-x86_64-release.apk
          asset_content_type: application/vnd.android.package-archive
  
  
```
