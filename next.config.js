/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker 部署用 standalone 输出
  output: "standalone",
  images: {
    unoptimized: true,
  },
  // 允许上传文件大小
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

module.exports = nextConfig;
