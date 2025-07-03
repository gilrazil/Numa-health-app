// Firebase compatibility fixes for Expo SDK 53
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable require.context support
config.transformer.unstable_allowRequireContext = true;

// Disable ES module imports (which was causing issues)
config.transformer.experimentalImportSupport = false;

// Clear cache to ensure fresh builds
config.resetCache = true;

// Improve module resolution for monorepos or complex setups
// Disabled due to SDK 53 compatibility issues
// config.resolver.unstable_enablePackageExports = true;

// Optimize for iOS build issues
config.transformer.minifierConfig = {
  keep_classnames: true,
  keep_fnames: true,
};

// Resolver configuration for stability
config.resolver = {
  ...config.resolver,
  // Disable symlinks to prevent path resolution issues
  resolverMainFields: ['react-native', 'browser', 'main'],
  platforms: ['ios', 'android', 'native', 'web'],
  sourceExts: [...config.resolver.sourceExts, 'cjs'],
  // Temporarily disable package.json exports for SDK 53 compatibility
  unstable_enablePackageExports: false,
};

// Note: unstable_enablePackageExports is already set above

module.exports = config;
