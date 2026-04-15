---
title: 被 Cloudflare 封号了？只需要排查一个开关
date: "2026-04-14"
draft: false
description: 我在给一个静态资源项目配 Cloudflare 访问控制的时候，settings 里有个按钮，不小心点了一下...
categories:
  - other
tags:
  - Cloudflare
  - Python
  - AI
  - API
  - DNS
source_url: https://mp.weixin.qq.com/s/91OjqyIjMwnnzew3kvuUvw
source_id: wx_Mzg5NDA5NjY3Mw==_2247483823_1
source_platform: wechat
ShowReadingTime: true
ShowWordCount: true
---

我在给一个静态资源项目配 Cloudflare 访问控制的时候，settings 里有个 Access Policy 的入口，不小心点到了 enable 按钮。如果有弹窗，我大概看了一眼，描述没什么异常，就习惯性的 allow 了。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ug1uSdEI3EibNAiayEXRg8eYMfwr8asiaBOL5l1eAiaHETjOlkfxzkTZq5CGCUCMIF2o3r67h5richMHPASwl2eKpc3WlVneRUJY3ojuSbXHX8YI/640?wx_fmt=jpeg&from=appmsg)

然后，请求这个 Pages 服务就返回了 Err1050！

```
error code: 1050
```

## 先说结论和修复方法

如果你也碰到全服务返回 1050，先执行这条命令查一下账号状态：

```
curl -s \
  -H "X-Auth-Email: 你的邮箱" \
  -H "X-Auth-Key: 你的Global_API_Key" \
  "https://api.cloudflare.com/client/v4/accounts/你的AccountID/access/organizations" \
  | python3 -m json.tool
```

如果看到 `"deny_unmatched_requests": true`，执行这条修复：

```
curl -s -X PUT \
  -H "X-Auth-Email: 你的邮箱" \
  -H "X-Auth-Key: 你的Global_API_Key" \
  -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/accounts/你的AccountID/access/organizations" \
  -d '{
    "auth_domain": "你的team.cloudflareaccess.com",
    "name": "你的team.cloudflareaccess.com",
    "deny_unmatched_requests": false
  }'
```

执行完，立刻好了。跟订阅计划无关，跟额度无关，跟封号无关。

下面是完整的排查过程，以及为什么这个问题这么难找到。

## 排查的两个小时

出现问题的第一反应，是这个项目配置本身有问题。但我不想删库重建——这个项目的部署脚本跑了很多次 Pipelines 才调通，DNS 和域名都配好了，重来太麻烦了。得找到原因。

检查项目配置，没问题。能重新部署，还是 1050。

然后突然发现情况比想的要糟：不只是这一个项目，账号下其他服务也开始返回 1050 了。生产环境，开发环境，全是！！！

开始加大 token 剂量。

使用量？非常少，远没到限额。顺着项目 settings 的 manage，在 Zero Trust - Access 看到一个 "choose plan" 的引导，进去选了免费计划，绑了 PayPal，想着万一真是计划问题。没用。

这时候想到，最开始那个 enable 是在 Access Policy 里点的。既然打开了出问题，那把刚建的 Application 删掉应该能恢复。

我把它删了。

然后情况彻底失控——删完之后，所有服务全挂了。不只是那个项目，是账号下的一切。

开始让 AI 帮忙查。第一个 AI 说可能是 Access Policy 配置问题，引导我去 Dashboard 找开关。翻了一圈，找不到任何关闭入口，只有一个 "manage" 按钮，点进去跳到 Zero Trust 控制面板，里面也没有。换一个 AI，引导去查防火墙规则。没问题。再换，查 WAF。没问题。查 DNS。没问题。

每换一个方向都是死路。

开始认真考虑迁移账号。就在这个时候，刷到小红书有人说 Cloudflare 会封号。我寻思我什么都没违规——但两个小时了，我也真的想不出别的解释了。

最后无所谓了，把 Global API Key 直接扔给 AI，让它绕过 Dashboard，从 API 层把整个账号配置倒出来查。

这才找到了。

## 原因是这个

```
{
  "deny_unmatched_requests": true
}
```

