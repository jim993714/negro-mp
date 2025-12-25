import { defineConfig } from '@tarojs/cli';
import type { UserConfigExport } from '@tarojs/cli';
import path from 'path';

export default defineConfig(async (merge) => {
  const baseConfig: UserConfigExport = {
    projectName: 'negro-mini',
    date: '2024-1-1',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      828: 1.81 / 2,
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: [],
    defineConstants: {},
    copy: {
      patterns: [],
      options: {},
    },
    framework: 'react',
    compiler: {
      type: 'webpack5',
      prebundle: { enable: false },
    },
    cache: {
      enable: false,
    },
    alias: {
      '@': path.resolve(__dirname, '..', 'src'),
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        url: {
          enable: true,
          config: {
            limit: 1024,
          },
        },
        cssModules: {
          enable: false,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      postcss: {
        autoprefixer: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
    },
  };

  if (process.env.NODE_ENV === 'development') {
    return merge({}, baseConfig, {
      env: {
        NODE_ENV: '"development"',
        TARO_APP_API_URL: '"http://localhost:3000"',
      },
      defineConstants: {
        'process.env.TARO_APP_API_URL': '"http://localhost:3000"',
      },
    });
  }

  return merge({}, baseConfig, {
    env: {
      NODE_ENV: '"production"',
      TARO_APP_API_URL: '"https://your-production-api.com"',
    },
    defineConstants: {
      'process.env.TARO_APP_API_URL': '"https://your-production-api.com"',
    },
    mini: {
      ...baseConfig.mini,
    },
    h5: {
      ...baseConfig.h5,
    },
  });
});

