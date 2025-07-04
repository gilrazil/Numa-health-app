import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../config';
import { log, logError } from '../utils/logger';
import { logRemote } from '../services/RemoteLogService';

const { width, height } = Dimensions.get('window');

export const CameraComponent = ({ 
  onPhotoTaken, 
  onCancel, 
  onError,
  quality = 0.7,
  allowRetake = true 
}) => {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, setMediaPermission] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');

  useEffect(() => {
    log("[CAMERA] 🚀 CameraComponent mounted");
    initializeCamera();
    
    return () => {
      log("[CAMERA] 🧹 CameraComponent unmounting");
      cleanup();
    };
  }, []);

  const initializeCamera = async () => {
    try {
      log("[CAMERA] 🔧 Initializing camera...");
      logRemote.info('[CAMERA] Initializing camera component');
      
      // Request camera permissions
      if (!permission?.granted) {
        log("[CAMERA] 🔐 Requesting camera permissions");
        const result = await requestPermission();
        if (!result.granted) {
          const error = new Error('Camera permission not granted');
          onError?.(error);
          return;
        }
      }

      // Request media library permissions
      const mediaLibraryResult = await MediaLibrary.requestPermissionsAsync();
      setMediaPermission(mediaLibraryResult);
      
      if (!mediaLibraryResult.granted) {
        log("[CAMERA] ⚠️ Media library permission not granted");
        Alert.alert(
          'Permission Required',
          'We need access to your photo library to save captured images.',
          [
            { text: 'OK', style: 'default' }
          ]
        );
      }

      setIsReady(true);
      log("[CAMERA] ✅ Camera initialized successfully");
      logRemote.info('[CAMERA] Camera initialized successfully');
      
    } catch (error) {
      logError("[CAMERA] ❌ Error initializing camera:", error);
      logRemote.critical('[CAMERA] Camera initialization failed', error);
      onError?.(error);
    }
  };

  const cleanup = async () => {
    try {
      // Clean up any temporary files
      if (capturedImage?.uri) {
        await FileSystem.deleteAsync(capturedImage.uri, { idempotent: true });
      }
    } catch (error) {
      logError("[CAMERA] ❌ Error during cleanup:", error);
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;
    
    try {
      setIsCapturing(true);
      log("[CAMERA] 📸 Taking picture...");
      logRemote.info('[CAMERA] Taking picture');
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: quality,
        base64: false,
        skipProcessing: false,
        imageType: 'jpg',
      });
      
      log("[CAMERA] 📸 Picture taken successfully");
      logRemote.info('[CAMERA] Picture taken successfully', {
        uri: photo.uri.substring(0, 50) + '...',
        width: photo.width,
        height: photo.height
      });
      
      setCapturedImage(photo);
      
    } catch (error) {
      logError("[CAMERA] ❌ Error taking picture:", error);
      logRemote.critical('[CAMERA] Error taking picture', error);
      
      Alert.alert(
        'Camera Error',
        'Failed to take picture. Please try again.',
        [
          { text: 'Retry', onPress: takePicture },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const retakePicture = () => {
    log("[CAMERA] 🔄 Retaking picture");
    setCapturedImage(null);
  };

  const confirmPicture = async () => {
    if (!capturedImage) return;
    
    try {
      setProcessing(true);
      log("[CAMERA] ✅ Confirming picture");
      logRemote.info('[CAMERA] Confirming picture');
      
      // Optimize image
      const optimizedImage = await optimizeImage(capturedImage);
      
      // Call parent callback with optimized image
      onPhotoTaken?.(optimizedImage);
      
    } catch (error) {
      logError("[CAMERA] ❌ Error confirming picture:", error);
      logRemote.critical('[CAMERA] Error confirming picture', error);
      onError?.(error);
    } finally {
      setProcessing(false);
    }
  };

  const optimizeImage = async (image) => {
    try {
      log("[CAMERA] 🔧 Optimizing image...");
      
      // Get image info
      const imageInfo = await FileSystem.getInfoAsync(image.uri);
      log("[CAMERA] 📊 Original image size:", imageInfo.size);
      
      // If image is too large, resize it
      if (imageInfo.size > 2000000) { // 2MB
        log("[CAMERA] 🔄 Resizing large image");
        
        // Calculate new dimensions (max 1080p)
        const maxWidth = 1080;
        const maxHeight = 1920;
        
        let { width: newWidth, height: newHeight } = image;
        
        if (newWidth > maxWidth || newHeight > maxHeight) {
          const ratio = Math.min(maxWidth / newWidth, maxHeight / newHeight);
          newWidth = Math.round(newWidth * ratio);
          newHeight = Math.round(newHeight * ratio);
        }
        
        // Create optimized version
        const optimizedUri = `${FileSystem.cacheDirectory}optimized-${Date.now()}.jpg`;
        
        // For now, return original image with metadata
        // In production, you might want to use expo-image-manipulator
        return {
          ...image,
          optimizedUri,
          originalSize: imageInfo.size,
          optimized: true
        };
      }
      
      return {
        ...image,
        originalSize: imageInfo.size,
        optimized: false
      };
      
    } catch (error) {
      logError("[CAMERA] ❌ Error optimizing image:", error);
      // Return original image if optimization fails
      return image;
    }
  };

  const toggleFlash = () => {
    setFlash(flash === 'off' ? 'on' : 'off');
  };

  const toggleFacing = () => {
    setFacing(facing === 'back' ? 'front' : 'back');
  };

  // Show loading while initializing
  if (!isReady || !permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.orange} />
          <Text style={styles.loadingText}>Initializing camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show permission denied screen
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <MaterialCommunityIcons name="camera-off" size={80} color={Colors.lightGrey} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to take meal photos. Please enable camera permissions in your device settings.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Request Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show captured image preview
  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage.uri }} style={styles.previewImage} />
          
          <View style={styles.previewControls}>
            <TouchableOpacity 
              style={styles.previewButton} 
              onPress={retakePicture}
              disabled={processing}
            >
              <MaterialCommunityIcons name="camera-retake" size={24} color={Colors.black} />
              <Text style={styles.previewButtonText}>Retake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.previewButton, styles.confirmButton]} 
              onPress={confirmPicture}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check" size={24} color="#fff" />
                  <Text style={styles.confirmButtonText}>Use Photo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Show camera view
  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
        onCameraReady={() => {
          log("[CAMERA] 📹 Camera ready");
          setIsReady(true);
        }}
        onMountError={(error) => {
          logError("[CAMERA] ❌ Camera mount error:", error);
          onError?.(error);
        }}
      >
        {/* Camera controls overlay */}
        <View style={styles.overlay}>
          {/* Top controls */}
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.controlButton} onPress={onCancel}>
              <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
              <MaterialCommunityIcons 
                name={flash === 'off' ? 'flash-off' : 'flash'} 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>

          {/* Bottom controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleFacing}>
              <MaterialCommunityIcons name="camera-flip" size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.captureButton, isCapturing && styles.captureButtonActive]} 
              onPress={takePicture}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <MaterialCommunityIcons name="camera" size={32} color="#fff" />
              )}
            </TouchableOpacity>
            
            <View style={styles.placeholder} />
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.orange,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonActive: {
    backgroundColor: Colors.darkOrange,
  },
  placeholder: {
    width: 50,
    height: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#000',
  },
  permissionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: Colors.orange,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 30,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 30,
    backgroundColor: '#000',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    gap: 8,
  },
  previewButtonText: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: Colors.orange,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 