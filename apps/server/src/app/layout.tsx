import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '游戏代练平台 API',
  description: '游戏代练平台后端服务',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

