const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");
const path = require("path");
const cors = require("cors"); // 引入cors中间件
const ffmpeg = require("fluent-ffmpeg");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://127.0.0.1:8080", // 允许的域名
    methods: ["GET", "POST"],
  },
}); // 使用socket.io创建WebSocket服务器

const corsOptions = {
  origin: "*",
  methods: "GET",
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Hello, World!"); // 用您的根路由处理逻辑替换这里的示例响应
});
app.get("/video", (req, res) => {
  const name = req.query.name;
  const filePath = path.join(__dirname, name || "frag_bunny.mp4");
  const stat = fs.statSync(filePath);

  res.writeHead(200, {
    "Content-Type": "video/mp4",
    "Content-Length": stat.size,
  });

  const readableStream = fs.createReadStream(filePath);
  readableStream.pipe(res);
});

io.on("connection", (socket) => {
  // 获取客户端传递的请求参数
  const { name } = socket.handshake.query;
  console.log(`流式播放的视频是, ${name || "frag_bunny.mp4"}`);

  const filePath = path.join(__dirname, name || "frag_bunny.mp4");
  const file = fs.readFileSync(filePath);
  console.log("filePath:", filePath);
  console.log("byteLength.b:", file.byteLength);

  ffmpeg.ffprobe(filePath, (err, metadata) => {
    if (err) {
      console.error("Error reading video metadata:", err);
      return;
    }

    if (metadata.format) {
      const mimeType = metadata.format.format_name;
      console.log("MIME Type:", mimeType);
    }

    if (metadata.streams && metadata.streams.length > 0) {
      // 检查视频流
      const videoStream = metadata.streams.find(
        (stream) => stream.codec_type === "video"
      );
      if (videoStream) {
        const videoCodec = videoStream.codec_name;
        console.log("Video Codec:", videoCodec);
      }

      // 检查音频流
      const audioStream = metadata.streams.find(
        (stream) => stream.codec_type === "audio"
      );
      if (audioStream) {
        const audioCodec = audioStream.codec_name;
        console.log("Audio Codec:", audioCodec);
      }
    }
  });

  //   如果当前视频支持流式，播放可以直接readstream，否则需要使用ffmpeg等进行转换
  const readableStream = fs.createReadStream(filePath);

  readableStream.on("data", (chunk) => {
    // 使用socket.emit发送二进制数据给客户端
    socket.emit("videoData", chunk);
  });

  readableStream.on("end", () => {
    socket.emit("videoDataComplete");
    // 关闭WebSocket连接
    socket.disconnect(true);
  });

  // 使用 fluent-ffmpeg 打开 MP4 文件
  // 创建 ffmpeg 命令
  //   const command = ffmpeg(filePath);

  //   // 指定输出格式为 MP4
  //   command.toFormat("mp4");

  //   // 创建可读流
  //   const stream = command.pipe();

  //   stream.on("data", (chunk) => {
  //     socket.emit("videoData", chunk);
  //   });

  //   stream.on("end", () => {
  //     socket.emit("videoDataComplete");
  //     // 关闭WebSocket连接
  //     socket.disconnect(true);
  //   });

  //   stream.on("error", (err) => {
  //     console.error("Stream error:", err);
  //   });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
