export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          🎮 游戏代练平台 API
        </h1>
        <p className="text-slate-400 mb-8">
          后端服务运行中...
        </p>
        <div className="space-y-2 text-left bg-slate-800/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">API 端点</h2>
          <ul className="space-y-2 text-slate-300 font-mono text-sm">
            <li>POST /api/auth/login - 微信登录</li>
            <li>GET /api/user/profile - 获取用户信息</li>
            <li>GET /api/games - 获取游戏列表</li>
            <li>GET /api/orders - 获取订单列表</li>
            <li>POST /api/orders - 创建订单</li>
            <li>GET /api/banners - 获取轮播图</li>
            <li>POST /api/booster/apply - 申请代练师</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

