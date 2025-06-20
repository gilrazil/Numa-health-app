import OpenAI from 'openai';
import { OPENAI_CONFIG } from '../config/openai';

class TextEditingService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: OPENAI_CONFIG.apiKey,
    });
  }

  // Parse natural language editing commands
  async parseEditCommand(text, currentIngredients) {
    try {
      const prompt = `
אתה עוזר לניתוח פקודות עריכה למרכיבי מזון בעברית.
המרכיבים הנוכחיים: ${JSON.stringify(currentIngredients, null, 2)}

הפקודה: "${text}"

החזר JSON עם המבנה הבא:
{
  "action": "add|edit|remove",
  "targetIndex": מספר האינדקס (null אם הוספה),
  "ingredient": {
    "name": "שם המרכיב",
    "quantity": מספר,
    "unit": "יחידת מידה",
    "confidence": 0.8
  },
  "explanation": "הסבר מה תבוצע"
}

דוגמאות:
- "הוסף 100 גרם אורז" → action: "add"
- "שנה את המרכיב הראשון ל-200 גרם" → action: "edit", targetIndex: 0
- "מחק את הלחם" → action: "remove"
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'אתה מומחה לניתוח פקודות עריכה של מרכיבי מזון בעברית. החזר תמיד JSON תקין.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result;

    } catch (error) {
      console.error('שגיאה בניתוח פקודת עריכה:', error);
      throw new Error('לא הצלחתי להבין את הפקודה');
    }
  }

  // Validate parsed command
  validateCommand(command) {
    if (!command || typeof command !== 'object') {
      return false;
    }

    const validActions = ['add', 'edit', 'remove'];
    if (!validActions.includes(command.action)) {
      return false;
    }

    if (command.action === 'add' || command.action === 'edit') {
      if (!command.ingredient || 
          !command.ingredient.name || 
          !command.ingredient.quantity || 
          !command.ingredient.unit) {
        return false;
      }
    }

    return true;
  }

  // Get example commands for UI
  getExampleCommands() {
    return [
      "הוסף 100 גרם אורז",
      "שנה את הכמות ל-200 גרם",
      "מחק את הלחם",
      "הוסף 2 כפות שמן זית",
      "שנה את המרכיב הראשון ל-150 גרם עוף"
    ];
  }
}

export { TextEditingService };
export default new TextEditingService(); 