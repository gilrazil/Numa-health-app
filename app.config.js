export default {
  expo: {
    name: "Numa Health App",
    slug: "numa-health-app",
    owner: "gilraz",
    privacy: "public",
    platforms: ["ios", "android", "web"],
    version: "1.0.22",
    orientation: "portrait",
    sdkVersion: "53.0.0",
    icon: "./assets/numa-logo.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    updates: {
      url: "https://u.expo.dev/f8a7c205-a5a5-4ac0-b6e9-a084d95662fa",
      fallbackToCacheTimeout: 0,
      checkAutomatically: "ON_ERROR_RECOVERY",
      enabled: false // Disable updates to prevent cache conflicts
    },
    runtimeVersion: "1.0.0",
    web: {
      favicon: "./assets/numa-logo.png",
      bundler: "metro"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.numahealth.app",
      buildNumber: "22",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription: "This app uses the camera to let you take photos of your meals for tracking.",
        NSPhotoLibraryUsageDescription: "This app accesses your photo library to let you select meal photos.",
        NSPhotoLibraryAddUsageDescription: "This app saves analyzed meal photos to your photo library.",
        // Prevent cache-related crashes
        UIFileSharingEnabled: false,
        LSSupportsOpeningDocumentsInPlace: false
      }
    },
    android: {
      package: "com.numahealth.app",
      versionCode: 12,
      adaptiveIcon: {
        foregroundImage: "./assets/numa-logo.png",
        backgroundColor: "#FFFFFF"
      },
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    extra: {
      eas: {
        projectId: "f8a7c205-a5a5-4ac0-b6e9-a084d95662fa"
      }
    },
    jsEngine: "hermes", // Hermes is required for SDK 52+
    packagerOpts: {
      config: "metro.config.js"
    },
    plugins: [
      'expo-font'
    ]
  },
};
