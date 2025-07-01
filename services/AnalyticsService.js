import { analytics } from '../config/firebase';
import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { log, logError, logWarn } from '../utils/logger';

export class AnalyticsService {
  // Track custom events
  static trackEvent(eventName, parameters = {}) {
    if (analytics) {
      logEvent(analytics, eventName, parameters);
      log(`📊 Analytics Event: ${eventName}`, parameters);
    }
  }

  // Track user login
  static trackLogin(method = 'email') {
    this.trackEvent('login', { method });
  }

  // Track user signup
  static trackSignUp(method = 'email') {
    this.trackEvent('sign_up', { method });
  }

  // Track meal logging
  static trackMealLogged(mealType) {
    this.trackEvent('meal_logged', { 
      meal_type: mealType,
      timestamp: new Date().toISOString()
    });
  }

  // Track goal setting
  static trackGoalSet(goalType) {
    this.trackEvent('goal_set', { goal_type: goalType });
  }

  // Track profile completion
  static trackProfileCompleted() {
    this.trackEvent('profile_completed');
  }

  // Set user properties
  static setUserProperties(userId, properties = {}) {
    if (analytics) {
      setUserId(analytics, userId);
      setUserProperties(analytics, properties);
    }
  }

  // Track screen views
  static trackScreenView(screenName) {
    this.trackEvent('screen_view', { screen_name: screenName });
  }
} 