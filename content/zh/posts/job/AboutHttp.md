---
title: http相关
date: 2024-06-02
draft: false
---
### 三次握手四次挥手
1. 客户端发起请求，携带请求序列号
1. 服务端接收，发送应答，返回请求序列号，携带新的服务序列号
1. 客户端收到应答和对应的请求序列号，发送确认应答，发送数据

序列号保证请求的正确性。接收之后再发送请求，避免超时重复发送。

1. 客户端数据发送完毕，请求关闭连接。
1. 服务端收到，回应信号。客户端收到回应，准备关闭。
1. 服务端传输完毕，发送可以关闭信号，准备关闭。
1. 客户端发送关闭信号，关闭连接。服务端收到，关闭连接。
### 跨域
协议(常见的http和https，私有部署的时候经常出现)、域名、端口不一致，就会产生跨域。
#### 如何解决
- CORS，服务端修改`access-control-allow-origin`，允许该origin请求。
- 通过客户端同源的代理服务访问。但大部分代理服务和客户端也不同源，在代理服务设置CORS。

### get、post、put、delete
#### get
目的用于请求数据。参数在URL上传输，没有https的保护，所以不适合传输敏感信息（URL Scheme也是同样的道理）。具有幂等性，多次执行得到同样的结果。默认能被浏览器缓存。
#### post
目的用于提交表单，创建新内容。比get更合适传输数据。不具有幂等性，多次post可能产生不同的结果，服务端不应当成更新资源使用。默认是不被缓存的。
#### put
目的是更新数据，会修改数据信息，具有幂等性。
#### delete
和put一样，会修改数据内容。通常为了数据能恢复，不做直接删除，通过修改状态软删。同样具备幂等性。

### option请求
复杂和跨域这类需要预先验证目标资源支持的通信选项时的请求，需要先发送额外的option请求。

## http发展过程
### 0.9
只有get方法，传输纯文本。
### 1.0
添加了请求头和响应头，增加post和head方法，支持更多的种类，tcp只能发送一个请求。
#### expire 强缓存
服务端返回的资源缓存时间。再次发起资源请求的时候，会使用当前客户端时间做判断，有缓存则直接使用缓存资源，过期了则获取新资源。
#### 产生的问题：
- 每次只能发一个请求，多个请求需要重新进行三次握手。
- expires 依赖客户端时间，不准确，并且缓存不能清除。

### 1.1
引入了Keep-alive机制，使得在一个三次握手周期内，可以发送多个请求。同时使用pipeline的机制，只要上个请求客户端资源发送完毕，则可以继续发送后续内容，不需要等待服务端完全返回。

提供更精细的缓存机制，通过Cache-control 设置max-age判断缓存是否过期（不发生请求），过期则将Last-Modified（response header）放在 If-Modified-Since，Etag（hash、md5等值, response header）放在If-None-Match 来确认文件是否发生改变，不改变的情况下资源返回304状态（会发起请求）。
![找的网图，如需要请联系删除](https://media.geeksforgeeks.org/wp-content/cdn-uploads/20191118174507/if_none_match.png)
(找的网图，如需要请联系删除)

#### 产生的问题：
虽然1.1在私有部署的情况下被大量使用（不用部署SSL证书）。
但1.1还面临这许多问题，请求发送是排队发送的，就会出现排队队头阻塞的问题，也无法并行传输（多路复用），每个请求header信息冗余（1.0是没办法），更重要的是明文传输，没有加密。

### https：SSL/TLS
在确认交互之前，增加安全验证，数据加密过程。拿到目标服务的公钥和证书链，客户端验证证书可信，使用公钥加密随机生成的对称加密字串，发送给服务端，服务端使用私钥解密后，建立对称加密的数据交互。
### 2.0
为了处理无法多路复用的问题，2.0将数据包切分为多个二进制帧（header、Priority、Settings帧等），多请求的情况下按帧发送，在接受端组合成完整的数据，同时也允许设置优先级。并且对头部信息进行了压缩，允许服务端推送（这个不是SSE，也不是长连接推送的信息，只是允许根据客户端发送的帧，来预判需要下载的内容，提前推送过去，不用再等待客户端的请求发送完成，但是需要客户端确认接受。nginx 设置https_push。）
#### 产生的问题
虽然看上去支持了多路复用，但是队头阻塞的问题还是没有解决，只是将包细分成为了帧，本质上没有改变。TCP动态调整传输窗口，三次握手和防丢包的拥塞机制（网络情况不好的时候，少传输点儿数据）等也是无法避免的问题。
### 3.0
3.0直接使用基于UDP的QUIC（Quick UDP Internet Connections）协议做为传输协议。

在做TCP、UDP对比的时候，UDP发送数据不需要建立连接，也不会等待接收方确认接收，无序发送等被认定为不可靠的。http3.0在传输流（每个请求当成一个流）中添加了序列号等，来保持最终数据可组合，根据这个顺序，可以快速检测是否有丢包，有则立出信息通知，不需要有额外的超时等待时间。

目前来说，3.0也不是完全没有问题，至少在兼容问题上，很容易就碰到了QUIC_PROTOCOL_ERROR，只要传输链路上有不兼容的，大概率出现这个问题，并且不好排查，路由、网络、浏览器都会导致。但是对于时间可以解决的，做好服务端的兼容和降级支持就好了。
