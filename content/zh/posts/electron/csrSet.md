---
title: macOS Developer ID Application 自分发证书申请与 GitHub Actions 自动化构建
date: 2026-01-09
draft: false
description: '详解 macOS 代码签名证书申请流程，GitHub Actions 自动化构建配置，以及常见错误排查方法'
categories:
  - Electron
series:
  - Electron
tags:
  - macOS
  - Code Signing
  - GitHub Actions
  - CI/CD
---

> 本文介绍如何申请 macOS 代码签名证书，并配置到 GitHub Actions 中实现自动化构建。

## 一、证书类型选择

### macOS 应用分发证书对比

| 证书类型 | 用途 | 分发渠道 |
|---------|------|---------|
| **Developer ID Application** | 签名 .app 文件 | Mac App Store **外部**（网站下载、直接分发） |
| **Apple Distribution** | 提交审核和发布 | Mac App Store **内部** |

**关键区别**：
- Developer ID Application：无需审核，可自由分发，通过 Gatekeeper 验证
- Apple Distribution：必须经过 Apple 审核，只能通过 App Store 分发
- 两种证书**不能混用**，选择后无法更改分发渠道

## 二、证书申请流程

### 1. 生成证书签名请求 (CSR)

在 macOS 上操作：

```bash
应用程序 > 实用工具 > 钥匙串访问.app
```

1. 菜单栏选择：`钥匙串访问 > 证书助理 > 从证书颁发机构请求证书`
2. 填写信息：
   - 用户电子邮件地址：Apple 开发者账号邮箱
   - 常用名称：你的名字或公司名称
   - CA 电子邮件地址：**留空**
   - 请求是：选择 **"存储到磁盘"**
3. （可选）勾选 "让我指定密钥对信息"：
   - 密钥大小：2048 位
   - 算法：RSA
4. 保存为：`CertificateSigningRequest.certSigningRequest`

### 2. 在 Apple Developer 创建证书

