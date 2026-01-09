"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from "react-native"
import { StatusBar } from "expo-status-bar"
import { LinearGradient } from "expo-linear-gradient"
import { getGroup, getGroupMembers, pushData, addGroupMember, addUser } from "../firebaseHelpers"

export default function AddMemberScreen({ groupId, onMemberAdded, onBack }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [groupName, setGroupName] = useState("")

  useEffect(() => {
    const fetchGroupName = async () => {
      try {
        const group = await getGroup(groupId)
        if (group) {
          setGroupName(group.name)
        }
      } catch (error) {
        console.error("Error fetching group:", error)
      }
    }
    if (groupId) {
      fetchGroupName()
    }
  }, [groupId])

  const generateCredentials = () => {
    const emailPrefix = email.split("@")[0].substring(0, 3)
    const randomChars = Math.random().toString(36).substring(2, 4)
    const username = (emailPrefix + randomChars).substring(0, 6)

    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    let password = ""
    for (let i = 0; i < 6; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return { username, password }
  }

  const handleAddMember = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter email address")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Error", "Please enter a valid email address")
      return
    }

    setLoading(true)
    try {
      const members = await getGroupMembers(groupId)

      if (members) {
        const existingMember = Object.values(members).find((m) => m.email.toLowerCase() === email.trim().toLowerCase())
        if (existingMember) {
          Alert.alert("Error", "Member with this email already exists")
          setLoading(false)
          return
        }
      }

      const { username, password } = generateCredentials()
      const { key: memberId } = await pushData(`groups/${groupId}/members`)

      await addGroupMember(groupId, memberId, {
        id: memberId,
        email: email.trim(),
        username,
        // Store plain password only in group members for admin view;
        // actual auth password in users node is hashed
        password,
        createdAt: Date.now(),
        isActive: false,
      })

      await addUser(memberId, {
        id: memberId,
        groupId,
        email: email.trim(),
        username,
        password,
        role: "member",
        createdAt: Date.now(),
        isActive: false,
      })

      Alert.alert(
        "Member Added Successfully!",
        `Username: ${username}\nPassword: ${password}\n\nPlease save these credentials.`,
        [
          {
            text: "OK",
            onPress: () => {
              setEmail("")
              onMemberAdded()
            },
          },
        ],
      )
    } catch (error) {
      console.error("Error adding member:", error)
      Alert.alert("Error", "Failed to add member")
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
          <Text style={styles.headerTitle}>Add Member</Text>
        </LinearGradient>

        <ScrollView style={styles.content}>
          <View style={styles.groupInfo}>
            <Text style={styles.groupLabel}>Group:</Text>
            <Text style={styles.groupName}>{groupName}</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter member email"
              placeholderTextColor="#b8b8d1"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <Text style={styles.hint}>Credentials will be automatically generated</Text>

            <LinearGradient
              colors={["#667eea", "#764ba2", "#f093fb"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.addButton, loading && styles.addButtonDisabled]}
            >
              <TouchableOpacity
                onPress={handleAddMember}
                disabled={loading}
                activeOpacity={0.9}
                style={styles.addButtonInner}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.addButtonText}>✨ Add Member</Text>}
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
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
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.3)",
  },
  groupLabel: {
    fontSize: 14,
    color: "#b8b8d1",
    marginBottom: 6,
    fontWeight: "500",
  },
  groupName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.2,
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
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  hint: {
    fontSize: 13,
    color: "#b8b8d1",
    marginBottom: 28,
    fontStyle: "italic",
    fontWeight: "500",
  },
  addButton: {
    borderRadius: 16,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  addButtonInner: {
    paddingVertical: 18,
    alignItems: "center",
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
})
