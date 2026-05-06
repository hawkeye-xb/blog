---
title: "$5/月 Vultr 自建 VPN：从部署到防刷爆的完整闭环"
date: 2026-05-06
draft: false
description: 用 Vultr 新加坡 1C1G 跑 3x-ui + VLESS+REALITY，踩了 ufw 默认 deny 的坑，搞清楚了 VPS 出口 3500Mbps 跟本地体感 16Mbps 的差距，最后用流量限额堵死被刷爆账单的可能性。一篇完整的自建 VPN 心路。
categories:
  - other
tags:
  - VPN
  - Vultr
  - VPS
  - 安全
ShowReadingTime: true
ShowWordCount: true
---

5 刀一个月的新加坡 VPS，跑一个独享的翻墙节点，最大的隐藏成本不是钱，是你在它上面踩的每一个坑。

我把整个过程从头到尾走了一遍，记一下，给以后自己换机器、给想自建的朋友省一两个晚上。

## 起点：装完了，但是不通

环境是这样的：

- VPS：Vultr 新加坡，$5/月，1C1G/25G SSD/1TB 流量
- 系统：Ubuntu 24.04 LTS
- 协议栈：3x-ui v2.9.2 + Xray + VLESS+REALITY，伪装 SNI 选了 `www.oracle.com`

3x-ui 装完，节点也建了，443 在 `ss -tlnp` 里看着也好好的。但客户端连不上，浏览器直接访问 `https://<VPS_IP>` 也超时。

第一反应就是怀疑现场 WiFi 出口给我封了——毕竟人在新加坡，家里到 Vultr 新加坡机房，理论上同城应该秒通。

## 三个一组的端口测试，立刻定位

懒得乱猜，跑一组并行测试：

```bash
ping -c 3 <VPS_IP>
nc -zv <VPS_IP> 22       # SSH
nc -zv <VPS_IP> 80
nc -zv <VPS_IP> 443
```

结果：

| 测试 | 结果 |
|---|---|
| ICMP ping | ✅ 通（84ms） |
| TCP 22 (SSH) | ✅ 通 |
| TCP 80 | ❌ 超时 |
| TCP 443 | ❌ 超时 |

排除掉的可能：

- ❌ 不是当前 WiFi 的封锁——如果是，22 也该不通
- ❌ 不是 VPS 死机——ping/SSH 都正常
- ❌ 不是 IP 被运营商屏蔽——ICMP 通

剩下三种最可能的：Vultr 控制台的云防火墙、VPS 系统的 ufw/iptables、或者 xray 没真的 listen 在 0.0.0.0:443。

SSH 进去一查：

```bash
ss -tlnp | grep -E ':(80|443|2053)'
ufw status verbose
```

`ss` 输出说 xray 老老实实 listen 在 `*:443`，从内部 `curl -k https://127.0.0.1:443` 也能 TLS 握手成功——服务本身没问题。问题在 ufw：

```
Status: active
Default: deny (incoming), allow (outgoing)

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere
22/tcp (v6)                ALLOW IN    Anywhere (v6)
```

只放了 22。Ubuntu 装了 ufw 是默认拦一切的，3x-ui 安装脚本也不会帮你开 443。一行修：

```bash
ufw allow 443/tcp
```

立马就通了。

**这个坑的本质**：3x-ui 把"程序 listen 端口"和"端口对外可达"当成了一回事，但 Linux 上这是两层。装完不通，永远先看 `ufw status`，比看 xray 日志快十倍。

## 测速：体感跟数字是两回事

通了之后第一件事是测速。在 VPS 上跑 speedtest：

```
下行: 3495 Mbps
上行: 2642 Mbps
```

这个数字看着爽，但客户端连上以后用 fast.com 测，只有 16 Mbps。差了两百倍——是 VPS 被偷偷限速了吗？

不是。两个测试的链路完全不一样：

```
VPS speedtest 测的是：
  VPS ──(机房光纤,1.8ms)── speedtest新加坡节点
  纯机房内网，VPS 出口能力的天花板

客户端测的是：
  你的设备 ──(WiFi)── 路由器 ──(运营商出口)
        ──(跨网到 Vultr,84ms)── VPS
        ──(VLESS 隧道)── VPS 内网 ──(机房)── speedtest
  端到端 5 跳，最慢的那跳决定速度
```

84ms 的 RTT 单 TCP 连接受窗口限制，理论上限就在 16-20Mbps 上下，跟我测出的体感完全吻合。Clash/Xray 真正用的时候是多连接并发，体感能拉到 50-100Mbps。

**VPS 的"出口带宽"和你能感受到的"翻墙速度"不是一回事**。前者是机房光纤的能力，后者受限于你到 VPS 的那段公网，再被 RTT 卡一刀。

## CPU 才 1%，是不是还能塞点东西？

