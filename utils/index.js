import * as Yup from 'yup';

export const loginValidationSchema = Yup.object().shape({
  email: Yup.string().email().label('Email'),
  password: Yup.string().required().min(6).label('Password')
});

export const signupValidationSchema = Yup.object().shape({
  email: Yup.string().required().email().label('Email'),
  password: Yup.string().required().min(6).label('Password'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Confirm Password must match password.')
    .required('Confirm Password is required.')
});

export const passwordResetSchema = Yup.object().shape({
  email: Yup.string()
    .required('Please enter a registered email')
    .label('Email')
    .email('Enter a valid email')
});

// Export error tracking utilities
export { 
  setupGlobalErrorTracking, 
  logComponentError, 
  logNetworkError, 
  logNavigationError 
} from './setupErrorTracking';

// Export debug utilities
export { 
  logInitializationStep, 
  logComponentLifecycle, 
  logNavigationState, 
  logFirebaseConnection, 
  logPerformanceMetric, 
  logMemoryUsage 
} from './debugInitialization';

// Export test utilities (for development/testing)
export { 
  TestErrorComponent, 
  ErrorBoundaryTester 
} from './testErrorBoundary';

// Export production check utilities
export { 
  runProductionChecks, 
  checkHermesIssues 
} from './productionChecks';
