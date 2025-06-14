import OpenAI from 'openai';
import { OPENAI_CONFIG } from '../config/openai';

// Initialize OpenAI client with proper configuration for project-based keys
const openai = new OpenAI({
  apiKey: OPENAI_CONFIG.apiKey,
  organization: 'org-FBKodskYRfF1sfDEocfEMPT4',
  project: 'proj_Arnb03Z4mKByZ3jTb5asqLVw',
  defaultHeaders: {
    'OpenAI-Organization': 'org-FBKodskYRfF1sfDEocfEMPT4',
    'OpenAI-Project': 'proj_Arnb03Z4mKByZ3jTb5asqLVw',
  },
});

export class MealAnalysisService {
  
  // בדיקה אם מפתח API מוגדר
  static checkApiKey() {
    console.log('🔑 Checking API key...');
    console.log('🔑 API key length:', OPENAI_CONFIG.apiKey?.length);
    console.log('🔑 API key starts with:', OPENAI_CONFIG.apiKey?.substring(0, 10));
    
    if (!OPENAI_CONFIG.apiKey || 
        OPENAI_CONFIG.apiKey === 'YOUR_OPENAI_API_KEY_HERE' ||
        OPENAI_CONFIG.apiKey.length < 20) {
      throw new Error('נדרש להגדיר מפתח OpenAI API תקף');
    }
  }

  // פונקציה לנתונים מדומים (לבדיקה)
  static getMockAnalysis() {
    return {
      ingredients: {
        ingredients: [
          {
            name: "חזה עוף",
            quantity: "150",
            unit: "גרם",
            confidence: 9
          },
          {
            name: "אורז לבן",
            quantity: "100",
            unit: "גרם",
            confidence: 8
          },
          {
            name: "ברוקולי",
            quantity: "80",
            unit: "גרם",
            confidence: 9
          },
          {
            name: "שמן זית",
            quantity: "1",
            unit: "כף",
            confidence: 7
          }
        ],
        totalEstimatedWeight: "330 גרם"
      },
      nutrition: {
        totalNutrition: {
          calories: "420",
          protein: "35",
          carbs: "25",
          fat: "18",
          fiber: "4",
          sugar: "3",
          sodium: "180"
        },
        breakdown: [
          {
            ingredient: "חזה עוף",
            calories: "250",
            protein: "30"
          },
          {
            ingredient: "אורז לבן",
            calories: "130",
            protein: "3"
          }
        ]
      },
      alignment: {
        score: 85,
        reasoning: "ארוחה מאוזנת ובריאה המתאימה למטרת הפחתת משקל. כמות החלבון גבוהה, הפחמימות מתונות והירקות מספקים ויטמינים וסיבים תזונתיים.",
        positives: [
          "כמות חלבון גבוהה המסייעת לשמירה על מסת שריר",
          "ירקות עשירים בויטמינים וסיבים",
          "ארוחה מאוזנת עם כל קבוצות המזון"
        ],
        dailyProgress: {
          caloriesProgress: "25% מהיעד היומי",
          proteinProgress: "45% מהיעד היומי"
        }
      },
      tip: "ארוחה מצוינת! בפעם הבאה נסה להוסיף עוד ירקות צבעוניים כמו גזר או פלפל לגיוון תזונתי רחב יותר.",
      timestamp: new Date().toISOString()
    };
  }
  
