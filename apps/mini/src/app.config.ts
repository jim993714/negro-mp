/**
 * 小程序全局配置
 */
export default defineAppConfig({
  // 页面路由
  pages: [
    // 首页
    'pages/home/index',
    
    // 认证模块
    'pages/auth/login/index',
    'pages/auth/register/index',
    
    // 游戏模块
    'pages/game/list/index',
    'pages/game/detail/index',
    
    // 订单模块
    'pages/order/list/index',
    'pages/order/create/index',
    'pages/order/detail/index',
    
    // 用户模块
    'pages/user/profile/index',
    'pages/user/wallet/index',
    'pages/user/booster-apply/index',
    'pages/user/settings/index',
  ],
  
  // 窗口配置
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#667eea',
    navigationBarTitleText: '代练平台',
    navigationBarTextStyle: 'white',
  },
  
  // TabBar 配置
  tabBar: {
    custom: true, // 开启自定义 tabBar
    color: '#8a8a8a',
    selectedColor: '#667eea',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
      },
      {
        pagePath: 'pages/game/list/index',
        text: '游戏',
      },
      {
        pagePath: 'pages/order/list/index',
        text: '订单',
      },
      {
        pagePath: 'pages/user/profile/index',
        text: '我的',
      },
    ],
  },
})