1. 登录 [Apple Developer](https://developer.apple.com/account/)
2. 进入 `Certificates, Identifiers & Profiles`
3. 点击 `+` 创建新证书
4. 选择 **Developer ID Application**
5. 选择 **G2 Sub-CA**（推荐，有效期至 2031 年）
6. 上传刚才生成的 CSR 文件
7. 下载生成的 `.cer` 证书文件

### 3. 安装证书

双击下载的 `.cer` 文件，自动添加到钥匙串。

验证：打开钥匙串访问，在 **"我的证书"** 中查看：

```
🔑 Developer ID Application: Your Name (TEAM_ID)
  └── 🔐 私钥 (private key)
```

## 三、配置 GitHub Actions

### 1. 导出证书为 .p12

在钥匙串访问中：

1. 选中证书（不是展开的私钥）
2. 右键 > **"导出"**
3. 文件格式：选择 **"个人信息交换 (.p12)"**
4. 设置密码（记住这个密码！）

### 2. 转换为 Base64

```bash
# 转换并复制到剪贴板
base64 -i /path/to/certificate.p12 | pbcopy
```

### 3. 配置 GitHub Secrets

#### Repository Secrets（推荐用于私有仓库）

仓库 `Settings` > `Secrets and variables` > `Actions` > `New repository secret`

添加两个 Secrets：

| Name | Value |
|------|-------|
| `MACOS_CERTIFICATE` | 粘贴 Base64 字符串 |
| `MACOS_CERTIFICATE_PWD` | .p12 导出时设置的密码 |

#### Organization Secrets（用于公开仓库）

组织 `Settings` > `Secrets and variables` > `Actions` > `New organization secret`

- **免费计划**：只能选择 "Public repositories"
- **付费计划**：可选 "Private repositories" 或 "Selected repositories"

### 4. GitHub Actions Workflow 配置

创建 `.github/workflows/build-macos.yml`：

```yaml
name: Build and Release macOS App

on:
  push:
    tags:
      - 'v*.*.*-beta'
      - 'v*.*.*'

jobs:
  build:
    runs-on: macos-latest
    permissions:
      contents: write  # Required for creating releases
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      # 重要：Python 3.12+ 移除了 distutils，导致 node-gyp 编译失败
      # 使用 Python 3.11 或更早版本来编译原生模块
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22.14.0'
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8
      
      - name: Import Apple Developer Certificate
        env:
          BUILD_CERTIFICATE_BASE64: ${{ secrets.MACOS_CERTIFICATE }}
          P12_PASSWORD: ${{ secrets.MACOS_CERTIFICATE_PWD }}
          KEYCHAIN_PASSWORD: ${{ secrets.KEYCHAIN_PASSWORD || 'temp_keychain_password_123456' }}
        run: |
          # Create temporary keychain
          security create-keychain -p "$KEYCHAIN_PASSWORD" build.keychain
          security default-keychain -s build.keychain
          security unlock-keychain -p "$KEYCHAIN_PASSWORD" build.keychain
          security set-keychain-settings -t 3600 -u build.keychain
          
          # Import certificate
          echo $BUILD_CERTIFICATE_BASE64 | base64 --decode > certificate.p12
          security import certificate.p12 -k build.keychain -P "$P12_PASSWORD" -T /usr/bin/codesign
          security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "$KEYCHAIN_PASSWORD" build.keychain
          
          # 重要：自动提取证书身份，去掉 "Developer ID Application:" 前缀
          # electron-builder 不接受带前缀的证书名称
          CERT_IDENTITY=$(security find-identity -v -p codesigning build.keychain | grep "Developer ID Application" | head -1 | sed -n 's/.*"Developer ID Application: \(.*\)"/\1/p')
          if [ -z "$CERT_IDENTITY" ]; then
            echo "❌ Error: Failed to extract certificate identity from keychain"
            echo "Available identities:"
            security find-identity -v -p codesigning build.keychain
            exit 1
          fi
          echo "CSC_IDENTITY=$CERT_IDENTITY" >> $GITHUB_ENV
          echo "✓ Certificate identity extracted: $CERT_IDENTITY"
          
          # Clean up certificate file
          rm certificate.p12
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build application
        run: pnpm run build
      
      - name: Package application
        run: pnpm run pkg:mac:prod
        env:
          # CSC_IDENTITY 已在上一步自动设置到 GITHUB_ENV
          # 公证凭据（可选，如需公证）
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
      
      - name: Upload to GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            dist-electron/*.dmg
            dist-electron/*.zip
            dist-electron/latest-mac.yml
          prerelease: ${{ contains(github.ref_name, 'beta') }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Clean up keychain
        if: always()
        run: |
          security delete-keychain build.keychain || true
```

## 四、electron-builder 配置

### 1. 基础配置

`electron-builder.config.js`：

```javascript
const baseConfig = {
  appId: 'com.example.myapp',
  productName: 'MyApp',
  mac: {
    target: [
      { target: 'dmg', arch: ['arm64'] },
      { target: 'zip', arch: ['arm64'] }
    ],
    icon: 'build/logo.png',
    category: 'public.app-category.productivity',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.inherit.plist',
    // 关键：让 electron-builder 从环境变量读取证书身份
    // undefined 时会自动在 keychain 中查找
    identity: process.env.CSC_IDENTITY,
    // 使用自定义公证脚本
    notarize: false
  }
};

const config = {
  development: {
    ...baseConfig,
    appId: 'com.example.myapp.dev',
    mac: {
      ...baseConfig.mac,
      identity: null  // 开发环境不签名
    }
  },
  production: {
    ...baseConfig,
    // 生产环境启用公证
    afterSign: 'notarize.cjs'
  }
};

const env = process.env.NODE_ENV || 'production';
export default config[env] || config.production;
```

### 2. 公证脚本配置

`notarize.cjs`：

```javascript
const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${appOutDir}/${appName}.app`;
  // 重要：从 context 动态获取 Bundle ID，确保一致性
  const appBundleId = context.packager.appInfo.id;

  const appleId = process.env.APPLE_ID;
  const appleIdPassword = process.env.APPLE_APP_SPECIFIC_PASSWORD;
  const teamId = process.env.APPLE_TEAM_ID;

  // 凭据缺失时优雅跳过
  if (!appleId || !appleIdPassword || !teamId) {
    console.log('⏭️  Skipping notarization: missing Apple credentials');
    return;
  }

  console.log('🔐 Starting Apple notarization...');
  
  await notarize({
    tool: 'notarytool',
    appBundleId: appBundleId,  // 使用动态获取的 ID
    appPath: appPath,
    appleId: appleId,
    appleIdPassword: appleIdPassword,
    teamId: teamId,
  });

  console.log('✅ Notarization completed');
};
```

### 3. 关键配置说明

| 配置项 | 说明 | 常见错误 |
|--------|------|---------|
| `identity` | 证书身份标识 | ❌ 不要硬编码，容易泄露 |
| `appBundleId` | 应用 Bundle ID | ❌ 必须与 `appId` 一致 |
| `CSC_IDENTITY` | 环境变量，格式如 `"Your Name (TEAM_ID)"` | ❌ 不能包含 `"Developer ID Application:"` 前缀 |

## 五、重要提示

### 证书数量限制

一个 Apple Developer 账号可以创建：
- ✅ 最多 **5 个** Developer ID Application 证书
- ✅ 最多 **5 个** Developer ID Installer 证书
- 证书有效期：**5 年**

### GitHub Secrets 优先级

```
Repository Secret (最高优先级)
    ↓
