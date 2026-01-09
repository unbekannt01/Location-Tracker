"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native"
import { StatusBar } from "expo-status-bar"
import { LinearGradient } from "expo-linear-gradient"
import { getAllGroups, setGroup } from "../firebaseHelpers"

export default function CreateGroupScreen({ onGroupCreated, onBack }) {
  const [groupName, setGroupName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter group name")
      return
    }

    setLoading(true)
    try {
      const groupId = `group_${Date.now()}`

      const allGroups = await getAllGroups()
      if (allGroups) {
        const existingGroup = Object.values(allGroups).find(
          (g) => g.name.toLowerCase() === groupName.trim().toLowerCase(),
        )
        if (existingGroup) {
          Alert.alert("Error", "Group name already exists")
          setLoading(false)
          return
        }
      }

      await setGroup(groupId, {
        id: groupId,
        name: groupName.trim(),
        createdAt: Date.now(),
        members: {},
      })

      Alert.alert("Success", "Group created successfully!", [{ text: "OK", onPress: () => onGroupCreated(groupId) }])
    } catch (error) {
      console.error("Error creating group:", error)
      Alert.alert("Error", "Failed to create group")
    } finally {
      setLoading(false)
    }
  }

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
          <Text style={styles.headerTitle}>Create Group</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.form}>
            <Text style={styles.label}>Group Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter group name"
              placeholderTextColor="#b8b8d1"
              value={groupName}
              onChangeText={setGroupName}
              editable={!loading}
            />

            <LinearGradient
              colors={["#667eea", "#764ba2", "#f093fb"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.createButton, loading && styles.createButtonDisabled]}
            >
              <TouchableOpacity
                onPress={handleCreateGroup}
                disabled={loading}
                activeOpacity={0.9}
                style={styles.createButtonInner}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>✨ Create Group</Text>
                )}
              </TouchableOpacity>
            </LinearGradient>
          </View>
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
    justifyContent: "center",
  },
  form: {
    width: "100%",
  },
  label: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: "rgba(45, 45, 68, 0.9)",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: "rgba(102, 126, 234, 0.4)",
    color: "#fff",
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createButton: {
    borderRadius: 16,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  createButtonInner: {
    paddingVertical: 18,
    alignItems: "center",
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
})
