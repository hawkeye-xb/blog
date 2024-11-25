---
title: 使用 peer 实现 WebRTC 数据传输
date: 2024-11-25
draft: false
descritpion: '介绍如何使用 Peer 实现 WebRTC 数据传输。'
tags: ['WebRTC', 'Peer']
series: ['我的网盘']
---

为了实现远端设备可访问，这里选用了 WebRTC 作为 P2P 数据传输方案。避免繁琐的内网穿透处理。[Peer使用方式可以直接跳转](#peer-使用)

### 什么是 NAT
NAT（Network Address Translation，网络地址转换）是一种在计算机网络中广泛使用的技术，主要用于将私有网络中的IP地址转换为公共网络中的IP地址。NAT的主要目的是解决IPv4地址短缺的问题，并提供一定程度的网络安全。

NAT在一定程度上隐藏了内部网络的IP地址，使得外部网络无法直接访问内部网络中的设备。相当于寄快递只填写到了合租的地址（公共地址），里面具体房间的地址是私有的，别人没法直接填写（访问）。

所以我们需要一些方法（内网穿透），让外部网络能够访问到内部网络中的设备。

### 什么是 STUN/TURN、ICE
点对点（P2P）通信的关键协议和机制。它们主要用于解决 NAT（网络地址转换）和防火墙等网络环境下的通信问题。

#### STUN（Session Traversal Utilities for NAT）：
用于帮助客户端发现自己的公共 IP 地址和端口，以及了解 NAT 设备的类型。    
客户端向 STUN 服务器发送请求。STUN 服务器返回客户端的公共 IP 地址和端口。客户端使用这些信息来建立与其他客户端的直接连接。    
只能处理简单的 NAT 类型，复杂、对称NAT 类型可能无法穿透。
#### TURN（Traversal Using Relays around NAT）：
用于在无法直接建立 P2P 连接的情况下，通过中继服务器转发数据。    
数据都通过 TURN 服务器转发，从而绕过 NAT 和防火墙的限制。
相应的，数据经过服务器，会增加一定的延迟和带宽消耗。    

#### ICE（Interactive Connectivity Establishment，交互式连接建立）：
是一种框架，用于在复杂的网络环境中建立 P2P 连接。它结合了 STUN 和 TURN 的功能，并尝试使用多种候选地址（包括本地地址、STUN 提供的公共地址、TURN 中继地址）来建立最优的连接。

### 什么是 [WebRTC](https://developer.mozilla.org/zh-CN/docs/Web/API/WebRTC_API)
简单了解了 NAT、STUN/TURN、ICE 这些内容，可以大致了解 WebRTC 的工作原理。不管是想要以什么方式传输(UDP, TCP)、传输什么数据(MediaStream, RTCDataChannel)，只要能建立连接，其他的都有很多的方式。

这里就不过多介绍了，更多可以去 [Mdn Web docs](https://developer.mozilla.org/zh-CN/docs/Web/API/WebRTC_API/Protocols) 查阅。概要说连接流程就是，我把本地对应的端口（不管以什么方式，正常以 WS 的方式连接信令服务，交互双方信息）告诉给对方，对方收到之后，和我沟通建立连接。
### Peer 使用
peerJs 默认连接 peer serve(免费的信令服务)
```ts
// client A
<script type="module">
  import {Peer} from "https://esm.sh/peerjs@1.5.4?bundle-deps"

	var peer = new Peer();

	peer.on('open', function(id) {
		console.log('My peer ID is: ' + id);
	});
	peer.on('connection', function(conn) {
		// 接收到别的连接邀请
		conn.on('data', function(data) {
			console.log('Received', data);

			// 发送数据
			conn.send('hello');
		});
	});
</script>
```

```ts
// client B
<script type="module">
	import {Peer} from "https://esm.sh/peerjs@1.5.4?bundle-deps"

	var peer = new Peer();

	// 与信令服务建立连接，可以通过 peer 属性获取连接状态。主动 disconnect 断开（建议退出时候销毁和断连）
	peer.on('open', function(id) {
		console.log('My peer ID is: ' + id);
		// 如果需要主动发起邀请，需要在这个阶段之后再发起
		const conn = peer.connect('peer A id');
		conn.on('open', function() {
			// 发送数据
			conn.send('hello im B client');
		});
		conn.on('data', function(data) {
			// 接收到数据
			console.log('Received', data);
		});
	});
	peer.on('connection', function(conn) {
		// ...
	});
</script>
```

### 再封装
基本使用也没太多的内容了，可以封装一下数据传输与初始化上，减少重复连接和管理 Connection，peer Connection 使用 Map 和 Object管理，但是属性废除了，获取不稳定（如有新的内容望大佬告知下），所以需要自己管理。

这里给出监听和请求两侧的封装。希望对大家有帮助。
```ts
import Peer, { type DataConnection } from "peerjs";

import {
  ActionType,
  type WebRTCContextType,
  type ConnectionFunctionType,
} from './type';

import {
  getRequest,
  setRequest,
  deleteRequest,
  generateWebRTCContext,
} from './requestManager';

import {
  on,
  emit,
  off,
} from './listeners';

const peerConfig = {
  // debug: 3,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  }
}

type InitPeerConfigType = {
  deviceId: string;
  onPeerOpen?: (p: Peer) => void;
  onPeerClosed?: (p: Peer) => void;
  onPeerError?: (p: Peer, err: Error) => void;
  onPeerReceivedConn?: (conn: DataConnection) => void;
}
type InitUniConnConfigType = {
  connDeviceId: string;
  onConnOpen?: (conn: DataConnection) => void;
  onConnClose?: (conn: DataConnection) => void;
  onConnError?: (conn: DataConnection, err: Error) => void;
  onConnData?: (conn: DataConnection, d: unknown) => void;
}
export class PeerInstance {
  // 静态属性，用于存储单例实例
  private static instance: PeerInstance;
  private peer: Peer | undefined;

  private uniConn: DataConnection | undefined; // 为使用侧保留，连接到存储侧的conn
  private uniConnInitBackup?: () => void;

  private connectionsMap = new Map<string, DataConnection>();

  private chunkMap = new Map<string, Uint8Array[]>();

  constructor() {
    console.warn('Dont new instance, use PeerInstance.getInstance()')
  }

  public static getInstance(): PeerInstance {
    if (!PeerInstance.instance) {
      PeerInstance.instance = new PeerInstance();
    }
    return PeerInstance.instance;
  }

  public init(config: InitPeerConfigType) {
    if (this.peer) {
      console.warn('peer already init');
      return;
    }

    this.peer = new Peer(config.deviceId, peerConfig);

    // @ts-ignore
    window.peer = this.peer;

    this.handlePeerListeners(config);
  }

  public destroy() {
    if (this.peer) {
      if (this.connections.length > 0) {
        // todo: 改 Promise，全部处理了再destroy
        this.connections.forEach((conn) => {
          conn.close();
          conn.once('close', () => {
            console.log('connection close');
          })
        })
      }
      this.peer.disconnect();
      this.peer.once('disconnected', () => {
        console.log('peer disconnected');
        this.peer?.destroy();
        this.peer = undefined;
      })
    }
  }

  private handlePeerListeners(config: InitPeerConfigType) {
    const p = this.peer;
    if (p !== undefined) {
      p.on('open', () => {
        config.onPeerOpen && config.onPeerOpen(p);

        if (this.uniConnInitBackup) {
          this.uniConnInitBackup();
        }
      })
      p.on('close', () => {
        config.onPeerClosed && config.onPeerClosed(p);
      })
      p.on('error', (err) => {
        config.onPeerError && config.onPeerError(p, err);
      })

      // 存储侧接受到的连接邀请
      p.on('connection', (conn) => {
        conn.on('open', () => {
          config.onPeerReceivedConn && config.onPeerReceivedConn(conn);

          this.connectionsMap.set(conn.peer, conn); // 不用删除
        })

        conn.on('data', (d: unknown) => {
          console.log('存储端 route 接收到的数据:', d)
          // 这里不用处理响应数据吧，只需要当成router来处理就好了
          // this.handleConnResponse(d)
          this.handleReceived(conn, d)
        })
      })
    }
  }

  // ---- 存储侧注册的类似router事件，有handleReceived处理 ----
  public register(action: ActionType, fn: ConnectionFunctionType) {
    on(action, fn);
  }
  public unregister(action: ActionType) {
    off(action);
  }

  private async handleReceived(conn: DataConnection, d: unknown) {
    try {
      const data = d as WebRTCContextType;
      await emit(data.action, data, conn);

      conn.send(data);
    } catch (error) {
      console.warn(error);
    }
  }

  // ----
  // 本侧发送数据 - 与接收返回数据的处理
  public connect(config: InitUniConnConfigType) {
    if (this.peer) {
      if (this.uniConn) {
        console.warn('uniConn already init');
        return;
      }

      if (this.peer.open) {
        this.handleUniConnListeners(config);
        return;
      }
      this.uniConnInitBackup = () => {
        this.handleUniConnListeners(config);
      }
    }
  }
  public handleUniConnListeners(config: InitUniConnConfigType) {
    const p = this.peer;
    if (!p) return;
    if (this.uniConn) return;

    const uc = p.connect(config.connDeviceId)
    this.uniConn = uc;
    this.uniConnInitBackup = undefined;

    uc.on('open', () => {
      config.onConnOpen && config.onConnOpen(uc);
    })
    uc.on('close', () => {
      config.onConnClose && config.onConnClose(uc);
    })
    uc.on('error', (err) => {
      config.onConnError && config.onConnError(uc, err);
    })
    uc.on('data', (d) => {
      config.onConnData && config.onConnData(uc, d);

      // 处理返回数据
      console.log('使用侧 接收到 存储侧 的数据:', d)
      this.handleConnResponse(d);
    })

    // @ts-ignore
    window.uniConn = uc;
  }

  public request<T>(action: ActionType, body: unknown, config: {
    target?: DataConnection;
    request?: {}
  }): Promise<T> {
    return new Promise((resolve, reject) => {
      const context = generateWebRTCContext(action, body);

      context.request = {
        ...context.request,
        ...config.request,
      };

      setRequest(context.request.id, {
        resolve,
        reject,
        context,
      })

      const conn = config.target || this.getUniConn();
      if (conn) {
        conn.send(context);
      } else {
        reject('conn not init');
      }
    })
  }

  private handleConnResponse(d: unknown) {
    try {
      const ctx = d as WebRTCContextType;
      // todo: reject handle?
      if (ctx.response.headers?.contentType === 'application/octet-stream') {
        const body = ctx.response.body.data as {
          type: 'start' | 'chunk' | 'end';
          chunk: Uint8Array;
        };
        if (body.type === 'start') {
          this.chunkMap.set(ctx.request.id, [body.chunk]);
          return;
        }
        if (body.type === 'chunk') {
          const chunks = this.chunkMap.get(ctx.request.id);
          chunks?.push(body.chunk);
          return;
        }
        if (body.type === 'end') {
          const chunks = this.chunkMap.get(ctx.request.id);

          // chunks 转成reader
          const reader = new ReadableStream({
            start(controller) {
              chunks?.forEach((chunk) => {
                controller.enqueue(chunk);
              })
              controller.close();
            },
          }).getReader();

          ctx.response.body = {
            ...ctx.response.body,
            data: reader
          };
          this.chunkMap.delete(ctx.request.id);
        }
      }

      const target = getRequest(ctx.request.id);

      if (target) {
        target.resolve(ctx);
        deleteRequest(ctx.request.id);
      }
    } catch (error) {
      console.warn(error);
    }
  }

  // ---- peer ----
  public getPeer() {
    return this.peer;
  }

  // ---- connections ----
  public getConnectionsMap() {
    return this.connectionsMap;
  }
  public getUniConn() {
    return this.uniConn;
  }
}

```
```ts
// requestManager.ts
// 被peer模块依赖
import { v4 as uuidv4 } from "uuid";
import { type ActionType, type WebRTCContextType, type RequestManagerType } from './type'

const requestMap = new Map();

export const setRequest = (id: string, ctx: RequestManagerType) => {
  requestMap.set(id, ctx);
}

export const getRequest = (id: string) => {
  return requestMap.get(id);
}

export const deleteRequest = (id: string) => {
  requestMap.delete(id);
}

export function generateWebRTCContext(action: ActionType, body: unknown): WebRTCContextType {
  return {
    action,
    request: {
      id: uuidv4(),
      body,
    },
    response: {
      body: {
        code: 200,
        data: undefined,
        message: ''
      },
    }
  }
}

```
```ts
// listeners.ts
import type { DataConnection } from 'peerjs';
import {
  type ActionType,
  type WebRTCContextType,
  type ConnectionFunctionType,
} from './type';

const functionMap = new Map<ActionType, ConnectionFunctionType>();

export function on(action: ActionType, fn: ConnectionFunctionType) {
  // 使用set可以重复注册
  functionMap.set(action, fn);
}

export async function emit(action: ActionType, ctx: WebRTCContextType, conn: DataConnection) {
  const fn = functionMap.get(action);
  if (fn) {
    await fn(ctx, conn);
  }
}

export function off(action: ActionType) {
  functionMap.delete(action);
}
```