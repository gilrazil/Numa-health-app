import 'dotenv/config';

export default {
  expo: {
    name: "Numa Health App",
    slug: "numa-health-app",
    owner: "gilraz",
    privacy: "public",
    platforms: ["ios", "android", "web"],
    version: "1.0.27",
    orientation: "portrait",
    sdkVersion: "53.0.0",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
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
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.gilraz.numahealthapp",
      buildNumber: "27",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription: "This app needs access to your camera to take photos of your meals for nutritional analysis.",
        NSPhotoLibraryUsageDescription: "This app needs access to your photo library to select meal photos for analysis.",
        NSMicrophoneUsageDescription: "This app may use the microphone when recording videos of meals.",
        NSPhotoLibraryAddUsageDescription: "This app needs permission to save meal photos to your photo library.",
        // Prevent cache-related crashes
        UIFileSharingEnabled: false,
        LSSupportsOpeningDocumentsInPlace: false
      }
    },
    android: {
      package: "com.numahealth.app",
      versionCode: 27,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "RECORD_AUDIO"
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
      "expo-camera",
      [
        "expo-image-picker",
        {
          photosPermission: "The app needs access to your photos to let you select meal images for analysis.",
          cameraPermission: "The app needs access to your camera to take photos of your meals."
        }
      ],
      [
        "expo-media-library",
        {
          photosPermission: "The app needs access to your photo library to save and manage meal photos.",
          savePhotosPermission: "The app needs permission to save meal photos to your photo library."
        }
      ]
    ]
  },
};
