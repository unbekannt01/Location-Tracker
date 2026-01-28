import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Error Boundary for Camera Component
 * Catches any errors from HiddenCameraComponent and prevents crash
 */
export default class CameraErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    console.error('[CameraErrorBoundary] Error caught:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[CameraErrorBoundary] Error details:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      console.log('[CameraErrorBoundary] Rendering error state - camera will be disabled');
      return null; // Silently fail - app continues without camera
    }

    return this.props.children;
  }
}
