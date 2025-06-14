import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, auth, db, storage } from '../config';
import { Button } from '../components';

export const MealCameraScreen = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestPermissions();
    loadMeals();
    // Clean up old meals periodically
    cleanupOldMeals();
  }, []);

  const requestPermissions = async () => {
    // Request camera permissions
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
    
    if (cameraPermission.status !== 'granted' || mediaLibraryPermission.status !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'We need camera and photo library permissions to let you take meal photos.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadMeals = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Simplified query to avoid composite index requirement
        const mealsSnapshot = await db
          .collection('meals')
          .where('userId', '==', currentUser.uid)
          .limit(20) // Increased limit to get more meals
          .get();
        
        // Sort the results in JavaScript instead of Firestore
        const mealsData = mealsSnapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              // Normalize the timestamp field
              sortTimestamp: data.timestamp || data.createdAt || data.date || new Date().toISOString()
            };
          })
          .sort((a, b) => {
            // Sort by timestamp descending (newest first)
            const dateA = new Date(a.sortTimestamp);
            const dateB = new Date(b.sortTimestamp);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 10); // Take only the 10 most recent
        
        console.log('Loaded meals:', mealsData.length);
        console.log('Sample meal data:', mealsData[0]);
        setMeals(mealsData);
      }
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.6,
        aspect: [4, 3],
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.6,
        aspect: [4, 3],
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking from gallery:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
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
      await ref.put(blob);
      
      // Get download URL
      const downloadURL = await ref.getDownloadURL();
      return downloadURL;
    } catch (error) {
      console.error('Error uploading to Firebase:', error);
      throw error;
    }
  };

  const uploadMeal = async () => {
    if (!selectedImage) return;

    try {
      setUploading(true);
      
      // Get user profile for analysis
      const userProfile = await getUserProfile();
      
      // Navigate to analysis immediately (don't wait for save)
      navigation.navigate('MealAnalysis', {
        imageUri: selectedImage.uri,
        userProfile: userProfile
      });
      
      // Save meal in background (async, don't wait)
      saveMealInBackground(selectedImage.uri);
      
    } catch (error) {
      console.error('Error starting meal analysis:', error);
      Alert.alert('Error', 'Failed to start analysis. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Background save function (doesn't block navigation)
  const saveMealInBackground = async (imageUri) => {
    try {
      console.log('🔄 Saving meal in background...');
      
      // Upload to Firebase Storage
      const downloadURL = await uploadImageToFirebase(imageUri);
      
      // Save meal record to Firestore
      const currentUser = auth.currentUser;
      if (currentUser) {
        const mealData = {
          userId: currentUser.uid,
          imageUrl: downloadURL,
          imageUri: imageUri,
          localUri: imageUri,
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          date: new Date().toDateString(),
        };
        
        await db.collection('meals').add(mealData);
        console.log('✅ Meal saved to history in background');
        
        // Refresh meals list after save
        await loadMeals();
      }
    } catch (error) {
      console.error('❌ Error saving meal in background:', error);
      // Don't show alert since user is already in analysis screen
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
      
      // Save meal in background (including device storage)
      saveMealWithDeviceStorage(photo.uri);
      
    } catch (error) {
      console.error('Error starting meal analysis:', error);
      Alert.alert('Error', 'Failed to start analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Background save with device storage
  const saveMealWithDeviceStorage = async (imageUri) => {
    try {
      console.log('🔄 Saving meal with device storage in background...');
      
      // Save photo to device storage
      const asset = await MediaLibrary.createAssetAsync(imageUri);
      console.log('📱 Photo saved to gallery:', asset.uri);
      
      // Upload to Firebase Storage
      const downloadURL = await uploadImageToFirebase(imageUri);
      
      // Save meal record to Firestore
      const currentUser = auth.currentUser;
      if (currentUser) {
        const mealData = {
          userId: currentUser.uid,
          imageUrl: downloadURL,
          imageUri: imageUri,
          localUri: imageUri,
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          date: new Date().toDateString(),
        };
        
        await db.collection('meals').add(mealData);
        console.log('✅ Meal saved to history in background');
        
        // Refresh meals list after save
        await loadMeals();
      }
    } catch (error) {
      console.error('❌ Error saving meal with device storage:', error);
      // Don't show alert since user is already in analysis screen
    }
  };

  const getUserProfile = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
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
      console.error('Error getting user profile:', error);
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
              console.log('Image load error for meal:', meal.id, error);
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
              console.log('Date parsing error:', error);
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
      console.error('Error handling meal press:', error);
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
      const mealsSnapshot = await db
        .collection('meals')
        .where('userId', '==', currentUser.uid)
        .get();

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
        console.log(`Cleaning up ${mealsToDelete.length} meals older than 2 weeks`);

        for (const meal of mealsToDelete) {
          // Delete from Firestore
          await db.collection('meals').doc(meal.id).delete();
          
          // Delete image from Storage if it exists
          if (meal.imageUrl) {
            try {
              const imageRef = storage.refFromURL(meal.imageUrl);
              await imageRef.delete();
            } catch (error) {
              console.log('Could not delete image:', error);
            }
          }
        }
        
        console.log(`Successfully cleaned up ${mealsToDelete.length} old meals`);
      } else {
        console.log('No old meals to clean up');
      }
    } catch (error) {
      console.error('Error cleaning up old meals:', error);
    }
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
        <Text style={styles.title}>Meal Tracker</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
            <View style={styles.imageActions}>
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={() => setSelectedImage(null)}
              >
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.usePhotoButton, uploading && styles.disabledButton]}
                onPress={uploadMeal}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.usePhotoButtonText}>Use Photo</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            <View style={styles.cameraPlaceholder}>
              <MaterialCommunityIcons name="camera" size={80} color={Colors.lightGrey} />
              <Text style={styles.cameraText}>Take a photo of your meal</Text>
            </View>
            
            <View style={styles.cameraActions}>
              <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
                <MaterialCommunityIcons name="camera" size={30} color="#fff" />
                <Text style={styles.cameraButtonText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.galleryButton} onPress={pickFromGallery}>
                <MaterialCommunityIcons name="image" size={30} color={Colors.orange} />
                <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Recent Meals */}
        <View style={styles.recentMeals}>
          <Text style={styles.sectionTitle}>Recent Meals</Text>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.orange} style={styles.loader} />
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
  cameraActions: {
    gap: 15,
  },
  cameraButton: {
    backgroundColor: Colors.orange,
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
    borderColor: Colors.orange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  galleryButtonText: {
    color: Colors.orange,
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
    backgroundColor: Colors.orange,
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
}); 