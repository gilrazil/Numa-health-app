import React, { useState, useEffect } from 'react';
import {
import { log, logError, logWarn } from '../utils/logger';
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
  Platform,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, auth, db, storage } from '../config';
import { Button, LoadingIndicator, AlphaBadge } from '../components';
import { collection, addDoc, doc, getDoc, query, where, orderBy, limit, getDocs, deleteDoc } from 'firebase/firestore';

export const MealCameraScreen = ({ navigation }) => {
  log("[CAMERA] 🚀 MealCameraScreen component called");
  log("[CAMERA] 🔧 __DEV__ flag:", __DEV__);
  log("[CAMERA] 🔧 NODE_ENV:", process.env.NODE_ENV);

  const [uploading, setUploading] = useState(false);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [mealsLoading, setMealsLoading] = useState(true);
  const [developmentMode, setDevelopmentMode] = useState(__DEV__ || process.env.NODE_ENV === 'development');

  useEffect(() => {
    log("[CAMERA] ⚡ MealCameraScreen useEffect triggered");
    log("[CAMERA] 🔧 Development mode:", developmentMode);
    
    // Wrap everything in try-catch to prevent crashes
    try {
      if (developmentMode) {
        log("[CAMERA] 🛠️ Running in development mode - using safe initialization");
        // Safe initialization for development
        safeInitialization();
      } else {
        // Production initialization
        requestPermissions();
        fetchMeals();
        checkUserProfile();
        cleanupOldMeals();
      }
    } catch (error) {
      logError("[CAMERA] 🔥 Error in useEffect:", error);
      logError("[CAMERA] 🔥 Error stack:", error.stack);
      setError(`Initialization error: ${error.message}`);
      setLoading(false);
    }

    // Add focus listener to clear error and refresh meals when returning to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      setError(null);
      fetchMeals(); // Refresh meals when screen is focused
    });

    // Cleanup listener on unmount
    return unsubscribe;
  }, [navigation]);

  // Safe initialization for development mode
  const safeInitialization = async () => {
    log("[CAMERA] 🛠️ safeInitialization called");
    try {
      setLoading(true);
      
      // Skip camera permissions in development mode
      log("[CAMERA] ⚠️ Skipping camera permissions in development mode");
      setPermissionStatus({
        camera: 'dev-mode',
        mediaLibrary: 'dev-mode'
      });
      
      // Still try to fetch meals and user profile
      log("[CAMERA] 📊 Fetching data in development mode");
      await fetchMeals();
      await checkUserProfile();
      
      log("[CAMERA] ✅ Safe initialization completed");
    } catch (error) {
      logError("[CAMERA] 🔥 Error in safe initialization:", error);
      setError(`Safe initialization failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const requestPermissions = async () => {
    log("[CAMERA] 🔐 requestPermissions called");
    log("[CAMERA] 🔧 Development mode status:", developmentMode);
    
    // Skip permission requests in development mode
    if (developmentMode) {
      log("[CAMERA] 🛠️ Skipping permission requests in development mode");
      setPermissionStatus({
        camera: 'dev-mode',
        mediaLibrary: 'dev-mode'
      });
      setLoading(false);
      return;
    }
    
    try {
      log("[CAMERA] 🔐 Starting camera permission requests");
      setLoading(true);
      // Request camera permissions
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      
      setPermissionStatus({
        camera: cameraPermission.status,
        mediaLibrary: mediaLibraryPermission.status
      });
      
      if (cameraPermission.status !== 'granted' || mediaLibraryPermission.status !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'We need camera and photo library permissions to let you take meal photos. Please enable them in your device settings.',
          [
            { 
              text: 'Open Settings', 
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      logError('Error requesting permissions:', error);
      setError('Failed to request permissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMeals = async () => {
    try {
      setMealsLoading(true);
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        log('🔍 Fetching meals for user:', currentUser.uid);
        
        const mealsQuery = query(
          collection(db, 'meals'),
          where('userId', '==', currentUser.uid),
          orderBy('timestamp', 'desc'), // Index ready - meals will be ordered by newest first
          limit(10)
        );
        
        const querySnapshot = await getDocs(mealsQuery);
        const mealsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        log('📋 Fetched meals:', mealsData.length, 'meals found');
        log('📋 First meal data:', mealsData[0] || 'No meals');
        
        setMeals(mealsData);
      } else {
        log('❌ No current user found');
      }
    } catch (error) {
      logError('Error fetching meals:', error);
      setError('Failed to load meal history');
    } finally {
      setMealsLoading(false);
    }
  };

  const checkUserProfile = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile(userData);
        }
      }
    } catch (error) {
      logError('Error fetching user profile:', error);
    }
  };

  const takePhoto = async () => {
    try {
      log("[CAMERA] 📸 takePhoto called");
      setError(null);
      
      // Development mode - show mock behavior
      if (developmentMode) {
        log("[CAMERA] 🛠️ Development mode - showing mock camera behavior");
        Alert.alert(
          "Development Mode",
          "Camera is disabled in development mode to prevent crashes. In production, this would open the camera.",
          [
            { text: "OK", style: "default" },
            { text: "Enable Camera", onPress: () => setDevelopmentMode(false) }
          ]
        );
        return;
      }
      
      // Check if ImagePicker is available
      if (!ImagePicker || !ImagePicker.launchCameraAsync) {
        logError("[CAMERA] ❌ ImagePicker is not available.");
        Alert.alert("Camera Error", "Image picker is not available.");
        return;
      }
      
      if (permissionStatus?.camera !== 'granted') {
        log("[CAMERA] ⚠️ Camera permission not granted, requesting permissions");
        await requestPermissions();
        return;
      }

      log("[📸 Camera] Launching camera...");
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: [ImagePicker.MediaTypeOptions.Images],
        allowsEditing: false,
        quality: 0.8,
        exif: false,
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
      });

      log("[📸 Camera] Result:", result);
      if (!result.canceled && result.assets[0]) {
        // Directly navigate to meal analysis after taking photo
        await navigateToMealAnalysis(result.assets[0]);
      }
    } catch (error) {
      logError('Error taking photo:', error);
      setError('Failed to take photo. Please try again.');
      Alert.alert(
        'Camera Error',
        'There was a problem accessing the camera. Please make sure the camera is not being used by another app.',
        [
          { text: 'Retry', onPress: takePhoto },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const pickFromGallery = async () => {
    try {
      log("[CAMERA] 🖼️ pickFromGallery called");
      setError(null);
      
      // Development mode - show mock behavior
      if (developmentMode) {
        log("[CAMERA] 🛠️ Development mode - showing mock gallery behavior");
        Alert.alert(
          "Development Mode",
          "Gallery access is disabled in development mode to prevent crashes. In production, this would open the photo gallery.",
          [
            { text: "OK", style: "default" },
            { text: "Enable Gallery", onPress: () => setDevelopmentMode(false) }
          ]
        );
        return;
      }
      
      // Check if ImagePicker is available
      if (!ImagePicker || !ImagePicker.launchImageLibraryAsync) {
        logError("[CAMERA] ❌ ImagePicker is not available.");
        Alert.alert("Gallery Error", "Image picker is not available.");
        return;
      }
      
      if (permissionStatus?.mediaLibrary !== 'granted') {
        log("[CAMERA] ⚠️ Media library permission not granted, requesting permissions");
        await requestPermissions();
        return;
      }

      log("[📸 Gallery] Launching gallery...");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaTypeOptions.Images],
        allowsEditing: false,
        quality: 0.8,
        exif: false,
      });

      log("[📸 Gallery] Result:", result);
      if (!result.canceled && result.assets[0]) {
        // Directly navigate to meal analysis after picking from gallery
        await navigateToMealAnalysis(result.assets[0]);
      }
    } catch (error) {
      logError('Error picking from gallery:', error);
      setError('Failed to pick image. Please try again.');
      Alert.alert(
        'Gallery Error',
        'There was a problem accessing your photo library. Please make sure you have granted permission.',
        [
          { text: 'Retry', onPress: pickFromGallery },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const uploadImageToFirebase = async (imageUri) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Create a unique filename
      const filename = `meals/${currentUser.uid}/${Date.now()}.jpg`;
      
      // Upload image to Firebase Storage
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const ref = storage.ref().child(filename);
      
      // Add upload progress tracking
      const uploadTask = ref.put(blob);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            log('Upload progress:', progress);
          },
          (error) => {
            logError('Upload error:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await ref.getDownloadURL();
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      logError('Error uploading to Firebase:', error);
      throw error;
    }
  };



  const handlePhotoTaken = async (photo) => {
    try {
      setLoading(true);
      
      // Get user profile for analysis
      const userProfile = await getUserProfile();
      
      // Navigate to analysis immediately
      navigation.navigate('MealAnalysis', {
        imageUri: photo.uri,
        userProfile: userProfile
      });
      
    } catch (error) {
      logError('Error starting meal analysis:', error);
      Alert.alert('Error', 'Failed to start analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToMealAnalysis = async (imageAsset) => {
    try {
      setUploading(true);
      setError(null);
      
      // Get user profile for analysis
      const userProfile = await getUserProfile();
      
      // Navigate directly to meal analysis screen
      navigation.navigate('MealAnalysis', {
        imageUri: imageAsset.uri,
        userProfile: userProfile,
        autoSave: true // Flag to indicate this should be auto-saved
      });
      
    } catch (error) {
      logError('Error navigating to meal analysis:', error);
      setError('Failed to start analysis. Please try again.');
      Alert.alert(
        'Analysis Error',
        'There was a problem starting the meal analysis. Would you like to retry?',
        [
          { text: 'Retry', onPress: () => navigateToMealAnalysis(imageAsset) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setUploading(false);
    }
  };

  const getUserProfile = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          return userDoc.data();
        }
      }
      
      // Return default profile if no data found
      return {
        goal: 'maintain',
        age: 30,
        weight: 70,
        height: 170,
        gender: 'other'
      };
    } catch (error) {
      logError('Error getting user profile:', error);
      return {
        goal: 'maintain',
        age: 30,
        weight: 70,
        height: 170,
        gender: 'other'
      };
    }
  };

  const renderMealItem = (meal) => {
    const imageUri = meal.imageUrl || meal.imageUri || meal.localUri;
    
    log('🖼️ Rendering meal item:', {
      id: meal.id,
      hasImageUrl: !!meal.imageUrl,
      hasImageUri: !!meal.imageUri,
      hasLocalUri: !!meal.localUri,
      finalImageUri: imageUri?.substring(0, 50) + '...',
      timestamp: meal.timestamp
    });
    
    return (
      <TouchableOpacity 
        key={meal.id} 
        style={styles.mealItem}
        onPress={() => handleMealPress(meal)}
        activeOpacity={0.7}
      >
        {imageUri ? (
          <Image 
            source={{ uri: imageUri }} 
            style={styles.mealImage}
            onError={(error) => {
              log('❌ Image load error for meal:', meal.id, error);
              log('❌ Problematic image URI:', imageUri);
            }}
            onLoad={() => {
              log('✅ Image loaded successfully for meal:', meal.id);
            }}
          />
        ) : (
          <View style={[styles.mealImage, styles.placeholderImage]}>
            <MaterialCommunityIcons name="image-off" size={40} color={Colors.lightGrey} />
          </View>
        )}
        <Text style={styles.mealDate}>
          {(() => {
            // Try different date fields and formats
            const dateValue = meal.timestamp || meal.createdAt || meal.date;
            if (!dateValue) return 'No date';
            
            try {
              const date = new Date(dateValue);
              if (isNaN(date.getTime())) {
                return 'Invalid date';
              }
              return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
            } catch (error) {
              log('Date parsing error:', error);
              return 'Date error';
            }
          })()}
        </Text>
        
        {/* Visual indicator that it's clickable */}
        <View style={styles.clickIndicator}>
          <MaterialCommunityIcons name="chevron-right" size={16} color={Colors.darkgrey} />
        </View>
      </TouchableOpacity>
    );
  };

  const handleMealPress = async (meal) => {
    try {
      // Check if the meal has analysis data
      if (meal.analysis) {
        // Navigate directly to analysis screen with stored data
        navigation.navigate('MealAnalysis', {
          imageUri: meal.imageUri || meal.imageUrl || meal.localUri,
          userProfile: await getUserProfile(),
          existingAnalysis: meal.analysis, // Pass the existing analysis
          isHistorical: true // Flag to indicate this is a historical view
        });
      } else {
        // If no analysis exists, show option to analyze now
        Alert.alert(
          'No Analysis Available',
          'This meal was saved before analysis was available. Would you like to analyze it now?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Analyze Now', 
              onPress: () => navigation.navigate('MealAnalysis', {
                imageUri: meal.imageUri || meal.imageUrl || meal.localUri,
                userProfile: getUserProfile(),
                isHistorical: true
              })
            }
          ]
        );
      }
    } catch (error) {
      logError('Error handling meal press:', error);
      Alert.alert('Error', 'Unable to view meal analysis. Please try again.');
    }
  };

  const cleanupOldMeals = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Calculate date 2 weeks ago
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      // Get all meals for the user
      const mealsQuery = query(
        collection(db, 'meals'),
        where('userId', '==', currentUser.uid)
      );
      const mealsSnapshot = await getDocs(mealsQuery);

      const meals = mealsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Find meals older than 2 weeks
      const mealsToDelete = meals.filter(meal => {
        const mealDate = new Date(meal.timestamp || meal.createdAt || meal.date);
        return mealDate < twoWeeksAgo;
      });

      if (mealsToDelete.length > 0) {
        log(`Cleaning up ${mealsToDelete.length} meals older than 2 weeks`);

        for (const meal of mealsToDelete) {
          // Delete from Firestore
          await db.collection('meals').doc(meal.id).delete();
          
          // Delete image from Storage if it exists
          if (meal.imageUrl) {
            try {
              const imageRef = storage.refFromURL(meal.imageUrl);
              await imageRef.delete();
            } catch (error) {
              log('Could not delete image:', error);
            }
          }
        }
        
        log(`Successfully cleaned up ${mealsToDelete.length} old meals`);
      } else {
        log('No old meals to clean up');
      }
    } catch (error) {
      logError('Error cleaning up old meals:', error);
    }
  };

  const deleteMeal = async (mealId) => {
    try {
      await deleteDoc(doc(db, 'meals', mealId));
      
      // Remove from local state
      setMeals(prevMeals => prevMeals.filter(meal => meal.id !== mealId));
      
      Alert.alert('Success', 'Meal deleted successfully');
    } catch (error) {
      logError('Error deleting meal:', error);
      Alert.alert('Error', 'Failed to delete meal');
    }
  };

  const handleGoBack = async () => {
    if (analysisResult) {
      try {
        // Save the analyzed meal to history
        const mealData = {
          imageUrl: imageUri,
          timestamp: new Date().toISOString(),
          analysis: analysisResult,
          userId: user.uid
        };

        await addDoc(collection(db, 'meals'), mealData);
        Alert.alert('Success', 'Meal saved to history');
      } catch (error) {
        logError('Error saving meal:', error);
        Alert.alert('Error', 'Failed to save meal to history');
      }
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.black} />
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Meal Tracker</Text>
          <AlphaBadge style={styles.alphaBadgeHeader} />
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchMeals}
            colors={[Colors.orange]}
            tintColor={Colors.orange}
          />
        }
      >
        {error && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={24} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Development Mode Warning */}
        {developmentMode && (
          <View style={styles.devModeWarning}>
            <MaterialCommunityIcons name="dev-to" size={24} color="#FF6B35" />
            <Text style={styles.devModeTitle}>Development Mode</Text>
            <Text style={styles.devModeText}>
              Camera is disabled in Expo Go to prevent crashes. Use dev client or TestFlight for full camera functionality.
            </Text>
            <TouchableOpacity
              style={styles.enableCameraButton}
              onPress={() => setDevelopmentMode(false)}
            >
              <Text style={styles.enableCameraText}>Force Enable Camera (may crash)</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.cameraContainer}>
          <View style={styles.cameraPlaceholder}>
            <MaterialCommunityIcons name="camera" size={80} color={Colors.lightGrey} />
            <Text style={styles.cameraText}>Take a photo of your meal</Text>
            {developmentMode ? (
              <Text style={styles.devModeStatusText}>
                🛠️ Camera disabled in development mode
              </Text>
            ) : permissionStatus?.camera !== 'granted' && (
              <Text style={styles.permissionText}>
                Camera permission is required
              </Text>
            )}
          </View>
          
          <View style={styles.cameraActions}>
            <TouchableOpacity 
              style={[styles.cameraButton, (developmentMode || permissionStatus?.camera !== 'granted' || uploading) && styles.disabledButton]} 
              onPress={takePhoto}
              disabled={developmentMode || permissionStatus?.camera !== 'granted' || uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="camera" size={30} color="#fff" />
                  <Text style={styles.cameraButtonText}>Take Photo</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.galleryButton, (developmentMode || permissionStatus?.mediaLibrary !== 'granted' || uploading) && styles.disabledButton]} 
              onPress={pickFromGallery}
              disabled={developmentMode || permissionStatus?.mediaLibrary !== 'granted' || uploading}
            >
              <MaterialCommunityIcons name="image" size={30} color="#6B4EFF" />
              <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Meals */}
        <View style={styles.recentMeals}>
          <Text style={styles.sectionTitle}>Recent Meals</Text>
          {mealsLoading ? (
            <LoadingIndicator size="large" color={Colors.orange} />
          ) : meals.length > 0 ? (
            <View style={styles.mealsGrid}>
              {meals.map(renderMealItem)}
            </View>
          ) : (
            <Text style={styles.noMealsText}>No meals yet. Start by taking your first meal photo!</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alphaBadgeHeader: {
    transform: [{ scale: 0.8 }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.black,
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cameraContainer: {
    marginTop: 30,
  },
  cameraPlaceholder: {
    backgroundColor: Colors.lightGrey + '20',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: Colors.lightGrey,
    borderStyle: 'dashed',
  },
  cameraText: {
    fontSize: 16,
    color: Colors.darkgrey,
    marginTop: 10,
    textAlign: 'center',
  },
  devModeStatusText: {
    fontSize: 14,
    color: '#FF6B35',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  permissionText: {
    fontSize: 14,
    color: Colors.error || '#FF4444',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  devModeWarning: {
    backgroundColor: '#FFF4F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF6B35',
    alignItems: 'center',
  },
  devModeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B35',
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
  },
  devModeText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  enableCameraButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  enableCameraText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
    flex: 1,
    lineHeight: 20,
  },
  cameraActions: {
    gap: 15,
  },
  cameraButton: {
    backgroundColor: '#6B4EFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  galleryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#6B4EFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  galleryButtonText: {
    color: '#6B4EFF',
    fontSize: 18,
    fontWeight: '600',
  },
  imageContainer: {
    marginTop: 30,
  },
  selectedImage: {
    width: '100%',
    height: 400,
    borderRadius: 16,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  imageActions: {
    flexDirection: 'row',
    gap: 15,
  },
  retakeButton: {
    flex: 1,
    backgroundColor: Colors.lightGrey,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: '600',
  },
  usePhotoButton: {
    flex: 2,
    backgroundColor: '#6B4EFF',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  usePhotoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  recentMeals: {
    marginTop: 40,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
  mealsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  mealItem: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  mealImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  mealDate: {
    fontSize: 12,
    color: Colors.darkgrey,
    textAlign: 'center',
  },
  noMealsText: {
    fontSize: 16,
    color: Colors.darkgrey,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
  placeholderImage: {
    backgroundColor: Colors.lightGrey + '20',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clickIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.error,
    marginLeft: 8,
    flex: 1,
  },
  permissionText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 8,
  },
}); 