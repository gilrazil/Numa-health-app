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
config.resolver.unstable_enablePackageExports = true;

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
};

// Fix for "Component auth has not been registered yet" error
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
