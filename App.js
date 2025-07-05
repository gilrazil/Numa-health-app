import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert, ScrollView, Platform, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from './config';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function App() {
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [user, setUser] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [totalTests, setTotalTests] = useState(0);
  const [passedTests, setPassedTests] = useState(0);
  const [failedTests, setFailedTests] = useState(0);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const BUILD_INFO = {
    number: 35,
    name: "Camera File Output Validation",
    description: "Testing photo capture and file output validation",
    version: "1.0.35",
    focus: "File output validation and preview"
  };

  console.log(`📱 BUILD ${BUILD_INFO.number} - ${BUILD_INFO.name.toUpperCase()}`);

  useEffect(() => {
    console.log(`📸 Build ${BUILD_INFO.number} - ${BUILD_INFO.name} - App component mounted`);
    
    const initializeApp = async () => {
      try {
        console.log('🔥 Initializing Firebase for file output test...');
        
        // Test Firebase connectivity
        if (auth && db) {
          console.log('✅ Firebase services initialized successfully');
          setIsFirebaseReady(true);
        } else {
          console.error('❌ Firebase services not available');
          setIsFirebaseReady(false);
        }

        // Request permissions
        await requestPermissions();
        
      } catch (error) {
        console.error('❌ App initialization error:', error);
        setIsFirebaseReady(false);
      }
    };

    initializeApp();
  }, []);

  const requestPermissions = async () => {
    try {
      console.log('🔐 Requesting camera permissions...');
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(cameraStatus.status);
      console.log('📊 Camera permission status:', cameraStatus.status);

      console.log('🔐 Requesting media library permissions...');
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      setMediaLibraryPermission(mediaLibraryStatus.status);
      console.log('📊 Media library permission status:', mediaLibraryStatus.status);
    } catch (error) {
      console.error('❌ Permission request error:', error);
    }
  };

  const handleLogin = async () => {
    const email = "gil.raz.il@gmail.com";
    const password = "test123!";
    
    console.log('🔑 Starting login process for Build 35');
    setLoginLoading(true);

    try {
      console.log('🔐 Attempting Firebase authentication...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      console.log('✅ Firebase authentication successful');
      console.log('👤 User UID:', firebaseUser.uid);
      console.log('📧 User email:', firebaseUser.email);
      
      setUser(firebaseUser);
      Alert.alert('✅ Login Success', 'Firebase authentication working!');
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      Alert.alert('❌ Login Error', error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const validateFileOutput = async (fileUri, filename) => {
    try {
      console.log(`📋 Validating file output: ${filename}`);
      
      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        console.error(`❌ File does not exist: ${filename}`);
        return { passed: false, error: 'File does not exist' };
      }

      // Check file size (150KB - 350KB range)
      const fileSizeKB = fileInfo.size / 1024;
      if (fileSizeKB < 150 || fileSizeKB > 350) {
        console.error(`❌ File size invalid: ${fileSizeKB}KB (expected 150-350KB)`);
        return { passed: false, error: `File size ${fileSizeKB}KB out of range` };
      }

      // Check filename format (should contain ISO timestamp)
      const timestampPattern = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      if (!timestampPattern.test(filename)) {
        console.error(`❌ Filename format invalid: ${filename}`);
        return { passed: false, error: 'Filename missing ISO timestamp' };
      }

      console.log(`✅ File validation passed: ${filename} (${fileSizeKB}KB)`);
      return { 
        passed: true, 
        size: fileSizeKB,
        path: fileUri,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ File validation error: ${error}`);
      return { passed: false, error: error.message };
    }
  };

  const capturePhoto = async () => {
    if (!cameraRef) {
      console.error('❌ Camera ref not available');
      Alert.alert('❌ Camera Error', 'Camera not ready');
      return null;
    }

    try {
      setIsCapturing(true);
      const timestamp = new Date().toISOString();
      const filename = `photo-${timestamp}.jpg`;
      
      console.log(`📸 Capturing photo: ${filename}`);
      
      const photo = await cameraRef.takePictureAsync({
        quality: 0.7,
        base64: false,
        exif: false
      });

      console.log(`📸 Photo captured: ${photo.uri}`);
      console.log(`📦 File size: ${Math.round((photo.width * photo.height * 3) / 1024)}KB (estimated)`);

      // Validate the captured file
      const validation = await validateFileOutput(photo.uri, filename);
      
      if (validation.passed) {
        console.log(`✅ File Saved: ${filename}`);
        console.log(`📸 Photo saved → ${photo.uri}`);
        console.log(`📦 File size → ${validation.size}KB`);
        console.log(`🧪 File output validation: ✅ Success`);
        
        setCapturedImages(prev => [...prev, {
          uri: photo.uri,
          filename: filename,
          timestamp: timestamp,
          size: validation.size,
          validation: validation
        }]);

        return { success: true, photo, validation };
      } else {
        console.error(`❌ File validation failed: ${validation.error}`);
        return { success: false, error: validation.error };
      }

    } catch (error) {
      console.error('❌ Photo capture error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsCapturing(false);
    }
  };

  const runTestCycle = async () => {
    console.log('🔄 Starting camera file output test cycle...');
    setIsRunningTests(true);
    
    const targetTests = 10;
    let currentTests = 0;
    let passed = 0;
    let failed = 0;
    const results = [];

    while (currentTests < targetTests) {
      currentTests++;
      console.log(`📋 Running test ${currentTests}/${targetTests}`);
      
      const result = await capturePhoto();
      
      if (result && result.success) {
        passed++;
        results.push({
          testNumber: currentTests,
          status: 'PASSED',
          filename: result.photo ? `photo-${new Date().toISOString()}.jpg` : 'unknown',
          size: result.validation ? result.validation.size : 0,
          timestamp: new Date().toISOString()
        });
        console.log(`✅ Test ${currentTests} PASSED`);
      } else {
        failed++;
        results.push({
          testNumber: currentTests,
          status: 'FAILED',
          error: result ? result.error : 'Unknown error',
          timestamp: new Date().toISOString()
        });
        console.log(`❌ Test ${currentTests} FAILED: ${result ? result.error : 'Unknown error'}`);
      }

      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    setTotalTests(currentTests);
    setPassedTests(passed);
    setFailedTests(failed);
    setTestResults(results);
    setIsRunningTests(false);

    // Generate final report
    const successRate = ((passed / currentTests) * 100).toFixed(1);
    
    console.log('\n📊 Build 35 Camera File Output Report');
    console.log(`Total tests: ${currentTests}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success rate: ${successRate}%`);
    
    if (failed === 0) {
      console.log('Ready for Build 36: ✅ YES');
      Alert.alert(
        '🎉 Build 35 Complete!',
        `All tests passed!\n\n✅ ${passed} successful captures\n❌ ${failed} failures\n📈 ${successRate}% success rate\n\nReady for Build 36!`,
        [{ text: 'Excellent!', style: 'default' }]
      );
    } else {
      console.log('Ready for Build 36: ❌ NO');
      Alert.alert(
        '⚠️ Build 35 Issues',
        `Some tests failed:\n\n✅ ${passed} passed\n❌ ${failed} failed\n📈 ${successRate}% success rate\n\nNeeds investigation before Build 36.`,
        [{ text: 'Review Results', style: 'default' }]
      );
    }
  };

  const renderCapturedImages = () => {
    if (capturedImages.length === 0) return null;

    return (
      <View style={styles.previewSection}>
        <Text style={styles.sectionTitle}>📸 Captured Photos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {capturedImages.map((image, index) => (
            <View key={index} style={styles.imagePreview}>
              <Image source={{ uri: image.uri }} style={styles.previewImage} />
              <Text style={styles.imageInfo}>
                {image.filename.substring(0, 20)}...
              </Text>
              <Text style={styles.imageSizeInfo}>
                {Math.round(image.size)}KB
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (!isFirebaseReady) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🔥 BUILD {BUILD_INFO.number}</Text>
          <Text style={styles.subtitle}>{BUILD_INFO.name}</Text>
          <Text style={styles.version}>Version {BUILD_INFO.version}</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <MaterialCommunityIcons name="loading" size={48} color="#FF6B35" />
          <Text style={styles.statusText}>Initializing Firebase...</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔥 BUILD {BUILD_INFO.number}</Text>
        <Text style={styles.subtitle}>{BUILD_INFO.name}</Text>
        <Text style={styles.version}>Version {BUILD_INFO.version}</Text>
        <Text style={styles.description}>{BUILD_INFO.description}</Text>
      </View>

      {/* Login Section */}
      {!user ? (
        <View style={styles.loginSection}>
          <Text style={styles.sectionTitle}>🔑 Firebase Authentication</Text>
          <Button
            title={loginLoading ? "Logging in..." : "Login with Firebase"}
            onPress={handleLogin}
            disabled={loginLoading}
            color="#4CAF50"
          />
        </View>
      ) : (
        <View style={styles.userSection}>
          <Text style={styles.sectionTitle}>✅ Authenticated</Text>
          <Text style={styles.userInfo}>👤 {user.email}</Text>
          <Text style={styles.userInfo}>🆔 {user.uid}</Text>
        </View>
      )}

      {/* Camera Section */}
      {user && cameraPermission === 'granted' && (
        <View style={styles.cameraSection}>
          <Text style={styles.sectionTitle}>📸 Camera File Output Test</Text>
          
          <View style={styles.cameraContainer}>
            <Camera
              style={styles.camera}
              type={Camera.Constants.Type.back}
              ref={setCameraRef}
            />
            <View style={styles.cameraOverlay}>
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>🧪 File Output:</Text>
                <Text style={styles.statusValue}>
                  {failedTests === 0 && totalTests > 0 ? '✅ Verified' : 
                   failedTests > 0 ? '❌ Failed' : '⏳ Pending'}
                </Text>
              </View>
              
              {capturedImages.length > 0 && (
                <View style={styles.statusInfo}>
                  <Text style={styles.statusLabel}>📸 Last Photo:</Text>
                  <Text style={styles.statusValue}>
                    {capturedImages[capturedImages.length - 1].filename.substring(0, 25)}...
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={isCapturing ? "Capturing..." : "📸 Capture Photo"}
              onPress={capturePhoto}
              disabled={isCapturing || isRunningTests}
              color="#FF6B35"
            />
            
            <View style={styles.buttonSpacer} />
            
            <Button
              title={isRunningTests ? "Running Tests..." : "🧪 Run 10-Photo Test"}
              onPress={runTestCycle}
              disabled={isCapturing || isRunningTests}
              color="#4CAF50"
            />
          </View>
        </View>
      )}

      {/* Test Results Section */}
      {totalTests > 0 && (
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>📊 Test Results</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Tests</Text>
              <Text style={styles.statValue}>{totalTests}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Passed</Text>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>{passedTests} ✅</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Failed</Text>
              <Text style={[styles.statValue, { color: '#F44336' }]}>{failedTests} ❌</Text>
            </View>
          </View>
          
          <View style={styles.readyStatus}>
            <Text style={styles.readyLabel}>Ready for Build 36:</Text>
            <Text style={[styles.readyValue, { color: failedTests === 0 ? '#4CAF50' : '#F44336' }]}>
              {failedTests === 0 ? '✅ YES' : '❌ NO'}
            </Text>
          </View>
        </View>
      )}

      {/* Preview Section */}
      {renderCapturedImages()}

      {/* Status Section */}
      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>📋 System Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Firebase:</Text>
          <Text style={styles.statusValue}>{isFirebaseReady ? '✅ Ready' : '❌ Not Ready'}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Camera:</Text>
          <Text style={styles.statusValue}>{cameraPermission === 'granted' ? '✅ Granted' : '❌ Denied'}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Media Library:</Text>
          <Text style={styles.statusValue}>{mediaLibraryPermission === 'granted' ? '✅ Granted' : '❌ Denied'}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Focus: {BUILD_INFO.focus}
        </Text>
        <Text style={styles.footerText}>
          {Platform.OS === 'ios' ? '📱 iOS' : '🤖 Android'} • Expo SDK 53
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 5,
  },
  version: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  description: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
  loginSection: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  userSection: {
    padding: 20,
    backgroundColor: '#e8f5e8',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  userInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  cameraSection: {
    padding: 20,
  },
  cameraContainer: {
    position: 'relative',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
  },
  statusInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  statusLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 12,
    color: '#fff',
  },
  buttonContainer: {
    gap: 10,
  },
  buttonSpacer: {
    height: 10,
  },
  resultsSection: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  readyStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  readyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  readyValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  previewSection: {
    padding: 20,
  },
  imagePreview: {
    marginRight: 15,
    alignItems: 'center',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 5,
  },
  imageInfo: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  imageSizeInfo: {
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
  },
  statusSection: {
    padding: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  footer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
}); 