"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native"
import { StatusBar } from "expo-status-bar"
import { LinearGradient } from "expo-linear-gradient"
import { getGroup, onGroupMembersChange, onGroupLocationsChange } from "../firebaseHelpers"
import MapScreenOSM from "../MapScreenOSM"

export default function AdminLocationTrackingScreen({ groupId, onBack }) {
  const [members, setMembers] = useState([])
  const [selectedMemberId, setSelectedMemberId] = useState(null)
  const [memberLocations, setMemberLocations] = useState({})
  const [loading, setLoading] = useState(true)
  const [groupName, setGroupName] = useState("")
  const [viewMode, setViewMode] = useState("list") // 'list' or 'map'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const group = await getGroup(groupId)
        if (group) {
          setGroupName(group.name)
        }

        const unsubscribeMembers = onGroupMembersChange(groupId, (membersData) => {
          if (membersData) {
            const membersList = Object.values(membersData)
            setMembers(membersList)
          } else {
            setMembers([])
          }
          setLoading(false)
        })

        const unsubscribeLocations = onGroupLocationsChange(groupId, (locations) => {
          if (locations) {
            setMemberLocations(locations)
          } else {
            setMemberLocations({})
          }
        })

        return () => {
          unsubscribeMembers()
          unsubscribeLocations()
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    let cleanup
    if (groupId) {
      fetchData().then((c) => {
        cleanup = c
      })
    }

    return () => {
      if (cleanup) cleanup()
    }
  }, [groupId])

  const handleViewMemberLocation = (memberId) => {
    setSelectedMemberId(memberId)
    setViewMode("map")
  }

  const handleBackToList = () => {
    setViewMode("list")
    setSelectedMemberId(null)
  }

  const getMemberLocation = (memberId) => {
    return memberLocations[memberId] || null
  }

  const isMemberTracking = (memberId) => {
    const location = getMemberLocation(memberId)
    if (!location) return false
    // Check if location is recent (within last 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    return location.timestamp > fiveMinutesAgo
  }

  const getLastSeenTime = (memberId) => {
    const location = getMemberLocation(memberId)
    if (!location) return "Never"

    const timeDiff = Date.now() - location.timestamp
    const minutes = Math.floor(timeDiff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    return "Just now"
  }

  // Map view
  if (viewMode === "map" && selectedMemberId) {
    const member = members.find((m) => m.id === selectedMemberId)
    const memberLocation = getMemberLocation(selectedMemberId)

    if (!memberLocation || !memberLocation.lat || !memberLocation.lng) {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackToList} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Location</Text>
          </View>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No location data available</Text>
            <Text style={styles.emptySubtext}>{member?.email || "Member"} has not shared location yet</Text>
            <TouchableOpacity style={styles.backToListButton} onPress={handleBackToList}>
              <Text style={styles.backToListButtonText}>Back to List</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }

    // Create a single member location object for map
    const singleMemberLocation = {
      [selectedMemberId]: memberLocation,
    }

    return (
      <View style={styles.container}>
        <MapScreenOSM
          myLocation={memberLocation}
          familyLocations={singleMemberLocation}
          onBackPress={handleBackToList}
          isTracking={isMemberTracking(selectedMemberId)}
        />
      </View>
    )
  }

  // List view
  return (
    <>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <LinearGradient
          colors={["#667eea", "#764ba2", "#f093fb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track Members</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.groupInfo}>
            <Text style={styles.groupName}>{groupName}</Text>
            <Text style={styles.memberCount}>{members.length} Members</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : members.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No members in this group</Text>
            </View>
          ) : (
            <ScrollView style={styles.membersList}>
              {members.map((member) => {
                const location = getMemberLocation(member.id)
                const isTracking = isMemberTracking(member.id)
                const lastSeen = getLastSeenTime(member.id)

                return (
                  <View key={member.id} style={styles.memberCard}>
                    <View style={styles.memberInfo}>
                      <View style={styles.memberHeader}>
                        <Text style={styles.memberEmail}>{member.email}</Text>
                        {isTracking && (
                          <View style={styles.trackingBadge}>
                            <Text style={styles.trackingBadgeText}>🔴 Live</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.memberUsername}>@{member.username}</Text>
                      <View style={styles.locationInfo}>
                        <Text style={styles.locationStatus}>
                          {location ? (
                            <>
                              📍 Last seen: {lastSeen}
                              {location.lat && location.lng && (
                                <>
                                  {"\n"}
                                  Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                                </>
                              )}
                            </>
                          ) : (
                            "📍 Location not available"
                          )}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.viewLocationButton, !location && styles.viewLocationButtonDisabled]}
                      onPress={() => handleViewMemberLocation(member.id)}
                      disabled={!location}
                    >
                      <Text style={styles.viewLocationButtonText}>{location ? "View Map" : "No Data"}</Text>
                    </TouchableOpacity>
                  </View>
                )
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  backButtonText: {
    color: "#667eea",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  groupInfo: {
    backgroundColor: "#2d2d44",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.3)",
  },
  groupName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  memberCount: {
    fontSize: 15,
    color: "#b8b8d1",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#b8b8d1",
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "500",
  },
  backToListButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  backToListButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  membersList: {
    flex: 1,
  },
  memberCard: {
    backgroundColor: "#2d2d44",
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.3)",
  },
  memberInfo: {
    marginBottom: 12,
  },
  memberHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
    letterSpacing: 0.2,
  },
  trackingBadge: {
    backgroundColor: "#ea4335",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: "#ea4335",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  trackingBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  memberUsername: {
    fontSize: 14,
    color: "#b8b8d1",
    marginBottom: 10,
    fontWeight: "500",
  },
  locationInfo: {
    marginTop: 10,
    backgroundColor: "rgba(26, 26, 46, 0.6)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.2)",
  },
  locationStatus: {
    fontSize: 13,
    color: "#b8b8d1",
    lineHeight: 20,
    fontWeight: "500",
  },
  viewLocationButton: {
    backgroundColor: "#667eea",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 4,
  },
  viewLocationButtonDisabled: {
    backgroundColor: "#4a4a5c",
    shadowOpacity: 0,
    elevation: 0,
  },
  viewLocationButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
})
