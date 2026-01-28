// src/services/CameraService.js
import * as FileSystem from 'expo-file-system';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';

let CameraModule = null;

try {
  CameraModule = require('expo-camera');
} catch (error) {
  console.warn('[CameraService] expo-camera not available');
}

class CameraService {
  constructor() {
    this.cameraRef = null;
  }

  setCameraRef(ref) {
    this.cameraRef = ref;
    console.log('[CameraService] Camera reference set');
  }

  async requestCameraPermission() {
    try {
      if (!CameraModule) {
        console.warn('[CameraService] Camera module not available');
        return false;
      }

      const Camera = CameraModule.Camera || CameraModule.default;
      if (!Camera || !Camera.requestCameraPermissionsAsync) {
        console.warn('[CameraService] Camera.requestCameraPermissionsAsync not available');
        return false;
      }

      const { status } = await Camera.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('[CameraService] Permission error:', error);
      return false;
    }
  }

  async _uriToBlob(uri) {
    try {
      // Handle data URLs directly - convert to array buffer compatible format
      if (uri && uri.startsWith('data:')) {
        const arr = uri.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/) || arr[0].match(/:(.*?)$/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/png';
        
        // Decode base64 to binary string
        const bstr = atob(arr[1]);
        
        // Create a simple blob from the binary string
        try {
          // Try modern Blob constructor with array of strings
          return new Blob([bstr], { type: mime });
        } catch (e) {
          console.log('[CameraService] Standard Blob creation failed, using alternative');
          // Fallback: create array buffer manually
          const bytes = new Array(bstr.length);
          for (let i = 0; i < bstr.length; i++) {
            bytes[i] = bstr.charCodeAt(i);
          }
          // Create blob from array
          return new Blob([new Uint8Array(bytes)], { type: mime });
        }
      }

      // Handle regular file URIs
      const response = await fetch(uri);
      return await response.blob();
    } catch (error) {
      console.error('[CameraService] Error converting URI to blob:', error);
      throw error;
    }
  }

  async downloadFile(fileUrl, filename) {
    try {
      console.log('[CameraService] Starting download:', filename);
      
      const downloadDir = FileSystem.DocumentDirectory;
      const downloadPath = `${downloadDir}${filename}`;

      const downloadResumable = FileSystem.createDownloadResumable(
        fileUrl,
        downloadPath,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          console.log('[CameraService] Download progress:', Math.round(progress * 100) + '%');
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (result && result.uri) {
        console.log('[CameraService] Download completed:', result.uri);
        return result.uri;
      }
    } catch (error) {
      console.error('[CameraService] Download error:', error);
      throw error;
    }
  }

  async capturePhoto(memberId, groupId) {
    try {
      if (!this.cameraRef) {
        console.error('[CameraService] Camera ref not set');
        return null;
      }

      const hasPermission = await this.requestCameraPermission();
      if (!hasPermission) {
        console.log('[CameraService] Camera permission denied');
        return null;
      }

      console.log('[CameraService] Taking picture...');
      const photo = await this.cameraRef.takePictureAsync({
        quality: 0.7,
        skipProcessing: true,
        base64: false,
      });

      if (!photo.uri) {
        console.error('[CameraService] Photo URI is null');
        return null;
      }

      console.log('[CameraService] Photo captured:', photo.uri);

      // Upload to Firebase Storage
      const timestamp = Date.now();
      const filename = `camera_captures/${groupId}/${memberId}/${timestamp}.jpg`;
      
      const blob = await this._uriToBlob(photo.uri);
      
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      
      const downloadURL = await getDownloadURL(storageRef);
      
      console.log('[CameraService] Photo uploaded:', downloadURL);

      // Clean up local file if it's a real file path
      if (photo.uri && !photo.uri.startsWith('data:')) {
        await FileSystem.deleteAsync(photo.uri, { idempotent: true });
      }
      
      return {
        url: downloadURL,
        timestamp,
        memberId,
        groupId,
      };
    } catch (error) {
      console.error('[CameraService] Capture photo error:', error);
      return null;
    }
  }

  async captureVideo(memberId, groupId, duration = 5000) {
    try {
      if (!this.cameraRef) {
        console.error('[CameraService] Camera ref not set');
        return null;
      }

      const hasPermission = await this.requestCameraPermission();
      if (!hasPermission) {
        console.log('[CameraService] Camera permission denied');
        return null;
      }

      console.log('[CameraService] Recording video...');
      const video = await this.cameraRef.recordAsync({
        maxDuration: duration / 1000,
        mute: true,
      });

      if (!video.uri) {
        console.error('[CameraService] Video URI is null');
        return null;
      }

      console.log('[CameraService] Video recorded:', video.uri);

      // Upload to Firebase Storage
      const timestamp = Date.now();
      const filename = `camera_captures/${groupId}/${memberId}/${timestamp}.mp4`;
      
      const blob = await this._uriToBlob(video.uri);
      
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      
      const downloadURL = await getDownloadURL(storageRef);
      
      console.log('[CameraService] Video uploaded:', downloadURL);

      // Clean up local file if it's a real file path
      if (video.uri && !video.uri.startsWith('data:')) {
        await FileSystem.deleteAsync(video.uri, { idempotent: true });
      }
      
      return {
        url: downloadURL,
        timestamp,
        memberId,
        groupId,
        type: 'video',
      };
    } catch (error) {
      console.error('[CameraService] Capture video error:', error);
      return null;
    }
  }

  stopRecording() {
    if (this.cameraRef) {
      this.cameraRef.stopRecording();
    }
  }
}

export default new CameraService();
