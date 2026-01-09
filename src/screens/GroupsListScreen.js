"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native"
import { StatusBar } from "expo-status-bar"
import { LinearGradient } from "expo-linear-gradient"
import { onGroupsChange } from "../firebaseHelpers"

export default function GroupsListScreen({ onSelectGroup, onBack, onCreateGroup }) {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onGroupsChange((groupsData) => {
      if (groupsData) {
        const groupsList = Object.values(groupsData).map((group) => ({
          id: group.id,
          name: group.name,
          createdAt: group.createdAt,
          memberCount: group.members ? Object.keys(group.members).length : 0,
        }))
        setGroups(groupsList)
      } else {
        setGroups([])
      }
      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [])

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
          <Text style={styles.headerTitle}>Groups</Text>
        </LinearGradient>

        <View style={styles.content}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.createButton}
          >
            <TouchableOpacity onPress={onCreateGroup} activeOpacity={0.9}>
              <Text style={styles.createButtonText}>+ Create New Group</Text>
            </TouchableOpacity>
          </LinearGradient>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : groups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No groups yet</Text>
              <Text style={styles.emptySubtext}>Create your first group to get started</Text>
            </View>
          ) : (
            <ScrollView style={styles.groupsList}>
              {groups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={styles.groupCard}
                  onPress={() => onSelectGroup(group.id)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={["#f093fb", "#f5576c"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.groupIcon}
                  >
                    <Text style={styles.groupEmoji}>👥</Text>
                  </LinearGradient>
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupDetails}>
                      {group.memberCount} {group.memberCount === 1 ? "Member" : "Members"}
                    </Text>
                  </View>
                  <View style={styles.arrowContainer}>
                    <Text style={styles.groupArrow}>→</Text>
                  </View>
                </TouchableOpacity>
              ))}
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
  createButton: {
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
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
    fontWeight: "500",
  },
  groupsList: {
    flex: 1,
  },
  groupCard: {
    backgroundColor: "#2d2d44",
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.3)",
  },
  groupIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
    shadowColor: "#f093fb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  groupEmoji: {
    fontSize: 36,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  groupDetails: {
    fontSize: 14,
    color: "#b8b8d1",
    fontWeight: "500",
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(102, 126, 234, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  groupArrow: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
})
