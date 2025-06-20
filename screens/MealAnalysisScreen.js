import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Pressable,
  Dimensions,
  TouchableOpacity,
  Animated,
  TextInput,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, auth, db } from '../config';
import { collection, addDoc } from 'firebase/firestore';
import { MealAnalysisService } from '../services/MealAnalysisService';
import { TextEditingService } from '../services/TextEditingService';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';

const { width } = Dimensions.get('window');

export const MealAnalysisScreen = ({ navigation, route }) => {
  const { imageUri, userProfile, existingAnalysis, isHistorical } = route.params;
  const [analysis, setAnalysis] = useState(existingAnalysis || null);
  const [loading, setLoading] = useState(!existingAnalysis);
  const [error, setError] = useState(null);
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [heightAnimation] = useState(new Animated.Value(140));
  const [progress] = useState(new Animated.Value(0));

  // Text editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editingAnimation] = useState(new Animated.Value(1));
  const [showEditModal, setShowEditModal] = useState(false);
  const [editText, setEditText] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    // Only analyze if we don't have existing analysis
    if (!existingAnalysis) {
      analyzeMeal();
    }
  }, []);

  useEffect(() => {
    Animated.timing(heightAnimation, {
      toValue: showAllIngredients ? 200 : 140,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showAllIngredients]);

  const simulateProgress = () => {
    // Reset progress
    progress.setValue(0);
    
    // Animate progress from 0 to 90%
    Animated.timing(progress, {
      toValue: 0.9,
      duration: 15000, // 15 seconds
      useNativeDriver: false,
    }).start();
  };

  const analyzeMeal = async () => {
    try {
      setLoading(true);
      setError(null);
      simulateProgress();
      
      // Get user's daily intake (you can implement this later)
      const dailyIntake = [];
      
      // Perform complete meal analysis
      const result = await MealAnalysisService.analyzeMealComplete(
        imageUri,
        userProfile,
        dailyIntake
      );
      
      // Complete the progress animation
      Animated.timing(progress, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start();
      
      setAnalysis(result);
      
      // Save analysis to Firestore
      await saveMeal();
      
    } catch (error) {
      console.error('שגיאה בניתוח ארוחה:', error);
      setError(error.message);
    } finally {
      setLoading(false);
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
            console.log('Upload progress:', progress);
          },
          (error) => {
            console.error('Upload error:', error);
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
      console.error('Error uploading to Firebase:', error);
      throw error;
    }
  };

  const saveMeal = async () => {
    try {
      setSaving(true);
      
      const mealData = {
        userId: auth.currentUser.uid,
        imageUrl: imageUri,
        analysis: analysis,
        timestamp: new Date().toISOString(),
        createdAt: new Date()
      };

      await addDoc(collection(db, 'meals'), mealData);
      
      Alert.alert(
        'Success', 
        'Meal saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert('Error', 'Failed to save meal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50'; // ירוק
    if (score >= 60) return '#FF9800'; // כתום
    return '#F44336'; // אדום
  };

  const getScoreEmoji = (score) => {
    if (score >= 80) return '🎉';
    if (score >= 60) return '👍';
    return '💪';
  };

  // בדיקה אם זה מצב דמו (נתונים מדומים)
  const isDemoMode = analysis?.tip === "ארוחה מצוינת! בפעם הבאה נסה להוסיף עוד ירקות צבעוניים כמו גזר או פלפל לגיוון תזונתי רחב יותר.";

  const showDemoInfo = () => {
    Alert.alert(
      'מצב דמו',
      'הנתונים המוצגים הם דוגמה בלבד בגלל מכסת OpenAI API. לקבלת ניתוח אמיתי, יש צורך במפתח API פעיל.',
      [{ text: 'הבנתי', style: 'default' }]
    );
  };

  const getVisibleIngredients = () => {
    if (!analysis?.ingredients?.ingredients) return [];
    
    const ingredients = analysis.ingredients.ingredients;
    const maxVisible = 1; // מספר מרכיבים מקסימלי להצגה בתחילה - שונה ל-1
    
    if (showAllIngredients || ingredients.length <= maxVisible) {
      return ingredients;
    }
    
    return ingredients.slice(0, maxVisible);
  };

  const hasMoreIngredients = () => {
    return analysis?.ingredients?.ingredients?.length > 1; // שינוי ל-1
  };

  // Text editing functions
  const startTextEdit = async () => {
    try {
      setShowEditModal(true);
      setEditText('');
    } catch (error) {
      console.error('שגיאה בהתחלת עריכה טקסטית:', error);
      Alert.alert('שגיאה', 'לא הצלחתי להתחיל העריכה.');
    }
  };

  const finishTextEdit = async () => {
    if (!editText.trim()) {
      Alert.alert('שגיאה', 'אנא הכנס פקודת עריכה');
      return;
    }

    try {
      setEditLoading(true);
      
      const command = await TextEditingService.parseEditCommand(editText, analysis.ingredients.ingredients);
      
      if (TextEditingService.validateCommand(command)) {
        // Apply the text command to ingredients
        applyTextCommand(command);
        
        Alert.alert(
          '✅ הבנתי!',
          `${command.explanation}`,
          [{ text: 'מעולה', style: 'default' }]
        );
        
        setShowEditModal(false);
        setEditText('');
      } else {
        Alert.alert('שגיאה', 'לא הצלחתי להבין את הפקודה. נסה שוב.');
      }
    } catch (error) {
      console.error('שגיאה בסיום עריכה טקסטית:', error);
      Alert.alert('שגיאה', 'לא הצלחתי לעבד את העריכה.');
    } finally {
      setEditLoading(false);
    }
  };

  const cancelTextEdit = async () => {
    setShowEditModal(false);
    setEditText('');
    setIsEditing(false);
  };

  const applyTextCommand = (command) => {
    try {
      const updatedAnalysis = { ...analysis };
      let ingredients = [...updatedAnalysis.ingredients.ingredients];

      switch (command.action) {
        case 'add':
          // Add new ingredient
          ingredients.push({
            name: command.ingredient.name,
            quantity: command.ingredient.quantity,
            unit: command.ingredient.unit,
            confidence: command.ingredient.confidence
          });
          break;

        case 'edit':
          // Edit existing ingredient
          if (command.targetIndex !== null && command.targetIndex < ingredients.length) {
            ingredients[command.targetIndex] = {
              ...ingredients[command.targetIndex],
              name: command.ingredient.name || ingredients[command.targetIndex].name,
              quantity: command.ingredient.quantity || ingredients[command.targetIndex].quantity,
              unit: command.ingredient.unit || ingredients[command.targetIndex].unit,
              confidence: command.ingredient.confidence || ingredients[command.targetIndex].confidence
            };
          }
          break;

        case 'remove':
          // Remove ingredient
          if (command.targetIndex !== null && command.targetIndex < ingredients.length) {
            ingredients.splice(command.targetIndex, 1);
          }
          break;

        default:
          console.warn('פעולה לא מוכרת:', command.action);
          return;
      }

      // Update analysis with new ingredients
      updatedAnalysis.ingredients.ingredients = ingredients;
      
      // Recalculate nutrition (simplified - in real app you'd call the nutrition service)
      // For now, just update the analysis state
      setAnalysis(updatedAnalysis);
      
      // Save updated analysis
      saveMealAnalysis(updatedAnalysis);
      
    } catch (error) {
      console.error('שגיאה ביישום פקודה טקסטית:', error);
      Alert.alert('שגיאה', 'לא הצלחתי ליישם את העריכה.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>מנתח את הארוחה שלך...</Text>
          <Text style={styles.loadingSubtext}>זה יכול לקחת כמה שניות</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>😔</Text>
          <Text style={styles.errorTitle}>אופס! משהו השתבש</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={analyzeMeal}>
            <Text style={styles.retryButtonText}>נסה שוב</Text>
          </Pressable>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>חזור</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Demo Mode Indicator */}
      {isDemoMode && (
        <TouchableOpacity style={styles.demoIndicator} onPress={showDemoInfo}>
          <Ionicons name="information-circle" size={14} color="#FF6B35" />
          <Text style={styles.demoText}>מצב דמו</Text>
        </TouchableOpacity>
      )}
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {isHistorical ? 'ניתוח ארוחה קודמת' : 'ניתוח ארוחה'}
          </Text>
          {isHistorical && analysis?.timestamp && (
            <Text style={styles.subtitle}>
              {new Date(analysis.timestamp).toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          )}
        </View>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* 1. Image + Ingredients Section */}
        <Animated.View style={[
          styles.topSection,
          { height: heightAnimation }
        ]}>
          <Image source={{ uri: imageUri }} style={styles.mealImage} />
          
          <View style={[
            styles.ingredientsSection,
            { maxHeight: showAllIngredients ? 160 : 100 }
          ]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="restaurant" size={16} color="#007AFF" />
              <Text style={styles.sectionTitle}>
                מרכיבים שזוהו ({analysis.ingredients.ingredients.length})
              </Text>
              {analysis.ingredients.totalEstimatedWeight && (
                <Text style={styles.totalWeight}>
                  {analysis.ingredients.totalEstimatedWeight}
                </Text>
              )}
              
              {/* Text Edit Button */}
              {!isHistorical && (
                <TouchableOpacity 
                  style={[
                    styles.textEditButton,
                    isEditing && styles.textEditButtonEditing
                  ]}
                  onPress={startTextEdit}
                  disabled={isEditing}
                >
                  <Animated.View style={{ transform: [{ scale: editingAnimation }] }}>
                    {isEditing ? (
                      <ActivityIndicator size="small" color="#007AFF" />
                    ) : (
                      <Ionicons 
                        name="create" 
                        size={16} 
                        color="#007AFF" 
                      />
                    )}
                  </Animated.View>
                </TouchableOpacity>
              )}
              
              {/* Visual indicator for more content */}
              {hasMoreIngredients() && !showAllIngredients && (
                <View style={styles.moreIndicator}>
                  <Ionicons name="ellipsis-horizontal" size={12} color="#8E8E93" />
                </View>
              )}
            </View>
            <ScrollView 
              style={styles.ingredientsScrollView}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              <View style={styles.ingredientsContainer}>
                {getVisibleIngredients().map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <View style={styles.ingredientInfo}>
                      <Text style={styles.ingredientName}>{ingredient.name}</Text>
                      <Text style={styles.ingredientQuantity}>
                        {ingredient.quantity} {ingredient.unit}
                      </Text>
                    </View>
                    <View style={styles.confidenceIndicator}>
                      <Text style={styles.confidenceText}>{ingredient.confidence}/10</Text>
                    </View>
                  </View>
                ))}
                
                {/* Show More/Less Button */}
                {hasMoreIngredients() && (
                  <TouchableOpacity 
                    style={styles.showMoreButton}
                    onPress={() => setShowAllIngredients(!showAllIngredients)}
                  >
                    <Text style={styles.showMoreText}>
                      {showAllIngredients 
                        ? `הצג פחות` 
                        : `הצג עוד (+${analysis.ingredients.ingredients.length - 3})`
                      }
                    </Text>
                    <Ionicons 
                      name={showAllIngredients ? "chevron-up" : "chevron-down"} 
                      size={14} 
                      color="#007AFF" 
                    />
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </Animated.View>

        {/* 2. Nutrition Values */}
        <View style={styles.nutritionSection}>
          <View style={styles.nutritionHeader}>
            <Text style={[styles.scoreText, { color: getScoreColor(analysis.alignment.score) }]}>
              {analysis.alignment.score}/100
            </Text>
            <Text style={styles.scoreLabel}>ציון התאמה</Text>
          </View>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionCard}>
              <Text style={styles.nutritionValue}>{analysis.nutrition.totalNutrition.calories}</Text>
              <Text style={styles.nutritionLabel}>קלוריות</Text>
            </View>
            <View style={styles.nutritionCard}>
              <Text style={styles.nutritionValue}>{analysis.nutrition.totalNutrition.protein}g</Text>
              <Text style={styles.nutritionLabel}>חלבון</Text>
            </View>
            <View style={styles.nutritionCard}>
              <Text style={styles.nutritionValue}>{analysis.nutrition.totalNutrition.carbs}g</Text>
              <Text style={styles.nutritionLabel}>פחמימות</Text>
            </View>
            <View style={styles.nutritionCard}>
              <Text style={styles.nutritionValue}>{analysis.nutrition.totalNutrition.fat}g</Text>
              <Text style={styles.nutritionLabel}>שומן</Text>
            </View>
          </View>
        </View>

        {/* 3. Tip */}
        <View style={styles.tipSection}>
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb" size={16} color="#007AFF" />
              <Text style={styles.tipTitle}>הטיפ שלך</Text>
            </View>
            <Text style={styles.tipText}>{analysis.tip}</Text>
          </View>
        </View>

        {/* 4. Action Button */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => navigation.navigate('MealCamera')}
          >
            <Text style={styles.primaryButtonText}>
              {isHistorical ? 'צלם ארוחה חדשה' : 'צלם ארוחה נוספת'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Text Editing Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={cancelTextEdit}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={cancelTextEdit} style={styles.modalCancelButton}>
              <Text style={styles.modalCancelText}>בטל</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>עריכת מרכיבים</Text>
            <TouchableOpacity 
              onPress={finishTextEdit} 
              style={[styles.modalDoneButton, editLoading && styles.modalDoneButtonDisabled]}
              disabled={editLoading}
            >
              {editLoading ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Text style={styles.modalDoneText}>בצע</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              הכנס פקודת עריכה למרכיבים:
            </Text>

            <TextInput
              style={styles.modalTextInput}
              value={editText}
              onChangeText={setEditText}
              placeholder="למשל: הוסף 100 גרם אורז"
              placeholderTextColor="#8E8E93"
              multiline={false}
              autoFocus={true}
              returnKeyType="done"
              onSubmitEditing={finishTextEdit}
            />

            <View style={styles.examplesContainer}>
              <Text style={styles.examplesTitle}>דוגמאות פקודות:</Text>
              {TextEditingService.getExampleCommands().map((example, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.exampleButton}
                  onPress={() => setEditText(example)}
                >
                  <Text style={styles.exampleText}>{example}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.currentIngredientsContainer}>
              <Text style={styles.currentIngredientsTitle}>מרכיבים נוכחיים:</Text>
              {analysis.ingredients.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.currentIngredientItem}>
                  <Text style={styles.currentIngredientIndex}>{index}.</Text>
                  <Text style={styles.currentIngredientText}>
                    {ingredient.name} - {ingredient.quantity} {ingredient.unit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
    color: '#1C1C1E',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1C1C1E',
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#6B4EFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#6B4EFF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 44,
  },
  demoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#856404',
    marginLeft: 8,
    flex: 1,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageScoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  mealImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  scoreSection: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 20,
  },
  scoreEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: 8,
  },
  scoreOutOf: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  nutritionSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionCard: {
    width: '23%',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 2,
  },
  nutritionLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
    textAlign: 'center',
  },
  ingredientsSection: {
    flex: 1,
    marginLeft: 16,
    minHeight: 80,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 6,
  },
  ingredientsScrollView: {
    flex: 1,
  },
  ingredientsContainer: {
    paddingRight: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    marginBottom: 2,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
    lineHeight: 14,
  },
  ingredientQuantity: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
    lineHeight: 12,
  },
  confidenceIndicator: {
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  confidenceText: {
    fontSize: 9,
    color: '#007AFF',
    fontWeight: '600',
  },
  confidenceContainer: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  confidenceBar: {
    width: 50,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginBottom: 4,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 2,
  },
  tipSection: {
    marginBottom: 16,
  },
  tipCard: {
    backgroundColor: '#E8F4FD',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 6,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'right',
    fontWeight: '400',
    color: '#1C1C1E',
  },
  actionsContainer: {
    paddingBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  lastIngredientItem: {
    borderBottomWidth: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  topSection: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nutritionHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    backgroundColor: '#E8F4FD',
    borderRadius: 6,
    marginTop: 2,
  },
  showMoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 8,
  },
  totalWeight: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 8,
  },
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  progressContainer: {
    width: '80%',
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginTop: 30,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6B4EFF',
    borderRadius: 4,
  },
  loadingSteps: {
    marginTop: 30,
    alignItems: 'flex-start',
    width: '80%',
  },
  loadingStep: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  modalCancelButton: {
    padding: 8,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  modalDoneButton: {
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 10,
  },
  modalDoneButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  modalDoneText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  modalTextInput: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 6,
  },
  examplesContainer: {
    marginBottom: 16,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  exampleButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 6,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  currentIngredientsContainer: {
    marginBottom: 16,
  },
  currentIngredientsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  currentIngredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentIngredientIndex: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginRight: 8,
  },
  currentIngredientText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1C1C1E',
  },
}); 