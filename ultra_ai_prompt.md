# คู่มือและระบบ AI Prompt ขั้นสูง (Ultra Version) สำหรับ DD Computer Platform

เอกสารนี้ประกอบด้วย **ระบบ AI System Prompt (ภาษาไทย)** สำหรับใช้กับ AI Agent (เช่น Cursor, Windsurf, Claude, GPT) เพื่อให้สามารถสแกน ตรวจหา วิเคราะห์ และแก้ไขบั๊กของระบบ DD Computer ได้โดยอัตโนมัติแบบ **Loop ต่อเนื่อง 100% จนกว่าจะเสร็จสมบูรณ์** และสรุปการวิเคราะห์ปัญหาของ **รูปภาพอัปโหลด 404 (uploads/...)** เพื่อให้แก้ไขปัญหาได้อย่างตรงจุด

---

## 🔍 ส่วนที่ 1: การวิเคราะห์สาเหตุของปัญหารูปภาพ 404 (Uploads Issue)

หากคุณพบบั๊กรูปภาพแสดงสถานะ **404 Not Found** จาก URL เช่น `https://ddcomputersamrong.com/uploads/[filename].jpg` โดยมีหน้าอ้างอิง (Referer) เป็น `https://ddcomputersamrong.com/admin/products` ไฟล์ที่เกี่ยวข้องและตำแหน่งที่ต้องตรวจสอบมีดังนี้:

