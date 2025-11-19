const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// SVG transformer
config.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer",
);

// Asset extensions - remove svg from assets since we're transforming it
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== "svg",
);

// Source extensions - add svg
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

module.exports = config;
