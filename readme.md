# 流式播放对视频的格式和编码有要求，不是所有的内容都可以

- 目录中只有 frag_bunny 视频才可以，其他的视频暂时不可以
- 之后再研究具体不可以的原因

# 除了 mov 视频，其他的 mp4 文件 可以通过 http 静态文件播放直接播放

- 例如 /video 的静态 http 接口

# mp4 需要满足 iso bmf

https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API/Transcoding_assets_for_MSE#checking_fragmentation

- 把一个本地文件 mp4 转化为一个符合谷歌浏览器的分片 MP4
  ffmpeg -i h264.mp4 -movflags frag_keyframe+empty_moov+default_base_moof output.mp4
- 其他格式转换
  ffmpeg -i test.mov -c:v copy -c:a copy -movflags frag_keyframe+empty_moov+default_base_moof output.mp4

# 测试一个 mp4 是否支持 mse

https://nickdesaulniers.github.io/mp4info/
