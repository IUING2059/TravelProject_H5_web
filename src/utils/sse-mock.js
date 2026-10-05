import http from "http";
const server = http.createServer((req, res) => {
  console.log("收到请求url：", req.url); // 新增打印，看请求路径
  // CORS 头
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  // 预检 OPTIONS 请求
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }
  if (req.url === "/chat" && req.method === "POST") {
    // 设置SSE响应头
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    console.log("进入chat SSE接口");
    const list = [
      {
        data: JSON.stringify({
          type: "chunk",
          content: "上海是一座极具魅力的国际化大都市，",
        }),
        delay: 400,
      },
      {
        data: JSON.stringify({
          type: "chunk",
          content: "美食种类非常丰富，融合了江南本帮菜特色，同时汇集各地风味。",
        }),
        delay: 400,
      },
      {
        data: JSON.stringify({
          type: "chunk",
          content:
            "\n\n🥟 经典本帮菜推荐：\n1.红烧肉：色泽红亮肥而不腻，甜咸适口，是上海菜代表。",
        }),
        delay: 400,
      },
      {
        data: JSON.stringify({
          type: "chunk",
          content:
            "\n2.响油鳝糊：鳝丝鲜嫩，上桌浇热油香气扑鼻。\n3.油爆虾：外壳酥脆，口味鲜甜。",
        }),
        delay: 400,
      },
      {
        data: JSON.stringify({
          type: "chunk",
          content:
            "\n🥟 上海特色小吃：\n✅生煎包：底部煎得金黄酥脆，皮薄汤汁饱满。",
        }),
        delay: 400,
      },
      {
        data: JSON.stringify({
          type: "chunk",
          content:
            "\n✅小笼包：皮薄肉嫩，咬开爆汁，一定要趁热品尝。\n✅葱油拌面，配上开洋，简单又鲜香。",
        }),
        delay: 400,
      },
      {
        data: JSON.stringify({
          type: "chunk",
          content: "\n✅排骨年糕，炸排骨搭配软糯年糕，是老上海街头味道。",
        }),
        delay: 400,
      },
      {
        data: JSON.stringify({
          type: "chunk",
          content:
            "\n📍美食打卡地：豫园周边、城隍庙、吴江路美食街、黄河路。\n\n希望这份推荐对你的上海旅行有帮助！",
        }),
        delay: 500,
      },
      { data: JSON.stringify({ done: true }), delay: 300 },
    ];
    let index = 0;
    function send() {
      if (index >= list.length) {
        res.end();
        return;
      }
      const item = list[index];
      setTimeout(() => {
        res.write(`data:${item.data}\n\n`);
        index++;
        send();
      }, item.delay);
    }
    send();
  } else {
    // 其他路径兜底返回
    res.writeHead(404);
    res.end("接口不存在，url:" + req.url);
  }
});
server.listen(3000, () => {
  console.log("✅ SSE Mock服务启动成功！");
  console.log("👉 请求地址：http://127.0.0.1:3000/chat");
});
