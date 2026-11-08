
import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Keyboard,
  Modal,
  ActivityIndicator,
  AppState,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

import {
  useFonts,
  Prompt_400Regular,
  Prompt_500Medium,
  Prompt_600SemiBold,
  Prompt_700Bold,
} from "@expo-google-fonts/prompt";

// ==========================================
// 1. SUPABASE
// ==========================================

const SUPABASE_URL =
  "https://pucjhtjurpkjixyfvoja.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_ZL18oSqMSSYZF9Lcqz--Gw_TG9f07Zr";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// ==========================================
// 2. COLORS
// ==========================================

const C = {
  pink: "#F4778B",
  pinkDark: "#E85F79",
  pinkLight: "#FFE5EB",
  pinkBg: "#FFF3F6",
  white: "#FFFFFF",
  text: "#57283D",
  muted: "#A47E8B",
  border: "#F4D9E1",
  green: "#279B65",
  greenLight: "#E8F7EF",
};

// ==========================================
// 3. REUSABLE COMPONENTS
// ==========================================

function Button({
  title,
  onPress,
  outline = false,
  style,
  disabled = false,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      style={[
        s.button,
        outline && s.buttonOutline,
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <Text
        style={[
          s.buttonText,
          outline && s.buttonOutlineText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
}) {
  return (
    <View style={s.field}>
      {!!label && <Text style={s.label}>{label}</Text>}

      <TextInput
        style={s.input}
        placeholder={placeholder}
        placeholderTextColor="#B99AA4"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={
          keyboardType === "email-address"
            ? "none"
            : secureTextEntry
            ? "none"
            : "sentences"
        }
        autoCorrect={false}
      />
    </View>
  );
}

function Brand() {
  return (
    <View style={s.brand}>
      <Text style={s.brandName}>TripBuddies</Text>
      <Text style={s.brandTagline}>
        Travel together, closer forever ♡
      </Text>
    </View>
  );
}

function Duck({ style }) {
  return (
    <Image
      source={require("./assets/Duck.png")}
      style={style}
      resizeMode="contain"
    />
  );
}

function BackHeader({ onPress, title = "" }) {
  return (
    <View style={s.header}>
      <TouchableOpacity
        onPress={onPress}
        style={s.backButton}
      >
        <Text style={s.backText}>‹</Text>
      </TouchableOpacity>

      <Text style={s.headerTitle}>{title}</Text>

      <View style={{ width: 40 }} />
    </View>
  );
}

// ==========================================
// 4. MAIN APP
// ==========================================

export default function App() {
  const [fontsLoaded] = useFonts({
    Prompt_400Regular,
    Prompt_500Medium,
    Prompt_600SemiBold,
    Prompt_700Bold,
  });

  // ----------------------------------------
  // SCREEN
  // ----------------------------------------

  const [screen, setScreen] = useState("landing");
  const [tab, setTab] = useState("home");

  // ----------------------------------------
  // USER
  // ----------------------------------------

  const [userId, setUserId] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState("บาท (THB)");

  // ----------------------------------------
  // APPLICATION
  // ----------------------------------------

  const [busy, setBusy] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // ----------------------------------------
  // GROUPS
  // ----------------------------------------

  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [members, setMembers] = useState([]);

  const [groupName, setGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [memberEmail, setMemberEmail] = useState("");

  const [groupModal, setGroupModal] = useState(false);
  const [groupActionBusy, setGroupActionBusy] = useState(false);

  // ----------------------------------------
  // TRIPS
  // ----------------------------------------

  const [trips, setTrips] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  const [tripModal, setTripModal] = useState(false);
  const [tripTitle, setTripTitle] = useState("");
  const [tripDestination, setTripDestination] = useState("");
  const [tripBudget, setTripBudget] = useState("");

  // ========================================
  // 5. CHECK SUPABASE
  // ========================================

  const checkSupabase = () => {
    if (
      !SUPABASE_URL.startsWith("https://") ||
      !SUPABASE_PUBLISHABLE_KEY
    ) {
      Alert.alert(
        "Supabase Error",
        "กรุณาตรวจสอบ Supabase URL และ Publishable Key"
      );

      return false;
    }

    return true;
  };

  // ========================================
  // 6. LOAD TRIPS
  // ========================================

  const loadTrips = async (uid, groupId) => {
    if (!uid || !groupId) {
      setTrips([]);
      setTotalBudget(0);
      setTotalSpent(0);
      return;
    }

    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.log("Load trips error:", error.message);

      Alert.alert(
        "โหลดทริปไม่สำเร็จ",
        error.message
      );

      return;
    }

    const tripList = data || [];

    setTrips(tripList);

    const budget = tripList.reduce(
      (sum, trip) =>
        sum + Number(trip.budget || 0),
      0
    );

    setTotalBudget(budget);

    if (tripList.length === 0) {
      setTotalSpent(0);
      return;
    }

    const tripIds = tripList.map(
      (trip) => trip.id
    );

    const { data: expenses, error: expenseError } =
      await supabase
        .from("expenses")
        .select("amount, trip_id")
        .in("trip_id", tripIds);

    if (expenseError) {
      console.log(
        "Load expenses error:",
        expenseError.message
      );

      return;
    }

    const spent = (expenses || []).reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

    setTotalSpent(spent);
  };

  // ========================================
  // 7. LOAD GROUPS
  // ========================================

  const loadGroups = async (uid) => {
    if (!uid) return [];

    const { data: memberships, error } =
      await supabase
        .from("group_members")
        .select("group_id, role")
        .eq("user_id", uid);

    if (error) {
      console.log(
        "Load memberships error:",
        error.message
      );

      Alert.alert(
        "โหลดกลุ่มไม่สำเร็จ",
        error.message
      );

      return [];
    }

    const groupIds = (memberships || []).map(
      (item) => item.group_id
    );

    if (groupIds.length === 0) {
      setGroups([]);
      setActiveGroup(null);
      setMembers([]);
      setTrips([]);
      setTotalBudget(0);
      setTotalSpent(0);

      return [];
    }

    const { data: groupData, error: groupError } =
      await supabase
        .from("groups")
        .select("*")
        .in("id", groupIds)
        .order("created_at", {
          ascending: false,
        });

    if (groupError) {
      console.log(
        "Load groups error:",
        groupError.message
      );

      Alert.alert(
        "โหลดข้อมูลกลุ่มไม่สำเร็จ",
        groupError.message
      );

      return [];
    }

    const result = (groupData || []).map(
      (group) => ({
        ...group,
        role:
          memberships.find(
            (m) => m.group_id === group.id
          )?.role || "member",
      })
    );

    setGroups(result);

    return result;
  };

  // ========================================
  // 8. LOAD MEMBERS
  // ========================================

  const loadMembers = async (groupId) => {
    if (!groupId) {
      setMembers([]);
      return;
    }

    const { data, error } = await supabase
      .from("group_members")
      .select("user_id, role, joined_at")
      .eq("group_id", groupId);

    if (error) {
      Alert.alert(
        "โหลดสมาชิกไม่สำเร็จ",
        error.message
      );

      return;
    }

    const userIds = (data || []).map(
      (item) => item.user_id
    );

    if (userIds.length === 0) {
      setMembers([]);
      return;
    }

    const { data: profiles, error: profileError } =
      await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", userIds);

    if (profileError) {
      console.log(
        "Load member profiles error:",
        profileError.message
      );
    }

    const result = (data || []).map(
      (member) => ({
        ...member,
        profile: (profiles || []).find(
          (p) => p.id === member.user_id
        ),
      })
    );

    setMembers(result);
  };

  // ========================================
  // 9. SELECT GROUP
  // ========================================

  const selectGroup = async (group) => {
    if (!group) return;

    setActiveGroup(group);

    await loadMembers(group.id);
    await loadTrips(userId, group.id);
  };

  // ========================================
  // 10. CREATE GROUP
  // ========================================

  const createGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert(
        "ข้อมูลไม่ครบ",
        "กรุณากรอกชื่อกลุ่ม"
      );

      return;
    }

    setGroupActionBusy(true);

    try {
      const { data, error } = await supabase.rpc(
        "create_group",
        {
          p_name: groupName.trim(),
        }
      );

      if (error) throw error;

      const loadedGroups = await loadGroups(userId);

      const newGroup = loadedGroups.find(
        (group) => group.id === data
      );

      if (newGroup) {
        await selectGroup(newGroup);
      }

      setGroupName("");
      setGroupModal(false);

      Alert.alert(
        "สำเร็จ!",
        "สร้างกลุ่มเรียบร้อยแล้ว"
      );
    } catch (error) {
      Alert.alert(
        "สร้างกลุ่มไม่สำเร็จ",
        error.message
      );
    } finally {
      setGroupActionBusy(false);
    }
  };

  // ========================================
  // 11. JOIN GROUP
  // ========================================

  const joinGroup = async () => {
    if (!joinCode.trim()) {
      Alert.alert(
        "ข้อมูลไม่ครบ",
        "กรุณากรอกรหัสเชิญ"
      );

      return;
    }

    setGroupActionBusy(true);

    try {
      const { data, error } = await supabase.rpc(
        "join_group_by_code",
        {
          p_invite_code: joinCode.trim(),
        }
      );

      if (error) throw error;

      const loadedGroups = await loadGroups(userId);

      const joinedGroup = loadedGroups.find(
        (group) => group.id === data
      );

      if (joinedGroup) {
        await selectGroup(joinedGroup);
      }

      setJoinCode("");

      Alert.alert(
        "สำเร็จ!",
        "เข้าร่วมกลุ่มเรียบร้อยแล้ว"
      );
    } catch (error) {
      Alert.alert(
        "เข้าร่วมกลุ่มไม่สำเร็จ",
        error.message
      );
    } finally {
      setGroupActionBusy(false);
    }
  };

  // ========================================
  // 12. ADD MEMBER BY EMAIL
  // ========================================

  const addMember = async () => {
    if (!activeGroup) {
      Alert.alert(
        "ยังไม่ได้เลือกกลุ่ม",
        "กรุณาเลือกกลุ่มก่อน"
      );

      return;
    }

    if (!memberEmail.trim()) {
      Alert.alert(
        "ข้อมูลไม่ครบ",
        "กรุณากรอกอีเมลสมาชิก"
      );

      return;
    }

    setGroupActionBusy(true);

    try {
      const { error } = await supabase.rpc(
        "add_group_member_by_email",
        {
          p_group_id: activeGroup.id,
          p_email: memberEmail.trim(),
        }
      );

      if (error) throw error;

      setMemberEmail("");

      await loadMembers(activeGroup.id);

      Alert.alert(
        "สำเร็จ!",
        "เพิ่มสมาชิกเรียบร้อยแล้ว"
      );
    } catch (error) {
      Alert.alert(
        "เพิ่มสมาชิกไม่สำเร็จ",
        error.message
      );
    } finally {
      setGroupActionBusy(false);
    }
  };

  // ========================================
  // 13. LOAD USER DATA
  // ========================================

  const loadUserData = async (user) => {
    setUserId(user.id);
    setEmail(user.email || "");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.log(
        "Profile loading error:",
        error.message
      );
    }

    setName(
      data?.full_name ||
      user.user_metadata?.full_name ||
      ""
    );

    setPhone(data?.phone || "");

    setCurrency(
      data?.currency === "USD"
        ? "ดอลลาร์ (USD)"
        : "บาท (THB)"
    );

    const loadedGroups = await loadGroups(user.id);

    if (loadedGroups.length > 0) {
      const firstGroup = loadedGroups[0];

      setActiveGroup(firstGroup);

      await loadMembers(firstGroup.id);
      await loadTrips(user.id, firstGroup.id);
    } else {
      setActiveGroup(null);
      setMembers([]);
      setTrips([]);
      setTotalBudget(0);
      setTotalSpent(0);
    }

    setTab("home");
    setScreen("home");
  };

  // ========================================
  // 14. RESTORE SESSION
  // ========================================

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const { data, error } =
          await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.log(
            "Restore session error:",
            error.message
          );
        }

        if (data.session?.user) {
          await loadUserData(data.session.user);

          if (!mounted) return;
        }
      } catch (error) {
        console.log(
          "Session error:",
          error.message
        );
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_OUT" && mounted) {
          setUserId(null);
          setName("");
          setEmail("");
          setPassword("");
          setConfirm("");
          setPhone("");

          setGroups([]);
          setActiveGroup(null);
          setMembers([]);

          setTrips([]);
          setTotalBudget(0);
          setTotalSpent(0);

          setTab("home");
          setScreen("welcome");
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ========================================
  // 15. AUTO REFRESH TOKEN
  // ========================================

  useEffect(() => {
    if (Platform.OS === "web") return;

    const subscription = AppState.addEventListener(
      "change",
      (state) => {
        if (state === "active") {
          supabase.auth.startAutoRefresh();
        } else {
          supabase.auth.stopAutoRefresh();
        }
      }
    );

    return () => subscription.remove();
  }, []);

  // ========================================
  // 16. NAVIGATION
  // ========================================

  const goHome = () => {
    Keyboard.dismiss();

    setTab("home");
    setScreen("home");
  };

  const goBack = () => {
    Keyboard.dismiss();

    if (screen === "register") {
      setScreen("welcome");
    } else {
      setScreen("landing");
    }
  };

  const nav = (next) => {
    Keyboard.dismiss();

    setTab(next);
    setScreen(next);
  };

  // ========================================
  // 17. LOGIN
  // ========================================

  const login = async () => {
    if (!checkSupabase()) return;

    if (!email.trim() || !password) {
      Alert.alert(
        "ข้อมูลไม่ครบ",
        "กรุณากรอกอีเมลและรหัสผ่าน"
      );

      return;
    }

    Keyboard.dismiss();
    setBusy(true);

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) throw error;

      if (!data.user) {
        throw new Error("ไม่พบข้อมูลผู้ใช้");
      }

      await loadUserData(data.user);
    } catch (error) {
      Alert.alert(
        "เข้าสู่ระบบไม่สำเร็จ",
        error.message
      );
    } finally {
      setBusy(false);
    }
  };

  // ========================================
  // 18. REGISTER
  // ========================================

  const register = async () => {
    if (!checkSupabase()) return;

    Keyboard.dismiss();

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirm
    ) {
      Alert.alert(
        "ข้อมูลไม่ครบ",
        "กรุณากรอกข้อมูลให้ครบทุกช่อง"
      );

      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "รหัสผ่านสั้นเกินไป",
        "กรุณาใช้รหัสผ่านอย่างน้อย 6 ตัวอักษร"
      );

      return;
    }

    if (password !== confirm) {
      Alert.alert(
        "รหัสผ่านไม่ตรงกัน",
        "กรุณากรอกรหัสผ่านให้ตรงกัน"
      );

      return;
    }

    setBusy(true);

    try {
      const { data, error } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
              phone: phone.trim(),
              currency: currency.includes("USD")
                ? "USD"
                : "THB",
            },
          },
        });

      if (error) throw error;

      if (data.session && data.user) {
        await loadUserData(data.user);
      } else {
        Alert.alert(
          "สมัครสมาชิกสำเร็จ",
          "กรุณาตรวจสอบอีเมลและกดยืนยันบัญชีก่อนเข้าสู่ระบบ"
        );

        setPassword("");
        setConfirm("");
        setScreen("welcome");
      }
    } catch (error) {
      Alert.alert(
        "สมัครสมาชิกไม่สำเร็จ",
        error.message
      );
    } finally {
      setBusy(false);
    }
  };

  // ========================================
  // 19. LOGOUT
  // ========================================

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert(
        "ออกจากระบบไม่สำเร็จ",
        error.message
      );

      return;
    }

    setScreen("welcome");
    setTab("home");
  };

  // ========================================
  // 20. CREATE TRIP
  // ========================================

  const createTrip = () => {
    if (!userId) {
      Alert.alert(
        "กรุณาเข้าสู่ระบบ",
        "ต้องเข้าสู่ระบบก่อนสร้างทริป"
      );

      return;
    }

    if (!activeGroup) {
      Alert.alert(
        "ต้องสร้างกลุ่มก่อน",
        "กรุณาสร้างกลุ่มหรือเข้าร่วมกลุ่มก่อน จึงจะสามารถสร้างทริปได้",
        [
          {
            text: "ยกเลิก",
            style: "cancel",
          },
          {
            text: "ไปหน้ากลุ่ม",
            onPress: () => nav("groups"),
          },
        ]
      );

      return;
    }

    setTripTitle("");
    setTripDestination("");
    setTripBudget("");

    setTripModal(true);
  };

  // ========================================
  // 21. SAVE TRIP
  // ========================================

  const saveTrip = async () => {
    if (!activeGroup) {
      Alert.alert(
        "ไม่พบกลุ่ม",
        "กรุณาเลือกกลุ่มก่อนสร้างทริป"
      );

      return;
    }

    if (!tripTitle.trim()) {
      Alert.alert(
        "ข้อมูลไม่ครบ",
        "กรุณากรอกชื่อทริป"
      );

      return;
    }

    const budget = Number(
      tripBudget.replace(/,/g, "")
    ) || 0;

    if (budget < 0) {
      Alert.alert(
        "งบประมาณไม่ถูกต้อง",
        "กรุณากรอกจำนวนเงินที่ถูกต้อง"
      );

      return;
    }

    setBusy(true);

    try {
      const { error } = await supabase
        .from("trips")
        .insert({
          title: tripTitle.trim(),
          destination: tripDestination.trim(),
          budget,
          currency: currency.includes("USD")
            ? "USD"
            : "THB",
          created_by: userId,
          group_id: activeGroup.id,
        });

      if (error) throw error;

      setTripModal(false);

      await loadTrips(userId, activeGroup.id);

      Alert.alert(
        "สำเร็จ!",
        "บันทึกทริปลงในกลุ่มเรียบร้อยแล้ว"
      );
    } catch (error) {
      Alert.alert(
        "สร้างทริปไม่สำเร็จ",
        error.message
      );
    } finally {
      setBusy(false);
    }
  };

  // ========================================
  // 22. BOTTOM NAVIGATION
  // ========================================

  const bottomNav = () => (
    <View style={s.bottomNav}>
      {[
        { key: "home", icon: "⌂", label: "Home" },
        { key: "groups", icon: "♧", label: "Groups" },
        { key: "expenses", icon: "◷", label: "Expenses" },
        { key: "profile", icon: "♙", label: "Profile" },
      ].map((item) => (
        <TouchableOpacity
          key={item.key}
          style={s.navItem}
          onPress={() => {
            if (item.key === "expenses") {
              Alert.alert(
                "Expenses",
                "หน้าจัดการค่าใช้จ่ายจะพัฒนาต่อในขั้นตอนถัดไป"
              );
              return;
            }

            nav(item.key);
          }}
        >
          <Text
            style={[
              s.navIcon,
              tab === item.key && s.navActive,
            ]}
          >
            {item.icon}
          </Text>

          <Text
            style={[
              s.navLabel,
              tab === item.key && s.navActive,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // ========================================
  // 23. LOADING
  // ========================================

  if (!fontsLoaded || checkingSession) {
    return (
      <View style={s.loadingScreen}>
        <ActivityIndicator
          size="large"
          color={C.pink}
        />

        <Text style={s.loadingText}>
          กำลังโหลด TripBuddies...
        </Text>
      </View>
    );
  }

  // ========================================
  // 24. LANDING
  // ========================================

  if (screen === "landing") {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" />

        <View style={s.landing}>
          <View style={s.landingTop}>
            <View style={s.decorCircle1} />
            <View style={s.decorCircle2} />

            <Brand />

            <Duck style={s.landingDuck} />

            <Text style={s.landingHeart}>♡</Text>
          </View>

          <View style={s.landingPanel}>
            <View style={s.handle} />

            <Text style={s.landingTitle}>
              ทุกการเดินทาง{"\n"}
              ดีกว่าเมื่อมีเพื่อน
            </Text>

            <Text style={s.landingDesc}>
              วางแผนทริป แชร์ค่าใช้จ่าย{"\n"}
              และสร้างความทรงจำไปด้วยกัน
            </Text>

            <Button
              title="เริ่มต้นใช้งาน"
              onPress={() => setScreen("welcome")}
              style={s.landingButton}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ========================================
  // 25. LOGIN
  // ========================================

  if (screen === "welcome") {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <ScrollView
            contentContainerStyle={s.loginContent}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
          >
            <BackHeader onPress={goBack} />

            <View style={s.loginMascot}>
              <Duck style={s.loginDuck} />
            </View>

            <View style={s.loginHeading}>
              <Text style={s.pageTitle}>
                ยินดีต้อนรับ!
              </Text>

              <Text style={s.subtitle}>
                เข้าสู่ระบบเพื่อเริ่มต้นการเดินทาง
              </Text>
            </View>

            <Input
              label="อีเมล"
              placeholder="กรอกอีเมลของคุณ"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <Input
              label="รหัสผ่าน"
              placeholder="กรอกรหัสผ่าน"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={s.forgot}
              onPress={async () => {
                if (!email.trim()) {
                  Alert.alert(
                    "ลืมรหัสผ่าน",
                    "กรุณากรอกอีเมลก่อน"
                  );
                  return;
                }

                const { error } =
                  await supabase.auth.resetPasswordForEmail(
                    email.trim()
                  );

                if (error) {
                  Alert.alert(
                    "ส่งอีเมลไม่สำเร็จ",
                    error.message
                  );
                } else {
                  Alert.alert(
                    "ส่งอีเมลแล้ว",
                    "กรุณาตรวจสอบอีเมลเพื่อรีเซ็ตรหัสผ่าน"
                  );
                }
              }}
            >
              <Text style={s.link}>
                ลืมรหัสผ่าน?
              </Text>
            </TouchableOpacity>

            <Button
              title={
                busy
                  ? "กำลังเข้าสู่ระบบ..."
                  : "เข้าสู่ระบบ"
              }
              onPress={login}
              disabled={busy}
            />

            <View style={s.orRow}>
              <View style={s.line} />
              <Text style={s.orText}>หรือ</Text>
              <View style={s.line} />
            </View>

            <TouchableOpacity
              style={s.social}
              onPress={() =>
                Alert.alert(
                  "Google Login",
                  "ยังไม่ได้เชื่อมต่อ Google OAuth จริง"
                )
              }
            >
              <Text style={s.google}>G</Text>
              <Text style={s.socialText}>
                Continue with Google
              </Text>
            </TouchableOpacity>

            <View style={s.switchRow}>
              <Text style={s.muted}>
                ยังไม่มีบัญชี?{" "}
              </Text>

              <Text
                style={s.link}
                onPress={() => setScreen("register")}
              >
                สมัครสมาชิก
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ========================================
  // 26. REGISTER
  // ========================================

  if (screen === "register") {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <ScrollView
            contentContainerStyle={s.registerContent}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
          >
            <BackHeader onPress={goBack} />

            <Text style={s.setupTitle}>
              กรอกโปรไฟล์ของคุณ
            </Text>

            <Text style={s.setupSubtitle}>
              มาเริ่มต้นการเดินทางไปด้วยกัน!
            </Text>

            <View style={s.setupAvatarWrap}>
              <View style={s.setupAvatarCircle}>
                <Duck style={s.setupDuck} />
              </View>
            </View>

            <View style={s.setupFormCard}>
              <Input
                label="ชื่อ - นามสกุล"
                placeholder="กรอกชื่อของคุณ"
                value={name}
                onChangeText={setName}
              />

              <Input
                label="เบอร์โทรศัพท์"
                placeholder="0812345678"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <Text style={s.label}>สกุลเงิน</Text>

              <TouchableOpacity
                style={s.currencySelect}
                onPress={() =>
                  setCurrency(
                    currency === "บาท (THB)"
                      ? "ดอลลาร์ (USD)"
                      : "บาท (THB)"
                  )
                }
              >
                <Text style={s.currencyText}>
                  {currency}
                </Text>

                <Text style={s.currencyArrow}>⌄</Text>
              </TouchableOpacity>

              <Input
                label="อีเมล"
                placeholder="example@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />

              <Input
                label="รหัสผ่าน"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Input
                label="ยืนยันรหัสผ่าน"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
              />
            </View>

            <Button
              title={
                busy
                  ? "กำลังสมัครสมาชิก..."
                  : "สมัครสมาชิก"
              }
              onPress={register}
              disabled={busy}
              style={{ marginTop: 15 }}
            />

            <View style={s.switchRow}>
              <Text style={s.muted}>
                มีบัญชีอยู่แล้ว?{" "}
              </Text>

              <Text
                style={s.link}
                onPress={() => setScreen("welcome")}
              >
                เข้าสู่ระบบ
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ========================================
  // 27. GROUPS SCREEN
  // ========================================

  if (screen === "groups") {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" />

        <View style={s.appScreen}>
          <ScrollView
            contentContainerStyle={s.homeContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={s.profileTitle}>
              กลุ่มของฉัน
            </Text>

            <Text style={s.subtitle}>
              สร้างกลุ่มหรือเข้าร่วมกลุ่มกับเพื่อน
            </Text>

            {/* CREATE GROUP */}

            <View style={s.groupActionCard}>
              <Text style={s.groupCardTitle}>
                สร้างกลุ่มใหม่
              </Text>

              <Text style={s.groupCardDesc}>
                สร้างพื้นที่สำหรับวางแผนทริปร่วมกัน
              </Text>

              <Button
                title="+ สร้างกลุ่ม"
                onPress={() => {
                  setGroupName("");
                  setGroupModal(true);
                }}
              />
            </View>

            {/* JOIN GROUP */}

            <View style={s.groupActionCard}>
              <Text style={s.groupCardTitle}>
                เข้าร่วมกลุ่ม
              </Text>

              <Input
                label="รหัสเชิญ"
                placeholder="กรอกรหัสเชิญจากเพื่อน"
                value={joinCode}
                onChangeText={setJoinCode}
              />

              <Button
                title={
                  groupActionBusy
                    ? "กำลังดำเนินการ..."
                    : "เข้าร่วมกลุ่ม"
                }
                outline
                onPress={joinGroup}
                disabled={groupActionBusy}
              />
            </View>

            {/* GROUP LIST */}

            <Text style={s.sectionTitle}>
              กลุ่มที่คุณเป็นสมาชิก
            </Text>

            {groups.length === 0 ? (
              <View style={s.emptyTrip}>
                <Text style={s.emptyTripIcon}>👥</Text>

                <Text style={s.emptyTripTitle}>
                  ยังไม่มีกลุ่ม
                </Text>

                <Text style={s.emptyTripText}>
                  สร้างกลุ่มแรกของคุณ หรือเข้าร่วมด้วยรหัสเชิญ
                </Text>
              </View>
            ) : (
              groups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    s.groupItem,
                    activeGroup?.id === group.id &&
                      s.groupItemActive,
                  ]}
                  onPress={() => selectGroup(group)}
                >
                  <View style={s.groupIcon}>
                    <Text style={{ fontSize: 23 }}>
                      👥
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={s.groupItemName}>
                      {group.name}
                    </Text>

                    <Text style={s.groupItemRole}>
                      {group.role === "owner"
                        ? "เจ้าของกลุ่ม"
                        : group.role === "admin"
                        ? "แอดมิน"
                        : "สมาชิก"}
                    </Text>
                  </View>

                  <Text style={s.groupArrow}>
                    {activeGroup?.id === group.id
                      ? "✓"
                      : "›"}
                  </Text>
                </TouchableOpacity>
              ))
            )}

            {/* ACTIVE GROUP DETAIL */}

            {activeGroup && (
              <View style={s.groupActionCard}>
                <Text style={s.groupCardTitle}>
                  {activeGroup.name}
                </Text>

                <Text style={s.groupCardDesc}>
                  รหัสเชิญ: {activeGroup.invite_code}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      "รหัสเชิญกลุ่ม",
                      activeGroup.invite_code
                    )
                  }
                >
                  <Text style={s.link}>
                    ดูรหัสเชิญ
                  </Text>
                </TouchableOpacity>

                <View style={s.divider} />

                <Text style={s.groupCardTitle}>
                  สมาชิก ({members.length})
                </Text>

                {members.map((member) => (
                  <View
                    key={member.user_id}
                    style={s.memberRow}
                  >
                    <View style={s.memberAvatar}>
                      <Text style={{ color: C.pinkDark }}>
                        ♙
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={s.memberName}>
                        {member.profile?.full_name ||
                          "สมาชิก"}
                      </Text>

                      <Text style={s.groupItemRole}>
                        {member.role === "owner"
                          ? "เจ้าของกลุ่ม"
                          : member.role === "admin"
                          ? "แอดมิน"
                          : "สมาชิก"}
                      </Text>
                    </View>
                  </View>
                ))}

                {(activeGroup.role === "owner" ||
                  activeGroup.role === "admin") && (
                  <>
                    <View style={s.divider} />

                    <Text style={s.groupCardTitle}>
                      เพิ่มสมาชิกด้วยอีเมล
                    </Text>

                    <Text style={s.groupCardDesc}>
                      เพื่อนต้องสมัครบัญชี TripBuddies ก่อน
                    </Text>

                    <Input
                      placeholder="อีเมลของเพื่อน"
                      value={memberEmail}
                      onChangeText={setMemberEmail}
                      keyboardType="email-address"
                    />

                    <Button
                      title="เพิ่มสมาชิก"
                      onPress={addMember}
                      disabled={groupActionBusy}
                    />
                  </>
                )}

                <View style={s.divider} />

                <Button
                  title="สร้างทริปในกลุ่มนี้"
                  onPress={() => {
                    setTab("home");
                    setScreen("home");
                    createTrip();
                  }}
                />
              </View>
            )}
          </ScrollView>

          {bottomNav()}

          {/* CREATE GROUP MODAL */}

          <Modal
            visible={groupModal}
            transparent
            animationType="fade"
            onRequestClose={() => setGroupModal(false)}
          >
            <View style={s.modalOverlay}>
              <View style={s.modalCard}>
                <Text style={s.modalTitle}>
                  สร้างกลุ่มใหม่
                </Text>

                <Text style={s.modalSubtitle}>
                  ตั้งชื่อกลุ่มสำหรับคุณและเพื่อน
                </Text>

                <Input
                  label="ชื่อกลุ่ม"
                  placeholder="เช่น แก๊งเที่ยวเชียงใหม่"
                  value={groupName}
                  onChangeText={setGroupName}
                />

                <Button
                  title={
                    groupActionBusy
                      ? "กำลังสร้างกลุ่ม..."
                      : "สร้างกลุ่ม"
                  }
                  onPress={createGroup}
                  disabled={groupActionBusy}
                />

                <Button
                  title="ยกเลิก"
                  outline
                  onPress={() => setGroupModal(false)}
                  style={{ marginTop: 10 }}
                />
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    );
  }

  // ========================================
  // 28. HOME DASHBOARD
  // ========================================

  if (screen === "home") {
    const latestTrip = trips[0];

    const remaining = Math.max(
      totalBudget - totalSpent,
      0
    );

    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" />

        <View style={s.appScreen}>
          <ScrollView
            contentContainerStyle={s.homeContent}
            showsVerticalScrollIndicator={false}
          >
            {/* HEADER */}

            <View style={s.homeHeader}>
              <TouchableOpacity
                style={s.homeAvatar}
                onPress={() => nav("profile")}
              >
                <Duck style={s.homeAvatarImage} />
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <Text style={s.homeName}>
                  {name || "Ducky"} ⌄
                </Text>

                <Text style={s.homeGreeting}>
                  {activeGroup
                    ? `กลุ่ม: ${activeGroup.name}`
                    : "ยังไม่ได้เลือกกลุ่ม"}
                </Text>
              </View>

              <TouchableOpacity
                style={s.notification}
                onPress={() =>
                  Alert.alert(
                    "การแจ้งเตือน",
                    "ยังไม่มีการแจ้งเตือนใหม่"
                  )
                }
              >
                <Text style={s.notificationIcon}>
                  ♧
                </Text>

                <View style={s.notificationDot} />
              </TouchableOpacity>
            </View>

            {/* CREATE TRIP BANNER */}

            <View style={s.tripBanner}>
              <Text style={s.bannerTitle}>
                ออกเดินทางกันเถอะ!
              </Text>

              <Text style={s.bannerSubtitle}>
                {activeGroup
                  ? `สร้างทริปในกลุ่ม ${activeGroup.name}`
                  : "เริ่มต้นด้วยการสร้างกลุ่มก่อน"}
              </Text>

              <TouchableOpacity
                style={s.createButton}
                onPress={() => {
                  if (activeGroup) {
                    createTrip();
                  } else {
                    nav("groups");
                  }
                }}
              >
                <Text style={s.createButtonText}>
                  {activeGroup
                    ? "+ สร้างทริป"
                    : "+ สร้างกลุ่ม"}
                </Text>
              </TouchableOpacity>

              <Text style={s.bannerPlane}>✈</Text>
              <Text style={s.bannerLandscape}>🏔️</Text>
            </View>

            {/* ACTIVE GROUP SELECTOR */}

            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>
                กลุ่มที่กำลังใช้งาน
              </Text>

              <TouchableOpacity
                onPress={() => nav("groups")}
              >
                <Text style={s.seeAll}>
                  เปลี่ยนกลุ่ม ›
                </Text>
              </TouchableOpacity>
            </View>

            {activeGroup ? (
              <View style={s.activeGroupCard}>
                <View style={s.groupIcon}>
                  <Text style={{ fontSize: 23 }}>👥</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={s.groupItemName}>
                    {activeGroup.name}
                  </Text>

                  <Text style={s.groupItemRole}>
                    {members.length} สมาชิก
                  </Text>
                </View>

                <Text style={s.groupArrow}>✓</Text>
              </View>
            ) : (
              <View style={s.emptyTrip}>
                <Text style={s.emptyTripIcon}>👥</Text>

                <Text style={s.emptyTripTitle}>
                  ยังไม่มีกลุ่มที่เลือก
                </Text>

                <Text style={s.emptyTripText}>
                  สร้างกลุ่มหรือเข้าร่วมกลุ่มก่อนสร้างทริป
                </Text>

                <Button
                  title="ไปหน้ากลุ่ม"
                  onPress={() => nav("groups")}
                  style={{ width: "100%", marginTop: 15 }}
                />
              </View>
            )}

            {/* RECENT TRIP */}

            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>
                ทริปล่าสุดของกลุ่ม
              </Text>

              <TouchableOpacity
                onPress={() => nav("groups")}
              >
                <Text style={s.seeAll}>
                  ดูกลุ่ม ›
                </Text>
              </TouchableOpacity>
            </View>

            {latestTrip ? (
              <View style={s.tripCard}>
                <View style={s.tripPhoto}>
                  <Text style={s.tripPhotoEmoji}>
                    🏞️
                  </Text>
                </View>

                <View style={s.tripInfo}>
                  <Text style={s.tripName}>
                    {latestTrip.title}
                  </Text>

                  <Text style={s.tripDate}>
                    {latestTrip.destination ||
                      "ยังไม่ได้ระบุสถานที่"}
                  </Text>

                  <Text style={s.tripPeople}>
                    งบประมาณ{" "}
                    {Number(
                      latestTrip.budget || 0
                    ).toLocaleString()}{" "}
                    {latestTrip.currency || "THB"}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={s.emptyTrip}>
                <Text style={s.emptyTripIcon}>🧳</Text>

                <Text style={s.emptyTripTitle}>
                  ยังไม่มีทริปในกลุ่มนี้
                </Text>

                <Text style={s.emptyTripText}>
                  สร้างทริปแรกของกลุ่มได้เลย
                </Text>
              </View>
            )}

            {/* BUDGET */}

            <View style={s.budgetCard}>
              <View style={s.budgetColumn}>
                <Text style={s.budgetIconPink}>▢</Text>

                <Text style={s.budgetLabel}>งบรวม</Text>

                <Text style={s.budgetValue}>
                  {totalBudget.toLocaleString()}
                </Text>
              </View>

              <View style={s.budgetDivider} />

              <View style={s.budgetColumn}>
                <Text style={s.budgetIconDark}>▣</Text>

                <Text style={s.budgetLabel}>
                  ใช้ไปแล้ว
                </Text>

                <Text style={s.budgetValue}>
                  {totalSpent.toLocaleString()}
                </Text>
              </View>

              <View style={s.budgetDivider} />

              <View style={s.budgetColumn}>
                <Text style={s.budgetIconGreen}>▢</Text>

                <Text style={s.budgetLabel}>
                  คงเหลือ
                </Text>

                <Text style={s.budgetValueGreen}>
                  {remaining.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* QUICK MENU */}

            <Text style={s.sectionTitle}>
              เมนูด่วน
            </Text>

            <View style={s.quickRow}>
              <TouchableOpacity
                style={s.quickItem}
                onPress={createTrip}
              >
                <Text style={s.quickIcon}>＋</Text>
                <Text style={s.quickLabel}>
                  เพิ่ม{"\n"}ทริป
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.quickItem}
                onPress={() => nav("groups")}
              >
                <Text style={s.quickIcon}>♧</Text>
                <Text style={s.quickLabel}>
                  ดูสมาชิก
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.quickItem}
                onPress={() =>
                  Alert.alert(
                    "Expenses",
                    "ระบบค่าใช้จ่ายจะพัฒนาต่อในขั้นตอนถัดไป"
                  )
                }
              >
                <Text style={s.quickIcon}>▥</Text>
                <Text style={s.quickLabel}>
                  สรุปยอด
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.quickItem}
                onPress={() => nav("profile")}
              >
                <Text style={s.quickIcon}>⚙</Text>
                <Text style={s.quickLabel}>
                  ตั้งค่า
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {bottomNav()}

          {/* CREATE TRIP MODAL */}

          <Modal
            visible={tripModal}
            transparent
            animationType="fade"
            onRequestClose={() => setTripModal(false)}
          >
            <View style={s.modalOverlay}>
              <View style={s.modalCard}>
                <Text style={s.modalTitle}>
                  สร้างทริปใหม่
                </Text>

                <Text style={s.modalSubtitle}>
                  กลุ่ม: {activeGroup?.name || "-"}
                </Text>

                <Input
                  label="ชื่อทริป"
                  placeholder="เช่น เที่ยวเชียงใหม่"
                  value={tripTitle}
                  onChangeText={setTripTitle}
                />

                <Input
                  label="สถานที่"
                  placeholder="เช่น เชียงใหม่"
                  value={tripDestination}
                  onChangeText={setTripDestination}
                />

                <Input
                  label="งบประมาณ"
                  placeholder="เช่น 8000"
                  value={tripBudget}
                  onChangeText={setTripBudget}
                  keyboardType="decimal-pad"
                />

                <Button
                  title={
                    busy
                      ? "กำลังบันทึก..."
                      : "บันทึกทริป"
                  }
                  onPress={saveTrip}
                  disabled={busy}
                />

                <Button
                  title="ยกเลิก"
                  outline
                  onPress={() => setTripModal(false)}
                  style={{ marginTop: 10 }}
                />
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    );
  }

  // ========================================
  // 29. PROFILE
  // ========================================

  if (screen === "profile") {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" />

        <View style={s.profileScreen}>
          <ScrollView
            contentContainerStyle={s.profileContent}
          >
            <Text style={s.profileTitle}>
              โปรไฟล์
            </Text>

            <Text style={s.subtitle}>
              จัดการข้อมูลส่วนตัวของคุณ
            </Text>

            <View style={s.profileCard}>
              <View style={s.profileAvatar}>
                <Duck style={s.profileDuck} />
              </View>

              <Text style={s.profileName}>
                {name || "Ducky"}
              </Text>

              <Text style={s.profileEmail}>
                {email}
              </Text>

              <Text style={s.profilePhone}>
                {phone || "ยังไม่ได้ระบุเบอร์โทรศัพท์"}
              </Text>
            </View>

            <View style={s.settingsCard}>
              <TouchableOpacity
                style={s.settingRow}
                onPress={() =>
                  Alert.alert(
                    "ข้อมูลส่วนตัว",
                    "ระบบแก้ไขโปรไฟล์จะพัฒนาต่อในขั้นตอนถัดไป"
                  )
                }
              >
                <Text style={s.settingIcon}>♙</Text>

                <Text style={s.settingText}>
                  ข้อมูลส่วนตัว
                </Text>

                <Text style={s.chevron}>›</Text>
              </TouchableOpacity>

              <View style={s.divider} />

              <TouchableOpacity
                style={s.settingRow}
                onPress={() =>
                  Alert.alert(
                    "การตั้งค่า",
                    "การตั้งค่าจะพัฒนาต่อในขั้นตอนถัดไป"
                  )
                }
              >
                <Text style={s.settingIcon}>⚙</Text>

                <Text style={s.settingText}>
                  การตั้งค่า
                </Text>

                <Text style={s.chevron}>›</Text>
              </TouchableOpacity>
            </View>

            <Button
              title="ออกจากระบบ"
              outline
              style={{ marginTop: 22 }}
              onPress={logout}
            />
          </ScrollView>

          {bottomNav()}
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

// ==========================================
// 30. DESIGN SYSTEM
// ==========================================

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.pinkBg,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: C.pinkBg,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    fontFamily: "Prompt_500Medium",
    color: C.muted,
    marginTop: 12,
    fontSize: 13,
  },

  brand: {
    alignItems: "center",
    justifyContent: "center",
  },

  brandName: {
    fontFamily: "Prompt_700Bold",
    color: C.pink,
    fontSize: 34,
    letterSpacing: -0.5,
  },

  brandTagline: {
    fontFamily: "Prompt_400Regular",
    color: C.pinkDark,
    fontSize: 11,
    marginTop: 3,
  },

  button: {
    minHeight: 49,
    borderRadius: 28,
    backgroundColor: C.pink,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    shadowColor: C.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },

  buttonText: {
    fontFamily: "Prompt_600SemiBold",
    color: C.white,
    fontSize: 14,
  },

  buttonOutline: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.pink,
    shadowOpacity: 0,
    elevation: 0,
  },

  buttonOutlineText: {
    color: C.pinkDark,
  },

  field: {
    marginBottom: 13,
  },

  label: {
    fontFamily: "Prompt_600SemiBold",
    fontSize: 12,
    color: C.text,
    marginBottom: 7,
    marginLeft: 5,
  },

  input: {
    fontFamily: "Prompt_400Regular",
    minHeight: 50,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 17,
    backgroundColor: C.white,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 13,
    color: C.text,
  },

  header: {
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 40,
    height: 42,
    justifyContent: "center",
  },

  backText: {
    fontSize: 35,
    color: C.text,
  },

  headerTitle: {
    fontFamily: "Prompt_600SemiBold",
    fontSize: 15,
    color: C.text,
  },

  // LANDING

  landing: {
    flex: 1,
    backgroundColor: C.pinkLight,
    justifyContent: "space-between",
  },

  landingTop: {
    flex: 1,
    backgroundColor: "#FFE4EB",
    alignItems: "center",
    paddingTop: 35,
    overflow: "hidden",
  },

  decorCircle1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 120,
    backgroundColor: "#FFD2DE",
    top: 100,
    left: -70,
  },

  decorCircle2: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#FFEFF3",
    top: 180,
    right: -100,
  },

  landingDuck: {
    width: 270,
    height: 270,
    marginTop: 25,
  },

  landingHeart: {
    position: "absolute",
    right: "18%",
    top: "36%",
    color: C.pink,
    fontSize: 35,
  },

  landingPanel: {
    backgroundColor: "#FFFAFB",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 25,
    alignItems: "center",
  },

  handle: {
    width: 40,
    height: 4,
    borderRadius: 3,
    backgroundColor: C.border,
    marginBottom: 16,
  },

  landingTitle: {
    fontFamily: "Prompt_700Bold",
    color: C.text,
    textAlign: "center",
    fontSize: 24,
    lineHeight: 36,
  },

  landingDesc: {
    fontFamily: "Prompt_400Regular",
    color: C.muted,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 22,
    marginTop: 8,
  },

  landingButton: {
    width: "100%",
    marginTop: 22,
  },

  // LOGIN

  loginContent: {
    flexGrow: 1,
    paddingHorizontal: 23,
    paddingBottom: 25,
    backgroundColor: C.pinkBg,
  },

  loginMascot: {
    alignItems: "center",
    marginTop: 7,
  },

  loginDuck: {
    width: 135,
    height: 135,
  },

  loginHeading: {
    alignItems: "center",
    marginBottom: 22,
  },

  pageTitle: {
    fontFamily: "Prompt_700Bold",
    color: C.text,
    fontSize: 25,
  },

  subtitle: {
    fontFamily: "Prompt_400Regular",
    color: C.muted,
    fontSize: 12,
    marginTop: 5,
    lineHeight: 20,
  },

  forgot: {
    alignSelf: "flex-end",
    marginTop: -3,
    marginBottom: 14,
  },

  link: {
    fontFamily: "Prompt_600SemiBold",
    color: C.pinkDark,
    fontSize: 12,
    textDecorationLine: "underline",
  },

  orRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 17,
  },

  line: {
    height: 1,
    flex: 1,
    backgroundColor: C.border,
  },

  orText: {
    fontFamily: "Prompt_400Regular",
    color: C.muted,
    fontSize: 12,
    marginHorizontal: 12,
  },

  social: {
    minHeight: 44,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  google: {
    color: "#4285F4",
    fontSize: 18,
    fontWeight: "900",
    marginRight: 12,
  },

  socialText: {
    fontFamily: "Prompt_500Medium",
    color: C.text,
    fontSize: 12,
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 17,
  },

  muted: {
    fontFamily: "Prompt_400Regular",
    color: C.muted,
    fontSize: 12,
  },

  // REGISTER

  registerContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingBottom: 25,
    backgroundColor: C.pinkBg,
  },

  setupTitle: {
    fontFamily: "Prompt_700Bold",
    textAlign: "center",
    color: C.text,
    fontSize: 23,
    marginTop: 8,
  },

  setupSubtitle: {
    fontFamily: "Prompt_400Regular",
    color: C.muted,
    textAlign: "center",
    fontSize: 12,
    marginTop: 5,
  },

  setupAvatarWrap: {
    alignSelf: "center",
    marginTop: 17,
    marginBottom: 15,
  },

  setupAvatarCircle: {
    width: 125,
    height: 125,
    borderRadius: 65,
    backgroundColor: "#FFD5DE",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  setupDuck: {
    width: 120,
    height: 120,
  },

  setupFormCard: {
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 22,
    padding: 12,
  },

  currencySelect: {
    height: 49,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 13,
  },

  currencyText: {
    fontFamily: "Prompt_400Regular",
    flex: 1,
    fontSize: 13,
    color: C.text,
  },

  currencyArrow: {
    fontSize: 21,
    color: C.text,
  },

  // APP / HOME

  appScreen: {
    flex: 1,
    backgroundColor: C.pinkBg,
  },

  homeContent: {
    paddingHorizontal: 17,
    paddingTop: 15,
    paddingBottom: 22,
  },

  homeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  homeAvatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "#FFD6DF",
    overflow: "hidden",
    marginRight: 11,
    borderWidth: 2,
    borderColor: C.white,
  },

  homeAvatarImage: {
    width: "100%",
    height: "100%",
  },

  homeName: {
    fontFamily: "Prompt_700Bold",
    fontSize: 16,
    color: C.text,
  },

  homeGreeting: {
    fontFamily: "Prompt_400Regular",
    fontSize: 10,
    color: C.muted,
    marginTop: 4,
  },

  notification: {
    width: 42,
    height: 42,
    borderRadius: 22,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
  },

  notificationIcon: {
    fontSize: 23,
    color: C.text,
  },

  notificationDot: {
    position: "absolute",
    top: 5,
    right: 6,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: C.pink,
  },

  tripBanner: {
    minHeight: 146,
    backgroundColor: "#F48296",
    borderRadius: 23,
    padding: 17,
    overflow: "hidden",
    marginBottom: 20,
  },

  bannerTitle: {
    fontFamily: "Prompt_700Bold",
    color: C.white,
    fontSize: 19,
  },

  bannerSubtitle: {
    fontFamily: "Prompt_400Regular",
    color: C.white,
    fontSize: 12,
    marginTop: 5,
  },

  createButton: {
    marginTop: 13,
    backgroundColor: C.white,
    paddingHorizontal: 17,
    paddingVertical: 9,
    borderRadius: 22,
    alignSelf: "flex-start",
  },

  createButtonText: {
    fontFamily: "Prompt_600SemiBold",
    color: C.pinkDark,
    fontSize: 12,
  },

  bannerPlane: {
    position: "absolute",
    right: 30,
    top: 10,
    fontSize: 55,
  },

  bannerLandscape: {
    position: "absolute",
    right: 12,
    bottom: 3,
    fontSize: 48,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  sectionTitle: {
    fontFamily: "Prompt_700Bold",
    color: C.text,
    fontSize: 16,
    marginBottom: 10,
  },

  seeAll: {
    fontFamily: "Prompt_500Medium",
    color: C.pinkDark,
    fontSize: 12,
  },

  // GROUPS

  groupActionCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 17,
    marginTop: 15,
    marginBottom: 5,
  },

  groupCardTitle: {
    fontFamily: "Prompt_700Bold",
    color: C.text,
    fontSize: 15,
    marginBottom: 5,
  },

  groupCardDesc: {
    fontFamily: "Prompt_400Regular",
    color: C.muted,
    fontSize: 11,
    marginBottom: 13,
  },

  groupItem: {
    minHeight: 75,
    borderRadius: 18,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 10,
  },

  groupItemActive: {
    borderColor: C.pink,
    borderWidth: 2,
    backgroundColor: "#FFF9FA",
  },

  groupIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: C.pinkLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  groupItemName: {
    fontFamily: "Prompt_600SemiBold",
    fontSize: 13,
    color: C.text,
  },

  groupItemRole: {
    fontFamily: "Prompt_400Regular",
    fontSize: 10,
    color: C.muted,
    marginTop: 3,
  },

  groupArrow: {
    fontSize: 23,
    color: C.pinkDark,
    paddingHorizontal: 8,
  },

  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  memberAvatar: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: C.pinkLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  memberName: {
    fontFamily: "Prompt_500Medium",
    color: C.text,
    fontSize: 12,
  },

  activeGroupCard: {
    minHeight: 70,
    borderRadius: 18,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 17,
  },

  // TRIPS

  tripCard: {
    minHeight: 112,
    borderRadius: 20,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  tripPhoto: {
    width: 105,
    height: 96,
    borderRadius: 15,
    backgroundColor: "#D9EBF3",
    alignItems: "center",
    justifyContent: "center",
  },

  tripPhotoEmoji: {
    fontSize: 48,
  },

  tripInfo: {
    flex: 1,
    marginLeft: 10,
  },

  tripName: {
    fontFamily: "Prompt_600SemiBold",
    color: C.text,
    fontSize: 13,
    marginBottom: 7,
  },

  tripDate: {
    fontFamily: "Prompt_400Regular",
    color: C.muted,
    fontSize: 10,
    marginBottom: 7,
  },

  tripPeople: {
    fontFamily: "Prompt_400Regular",
    color: C.muted,
    fontSize: 11,
  },

  emptyTrip: {
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    padding: 24,
    marginBottom: 15,
  },

  emptyTripIcon: {
    fontSize: 34,
    marginBottom: 7,
  },

  emptyTripTitle: {
    fontFamily: "Prompt_600SemiBold",
    color: C.text,
    fontSize: 13,
  },

  emptyTripText: {
    fontFamily: "Prompt_400Regular",
    color: C.muted,
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },

  // BUDGET

  budgetCard: {
    minHeight: 103,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 18,
    paddingVertical: 10,
  },

  budgetColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  budgetDivider: {
    height: 65,
    width: 1,
    backgroundColor: C.border,
  },

  budgetIconPink: {
    color: C.pink,
    fontSize: 22,
  },

  budgetIconDark: {
    color: C.text,
    fontSize: 22,
  },

  budgetIconGreen: {
    color: C.green,
    fontSize: 22,
  },

  budgetLabel: {
    fontFamily: "Prompt_400Regular",
    color: C.muted,
    fontSize: 10,
    marginTop: 4,
  },

  budgetValue: {
    fontFamily: "Prompt_600SemiBold",
    color: C.text,
    fontSize: 11,
    marginTop: 4,
  },

  budgetValueGreen: {
    fontFamily: "Prompt_600SemiBold",
    color: C.green,
    fontSize: 11,
    marginTop: 4,
  },

  // QUICK MENU

  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  quickItem: {
    width: "23.5%",
    minHeight: 82,
    borderRadius: 17,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  quickIcon: {
    color: C.pink,
    fontSize: 25,
    marginBottom: 4,
  },

  quickLabel: {
    fontFamily: "Prompt_500Medium",
    color: C.text,
    fontSize: 10,
    textAlign: "center",
    lineHeight: 16,
  },

  // PROFILE

  profileScreen: {
    flex: 1,
    backgroundColor: C.pinkBg,
  },

  profileContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 25,
  },

  profileTitle: {
    fontFamily: "Prompt_700Bold",
    color: C.text,
    fontSize: 25,
  },

  profileCard: {
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
    padding: 25,
    marginTop: 22,
  },

  profileAvatar: {
    width: 88,
    height: 88,
    borderRadius: 45,
    backgroundColor: C.pinkLight,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 13,
  },

  profileDuck: {
    width: 85,
    height: 85,
  },

  profileName: {
    fontFamily: "Prompt_700Bold",
    color: C.text,
    fontSize: 18,
    marginBottom: 6,
  },

  profileEmail: {
    fontFamily: "Prompt_400Regular",
    color: C.muted,
    fontSize: 12,
  },

  profilePhone: {
    fontFamily: "Prompt_400Regular",
    color: C.muted,
    fontSize: 11,
    marginTop: 5,
  },

  settingsCard: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    paddingHorizontal: 15,
    marginTop: 18,
  },

  settingRow: {
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
  },

  settingIcon: {
    width: 36,
    color: C.pinkDark,
    fontSize: 20,
  },

  settingText: {
    fontFamily: "Prompt_500Medium",
    flex: 1,
    color: C.text,
    fontSize: 13,
  },

  chevron: {
    color: C.muted,
    fontSize: 24,
  },

  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 12,
  },

  // MODALS

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(50,20,35,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalCard: {
    width: "100%",
    maxWidth: 430,
    backgroundColor: C.pinkBg,
    borderRadius: 25,
    padding: 22,
  },

  modalTitle: {
    fontFamily: "Prompt_700Bold",
    color: C.text,
    fontSize: 21,
    textAlign: "center",
  },

  modalSubtitle: {
    fontFamily: "Prompt_400Regular",
    color: C.muted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 18,
  },

  // BOTTOM NAV

  bottomNav: {
    height: 68,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  navIcon: {
    color: "#AFA0A6",
    fontSize: 23,
  },

  navLabel: {
    fontFamily: "Prompt_400Regular",
    color: "#AFA0A6",
    fontSize: 10,
    marginTop: 2,
  },

  navActive: {
    color: C.pink,
  },
});
