import { db } from "../firebase"
import { ref, set, get, push, remove, onValue } from "firebase/database"

// Groups
export const getAllGroups = async () => {
  try {
    const snapshot = await get(ref(db, "groups"))
    return snapshot.val()
  } catch (error) {
    console.error("Error getting groups:", error)
    throw error
  }
}

export const getGroup = async (groupId) => {
  try {
    const snapshot = await get(ref(db, `groups/${groupId}`))
    return snapshot.val()
  } catch (error) {
    console.error("Error getting group:", error)
    throw error
  }
}

export const setGroup = async (groupId, groupData) => {
  try {
    await set(ref(db, `groups/${groupId}`), groupData)
  } catch (error) {
    console.error("Error setting group:", error)
    throw error
  }
}

export const deleteGroup = async (groupId) => {
  try {
    await remove(ref(db, `groups/${groupId}`))
  } catch (error) {
    console.error("Error deleting group:", error)
    throw error
  }
}

export const onGroupsChange = (callback) => {
  const unsubscribe = onValue(ref(db, "groups"), (snapshot) => {
    callback(snapshot.val())
  })
  return unsubscribe
}

// Members
export const getGroupMembers = async (groupId) => {
  try {
    const snapshot = await get(ref(db, `groups/${groupId}/members`))
    return snapshot.val()
  } catch (error) {
    console.error("Error getting members:", error)
    throw error
  }
}

export const addGroupMember = async (groupId, memberId, memberData) => {
  try {
    await set(ref(db, `groups/${groupId}/members/${memberId}`), memberData)
  } catch (error) {
    console.error("Error adding member:", error)
    throw error
  }
}

export const deleteMember = async (groupId, memberId) => {
  try {
    await remove(ref(db, `groups/${groupId}/members/${memberId}`))
  } catch (error) {
    console.error("Error deleting member:", error)
    throw error
  }
}

export const onGroupMembersChange = (groupId, callback) => {
  const unsubscribe = onValue(ref(db, `groups/${groupId}/members`), (snapshot) => {
    callback(snapshot.val())
  })
  return unsubscribe
}

// Users
export const addUser = async (userId, userData) => {
  try {
    await set(ref(db, `users/${userId}`), userData)
  } catch (error) {
    console.error("Error adding user:", error)
    throw error
  }
}

export const getUserByCredentials = async (username, password) => {
  try {
    const snapshot = await get(ref(db, "users"))
    const users = snapshot.val()
    if (users) {
      const entry = Object.entries(users).find(
        ([id, u]) => u.username === username && u.password === password,
      )
      if (!entry) return null
      const [id, user] = entry
      return { ...user, id }
    }
    return null
  } catch (error) {
    console.error("Error getting user:", error)
    throw error
  }
}

export const deleteUser = async (userId) => {
  try {
    await remove(ref(db, `users/${userId}`))
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}

export const updateUserPassword = async (userId, newPassword) => {
  try {
    await set(ref(db, `users/${userId}/password`), newPassword)
  } catch (error) {
    console.error("Error updating password:", error)
    throw error
  }
}

// Locations
export const getGroupLocations = async (groupId) => {
  try {
    const snapshot = await get(ref(db, `locations/${groupId}`))
    return snapshot.val()
  } catch (error) {
    console.error("Error getting locations:", error)
    throw error
  }
}

export const setLocation = async (groupId, memberId, locationData) => {
  try {
    await set(ref(db, `locations/${groupId}/${memberId}`), locationData)
  } catch (error) {
    console.error("Error setting location:", error)
    throw error
  }
}

export const deleteLocation = async (groupId, memberId) => {
  try {
    await remove(ref(db, `locations/${groupId}/${memberId}`))
  } catch (error) {
    console.error("Error deleting location:", error)
    throw error
  }
}

export const onGroupLocationsChange = (groupId, callback) => {
  const unsubscribe = onValue(ref(db, `locations/${groupId}`), (snapshot) => {
    callback(snapshot.val())
  })
  return unsubscribe
}

// Push data helper
export const pushData = async (path) => {
  try {
    const newRef = push(ref(db, path))
    return { key: newRef.key }
  } catch (error) {
    console.error("Error pushing data:", error)
    throw error
  }
}
