'use client';

// src/components/LiveStreamViewer.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../../firebase';

export default function LiveStreamViewer({ memberId, groupId, onClose }) {
  const [frameData, setFrameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [frameCount, setFrameCount] = useState(0);
  const [connectionTimeout, setConnectionTimeout] = useState(false);

  useEffect(() => {
    if (!memberId || !groupId) {
      console.log('[LiveViewer] Missing memberId or groupId');
      return;
    }

    console.log('[LiveViewer] Starting to listen for live stream');
    setLoading(true);
    setIsConnected(true);
    setConnectionTimeout(false);

    let timeoutId = null;
    let frameTimeoutId = null;

    const streamRef = ref(db, `live_streams/${groupId}/${memberId}/currentFrame`);

    // Set timeout for connection
    timeoutId = setTimeout(() => {
      setConnectionTimeout(true);
      console.warn('[LiveViewer] Connection timeout - member may be offline');
    }, 10000);

    // Listen for real-time frame updates
    const unsubscribe = onValue(
      streamRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          if (data && data.frameData) {
            clearTimeout(timeoutId);
            setIsConnected(true);
            setConnectionTimeout(false);
            setFrameData(data.frameData);
            setLastUpdate(new Date(data.timestamp).toLocaleTimeString());
            setFrameCount(fc => fc + 1);
            setLoading(false);
            
            // Clear frame timeout on successful frame
            if (frameTimeoutId) clearTimeout(frameTimeoutId);
            
            // Set timeout to check if frames stop coming
            frameTimeoutId = setTimeout(() => {
              setIsConnected(false);
              console.warn('[LiveViewer] No frames received for 5 seconds');
            }, 5000);
            
            console.log('[LiveViewer] Frame #' + (frameCount + 1) + ' received at', new Date(data.timestamp).toLocaleTimeString());
          }
        } catch (error) {
          console.error('[LiveViewer] Error processing frame:', error);
        }
      },
      (error) => {
        console.error('[LiveViewer] Firebase listener error:', error);
        setIsConnected(false);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(frameTimeoutId);
      off(streamRef);
      console.log('[LiveViewer] Stopped listening for frames');
    };
  }, [memberId, groupId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Camera Feed</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.streamContainer}>
        {loading && connectionTimeout ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Member is Offline
            </Text>
            <Text style={styles.errorSubText}>
              No response from member's device. Make sure their app is open and they have camera access enabled.
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setLoading(true);
                setConnectionTimeout(false);
              }}
            >
              <Text style={styles.retryButtonText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF1744" />
            <Text style={styles.loadingText}>Connecting to camera...</Text>
          </View>
        ) : frameData ? (
          <>
            <Image source={{ uri: frameData }} style={styles.stream} />
            <View style={styles.statusBar}>
              <View
                style={[
                  styles.statusIndicator,
                  isConnected ? styles.connected : styles.disconnected,
                ]}
              />
              <Text style={styles.statusText}>
                {isConnected ? 'LIVE' : 'RECONNECTING...'}
              </Text>
              <Text style={styles.timeText}>{lastUpdate}</Text>
            </View>
          </>
        ) : connectionTimeout ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Member is Offline
            </Text>
            <Text style={styles.errorSubText}>
              No camera feed available. Make sure the member's app is running.
            </Text>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Waiting for first frame...
            </Text>
            <Text style={styles.errorSubText}>
              Ensure member device has camera permissions enabled
            </Text>
          </View>
        )}
      </View>

      <View style={styles.infoBar}>
        <Text style={styles.infoText}>Real-time Live Stream</Text>
        <Text style={styles.infoSubText}>Frames received: {frameCount} | {isConnected ? '🟢 Connected' : '🔴 Offline'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FF1744',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  closeButton: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  streamContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  stream: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statusBar: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  connected: {
    backgroundColor: '#4CAF50',
  },
  disconnected: {
    backgroundColor: '#FF5252',
  },
  statusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    marginRight: 8,
  },
  timeText: {
    color: '#aaa',
    fontSize: 11,
    marginLeft: 'auto',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 16,
    fontWeight: '600',
  },
  errorSubText: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 8,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FF1744',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBar: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#404040',
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoSubText: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 4,
  },
});