跑了一天看一眼 `htop`：CPU <1%，内存 369/955 MB。$5 都花了，闲着就觉得亏。一开始想塞 Vaultwarden（密码管理）、Memos（笔记）、AdGuard Home、RSSHub 一堆。

后来想清楚了——**Cloudflare Pages/Workers 能搞定的别自托管**。博客、笔记、密码管理这种，Cloudflare 全免费，签证书、扛攻击都不用我管。自己塞进 VPS 反而要装 Docker、配 Caddy、定期升级、出问题还得自己救。

VPS 唯一不可替代的优势是：

- **后台长时间任务**：aria2 离线下载海外资源
- **不能跑在 serverless 上的服务**：要常驻进程、要 puppeteer、要超过 10ms CPU 的逻辑

我盘了一圈自己的需求，发现真没有非自托管不可的东西。最后结论：

> 开服务器不是为了榨干 CPU，是为了你需要的时候它在那儿。

什么都不塞，就让它一直跑 VPN，反而是这 5 刀最舒服的花法。

## 顺便说说 Vultr 的计费坑

很多人栽在这上面：**关机不停费**。

Vultr 是按小时计费 + 流量配额的双轨制：

- $5 套餐 ≈ $0.007/小时，月封顶 $5
- **网页控制台点 Stop、系统里 `shutdown -h now`，仍然计费**——因为实例还占用 IP、磁盘、配额
- 想停止扣费唯一方法：**Destroy（销毁实例）**，但销毁后 IP 和数据全丢
- 流量含 1TB/月，超出 $0.01/GB

如果你只是临时不用，5 刀就让它开着；想保住 IP 又省钱可以用 Reserved IP（$3/月独立保留），不过单 VPS 没必要。重点是去后台开 **Bandwidth Alert**，等会儿讲。

## 订阅 URL：base64 还是 yaml，老 Clash 不认

3x-ui 自带订阅服务，端口是 2096，路径可以自己设随机串防扫描。开起来之后能直接生成订阅 URL：

```
http://<VPS_IP>:2096/sub_<random12hex>/<subId>
```

填到 Clash Verge / V2RayN 里立即生效，**多设备一处改全员同步**，每 12 小时客户端自己拉最新配置。

但是！手机上一个老版本的 Clash for Android 死活不认——因为 3x-ui 默认订阅响应是 base64 编码的 `vless://` 链接列表，而老 Clash 只认原生 yaml 格式，根本不支持 VLESS 协议。

两条路：

**A. 换客户端**——ClashMetaForAndroid（CMFA），或者 mac 上的 Mihomo Party / Clash Verge Rev / ClashX Meta，全都支持 VLESS，跨设备一致。

**B. 自己生成 yaml** ——在 VPS 上装个 Caddy，把节点参数渲染成 Clash Meta 格式的 yaml 文件，托管在另一个端口和随机路径下：

```
http://<VPS_IP>:8080/<random12hex>/clash.yaml
```

所有 Clash 系客户端无差别识别。代价是这是个**静态文件**，节点变了要手动重新生成。

我两个都开了——base64 给 V2RayN 用，yaml 给 Clash 系用，路径都带 12 位随机 hex 防扫描。

## 安全加固：上线 24 小时已经被扫了

有了订阅 URL 之后，开始想"这玩意儿真的扛得住别人攻击吗"。

第一件事看 SSH 登录失败日志：

```bash
journalctl -u ssh | grep "Failed password" | wc -l
```

24 小时 **210 次失败**，主力是俄罗斯一个 IP 段（80.94.92.0/24）持续在扫。再看看 SSH 配置：`PermitRootLogin yes`、密码登录、没装 fail2ban。这一套就跟把家门钥匙挂在门把手上没区别。

我做了三件事，性价比从高到低：

### 1. fail2ban + 系统补丁

```bash
apt update && apt upgrade -y
apt install -y fail2ban
systemctl enable --now fail2ban
```

默认配置就是 SSH 5 次失败封 1 小时，装完几分钟内立刻封了那个俄罗斯段的 5 个 IP。这个收益最大——所有自动化扫描立刻失效。

### 2. 3x-ui 面板改成只听 127.0.0.1

面板默认监听 `0.0.0.0:2053`，虽然 ufw 没放行，外网摸不到，但**单层防御**总是不安全。改成只听本地，以后哪怕 ufw 误开端口也不会暴露面板：

```bash
# 在 3x-ui 面板 → 面板设置里把"监听 IP"改成 127.0.0.1
# 或者直接改数据库
sqlite3 /etc/x-ui/x-ui.db \
  "UPDATE settings SET value='127.0.0.1' WHERE key='webListen';"
systemctl restart x-ui
```

代价是以后访问面板必须走 SSH 隧道：

