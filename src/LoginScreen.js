"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { StatusBar } from "expo-status-bar"
import { LinearGradient } from "expo-linear-gradient"

export default function LoginScreen({ onLogin }) {
  const [loginType, setLoginType] = useState("admin") // 'admin' or 'member'
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter username and password")
      return
    }

    setLoading(true)

    if (loginType === "admin") {
      setTimeout(() => {
        setLoading(false)
        // Pass credentials to App.js for database validation
        onLogin({ type: "admin", username: username.trim(), password: password })
      }, 500)
    } else {
      // Member login - will be validated against Firebase
      setTimeout(() => {
        setLoading(false)
        onLogin({
          type: "member",
          username: username.trim(),
          password: password,
        })
      }, 500)
    }
  }

  return (
    <>
      <StatusBar style="auto" />
      <LinearGradient
        colors={["#1a1a2e", "#2d2d44", "#3a3a5c"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.emoji}>🔐</Text>
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to track locations</Text>
          </View>

          {/* Login Type Tabs */}
          <View style={styles.tabContainer}>
            {["admin", "member"].map((type) => {
              const isActive = loginType === type

              return (
                <TouchableOpacity
                  key={type}
                  style={styles.tab}
                  onPress={() => {
                    setLoginType(type)
                    setUsername("")
                    setPassword("")
                  }}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={
                      isActive
                        ? type === "admin"
                          ? ["#667eea", "#764ba2"]
                          : ["#f093fb", "#f5576c"]
                        : ["transparent", "transparent"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.tabGradient}
                  >
                    <Text style={isActive ? styles.tabTextActive : styles.tabText}>
                      {type === "admin" ? "Admin" : "Member"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#b8b8d1"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#b8b8d1"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {loginType === "member" && (
              <Text style={styles.helperText}>
                Member credentials (username & password) aapko sirf admin provide karega.
              </Text>
            )}

            <LinearGradient
              colors={["#667eea", "#764ba2", "#f093fb"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            >
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.9}
                style={styles.loginButtonInner}
              >
                <Text style={styles.loginButtonText}>{loading ? "Logging in..." : "🚀 Login"}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </LinearGradient>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(102, 126, 234, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "rgba(102, 126, 234, 0.4)",
  },
  emoji: {
    fontSize: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 10,
    letterSpacing: 1,
    textShadowColor: "rgba(102, 126, 234, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#b8b8d1",
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(45, 45, 68, 0.9)",
    borderRadius: 16,
    padding: 6,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.3)",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
  },
  tabActive: {
    // Gradient will be applied via LinearGradient component
  },
  tabGradient: {
    width: "100%",
    height: 52,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#b8b8d1",
  },
  tabTextActive: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: "rgba(45, 45, 68, 0.9)",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: "rgba(102, 126, 234, 0.4)",
    color: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  helperText: {
    fontSize: 13,
    color: "#b8b8d1",
    marginTop: -8,
    marginBottom: 8,
    fontStyle: "italic",
  },
  loginButton: {
    borderRadius: 16,
    marginTop: 12,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonInner: {
    paddingVertical: 18,
    alignItems: "center",
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
})
