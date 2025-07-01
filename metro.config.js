// Firebase compatibility fixes for Expo SDK 53
if (__DEV__) {
  console.log("🧠 Using metro.config.js - Config is being loaded!");
}

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable require.context support
config.transformer.unstable_allowRequireContext = true;

// Disable ES module imports (which was causing issues)
config.transformer.experimentalImportSupport = false;

// Clear cache to ensure fresh builds
config.resetCache = true;

// Improve module resolution for monorepos or complex setups
config.resolver.unstable_enablePackageExports = true;

// Optimize for iOS build issues
config.transformer.minifierConfig = {
  keep_classnames: true,
  keep_fnames: true,
};

if (__DEV__) {
  console.log("🔧 Metro Config Applied:");
  console.log("  - unstable_allowRequireContext:", config.transformer.unstable_allowRequireContext);
  console.log("  - experimentalImportSupport:", config.transformer.experimentalImportSupport);
  console.log("  - resetCache:", config.resetCache);
  console.log("  - unstable_enablePackageExports:", config.resolver.unstable_enablePackageExports);
}

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