```bash
ssh -L 2053:127.0.0.1:2053 root@<VPS_IP> -N
# 浏览器打开 http://127.0.0.1:2053
```

不方便，但只有自己能进。

### 3. 跳过的几个

- **SSH 密钥登录** —— 本地没配过密钥，麻烦，密码 16 位混合 + fail2ban 已经够
- **SSH 端口换号** —— 噪音再多也是噪音，没增益
- **IP 白名单** —— 5G/酒店/公共 WiFi 经常切，不现实
- **Cloudflare 套域名** —— 不想再绑域名

跑完这三步，自动化扫描这条最大攻击面被堵死，剩下的风险只剩"密码被撞库"，强度足以扛。

## 真正想清楚的问题：URL 泄露 = 账单失控

加固完之后我才想明白一件更深的事：

**订阅 URL 一旦泄露，谁拿到 yaml 都能直接用我的 VPS 翻墙。**

如果攻击者拿到 URL（中间人嗅探、不小心复制错地方、被人转发），就能：

| 玩法 | 后果 |
|---|---|
| 挂 4K 视频 | 1TB ≈ 100 小时刷爆 |
| 跑爬虫/挖矿/CC | 几天 5-10TB |
| 超 1TB 后 | $0.01/GB，10TB = $90，**100TB = $999** |

URL 路径再随机也没用——一旦泄露就是**永久泄露**，靠"猜不到"已经失效。Vultr 不会自动封顶，账单理论上能失控。

这才是自建 VPN 真正应该担心的事，比 GFW 封 IP 还要紧。

### 三层防御 + 一道兜底

3x-ui / Xray 在协议层有原生限额支持，无视 URL 泄露：

```json
{
  "limitIp": 3,        // 最多 3 个不同 IP 同时连
  "totalGB": 200,      // 月流量 200GB，超了自动停
  "expiryTime": 0      // 不过期
}
```

**核心机制**：即使 URL 全网公开，攻击者最多只能 3 个 IP 同时连，且共用 200GB 月度上限。配合 Vultr 含 1TB，永远刷不爆。

再设月度自动重置（数据库里的 `traffic_reset = monthly`），每月 1 号 0 点清零，被刷爆下月还能用。

最后一道兜底——Vultr 后台开 Bandwidth Alert：

```
Account → Notifications → Bandwidth Alerts
阈值设 80%（800GB）
```

理论上 client 200GB 自动停在前，VPS 总流量根本到不了 800GB。Vultr 邮件告警是兜底，万一 Xray 的 200GB 限额因为某个 bug 失效，至少能在出账单前知道。

最坏情况推演：

```
URL 全网公开
  ↓
xray 检查同时连接 IP > 3 → 拒绝
  ↓
即使能进，所有流量计入这个 client
  ↓
累计 200GB 后自动停用 client
  ↓
Vultr 1TB 配额内，永远不收超额费
  ↓
异常 → 后台一键重置 UUID，老 yaml 全部失效
```

**最大可能损失：200GB / 月，0 元**。

## 最终的端口和资源占用

```
22    ufw allow            ← SSH，fail2ban 自动封爆破
443   ufw allow → xray     ← VPN（VLESS+REALITY）
2053  127.0.0.1 only       ← 3x-ui 面板，SSH 隧道访问
2096  ufw allow → x-ui     ← base64 订阅
8080  ufw allow → caddy    ← Clash yaml 订阅
```

资源占用：

| 服务 | 内存 |
|---|---|
| xray + 3x-ui | ~100 MB |
| caddy | ~15 MB |
| fail2ban | ~30 MB |
| 系统 | ~200 MB |
| **总计** | **~350 MB / 955 MB** |

CPU 常年 1% 以下，富余巨大，但我什么都不打算再塞了。

## 结尾的几条心得

1. **`ss -tlnp` 跟外网可达不是一回事**——程序在 listen 不代表别人能连进来，永远先看 ufw。
2. **VPS 出口带宽是天花板，不是体感**——你的速度由本地→VPS 那段公网决定，跨网就是跨网，不是钱能解决的。
3. **不要为了"榨干 CPU"塞服务**——能用 Cloudflare 解决的别自托管，每塞一个就多一份维护成本和攻击面。
4. **订阅 URL 的真实威胁是账单刷爆，不是被 GFW 发现**——URL 泄露不可恢复，必须在协议层（`limitIp` + `totalGB`）做硬限制。
5. **fail2ban + 关闭 root 密码 + 面板 127.0.0.1**——三件套做完，剩下能打到你的攻击都不便宜。

5 刀一个月的隐性成本不是钱，是你愿意花多少时间把它跑出"放着不用管"的状态。这套配置基本上做到了：节点自己跑、订阅自己同步、被攻击 fail2ban 自动挡、被偷流量协议层自动停。

剩下的就是每月 1 号收 Vultr 那封 5 刀的扣费邮件。
