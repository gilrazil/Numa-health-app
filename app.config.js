export default {
  expo: {
    name: "Numa Health App",
    slug: "numa-health-app",
    owner: "gilraz",
    privacy: "public",
    platforms: ["ios", "android", "web"],
    version: "1.0.0",
    orientation: "portrait",
    sdkVersion: "53.0.0",
    icon: "./assets/numa-logo.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "cover",
      backgroundColor: "#007AFF",
    },
    updates: {
      url: "https://u.expo.dev/f8a7c205-a5a5-4ac0-b6e9-a084d95662fa",
      fallbackToCacheTimeout: 0
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    web: {
      favicon: "./assets/numa-logo.png",
      bundler: "metro"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.numahealth.app",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription: "This app uses the camera to let you take photos of your meals for tracking.",
        NSPhotoLibraryUsageDescription: "This app accesses your photo library to let you select meal photos."
      }
    },
    android: {
      package: "com.numahealth.app",
      adaptiveIcon: {
        foregroundImage: "./assets/numa-logo.png",
        backgroundColor: "#007AFF"
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
  },
};
