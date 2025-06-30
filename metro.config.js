// Firebase compatibility fixes for Expo SDK 53
console.log("🧠 Using metro.config.js - Config is being loaded!");
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Prevent cache corruption issues
config.resetCache = true;
config.cacheStores = [];

// Enhanced transformer options for stability
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
  },
  // Enable require.context to prevent runtime crashes
  experimentalImportSupport: false,
  unstable_allowRequireContext: true,
};

console.log("🔧 Metro Config Applied:");
console.log("  - unstable_allowRequireContext:", config.transformer.unstable_allowRequireContext);
console.log("  - experimentalImportSupport:", config.transformer.experimentalImportSupport);
console.log("  - resetCache:", config.resetCache);
console.log("  - unstable_enablePackageExports:", config.resolver.unstable_enablePackageExports);

// Resolver configuration for stability
config.resolver = {
  ...config.resolver,
  // Disable symlinks to prevent path resolution issues
  resolverMainFields: ['react-native', 'browser', 'main'],
  platforms: ['ios', 'android', 'native', 'web'],
};

// Fix for "Component auth has not been registered yet" error
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