Organization Secret
    ↓
Environment Secret (最低优先级)
```

仓库级别的 Secret 会**覆盖**同名的组织级别 Secret。

### 安全建议

- ❌ 不要将 `.p12` 文件提交到 Git
- ✅ 使用强密码保护 `.p12` 文件
- ✅ 定期检查证书有效期
- ✅ 如证书泄露，立即在 Apple Developer 撤销

## 六、常见问题与错误排查

### 基础问题

**Q: Developer ID 签名的应用能上传 App Store 吗？**  
A: 不能。必须使用 Apple Distribution 证书重新签名。

**Q: 证书过期后已发布的应用还能用吗？**  
A: 可以。用户仍可下载和运行已签名的应用，但无法签名新版本。

**Q: 私有仓库能使用组织的免费 Secrets 吗？**  
A: 不能。免费计划只支持公开仓库，私有仓库需使用 Repository Secrets 或升级付费计划。

### 常见错误

#### 1. `ModuleNotFoundError: No module named 'distutils'`

**原因**：Python 3.12+ 移除了 `distutils` 模块，导致 `node-gyp` 编译原生模块失败。

**解决方案**：在 workflow 中指定 Python 3.11：

```yaml
- name: Setup Python
  uses: actions/setup-python@v5
  with:
    python-version: '3.11'
```

#### 2. `Please remove prefix "Developer ID Application:" from the specified name`

**原因**：electron-builder 不接受带前缀的证书名称。

**错误示例**：
```bash
CSC_IDENTITY="Developer ID Application: Your Name (TEAM_ID)"  # ❌
```

**正确格式**：
```bash
CSC_IDENTITY="Your Name (TEAM_ID)"  # ✅
```

**自动提取**：
```bash
# 使用 sed 去掉前缀
CERT_IDENTITY=$(security find-identity -v -p codesigning build.keychain | \
  grep "Developer ID Application" | head -1 | \
  sed -n 's/.*"Developer ID Application: \(.*\)"/\1/p')
```

#### 3. `skipped macOS code signing: reason=identity explicitly is set to null`

**原因**：`identity` 配置为 `null`，electron-builder 跳过签名。

**解决方案**：

```javascript
// ❌ 错误
identity: process.env.CSC_IDENTITY || null

// ✅ 正确 - undefined 时自动检测
identity: process.env.CSC_IDENTITY
```

#### 4. 公证失败：`app is not signed` 或 Bundle ID 不匹配

**原因**：应用未签名，或 `notarize.cjs` 中硬编码了错误的 Bundle ID。

**解决方案**：

```javascript
// ❌ 错误 - 硬编码
appBundleId: 'com.example.wrongapp'

// ✅ 正确 - 动态获取
const appBundleId = context.packager.appInfo.id;
```

#### 5. `electron-rebuild` 失败

**原因**：缺少编译工具或 Python 版本不兼容。

**解决方案**：
1. 确保安装了 Xcode Command Line Tools
2. 使用 Python 3.11 或更早版本
3. 检查 `package.json`：

```json
{
  "scripts": {
    "postinstall": "electron-rebuild -f -w native-module-name"
  }
}
```

### 调试技巧

#### 查看本地证书

```bash
# 查看所有代码签名证书
security find-identity -v -p codesigning

# 查看特定 keychain 中的证书
security find-identity -v -p codesigning build.keychain
```

#### 验证签名

```bash
# 验证应用签名
codesign -vvv --deep --strict MyApp.app

# 验证 Gatekeeper 评估
spctl -a -vv -t exec MyApp.app
```

#### 查看证书详情

```bash
# 从 p12 文件提取证书信息
openssl pkcs12 -in certificate.p12 -nokeys -passin pass:YOUR_PASSWORD | \
  openssl x509 -noout -subject
