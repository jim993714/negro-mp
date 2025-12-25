import { PropsWithChildren, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { useUserStore } from '@/store/user';
import './app.scss';

function App({ children }: PropsWithChildren) {
  const { login, isLoggedIn } = useUserStore();

  useEffect(() => {
    // 检查登录状态
    const token = Taro.getStorageSync('token');
    if (token && !isLoggedIn) {
      // 尝试获取用户信息
      useUserStore.getState().fetchProfile();
    }
  }, [isLoggedIn]);

  return children;
}

export default App;

