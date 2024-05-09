 +++
title = '零基礎實戰Flutter：Github自動構建APK Release分發'
date = 2024-04-05
draft = false

categories = ['flutter']
series = ['零基礎實戰Flutter']
+++

#### Github Actions是什麼

GitHub Actions 是 GitHub 的持續集成和持續部署（CI/CD）平台，允許用戶自動化他們的構建、測試和部署工作流程。通過在 GitHub 倉庫中創建工作流程，開發者可以在每次提交代碼、創建拉取請求（PR）、或者定義的其他事件發生時自動運行這些工作流程。

GitHub Actions 的工作流程是通過 YAML 文件定義的，這些文件位於倉庫的 `.github/workflows` 目錄中。

#### Github Release是什麼

GitHub Release 是 GitHub 提供的一個功能，它允許項目維護者和開發者將軟件的特定狀態作為“發布版”（Release）標記和管理。這通常用於分發項目的特定版本給最終用戶，包括編譯好的二進制文件、源代碼壓縮包和其他相關資料。

正常github代碼託管和版本控制，倉庫不上傳保存構建產物，原因有體積大、diff不了、構建產物多變等。所以提供了Release的方式發布構建產物。對於靜態網站，github還提供了github page託管。

  


### 觸發條件

Release作為穩定的分發版本，建議與Tag相對應。

打tag才算是完整的版號。`v1.0.0, v0.1.0-beta.1, v0.1.0-alpha.1`

```yaml
on:
  push:
    tags:
      - 'v*.*.*-*' # This will match tags like v1.0.0, v0.1.0-beta.1, v0.1.0-alpha.1
```

### 構建環境設置

運行環境設置為`ubuntu-latest` 通過 `java --version` 獲取本地構建的JDK版本。

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

### **創建依賴文件**

一些不允許公開的信息（比如：遠端服務器的Key、jks文件的密碼），yml文件如何獲取。可以預先維護在` Github > settings > Secrets and variables > Actions > * secrets  `中，就可以通過 `${{ secrets.* }}` 獲取。

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

JKS文件則，將文件轉換成base64格式，使用時候decode成文件即可。

```yaml
#...
      - name: Decode Keystore
        run: echo ${{ secrets.KEY_STORE_BASE64 }} | base64 --decode > android/upload-keystore.jks
#...
```

### 構建

至此，前置的依賴設置完畢。正常執行`  flutter build apk --split-per-abi ` 後，就能在該環境下看到構建的產物，而後我們需要發布到Github Release上。

### **創建Release**

後續針對Github openapi進行調用，需要申請Github 授權token才有權限操作。

**申請 Github token 個人頭像 > settings > developer settings > personal access tokens**

使用tag name作為release name，方便對應版本。release有是否存為draft 和設置pre字段，就直接發布不存draft，pre可以根據是否包含-beta等字段判斷。body作為release發布的描述，由於獲取tag msg較麻煩，直接使用當前tag commit msg，如果是feature功能合入main，再打tag，commit msg也合適作為release更新信息。

通過id將操作返回提供給下一個步驟。

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

### **上傳到Release**

這裡只給出了一個apk的上傳。

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

### 最終代碼文件

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


__[文檔由AI翻譯](/posts/blog/autotranslate/)__