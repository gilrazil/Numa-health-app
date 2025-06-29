import React, { useState } from 'react';
import { View, Button, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase'; // make sure this points to your correct file

export default function LogMealScreen() {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.IMAGES],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!image) return;

    try {
      setUploading(true);
      const response = await fetch(image);
      const blob = await response.blob();

      const filename = `meals/${Date.now()}.jpg`;
      const imageRef = ref(storage, filename);

      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);

      Alert.alert("Upload Success", `Image URL:\n${downloadURL}`);
      console.log('Uploaded image URL:', downloadURL);
      setImage(null);
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Upload Failed", err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Pick an Image" onPress={pickImage} />
      {image && (
        <>
          <Image source={{ uri: image }} style={{ width: 200, height: 200, marginVertical: 20 }} />
          {uploading ? (
            <ActivityIndicator />
          ) : (
            <Button title="Upload Image to Firebase" onPress={uploadImage} />
          )}
        </>
      )}
    </View>
  );
}
