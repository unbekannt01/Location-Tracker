// src/services/LiveCameraService.js
import { ref, set } from 'firebase/database';
import { db } from '../../firebase';

class LiveCameraService {
  constructor() {
    this.cameraRef = null;
    this.isStreaming = false;
    this.streamInterval = null;
    this.memberId = null;
    this.groupId = null;
    this.frameRate = 1000; // ms between frames - 1 second
    this.cameraModule = null;
  }

  initializeCamera() {
    try {
      // Lazy load camera module
      this.cameraModule = require('expo-camera');
      console.log('[LiveCamera] Camera module initialized');
    } catch (error) {
      console.error('[LiveCamera] Failed to initialize camera module:', error);
    }
  }

  setCameraRef(ref) {
    this.cameraRef = ref;
    console.log('[LiveCamera] Camera reference set');
  }

  async startLiveStream(memberId, groupId) {
    try {
      if (this.isStreaming) {
        console.log('[LiveCamera] Stream already running');
        return true;
      }

      if (!this.cameraRef) {
        console.error('[LiveCamera] Camera reference not set');
        return false;
      }

      this.memberId = memberId;
      this.groupId = groupId;
      this.isStreaming = true;

      console.log('[LiveCamera] Starting live stream for', memberId);

      // Capture and send frames periodically
      this.streamInterval = setInterval(async () => {
        try {
          if (!this.isStreaming || !this.cameraRef) return;

          // Capture frame
          const photo = await this.cameraRef.takePictureAsync({
            quality: 0.3, // Lower quality for faster streaming
            base64: true,
            skipProcessing: true,
          });

          if (photo && photo.base64) {
            // Send to Firebase
            const streamRef = ref(
              db,
              `live_streams/${groupId}/${memberId}/currentFrame`
            );

            await set(streamRef, {
              timestamp: Date.now(),
              frameData: `data:image/jpg;base64,${photo.base64}`,
            });

            console.log('[LiveCamera] Frame sent at', new Date().toLocaleTimeString());
          }
        } catch (error) {
          console.error('[LiveCamera] Frame capture error:', error);
        }
      }, this.frameRate);

      return true;
    } catch (error) {
      console.error('[LiveCamera] Start stream error:', error);
      this.isStreaming = false;
      return false;
    }
  }

  stopLiveStream() {
    try {
      if (this.streamInterval) {
        clearInterval(this.streamInterval);
        this.streamInterval = null;
      }

      this.isStreaming = false;

      // Clear Firebase stream data
      if (this.memberId && this.groupId) {
        const streamRef = ref(
          db,
          `live_streams/${this.groupId}/${this.memberId}`
        );
        set(streamRef, null);
      }

      console.log('[LiveCamera] Stream stopped');
      return true;
    } catch (error) {
      console.error('[LiveCamera] Stop stream error:', error);
      return false;
    }
  }

  isStreamingActive() {
    return this.isStreaming;
  }

  setFrameRate(milliseconds) {
    this.frameRate = milliseconds;
    console.log('[LiveCamera] Frame rate updated to', milliseconds, 'ms');
  }
}

export default new LiveCameraService();