```

### 实际案例：构建失败问题追踪

以下是一个真实项目遇到的问题及解决过程：

#### 问题 1：Python distutils 缺失
```
ModuleNotFoundError: No module named 'distutils'
apps/desktop postinstall: gyp failed with exit code: 1
```

**原因**：GitHub Actions `macos-latest` 使用 Python 3.12+，已移除 distutils  
**影响**：`electron-rebuild` 无法编译 `@jitsi/robotjs` 等原生模块  
**解决**：添加 Python 3.11 setup，2 分钟修复

#### 问题 2：证书格式错误
```
⨯ Please remove prefix "Developer ID Application:" from the specified name
```

**原因**：自动提取的证书名称包含前缀  
**影响**：electron-builder 拒绝签名  
**解决**：修改 sed 命令去掉前缀，1 分钟修复

#### 问题 3：Bundle ID 不一致
```
❌ Notarization failed: app is not signed
Xisper.app: code has no resources but signature indicates they must be present
```

**原因**：
- `electron-builder.config.js`: `xyz.hawkeye-xb.xisper`
- `notarize.cjs` 硬编码: `ai.xisper.voice-input`
- 两者不一致导致公证失败

**影响**：应用签名成功但公证失败  
**解决**：改为动态获取 `context.packager.appInfo.id`，2 分钟修复

#### 总结

| 问题 | 根因 | 修复时间 | 预防措施 |
|------|------|----------|----------|
| distutils 缺失 | Python 版本升级 | 2 分钟 | 固定 Python 3.11 |
| 证书前缀错误 | 自动提取逻辑 | 1 分钟 | sed 去前缀 |
| Bundle ID 不一致 | 硬编码配置 | 2 分钟 | 动态获取 |

**关键教训**：
1. 不要硬编码任何配置，尽可能动态获取
2. Python 版本对原生模块编译至关重要
3. 证书格式必须严格遵守 electron-builder 规范
4. 完善的错误检查可以快速定位问题

## 七、最佳实践总结

### 完整工作流程

```
1. Setup Python 3.11                    ← 避免 distutils 错误
   ↓
2. 导入证书到 keychain
   ↓
3. 自动提取证书身份（去前缀）          ← 避免 prefix 错误
   ↓
4. 设置 CSC_IDENTITY 到 GITHUB_ENV
   ↓
5. Install dependencies
   ↓
6. Build application
   ↓
7. electron-builder 自动签名            ← 使用 CSC_IDENTITY
   ↓
8. afterSign hook 执行公证              ← 使用动态 Bundle ID
   ↓
9. Upload to release
   ↓
10. 清理 keychain
```

### 核心要点

| 项目 | 要点 | 原因 |
|------|------|------|
| Python 版本 | 使用 3.11 或更早 | Python 3.12+ 移除 distutils |
| 证书身份格式 | `"Your Name (TEAM_ID)"` | electron-builder 不接受前缀 |
| identity 配置 | `process.env.CSC_IDENTITY` | undefined 时自动检测 |
| Bundle ID | 动态获取，保持一致 | 硬编码易出错 |
| 环境变量传递 | 使用 `GITHUB_ENV` | 跨步骤共享变量 |
| 错误处理 | 提取失败立即退出 | 快速发现问题 |

### 安全检查清单

- [ ] ✅ 证书以 Base64 存储在 GitHub Secrets
- [ ] ✅ 密码使用强密码并存储在 Secrets
- [ ] ✅ 不在代码中硬编码任何敏感信息
- [ ] ✅ `.p12` 文件添加到 `.gitignore`
- [ ] ✅ 定期检查证书有效期（5年）
- [ ] ✅ 泄露时立即在 Apple Developer 撤销
- [ ] ✅ 使用 `if: always()` 确保清理 keychain

### 需要的 GitHub Secrets

| Secret 名称 | 说明 | 必需 |
|-------------|------|------|
| `MACOS_CERTIFICATE` | p12 证书的 Base64 | ✅ |
| `MACOS_CERTIFICATE_PWD` | p12 密码 | ✅ |
| `APPLE_ID` | Apple ID 邮箱 | 公证需要 |
| `APPLE_APP_SPECIFIC_PASSWORD` | 应用专用密码 | 公证需要 |
| `APPLE_TEAM_ID` | Team ID | 公证需要 |
| `KEYCHAIN_PASSWORD` | 临时 keychain 密码 | 可选 |

---

**参考资料**：
- [Apple Developer ID 官方文档](https://developer.apple.com/support/developer-id/)
- [electron-builder 代码签名指南](https://www.electron.build/code-signing)
- [Python distutils 移除公告](https://peps.python.org/pep-0632/)
- [@electron/notarize 文档](https://github.com/electron/notarize)