### 1. Nginx Reverse Proxy Precedence Bug (ไฟล์ตั้งค่า Nginx)
*   **ไฟล์ที่เกี่ยวข้อง:**
    *   [setup-nginx-cloudflare.sh](file:///c:/Users/Admin/Downloads/DD-v.1-main/DD-v.1-main/setup-nginx-cloudflare.sh#L131-L135)
    *   [ddcomputer.conf](file:///c:/Users/Admin/Downloads/DD-v.1-main/DD-v.1-main/nginx/ddcomputer.conf#L64-L76)
    *   [ddcomputer-ip.conf](file:///c:/Users/Admin/Downloads/DD-v.1-main/DD-v.1-main/nginx/ddcomputer-ip.conf#L30-L41)
*   **สาเหตุ:** 
    ในไฟล์ Nginx Config มีการตั้งค่า `location /uploads/` ให้ส่งต่อ (Proxy Pass) ไปยัง backend (port 3001) แต่ในบล็อก `location /` (สำหรับ Next.js frontend) ดันมีบล็อก Nested Regex สำหรับแคชไฟล์รูปภาพ ดังนี้:
    ```nginx
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://frontend; # ส่งไปที่ Next.js แทนที่จะเป็น Backend!
    }
    ```
    เมื่อมีการเรียกดูไฟล์ `.jpg` ภายใต้โฟลเดอร์ `/uploads/` Nginx จะจับคู่ Regex ที่ส่งไปที่ **Frontend (Next.js)** ทำให้เกิด 404 เนื่องจากรูปภาพจริง ๆ ถูกอัปโหลดเก็บไว้ที่ **Backend (NestJS)**
*   **วิธีแก้ไข:** เปลี่ยน `location /uploads/` เป็น `location ^~ /uploads/` (ใช้สัญลักษณ์ `^~` เพื่อบอก Nginx ว่าถ้าเจอ path นี้ ไม่ต้องหาต่อด้วย Regex อื่น ๆ)
    ```nginx
    location ^~ /uploads/ {
        proxy_pass http://backend;
        ...
    }
    ```

### 2. Docker Container Volumes (ความคงอยู่ของข้อมูลรูปภาพ)
*   **ไฟล์ที่เกี่ยวข้อง:**
    *   [docker-compose.prod.yml](file:///c:/Users/Admin/Downloads/DD-v.1-main/DD-v.1-main/docker-compose.prod.yml#L52-L53)
    *   [backend/Dockerfile](file:///c:/Users/Admin/Downloads/DD-v.1-main/DD-v.1-main/backend/Dockerfile#L23-L24)
*   **สาเหตุ:** 
    หากไม่ได้แมปโฟลเดอร์ `/app/uploads` ออกมายัง Host Machine เมื่อ Container ของ Backend ถูกอัปเดตหรือรันใหม่ ข้อมูลรูปภาพที่เคยอัปโหลดจะถูกลบหายไปทั้งหมด
*   **วิธีแก้ไข:** ตรวจสอบว่าใน `docker-compose.prod.yml` ส่วนของ backend มีการทำ Volume Mapping ที่สมบูรณ์และโฟลเดอร์ฝั่ง Host มีสิทธิ์ในการเขียนข้อมูล (Write Permissions):
    ```yaml
    volumes:
      - ./backend/uploads:/app/uploads
    ```

### 3. Service Worker Cache (การแคชฝั่งเบราว์เซอร์)
*   **สาเหตุ:** 
    เบราว์เซอร์ฟ้องว่า `404 Not Found (from service worker)` แสดงว่าเบราว์เซอร์เคยจำค่า 404 หรือมีการแคชเส้นทาง `/uploads/` ไว้ใน Service Worker
*   **วิธีแก้ไข:** ต้องแก้ไข Service Worker ในฝั่ง Frontend ให้ข้ามการแคช (Bypass/Ignore) เส้นทาง `/uploads/*` และ `/api/*` เสมอ

---

## 🛠️ ส่วนที่ 2: ระบบ Prompt ขั้นสูง (Ultra Version) สำหรับสั่งงาน AI

คัดลอก Prompt ด้านล่างนี้ไปสั่งงาน AI Agent ที่คุณใช้งานอยู่ (เช่น Cursor, Windsurf หรือ Chat อื่นๆ) เพื่อเริ่มกระบวนการแก้ไขบั๊กแบบอัตโนมัติเต็มรูปแบบ:

```markdown
# [SYSTEM INSTRUCTION: DD COMPUTER AUTO-REPAIR LOOP - ULTRA VERSION]

คุณคือสุดยอดวิศวกร AI Full-Stack Developer ที่มีหน้าที่ตรวจจับ วิเคราะห์ และแก้ไขปัญหาของระบบ DD Computer (NestJS Backend, Next.js Frontend, MySQL, Nginx, Docker) ให้สามารถทำงานได้ 100% บนทุกสภาพแวดล้อมระบบ

## 🎯 เป้าหมายหลัก
1. แก้ไขและทดสอบโค้ดโดยอัตโนมัติอย่างมีเหตุผล (Smart Auto-Repair)
2. ห้ามหยุดทำงานจนกว่าทุกระบบจะผ่านการทดสอบ ทำงานวนลูปตรวจสอบตัวเองแบบปิด (Continuous Feedback Loop)
3. ตรวจสอบการทำงานของฟังก์ชันรูปภาพอัปโหลด (Uploads 404), ระบบล็อกอิน, และระบบ Real-time Chat ให้ใช้งานได้สมบูรณ์

## 📂 โครงสร้างและไฟล์สำคัญที่ต้องตรวจสอบ
- Backend: /backend/src/main.ts, /backend/src/products/products.controller.ts, /backend/src/common/public-url.ts
- Frontend: /frontend/src/lib/image.ts, /frontend/src/lib/env.ts, /frontend/package.json
- Nginx & Setup: /nginx/ddcomputer.conf, /setup-nginx-cloudflare.sh, /docker-compose.prod.yml

---

## 🔁 กระบวนการทำงานแบบลูปไม่รู้จบ (EXECUTION LOOP STAGES)

ขั้นตอนที่ 1: ตรวจวิเคราะห์รหัสข้อผิดพลาด (Analyze & Trace)
- สแกนดูไฟล์คอนฟิก Nginx, Docker Compose, และการตั้งค่า Static Uploads ใน Backend
- ตรวจสอบว่าเส้นทาง /uploads/ มีสัญลักษณ์ `^~` เพื่อป้องกัน Regex match ผิดพลาดหรือไม่
- วิเคราะห์ Docker Volume Permission ว่าโฟลเดอร์ uploads บน Host มีสิทธิ์แบบ 755 หรือไม่

ขั้นตอนที่ 2: ดำเนินการแก้ไข (Execute Fixes)
- ทำการแก้ไขจุดบกพร่องตามที่วิเคราะห์ไว้ทีละขั้น
- รักษารหัสเดิม ความคิดเห็น และ docstrings ที่ไม่เกี่ยวข้องกับบั๊กไว้ห้ามให้สูญหาย
- อัปเดตสคริปต์สถาปัตยกรรมเช่น deploy-complete.sh และ setup-nginx-cloudflare.sh ให้ถูกต้องสอดคล้องกัน

ขั้นตอนที่ 3: ตรวจสอบผลลัพธ์แบบอัตโนมัติ (Automated Verification)
- จำลองการยิง Request หรือสั่ง Build เพื่อเช็คสถานะคอมไพล์ของโปรเจกต์
- หากเกิดข้อผิดพลาด ให้จับ Log นั้นกลับไปเข้าสู่ "ขั้นตอนที่ 1" ใหม่ทันที
- สั่งรันสคริปต์แก้ไขภาพเสีย เช่น backend/check-missing-images.js หรือ backend/fix-missing-images.js เพื่อตรวจสถานะภาพในฐานข้อมูล

ขั้นตอนที่ 4: วนลูปและรายงานความคืบหน้า (Continuous Iteration)
- ทำงานวนซ้ำไปเรื่อย ๆ จนกระทั่งผลการ Build และการทดสอบผ่าน 100%
- รายงานความคืบหน้าสั้น ๆ ทุกครั้งที่แก้ไขเสร็จในแต่ละจุด และระบุว่ากำลังจะไปเช็คจุดใดต่อ
- **ห้ามแสดงข้อความแจ้งว่า "งานเสร็จสิ้นแล้ว" หรือหยุดทำงานจนกว่าจะมั่นใจว่าไม่มี Error เหลืออยู่ใน Log เลย**
```

---

## 📋 คำแนะนำสำหรับผู้ใช้ในการเริ่มต้น Loop

1. **คัดลอก Prompt ด้านบน** ส่งให้ AI ทำงาน
2. หากใช้ **Windsurf** หรือ **Cursor** ให้พิมพ์เปิดแชทในโฟลเดอร์โครงการ จากนั้นใช้คำสั่ง `/goal` ร่วมกับ Prompt นี้ เพื่อให้ AI เข้าใจและดำเนินแผนงานรันคำสั่งโดยอัตโนมัติ
3. AI จะเริ่มเขียนโค้ดและทำการทดสอบ เช่น การแก้ไขไฟล์ Nginx ให้คุณ และพยายามสตาร์ท Docker/Nginx ซ้ำเพื่อตรวจสอบผลจนกว่าจะผ่านทั้งหมด
