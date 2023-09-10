const net = require("net");

// 创建TCP客户端
const client = new net.Socket();

// 连接到服务器
client.connect(3000, "localhost", () => {
  console.log("已连接到服务器");
});

// 监听从服务器接收的消息
client.on("data", (data) => {
  console.log("接收到消息:", data.toString());
});

// 用户从命令行输入消息并发送到服务器
process.stdin.on("data", (data) => {
  const message = data.toString().trim();
  client.write(message);
});

// 监听连接关闭事件
client.on("close", () => {
  console.log("连接已关闭");
});
