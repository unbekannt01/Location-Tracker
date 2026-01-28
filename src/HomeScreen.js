import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native"
import { StatusBar } from "expo-status-bar"
import { LinearGradient } from "expo-linear-gradient"

export default function HomeScreen({
  onStartTracking,
  onManageMembers,
  onAdminLocationTracking,
  onCameraControl,
  onLogout,
  onChangePassword,
  userRole,
  userInfo,
  groupId,
}) {
  return (
    <>
      <StatusBar style="auto" />
      <View style={styles.container}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={["#667eea", "#764ba2", "#f093fb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <Text style={styles.headerIcon}>📍</Text>
            </View>
            <Text style={styles.headerTitle}>Location Tracker</Text>
            <Text style={styles.headerSubtitle}>{userRole === "admin" ? "Admin Dashboard" : "Member Dashboard"}</Text>
          </View>
          <View style={styles.headerButtons}>
            {userRole === "admin" && (
              <TouchableOpacity style={styles.passwordButton} onPress={onChangePassword} activeOpacity={0.8}>
                <Text style={styles.passwordButtonText}>🔐</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.8}>
              <Text style={styles.logoutButtonText}>🚪</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Main Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {userRole === "member" && groupId && (
            <View style={styles.memberGroupInfo}>
              <Text style={styles.memberGroupTitle}>Your Group</Text>
              <Text style={styles.memberGroupName}>{groupId}</Text>
              <Text style={styles.memberGroupSubtitle}>
                Ask your admin for details and credentials of other members in this group.
              </Text>
            </View>
          )}
          
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <TouchableOpacity style={styles.actionCard} onPress={onStartTracking} activeOpacity={0.9}>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionIconGradient}
              >
                <Text style={styles.actionEmoji}>🚀</Text>
              </LinearGradient>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Start Location Tracking</Text>
                <Text style={styles.actionDescription}>Track your current location in real-time</Text>
              </View>
              <View style={styles.arrowContainer}>
                <Text style={styles.actionArrow}>→</Text>
              </View>
            </TouchableOpacity>

            {userRole === "admin" && (
              <>
                <TouchableOpacity style={styles.actionCard} onPress={onManageMembers} activeOpacity={0.9}>
                  <LinearGradient
                    colors={["#f093fb", "#f5576c"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionIconGradient}
                  >
                    <Text style={styles.actionEmoji}>👥</Text>
                  </LinearGradient>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>Manage Members</Text>
                    <Text style={styles.actionDescription}>Create groups and add members</Text>
                  </View>
                  <View style={styles.arrowContainer}>
                    <Text style={styles.actionArrow}>→</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} onPress={onAdminLocationTracking} activeOpacity={0.9}>
                  <LinearGradient
                    colors={["#4facfe", "#00f2fe"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionIconGradient}
                  >
                    <Text style={styles.actionEmoji}>📍</Text>
                  </LinearGradient>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>Track Members</Text>
                    <Text style={styles.actionDescription}>View member locations (live or last known)</Text>
                  </View>
                  <View style={styles.arrowContainer}>
                    <Text style={styles.actionArrow}>→</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} onPress={onCameraControl} activeOpacity={0.9}>
                  <LinearGradient
                    colors={["#43e97b", "#38f9d7"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionIconGradient}
                  >
                    <Text style={styles.actionEmoji}>📸</Text>
                  </LinearGradient>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>Camera Control</Text>
                    <Text style={styles.actionDescription}>Capture photos/videos from members</Text>
                  </View>
                  <View style={styles.arrowContainer}>
                    <Text style={styles.actionArrow}>→</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Features Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>

            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}>📍</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Real-time Tracking</Text>
                <Text style={styles.featureDescription}>Live location updates</Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}>👥</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Group Management</Text>
                <Text style={styles.featureDescription}>
                  {userRole === "admin" ? "Create groups and manage members" : "View your group members"}
                </Text>
              </View>
            </View>

            {userRole === "admin" && (
              <View style={styles.featureCard}>
                <Text style={styles.featureEmoji}>📸</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Remote Camera Access</Text>
                  <Text style={styles.featureDescription}>Monitor members with photo/video capture</Text>
                </View>
              </View>
            )}

            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}>📊</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Location History</Text>
                <Text style={styles.featureDescription}>View past location records</Text>
              </View>
            </View>
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
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerContent: {
    alignItems: "center",
    flex: 1,
  },
  headerIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  headerIcon: {
    fontSize: 36,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  passwordButton: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  passwordButtonText: {
    fontSize: 24,
  },
  logoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  logoutButtonText: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 8,
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  memberGroupInfo: {
    backgroundColor: "#2d2d44",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.3)",
  },
  memberGroupTitle: {
    fontSize: 14,
    color: "#b8b8d1",
    marginBottom: 4,
    fontWeight: "600",
  },
  memberGroupName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
  },
  memberGroupSubtitle: {
    fontSize: 13,
    color: "#b8b8d1",
    fontWeight: "500",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 20,
    letterSpacing: 0.5,
    textShadowColor: "rgba(102, 126, 234, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  actionCard: {
    backgroundColor: "#2d2d44",
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.3)",
  },
  actionIconGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  actionEmoji: {
    fontSize: 36,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  actionDescription: {
    fontSize: 14,
    color: "#b8b8d1",
    lineHeight: 20,
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
  actionArrow: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  featureCard: {
    backgroundColor: "#2d2d44",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.25)",
  },
  featureEmoji: {
    fontSize: 40,
    marginRight: 20,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  featureDescription: {
    fontSize: 14,
    color: "#b8b8d1",
    lineHeight: 20,
    fontWeight: "500",
  },
})