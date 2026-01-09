"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from "react-native"
import { StatusBar } from "expo-status-bar"
import { LinearGradient } from "expo-linear-gradient"
import { getUserByCredentials, updateUserPassword } from "../firebaseHelpers"

export default function ChangePasswordScreen({ userInfo, onBack, onPasswordChanged }) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  if (!userInfo || userInfo.type !== "admin") {
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
            <View style={styles.headerContent}>
              <Text style={styles.headerIcon}>🔐</Text>
              <Text style={styles.headerTitle}>Access Restricted</Text>
            </View>
          </LinearGradient>
          <View style={[styles.content, { justifyContent: "center" }]}>
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>⚠️</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Only admins can change password</Text>
                <Text style={styles.infoText}>Please contact the admin if you need help with your account.</Text>
              </View>
            </View>
          </View>
        </View>
      </>
    )
  }

  const validateForm = () => {
    if (!currentPassword.trim()) {
      Alert.alert("Error", "Please enter your current password")
      return false
    }
    if (!newPassword.trim()) {
      Alert.alert("Error", "Please enter a new password")
      return false
    }
    if (!confirmPassword.trim()) {
      Alert.alert("Error", "Please confirm your new password")
      return false
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters")
      return false
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match")
      return false
    }
    if (currentPassword === newPassword) {
      Alert.alert("Error", "New password must be different from current password")
      return false
    }
    return true
  }

  const handleChangePassword = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)

      const user = await getUserByCredentials(userInfo.username, currentPassword)

      if (!user || user.role !== "admin") {
        Alert.alert("Error", "Current password is incorrect")
        setLoading(false)
        return
      }

      await updateUserPassword(user.id, newPassword)

      Alert.alert("Success", "Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      if (onPasswordChanged) {
        onPasswordChanged()
      }
    } catch (error) {
      console.error("Error changing password:", error)
      Alert.alert("Error", "Failed to change password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <StatusBar style="auto" />
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={["#667eea", "#764ba2", "#f093fb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerIcon}>🔐</Text>
            <Text style={styles.headerTitle}>Change Password</Text>
          </View>
        </LinearGradient>

        {/* Form Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter current password"
                  placeholderTextColor="#b8b8d1"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  editable={!loading}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)} style={styles.eyeButton}>
                  <Text style={styles.eyeIcon}>{showCurrentPassword ? "👁️" : "👁️‍🗨️"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password (min 6 characters)"
                  placeholderTextColor="#b8b8d1"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  editable={!loading}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeButton}>
                  <Text style={styles.eyeIcon}>{showNewPassword ? "👁️" : "👁️‍🗨️"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor="#b8b8d1"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                  <Text style={styles.eyeIcon}>{showConfirmPassword ? "👁️" : "👁️‍🗨️"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Security Info */}
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Password Requirements</Text>
                <Text style={styles.infoText}>• Minimum 6 characters</Text>
                <Text style={styles.infoText}>• Must be different from current password</Text>
              </View>
            </View>

            {/* Change Button */}
            <LinearGradient
              colors={["#667eea", "#764ba2", "#f093fb"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButton}
            >
              <TouchableOpacity onPress={handleChangePassword} disabled={loading} style={styles.submitButtonInner}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>🔄 Change Password</Text>
                )}
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
    paddingBottom: 24,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  backButton: {
    position: "absolute",
    left: 24,
    top: 60,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  backButtonText: {
    color: "#667eea",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  formContainer: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2d2d44",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(102, 126, 234, 0.4)",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  eyeIcon: {
    fontSize: 20,
  },
  infoBox: {
    backgroundColor: "#2d2d44",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.3)",
  },
  infoIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  infoText: {
    fontSize: 14,
    color: "#b8b8d1",
    marginBottom: 4,
    fontWeight: "500",
  },
  submitButton: {
    borderRadius: 16,
    marginTop: 12,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonInner: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
})
