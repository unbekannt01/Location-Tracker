// src/services/CameraMonitorService.js
import { ref, onValue, update } from "firebase/database";
import { db } from "../../firebase";
import CameraService from "./CameraService";
import AsyncStorage from "@react-native-async-storage/async-storage";

class CameraMonitorService {
  constructor() {
    this.unsubscribe = null;
    this.isMonitoring = false;
  }

  async startMonitoring() {
    try {
      const memberId = await AsyncStorage.getItem("memberId");
      const groupId = await AsyncStorage.getItem("groupId");

      if (!memberId || !groupId) {
        console.log("[CameraMonitor] Member info not found");
        return;
      }

      this.isMonitoring = true;
      console.log("[CameraMonitor] Starting monitoring for:", memberId);

      // Listen for camera commands from admin
      const commandRef = ref(db, `camera_commands/${groupId}/${memberId}`);

      this.unsubscribe = onValue(commandRef, async (snapshot) => {
        if (!snapshot.exists()) return;

        const command = snapshot.val();
        console.log("[CameraMonitor] Command received:", command);

        // Check if command is new and not processed
        if (command.status === "pending") {
          await this.handleCameraCommand(command, memberId, groupId);
        }
      });

      console.log("[CameraMonitor] Camera monitoring started");
    } catch (error) {
      console.error("[CameraMonitor] Error starting monitor:", error);
    }
  }

  async handleCameraCommand(command, memberId, groupId) {
    try {
      console.log("[CameraMonitor] Processing camera command:", command.type);

      // ✅ ADD THIS CHECK
      if (!CameraService.cameraRef) {
        console.error("[CameraMonitor] Camera not ready yet");
        throw new Error("Camera not initialized");
      }

      let result = null;

      if (command.type === "photo") {
        result = await CameraService.capturePhoto(memberId, groupId);
      } else if (command.type === "video") {
        result = await CameraService.captureVideo(
          memberId,
          groupId,
          command.duration || 5000,
        );
      }

      // Update command status
      const commandRef = ref(db, `camera_commands/${groupId}/${memberId}`);
      await update(commandRef, {
        status: "completed",
        result: result || { error: "Failed to capture" },
        completedAt: Date.now(),
      });

      console.log("[CameraMonitor] Camera command completed");
    } catch (error) {
      console.error("[CameraMonitor] Error handling command:", error);

      // Update status to failed
      const commandRef = ref(db, `camera_commands/${groupId}/${memberId}`);
      await update(commandRef, {
        status: "failed",
        error: error.message,
        completedAt: Date.now(),
      });
    }
  }

  stopMonitoring() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.isMonitoring = false;
    console.log("[CameraMonitor] Camera monitoring stopped");
  }
}

export default new CameraMonitorService();
