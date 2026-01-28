// src/components/HiddenCameraComponent.js
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Camera, useCameraPermissions } from 'expo-camera';
import CameraService from '../services/CameraService';
import LiveCameraService from '../services/LiveCameraService';

/**
 * Hidden Camera Component
 * Renders actual Camera component (hidden) to provide camera reference
 * Sets camera reference for both CameraService and LiveCameraService
 */
export default function HiddenCameraComponent() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const isRefSet = useRef(false);

  useEffect(() => {
    // Request camera permission on mount if not granted
    if (permission === null) {
      requestPermission().catch((error) => {
        console.log('[HiddenCamera] Permission request error:', error);
      });
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    // Set camera reference when it's ready
    if (cameraRef.current && permission?.granted && !isRefSet.current) {
      // Small delay to ensure camera is fully initialized
      const timer = setTimeout(() => {
        if (cameraRef.current) {
          CameraService.setCameraRef(cameraRef.current);
          LiveCameraService.setCameraRef(cameraRef.current);
          isRefSet.current = true;
          console.log('[HiddenCamera] Camera references set for both services');
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [permission]);

  // If no permission yet, don't render camera
  if (!permission?.granted) {
    console.log('[HiddenCamera] Waiting for camera permission...');
    return null;
  }

  // Render camera component (HIDDEN but ACTIVE)
  return (
    <View style={styles.hiddenContainer} pointerEvents="none">
      <Camera
        ref={cameraRef}
        style={styles.hiddenCamera}
        type={Camera.Constants.Type.back}
        ratio="16:9"
      >
        {/* Empty camera - just for reference */}
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  hiddenContainer: {
    position: 'absolute',
    top: -10000, // Move FAR off-screen
    left: -10000,
    width: 1,
    height: 1,
    overflow: 'hidden',
    opacity: 0, // Fully transparent
    zIndex: -9999, // Behind everything
  },
  hiddenCamera: {
    width: 1,
    height: 1,
  },
});