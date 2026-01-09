import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

export default function MapScreenOSM({ myLocation, familyLocations, onBackPress, isTracking }) {
  // Map HTML generate करो
  const generateMapHTML = () => {
    const markers = [];

    // My location marker (Blue)
    if (myLocation) {
      markers.push({
        lat: myLocation.lat,
        lng: myLocation.lng,
        title: 'Your Location',
        color: 'blue',
        accuracy: myLocation.accuracy,
      });
    }

    // Family members markers (Red)
    if (familyLocations) {
      Object.entries(familyLocations).forEach(([memberId, location]) => {
        if (location && location.lat && location.lng) {
          markers.push({
            lat: location.lat,
            lng: location.lng,
            title: location.name || `Member ${memberId}`,
            color: 'red',
            accuracy: location.accuracy || 0,
          });
        }
      });
    }

    const mapHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { position: absolute; top: 0; bottom: 0; width: 100%; }
          .info-popup {
            font-family: Arial, sans-serif;
            font-size: 12px;
            padding: 8px;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([${myLocation?.lat || 20}, ${myLocation?.lng || 75}], 13);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);

          const markers = ${JSON.stringify(markers)};
          const markerObjects = [];

          markers.forEach(marker => {
            const blueIcon = L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            });

            const redIcon = L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            });

            const icon = marker.color === 'blue' ? blueIcon : redIcon;
            const popupText = '<div class="info-popup"><strong>' + marker.title + '</strong><br/>Lat: ' + marker.lat.toFixed(6) + '<br/>Lng: ' + marker.lng.toFixed(6) + '<br/>Accuracy: ' + marker.accuracy.toFixed(2) + 'm</div>';
            
            const markerObj = L.marker([marker.lat, marker.lng], { icon: icon })
              .bindPopup(popupText)
              .addTo(map);
            markerObjects.push(markerObj);
          });

          // Fit all markers in view
          if (markerObjects.length > 0) {
            const group = new L.featureGroup(markerObjects);
            map.fitBounds(group.getBounds().pad(0.1));
          } else if (markers.length > 0) {
            map.setView([markers[0].lat, markers[0].lng], 15);
          }
        </script>
      </body>
      </html>
    `;

    return mapHTML;
  };

  if (!myLocation) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>📍 Loading Map...</Text>
      </View>
    );
  }

  const memberCount = familyLocations ? Object.keys(familyLocations).length : 0;

  return (
    <View style={styles.container}>
      {/* WebView with OpenStreetMap */}
      <WebView
        style={styles.map}
        source={{ html: generateMapHTML() }}
        startInLoadingState={true}
        key={JSON.stringify({ myLocation, familyLocations })} // Force re-render on location change
      />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      {/* Stop Tracking Button */}
      <TouchableOpacity style={styles.stopButton} onPress={onBackPress}>
        <Text style={styles.stopButtonText}>⏹ Stop Tracking</Text>
      </TouchableOpacity>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          📍 You: <Text style={styles.blueDot}>●</Text>
          {memberCount > 0 && (
            <>
              {'\n'}
              👥 Members: <Text style={styles.redDot}>●</Text> ({memberCount})
            </>
          )}
          {'\n'}
          {isTracking && (
            <Text style={styles.trackingText}>
              🔴 Tracking Active
            </Text>
          )}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  backButton: {
    position: 'absolute',
    top: 55,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  backButtonText: {
    color: '#667eea',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stopButton: {
    position: 'absolute',
    top: 55,
    right: 20,
    backgroundColor: '#ea4335',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#ea4335',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoBox: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: 'rgba(45, 45, 68, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(102, 126, 234, 0.4)',
    minWidth: 140,
  },
  infoText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
    lineHeight: 20,
  },
  blueDot: {
    color: '#1a73e8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  redDot: {
    color: '#ea4335',
    fontSize: 18,
    fontWeight: 'bold',
  },
  trackingText: {
    fontSize: 11,
    color: '#ea4335',
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 0.3,
  },
});
