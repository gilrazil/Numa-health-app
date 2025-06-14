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
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, auth, db } from '../config';
import { MealAnalysisService } from '../services/MealAnalysisService';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const MealAnalysisScreen = ({ navigation, route }) => {
  const { imageUri, userProfile, existingAnalysis, isHistorical } = route.params;
  const [analysis, setAnalysis] = useState(existingAnalysis || null);
  const [loading, setLoading] = useState(!existingAnalysis);
  const [error, setError] = useState(null);
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [heightAnimation] = useState(new Animated.Value(140));

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

  const analyzeMeal = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user's daily intake (you can implement this later)
      const dailyIntake = [];
      
      // Perform complete meal analysis
      const result = await MealAnalysisService.analyzeMealComplete(
        imageUri,
        userProfile,
        dailyIntake
      );
      
      setAnalysis(result);
      
      // Save analysis to Firestore
      await saveMealAnalysis(result);
      
    } catch (error) {
      console.error('שגיאה בניתוח ארוחה:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveMealAnalysis = async (analysisData) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const mealData = {
          userId: currentUser.uid,
          imageUri: imageUri,
          analysis: analysisData,
          timestamp: new Date().toISOString(),
          date: new Date().toDateString()
        };
        
        await db.collection('meals').add(mealData);
        console.log('✅ ניתוח הארוחה נשמר בהצלחה');
      }
    } catch (error) {
      console.error('❌ שגיאה בשמירת ניתוח:', error);
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
    const maxVisible = 3; // מספר מרכיבים מקסימלי להצגה בתחילה - הקטנתי ל-3
    
    if (showAllIngredients || ingredients.length <= maxVisible) {
      return ingredients;
    }
    
    return ingredients.slice(0, maxVisible);
  };

  const hasMoreIngredients = () => {
    return analysis?.ingredients?.ingredients?.length > 3; // שינוי ל-3
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
              <Text style={styles.sectionTitle}>מרכיבים שזוהו</Text>
              {analysis.ingredients.totalEstimatedWeight && (
                <Text style={styles.totalWeight}>
                  ({analysis.ingredients.totalEstimatedWeight})
                </Text>
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
    backgroundColor: '#007AFF',
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
    color: '#007AFF',
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
}); 