  // 🥇 שלב 1: זיהוי מרכיבים וכמויות
  static async identifyIngredientsAndQuantities(imageUri) {
    try {
      this.checkApiKey();
      console.log('🔍 מזהה מרכיבים בתמונה...');
      console.log('📷 Image URI:', imageUri);
      
      // Convert image to base64 for OpenAI Vision API
      console.log('🔄 Converting image to base64...');
      const base64Image = await this.convertImageToBase64(imageUri);
      console.log('✅ Base64 conversion complete, length:', base64Image.length);
      
      console.log('🌐 Making OpenAI API call...');
      const response = await openai.chat.completions.create({
        model: "gpt-4o",  // Use the latest model that supports vision
        messages: [
          {
            role: "system",
            content: "You are a nutrition expert. You must respond ONLY with valid JSON format, no additional text or explanations."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this meal image and identify all ingredients and estimated quantities. 
                Respond ONLY with valid JSON in this exact format (no additional text):
                {
                  "ingredients": [
                    {
                      "name": "ingredient name in Hebrew",
                      "quantity": "estimated amount",
                      "unit": "unit of measurement (גרם/כוס/יחידה)",
                      "confidence": 8
                    }
                  ],
                  "totalEstimatedWeight": "total estimated weight in grams"
                }`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1  // Lower temperature for more consistent JSON output
      });

      console.log('✅ OpenAI API response received');
      console.log('📝 Raw response content:', response.choices[0].message.content);
      
      // Clean the response content to ensure it's valid JSON
      let responseContent = response.choices[0].message.content.trim();
      
      // Remove any markdown code blocks if present
      if (responseContent.startsWith('```json')) {
        responseContent = responseContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (responseContent.startsWith('```')) {
        responseContent = responseContent.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      console.log('🧹 Cleaned response content:', responseContent);
      
      let analysisResult;
      try {
        analysisResult = JSON.parse(responseContent);
      } catch (jsonError) {
        console.error('❌ JSON Parse Error:', jsonError);
        console.error('❌ Failed to parse content:', responseContent);
        
        // If JSON parsing fails, return mock data
        console.log('🔄 Using mock data due to JSON parse error');
        return this.getMockAnalysis().ingredients;
      }
      
      console.log('✅ זיהוי מרכיבים הושלם:', analysisResult);
      
      return analysisResult;
    } catch (error) {
      console.error('❌ שגיאה בזיהוי מרכיבים:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type,
        stack: error.stack
      });
      
      // אם זה שגיאת quota, החזר נתונים מדומים
      if (error.message.includes('429') || error.message.includes('quota') || error.status === 429) {
        console.log('🔄 משתמש בנתונים מדומים בגלל מכסת API');
        return this.getMockAnalysis().ingredients;
      }
      
      if (error.message.includes('API') || error.message.includes('401') || error.message.includes('403')) {
        throw new Error('שגיאה בחיבור ל-OpenAI. בדוק את מפתח ה-API');
      }
      throw new Error(`לא ניתן לנתח את התמונה כרגע: ${error.message}`);
    }
  }

  // 🥈 שלב 2: חישוב ערכים תזונתיים כוללים
  static async calculateNutritionalValues(ingredients) {
    try {
      this.checkApiKey();
      console.log('🧮 מחשב ערכים תזונתיים...');
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a nutrition expert. You must respond ONLY with valid JSON format, no additional text or explanations."
          },
          {
            role: "user", 
            content: `Based on the following ingredients list, calculate the total nutritional values:
            ${JSON.stringify(ingredients, null, 2)}
            
            Respond ONLY with valid JSON in this exact format (no additional text):
            {
              "totalNutrition": {
                "calories": "number of calories",
                "protein": "grams of protein",
                "carbs": "grams of carbs", 
                "fat": "grams of fat",
                "fiber": "grams of fiber",
                "sugar": "grams of sugar",
                "sodium": "milligrams of sodium"
              },
              "breakdown": [
                {
                  "ingredient": "ingredient name",
                  "calories": "calories for this ingredient",
                  "protein": "protein for this ingredient"
                }
              ]
            }`
          }
        ],
        max_tokens: 800,
        temperature: 0.1
      });

      console.log('✅ Nutrition API response received');
      console.log('📝 Raw nutrition response:', response.choices[0].message.content);
      
      // Clean the response content
      let responseContent = response.choices[0].message.content.trim();
      if (responseContent.startsWith('```json')) {
        responseContent = responseContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (responseContent.startsWith('```')) {
        responseContent = responseContent.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      let nutritionData;
      try {
        nutritionData = JSON.parse(responseContent);
      } catch (jsonError) {
        console.error('❌ Nutrition JSON Parse Error:', jsonError);
        console.log('🔄 Using mock nutrition data due to JSON parse error');
        return this.getMockAnalysis().nutrition;
      }
      
      console.log('✅ חישוב תזונתי הושלם:', nutritionData);
      
      return nutritionData;
    } catch (error) {
      console.error('❌ שגיאה בחישוב תזונתי:', error);
      
      // אם זה שגיאת quota, החזר נתונים מדומים
      if (error.message.includes('429') || error.message.includes('quota')) {
        console.log('🔄 משתמש בנתונים מדומים בגלל מכסת API');
        return this.getMockAnalysis().nutrition;
      }
      
      throw new Error('לא ניתן לחשב ערכים תזונתיים כרגע');
    }
  }

  // 🥉 שלב 3: ציון התאמה למטרת המשתמש
  static async calculateGoalAlignment(nutritionData, userProfile, dailyIntake = []) {
    try {
      this.checkApiKey();
      console.log('🎯 מחשב התאמה למטרה...');
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a nutrition expert. You must respond ONLY with valid JSON format, no additional text or explanations."
          },
          {
            role: "user",
            content: `Analyze how well this meal aligns with the user's goal:
            
            User Profile:
            - Goal: ${userProfile.goal}
            - Age: ${userProfile.age}
            - Weight: ${userProfile.weight} kg
            - Height: ${userProfile.height} cm
            - Gender: ${userProfile.gender}
            
            Meal Nutrition:
            ${JSON.stringify(nutritionData.totalNutrition, null, 2)}
            
            Daily Intake So Far:
            ${JSON.stringify(dailyIntake, null, 2)}
            
            Respond ONLY with valid JSON in this exact format (no additional text):
            {
              "score": 85,
              "reasoning": "detailed reasoning for the score in Hebrew",
              "positives": ["positive things about the meal in Hebrew"],
              "dailyProgress": {
                "caloriesProgress": "percentage of daily target",
                "proteinProgress": "percentage of daily target"
              }
            }`
          }
        ],
        max_tokens: 600,
        temperature: 0.1
      });

