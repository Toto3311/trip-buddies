# TripBuddies Mobile App (React Native Expo)

แอปพลิเคชันสำหรับวางแผนทริปและจัดการค่าใช้จ่ายร่วมกับเพื่อน (Trip Buddies) พัฒนาด้วย **React Native** และ **Expo SDK 54** เชื่อมต่อฐานข้อมูลด้วย **Supabase**

---

## 🚀 วิธีการรันโปรเจกต์บนเครื่องนี้

### 1. เริ่มต้นรันเซิร์ฟเวอร์พัฒนา (Expo Dev Server)
เปิด Terminal ในโฟลเดอร์นี้ แล้วรันคำสั่ง:
```bash
npm start
```
หรือ
```bash
npx expo start
```

### 2. วิธีการเปิดดูแอปพลิเคชัน

- **บนโทรศัพท์จริง (iOS / Android ผ่าน Expo Go):**
  1. ดาวน์โหลดแอป **Expo Go** จาก App Store หรือ Google Play Store
  2. เชื่อมต่อ Wi-Fi วงเดียวกันกับคอมพิวเตอร์
  3. เปิดกล้อง (iOS) หรือเปิดแอป Expo Go (Android) สแกน **QR Code** ที่ปรากฏบนหน้าจอ Terminal
  *(หาก Wi-Fi มองไม่เห็นกัน สามารถรันด้วย `npx expo start --tunnel` ได้)*

- **บนเว็บเบราว์เซอร์ (Web Preview):**
  กดปุ่ม `w` ในหน้าต่าง Terminal ที่รันอยู่ หรือรันคำสั่ง:
  ```bash
  npm run web
  ```

- **บน Android Emulator:**
  กดปุ่ม `a` ใน Terminal หรือรันคำสั่ง:
  ```bash
  npm run android
  ```

- **เคลียร์ Cache เมื่อมีการเปลี่ยนแปลง:**
  ```bash
  npm run start:clear
  ```

---

## 🛠️ รายละเอียดการตั้งค่าและแพ็กเกจหลัก

- **Framework:** Expo SDK 54 (~54.0.37) & React Native 0.81.5
- **UI & Fonts:** Google Fonts Prompt (`@expo-google-fonts/prompt`)
- **Backend / Database:** Supabase (`@supabase/supabase-js`)
- **Storage:** `@react-native-async-storage/async-storage`
- **Polyfill:** `react-native-url-polyfill`
