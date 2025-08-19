module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "expo-router/babel",
      // NOTE: This plugin MUST be listed last
      "react-native-reanimated/plugin",
    ],
  };
};


