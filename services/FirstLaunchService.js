import AsyncStorage from '@react-native-async-storage/async-storage';

const FIRST_LAUNCH_KEY = 'has_launched_before';
const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';
import { log, logError, logWarn } from '../utils/logger';

export class FirstLaunchService {
  // Check if this is the user's first time opening the app
  static async isFirstLaunch() {
    try {
      const hasLaunchedBefore = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
      return hasLaunchedBefore === null; // null means first launch
    } catch (error) {
      logError('Error checking first launch:', error);
      return true; // Assume first launch on error
    }
  }

  // Mark that the app has been launched before
  static async markAsLaunched() {
    try {
      await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'true');
      log('📱 App marked as launched before');
    } catch (error) {
      logError('Error marking app as launched:', error);
    }
  }

  // Check if user has completed onboarding before
  static async hasCompletedOnboarding() {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      return completed === 'true';
    } catch (error) {
      logError('Error checking onboarding completion:', error);
      return false;
    }
  }

  // Mark onboarding as completed
  static async markOnboardingCompleted() {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      log('✅ Onboarding marked as completed');
    } catch (error) {
      logError('Error marking onboarding as completed:', error);
    }
  }

  // Get user experience type for smart routing
  static async getUserExperienceType() {
    try {
      const [isFirst, hasOnboarded] = await Promise.all([
        this.isFirstLaunch(),
        this.hasCompletedOnboarding()
      ]);

      if (isFirst) {
        return 'first_time'; // Completely new user
      } else if (hasOnboarded) {
        return 'returning'; // Returning user who completed onboarding
      } else {
        return 'incomplete'; // User started but didn't finish onboarding
      }
    } catch (error) {
      logError('Error determining user experience type:', error);
      return 'first_time'; // Safe default
    }
  }

  // Clear all stored data (for testing purposes)
  static async clearAll() {
    try {
      await AsyncStorage.multiRemove([FIRST_LAUNCH_KEY, ONBOARDING_COMPLETED_KEY]);
      log('🧹 Cleared all first launch data');
    } catch (error) {
      logError('Error clearing first launch data:', error);
    }
  }
} 