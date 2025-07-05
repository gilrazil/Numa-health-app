import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, storage } from '../config/firebase';
import { Colors } from '../config';
import { CameraComponent } from '../components/CameraComponent';
import { log, logError } from '../utils/logger';
import { logRemote } from '../services/RemoteLogService';

export const CameraScreen = ({ navigation, route }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Get params from navigation
  const { 
    returnScreen = 'MealCamera', 
    autoSave = false, 
    userProfile = null 
  } = route.params || {};

  useEffect(() => {
    log("[CAMERA_SCREEN] 🚀 CameraScreen mounted");
    logRemote.info('[CAMERA_SCREEN] CameraScreen mounted', {
      returnScreen,
      autoSave,
      hasUserProfile: !!userProfile
    });
    
    // Get current user
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      log("[CAMERA_SCREEN] 👤 User authenticated:", currentUser.uid);
    } else {
      log("[CAMERA_SCREEN] ❌ No authenticated user");
      Alert.alert(
        'Authentication Required',
        'Please log in to take photos',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, []);

  const handlePhotoTaken = async (photo) => {
    try {
      log("[CAMERA_SCREEN] 📸 Photo taken successfully");
      logRemote.info('[CAMERA_SCREEN] Photo taken', {
        uri: photo.uri.substring(0, 50) + '...',
        width: photo.width,
        height: photo.height,
        optimized: photo.optimized
      });
      
      if (autoSave) {
        await savePhotoToFirebase(photo);
      } else {
        // Navigate to analysis or return screen with photo
        navigation.navigate('MealAnalysis', {
          imageUri: photo.uri,
          userProfile: userProfile,
          photoData: photo
        });
      }
      
    } catch (error) {
      logError("[CAMERA_SCREEN] ❌ Error handling photo:", error);
      logRemote.critical('[CAMERA_SCREEN] Error handling photo', error);
      handleError(error);
    }
  };

  const savePhotoToFirebase = async (photo) => {
    try {
      setUploading(true);
      setError(null);
      
      log("[CAMERA_SCREEN] ☁️ Uploading photo to Firebase Storage");
      logRemote.info('[CAMERA_SCREEN] Starting Firebase upload');
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create unique filename
      const timestamp = Date.now();
      const filename = `meals/${user.uid}/${timestamp}-${photo.width}x${photo.height}.jpg`;
      
      // Upload to Firebase Storage
      const downloadURL = await uploadImageToStorage(photo.uri, filename);
      
      // Save meal record to Firestore
      const mealData = {
        userId: user.uid,
        imageUrl: downloadURL,
        imageUri: photo.uri,
        timestamp: serverTimestamp(),
        photoData: {
          width: photo.width,
          height: photo.height,
          optimized: photo.optimized,
          originalSize: photo.originalSize
        },
        build: '28',
        source: 'camera'
      };
      
      await addDoc(collection(db, 'meals'), mealData);
      
      log("[CAMERA_SCREEN] ✅ Photo saved successfully");
      logRemote.info('[CAMERA_SCREEN] Photo saved successfully', {
        filename,
        downloadURL: downloadURL.substring(0, 50) + '...'
      });
      
      Alert.alert(
        'Photo Saved!',
        'Your meal photo has been saved successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      
    } catch (error) {
      logError("[CAMERA_SCREEN] ❌ Error saving photo:", error);
      logRemote.critical('[CAMERA_SCREEN] Error saving photo', error);
      handleError(error);
    } finally {
      setUploading(false);
    }
  };

  const uploadImageToStorage = async (imageUri, filename) => {
    try {
      log("[CAMERA_SCREEN] 📤 Starting image upload");
      
      // Convert image to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      log("[CAMERA_SCREEN] 📦 Image converted to blob, size:", blob.size);
      
      // Create storage reference
      const storageRef = ref(storage, filename);
      
      // Upload with progress tracking
      const uploadTask = uploadBytes(storageRef, blob);
      
      // Wait for upload to complete
      await uploadTask;
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      log("[CAMERA_SCREEN] ✅ Upload complete, URL:", downloadURL.substring(0, 50) + '...');
      
      return downloadURL;
      
    } catch (error) {
      logError("[CAMERA_SCREEN] ❌ Upload error:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  };

  const handleCancel = () => {
    log("[CAMERA_SCREEN] ❌ Camera cancelled");
    navigation.goBack();
  };

  const handleError = (error) => {
    logError("[CAMERA_SCREEN] ❌ Camera error:", error);
    setError(error.message);
    
    Alert.alert(
      'Camera Error',
      error.message,
      [
        { text: 'Retry', onPress: () => setError(null) },
        { text: 'Cancel', onPress: handleCancel }
      ]
    );
  };

  // Show uploading state
  if (uploading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="large" color={Colors.orange} />
          <Text style={styles.uploadingText}>Saving photo...</Text>
          <Text style={styles.uploadingSubtext}>
            Uploading to Firebase Storage
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={60} color={Colors.error} />
          <Text style={styles.errorTitle}>Camera Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          
          <View style={styles.errorButtons}>
            <TouchableOpacity 
              style={styles.errorButton} 
              onPress={() => setError(null)}
            >
              <Text style={styles.errorButtonText}>Try Again</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.errorButton, styles.cancelButton]} 
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Show camera component
  return (
    <CameraComponent
      onPhotoTaken={handlePhotoTaken}
      onCancel={handleCancel}
      onError={handleError}
      quality={0.7}
      allowRetake={true}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  uploadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  uploadingText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
  },
  uploadingSubtext: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorButtons: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 15,
  },
  errorButton: {
    backgroundColor: Colors.orange,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 