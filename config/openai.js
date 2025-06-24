// OpenAI configuration using environment variables
export const OPENAI_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
};

// Validate that API key is available
if (!OPENAI_CONFIG.apiKey) {
  console.warn('⚠️ EXPO_PUBLIC_OPENAI_API_KEY environment variable is not set');
}

export default OPENAI_CONFIG; 