      console.log('✅ Alignment API response received');
      console.log('📝 Raw alignment response:', response.choices[0].message.content);
      
      // Clean the response content
      let responseContent = response.choices[0].message.content.trim();
      if (responseContent.startsWith('```json')) {
        responseContent = responseContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (responseContent.startsWith('```')) {
        responseContent = responseContent.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      let alignmentData;
      try {
        alignmentData = JSON.parse(responseContent);
      } catch (jsonError) {
        console.error('❌ Alignment JSON Parse Error:', jsonError);
        console.log('🔄 Using mock alignment data due to JSON parse error');
        return this.getMockAnalysis().alignment;
      }
      
      console.log('✅ חישוב התאמה הושלם:', alignmentData);
      
      return alignmentData;
    } catch (error) {
      console.error('❌ שגיאה בחישוב התאמה:', error);
      
      // אם זה שגיאת quota, החזר נתונים מדומים
      if (error.message.includes('429') || error.message.includes('quota')) {
        console.log('🔄 משתמש בנתונים מדומים בגלל מכסת API');
        return this.getMockAnalysis().alignment;
      }
      
      throw new Error('לא ניתן לחשב התאמה למטרה כרגע');
    }
  }

  // 🏅 שלב 4: טיפ מותאם
  static async generatePersonalizedTip(nutritionData, alignmentData, userProfile) {
    try {
      this.checkApiKey();
      console.log('💡 יוצר טיפ מותאם...');
      
      const tipPrompt = `
        בהתבסס על הניתוח הבא, תן טיפ קצר ומעשי למשתמש:
        
        פרופיל: ${userProfile.goal}, גיל ${userProfile.age}
        ציון ארוחה: ${alignmentData.score}/100
        נימוק: ${alignmentData.reasoning}
        
        תן טיפ של משפט אחד או שניים שיעזור למשתמש לשפר את הארוחה הבאה או את התזונה בכלל.
        הטיפ צריך להיות:
        - מעשי וקל ליישום
        - מותאם למטרה שלו
        - חיובי ומעודד
        - בעברית פשוטה
        
        החזר רק את הטיפ, בלי הסברים נוספים.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "אתה מאמן תזונה ישראלי שנותן טיפים קצרים ומעשיים."
          },
          {
            role: "user",
            content: tipPrompt
          }
        ],
        max_tokens: 200
      });

      const tip = response.choices[0].message.content.trim();
      console.log('✅ טיפ נוצר:', tip);
      
      return tip;
    } catch (error) {
      console.error('❌ שגיאה ביצירת טיפ:', error);
      
      // אם זה שגיאת quota, החזר נתונים מדומים
      if (error.message.includes('429') || error.message.includes('quota')) {
        console.log('🔄 משתמש בטיפ מדומה בגלל מכסת API');
        return this.getMockAnalysis().tip;
      }
      
      throw new Error('לא ניתן ליצור טיפ כרגע');
    }
  }

  // פונקציה מרכזת שמפעילה את כל השלבים
  static async analyzeMealComplete(imageUri, userProfile, dailyIntake = []) {
    try {
      console.log('🚀 מתחיל ניתוח מלא של הארוחה...');
      
      // שלב 1: זיהוי מרכיבים
      const ingredients = await this.identifyIngredientsAndQuantities(imageUri);
      
      // שלב 2: חישוב תזונתי
      const nutrition = await this.calculateNutritionalValues(ingredients.ingredients);
      
      // שלב 3: ציון התאמה
      const alignment = await this.calculateGoalAlignment(nutrition, userProfile, dailyIntake);
      
      // שלב 4: טיפ מותאם
      const tip = await this.generatePersonalizedTip(nutrition, alignment, userProfile);
      
      const completeAnalysis = {
        ingredients: ingredients,
        nutrition: nutrition,
        alignment: alignment,
        tip: tip,
        timestamp: new Date().toISOString()
      };
      
      console.log('🎉 ניתוח מלא הושלם בהצלחה!');
      return completeAnalysis;
      
    } catch (error) {
      console.error('❌ שגיאה בניתוח מלא:', error);
      
      // אם זה שגיאת quota, החזר ניתוח מדומה מלא
      if (error.message.includes('429') || error.message.includes('quota') || 
          error.message.includes('לא ניתן לנתח את התמונה כרגע')) {
        console.log('🔄 משתמש בניתוח מדומה מלא בגלל מכסת API');
        return this.getMockAnalysis();
      }
      
      throw error;
    }
  }

  // פונקציית עזר להמרת תמונה ל-base64
  static async convertImageToBase64(imageUri) {
    try {
      console.log('🔄 Starting image conversion for URI:', imageUri);
      
      const response = await fetch(imageUri);
      console.log('📥 Fetch response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('📦 Blob created, size:', blob.size, 'type:', blob.type);
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const base64 = reader.result.split(',')[1];
            console.log('✅ Base64 conversion successful, length:', base64.length);
            resolve(base64);
          } catch (err) {
            console.error('❌ Error splitting base64:', err);
            reject(err);
          }
        };
        reader.onerror = (err) => {
          console.error('❌ FileReader error:', err);
          reject(err);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('❌ שגיאה בהמרת תמונה:', error);
      console.error('❌ Image conversion error details:', {
        message: error.message,
        stack: error.stack,
        imageUri: imageUri
      });
      throw new Error(`לא ניתן לעבד את התמונה: ${error.message}`);
    }
  }
} 