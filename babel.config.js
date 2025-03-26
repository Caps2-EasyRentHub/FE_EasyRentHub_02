module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['module:metro-react-native-babel-preset'],
    env: {
      production: {
        plugins: ['react-native-paper/babel'],
      },
    },
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@/*': ['./src/*'],
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