这是 Cloudflare Zero Trust 的一个**账号级别**设置。开启之后，所有没有匹配到 Access 策略的请求，全部拒绝。

而我的 Access 应用列表——是空的。当时删掉那个 policy 的时候，这个开关没有跟着还原。

没有 Access 应用 = 没有任何请求能被匹配 = 所有请求一律 403，返回 1050。

这就完全对上了！！！

## 为什么这么难查到

找到原因之后，我去翻了 Cloudflare 官方文档，想确认 1050 到底是什么。

结论是：**1050 这个错误码，在 Cloudflare 官方文档里根本不存在。**

Cloudflare 的 1xxx 错误码文档从 1000 列到 1200，中间直接跳过了 1050，完全没有条目。没有 "Access blocked" 的描述，没有 "check your Zero Trust settings" 的引导，就是一个凭空冒出来的数字。

搜索引擎、AI、社区论坛，都找不到指向 `deny_unmatched_requests` 这个方向的内容。所有查过这个问题的人都往防火墙、WAF、封号方向走了，因为那些至少有文档，1050 什么都没有。

还有两件事让这个坑更深：

**这个开关只能通过 API 关闭。** Dashboard 里有打开它的入口，但没有关闭的开关。给了你一个打开的按钮，关掉它的方式藏在 API 里，文档里也没有提示你去哪找。

**影响范围是整个账号，不是单个项目。** 你以为在操作某一个 Worker 的访问控制，实际上动的是账号级别的 Zero Trust 配置，覆盖所有服务，删掉触发它的 policy 也不会还原。

## Zero Trust 的设计逻辑和它的问题

Zero Trust 的核心是"默认拒绝一切"——需要显式配置谁能访问，没有配置的请求全部拒绝。这在企业场景里是合理的：内部应用，只让经过身份验证的员工进来。

Cloudflare 官方也承认这套逻辑会导致合法用户被意外拦截，为此专门做了排错工具，因为这种误拦截发生得太频繁了。

但对独立开发者来说：你的服务全是公开的，没有任何 Access 应用，只是在配置页面点了一个按钮——然后全挂了，而且在 Dashboard 里找不到任何关闭方式。这个设计对不熟悉 Zero Trust 体系的人来说，没有任何容错空间。

## 如果你还没踩坑，对号入座一下

如果你在 Cloudflare 后台操作过以下任何一项，建议现在就检查一下 `deny_unmatched_requests` 的状态：

- 在 Workers 或 Pages 的设置里看到过 Access Policy 相关入口并点了 enable
- 进入过 Zero Trust 控制面板并做过任何配置
- 删除过 Access 应用（删除不会自动还原这个开关）

检查命令就是文章开头那条，执行一下，看返回值是 true 还是 false。

最后说一句。

这个根因——`deny_unmatched_requests` 被静默开启、又无法在 Dashboard 关闭——到目前为止几乎没有公开的分析内容。不是因为踩坑的人少，而是因为文档不存在，Dashboard 找不到，只有绕过 UI 从 API 层查才能看到。大多数人在这里耗完耐心之后，要么迁移账号，要么等服务神奇地"自愈"，不知道自己到底碰到了什么。

这件事让我意识到一个更普遍的问题：SaaS 产品在快速迭代的过程中，UI 会腐烂，文档会腐烂，但底层 API 的逻辑往往是干净的。UI 给你展示的是产品团队当时认为你需要看到的东西，文档反映的是某个版本的理解——而这两者都会欠债，都会跟不上实际的状态。这次两个小时，前一个半小时都在跟 Dashboard 较劲，最后十分钟是从 API 层直接把答案挖出来的。

往后遇到这类问题，我的第一反应会变：不信 UI，不信文档，直接问 API。

而且我觉得这个思路在 AI agent 时代只会更成立。agent 最终要操作的是接口，不是界面。那些真正经得起推敲的服务，是那些 API 语义清晰、行为可预期的——而不是 Dashboard 做得多好看。SaaS 如果真的想面向 agent 时代，需要认真对待的不是 UI，是那些底层的、没有包装的、真实发生的东西。

如果你碰到了这个问题，希望这篇文章能让你少走两个小时的弯路。
