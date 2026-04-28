---
title: 用 fake-claude + Hammerspoon 假装加班：人走了，AI 还在跑
date: "2026-04-28"
draft: false
description: 提前溜了又不想被发现？让 fake-claude 在终端继续"跑任务"，Hammerspoon 守住电脑——只要有人动鼠标键盘，屏幕立刻锁掉。
categories:
  - AI-and-life
tags:
  - 独立开发
  - Hammerspoon
  - AI
ShowReadingTime: true
ShowWordCount: true
---

晚上七点，活干完了，我想走。

但抬头一看，左边的同事还在敲，右边的同事还在敲，组长工位的灯也还亮着。我知道这是垃圾文化，但下周分活的不是道理，是人。

所以问题就变成了：怎么让我这台电脑看起来还在加班，而我人已经在地铁上了？

锁屏肯定不行。哪有谁加班把屏幕锁了的，一锁就破功。

留个 IDE 在那也不行。光标不动、鼠标不动，过个三十秒，路过的人扫一眼就知道这屏幕没人。

我要的是一个**会自己一直动、看起来一直在干活**的屏幕。

而且——万一有人凑过来想戳一下我的鼠标，比如想偷我桌上零食，或者想留个便签——屏幕得立刻锁掉，不能让他多看一眼。一看就穿帮。

于是有了今天这俩主角：fake-claude 让终端假装在跑任务，Hammerspoon 守门。

## fake-claude：让终端看起来在加班

这是我前段时间写的一个小工具，灵感来自 [genact](https://github.com/svenstaro/genact)（让终端看起来像在跑黑客脚本的那个经典玩具），但我做的是 Claude Code 专用版。

它会模拟思考转圈、Read 文件、写 diff、跑 Bash、grep、最后给你来个权限确认弹窗，结束还有 token 用量统计。该有的都有。

走之前在终端里起一个，慢一点跑：

```bash
fake-claude --speed 1.5
```

二进制能直接从 [Releases](https://github.com/hawkeye-xb/fake-claude/releases) 下，零依赖，不用装 Node。

**为什么是 Claude Code**——因为现在跑 AI agent 是最不用解释的加班姿态。

「他怎么不在工位？」
「Claude 在跑，估计是个长 refactor，等输出呢。」

合理。一句话堵死所有疑问。如果换成 IDE 光标停那不动，三十秒就被识破；但终端里 spinner 在转、文件在读、diff 一行一行往外吐，远远扫一眼，就是个**正在工作**的状态——而不是一个**被冻住**的状态。

## Hammerspoon：人走之前启动哨兵

光让屏幕滚还不够。

终端在跑没问题，但屏幕**没锁**——这是为了让画面继续动。代价就是，任何人路过都能坐下来动我的鼠标键盘。一动，他就看见 Claude 在 `Caffeinating`，然后过五秒还在 `Caffeinating`，再过五秒……完了。

所以得有个东西替我守着。

我用的是 Hammerspoon。这是 macOS 上的一个 Lua 自动化工具，能监听几乎所有事件——鼠标、键盘、触控板、USB、屏幕、网络。我拿它写了一个**离座哨兵**：人走之前按一个快捷键启动，之后只要有任何输入事件，就立刻锁屏。

下面是我自己用的一段，你拿去改成自己的：

```lua
-- ~/.hammerspoon/init.lua

local sentry = nil

local function startSentry()
    if sentry then return end

    sentry = hs.eventtap.new({
        hs.eventtap.event.types.mouseMoved,
        hs.eventtap.event.types.leftMouseDown,
        hs.eventtap.event.types.rightMouseDown,
        hs.eventtap.event.types.keyDown,
        hs.eventtap.event.types.scrollWheel,
        hs.eventtap.event.types.gesture,
    }, function()
        sentry:stop()
        sentry = nil
        hs.caffeinate.lockScreen()
        return false
    end)

    sentry:start()
    hs.alert.show("哨兵已启动，人可以走了")
end

hs.hotkey.bind({"ctrl", "alt"}, "G", startSentry)
```

我绑的快捷键是 `⌃⌥G`，监听的是「鼠标动一下、键盘按一下、滚轮、触控板手势」。这些是我的偏好——你完全可以换。

比如你嫌鼠标动一下就锁屏太敏感（因为蓝牙鼠标偶尔会自己漂），可以只监听键盘。或者你不想用快捷键启动，想做成「检测到我手机蓝牙离开 5 米就自启」，Hammerspoon 也能写。再比如把锁屏换成屏保（`hs.caffeinate.startScreensaver()`），效果差不多但日志没那么扎眼。

有个细节我得提醒一下：按下哨兵快捷键的瞬间它就生效了，所以**按完得立刻把手离开键盘**，不然会自己触发自己。我的实际做法是按完 `⌃⌥G` 之后立刻举手，像被警察喊「不许动」一样僵住，再侧身离开座位。第一次做这个动作的时候我对着屏幕笑了半天。

## 串起来就是一次完整的下班遛号

```
17:55  活干完了，环顾四周大家都在
17:58  终端起 fake-claude --speed 1.5
       屏幕开始滚 spinner、出 diff
18:00  按 ⌃⌥G 启动哨兵
       手立刻离开键盘
18:02  起身、收包、走出公司、坐地铁、回家
       工位上：终端继续在跑，远看就是人去上厕所了
       任何人靠近碰一下：瞬间锁屏
20:00  老板路过看一眼，「这哥们今天搞到挺晚」
```

闭环。

## 链接

- fake-claude: <https://github.com/hawkeye-xb/fake-claude>
- Hammerspoon: <https://www.hammerspoon.org/>

下班见。
