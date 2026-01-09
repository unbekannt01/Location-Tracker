"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native"
import { StatusBar } from "expo-status-bar"
import { LinearGradient } from "expo-linear-gradient"
import {
  getGroup,
  onGroupMembersChange,
  deleteMember,
  deleteUser,
  deleteLocation,
  deleteGroup,
} from "../firebaseHelpers"

export default function MembersListScreen({ groupId, onAddMember, onBack, onGroupDeleted }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [groupName, setGroupName] = useState("")
  const [deletingMemberId, setDeletingMemberId] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const group = await getGroup(groupId)
        if (group) {
          setGroupName(group.name)
        }

        const unsubscribe = onGroupMembersChange(groupId, (membersData) => {
          if (membersData) {
            const membersList = Object.values(membersData)
            setMembers(membersList)
          } else {
            setMembers([])
          }
          setLoading(false)
        })

        return unsubscribe
      } catch (error) {
        console.error("Error fetching members:", error)
        setLoading(false)
      }
    }

    let unsubscribe
    if (groupId) {
      fetchData().then((unsub) => {
        unsubscribe = unsub
      })
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [groupId])

  const handleViewCredentials = (member) => {
    Alert.alert(
      "Member Credentials",
      `Email: ${member.email}\n\nUsername: ${member.username}\nPassword: ${member.password}`,
      [{ text: "OK" }],
    )
  }

  const handleDeleteMember = (member) => {
    Alert.alert("Delete Member", `Are you sure you want to delete ${member.email}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setDeletingMemberId(member.id)

            await deleteMember(groupId, member.id)
            await deleteUser(member.id)
            await deleteLocation(groupId, member.id)

            Alert.alert("Success", "Member deleted successfully")
          } catch (error) {
            console.error("Error deleting member:", error)
            Alert.alert("Error", "Failed to delete member")
          } finally {
            setDeletingMemberId(null)
          }
        },
      },
    ])
  }

  const handleDeleteGroup = () => {
    Alert.alert(
      "Delete Group",
      `Are you sure you want to delete "${groupName}"?\n\nThis will delete all members and their data.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true)

              if (members.length > 0) {
                const deletePromises = members.map((member) => deleteUser(member.id))
                await Promise.all(deletePromises)
              }

              await deleteGroup(groupId)

              Alert.alert("Success", "Group deleted successfully", [
                {
                  text: "OK",
                  onPress: () => {
                    if (onGroupDeleted) {
                      onGroupDeleted()
                    } else {
                      onBack()
                    }
                  },
                },
              ])
            } catch (error) {
              console.error("Error deleting group:", error)
              Alert.alert("Error", "Failed to delete group")
              setLoading(false)
            }
          },
        },
      ],
    )
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
          <Text style={styles.headerTitle}>Members</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.groupInfo}>
            <View style={styles.groupInfoTop}>
              <View style={styles.groupInfoLeft}>
                <Text style={styles.groupName}>{groupName}</Text>
                <Text style={styles.memberCount}>{members.length} Members</Text>
              </View>
              <TouchableOpacity style={styles.deleteGroupButton} onPress={handleDeleteGroup}>
                <Text style={styles.deleteGroupButtonText}>🗑️ Delete Group</Text>
              </TouchableOpacity>
            </View>
          </View>

          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButton}
          >
            <TouchableOpacity onPress={onAddMember} activeOpacity={0.9}>
              <Text style={styles.addButtonText}>+ Add Member</Text>
            </TouchableOpacity>
          </LinearGradient>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : members.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No members yet</Text>
              <Text style={styles.emptySubtext}>Add your first member to get started</Text>
            </View>
          ) : (
            <ScrollView style={styles.membersList}>
              {members.map((member) => (
                <View key={member.id} style={styles.memberCard}>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                    <Text style={styles.memberUsername}>@{member.username}</Text>
                  </View>
                  <View style={styles.memberActions}>
                    <TouchableOpacity style={styles.viewButton} onPress={() => handleViewCredentials(member)}>
                      <Text style={styles.viewButtonText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.deleteButton, deletingMemberId === member.id && styles.deleteButtonDisabled]}
                      onPress={() => handleDeleteMember(member)}
                      disabled={deletingMemberId === member.id}
                    >
                      {deletingMemberId === member.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
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
  groupInfoTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groupInfoLeft: {
    flex: 1,
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
  deleteGroupButton: {
    backgroundColor: "#ea4335",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: "#ea4335",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteGroupButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  addButton: {
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
  addButtonText: {
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
  membersList: {
    flex: 1,
  },
  memberCard: {
    backgroundColor: "#2d2d44",
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.3)",
  },
  memberInfo: {
    flex: 1,
    marginRight: 14,
  },
  memberEmail: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  memberUsername: {
    fontSize: 14,
    color: "#b8b8d1",
    fontWeight: "500",
  },
  memberActions: {
    flexDirection: "row",
    gap: 10,
  },
  viewButton: {
    backgroundColor: "#e8f0fe",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d2e3fc",
  },
  viewButtonText: {
    color: "#1a73e8",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  deleteButton: {
    backgroundColor: "#ea4335",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: "#ea4335",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
})
