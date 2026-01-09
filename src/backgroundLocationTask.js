import * as TaskManager from "expo-task-manager"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { ref, set } from "firebase/database"
import { db } from "../firebase"

export const BACKGROUND_LOCATION_TASK = "family-tracker-background-location"

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  try {
    if (error) {
      console.error("Background location task error:", error)
      return
    }

    if (!data) return
    const { locations } = data
    const location = locations && locations[0]
    if (!location) return

    const memberId = await AsyncStorage.getItem("memberId")
    const groupId = await AsyncStorage.getItem("groupId")
    const username = await AsyncStorage.getItem("username")

    if (!memberId || !groupId) {
      return
    }

    const locationData = {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      accuracy: location.coords.accuracy || 0,
      timestamp: Date.now(),
    }

    await set(ref(db, `groups/${groupId}/locations/${memberId}`), {
      ...locationData,
      name: username || "Member",
    })
  } catch (e) {
    console.error("Background location task exception:", e)
  }
})
