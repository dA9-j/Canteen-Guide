# Canteen Guide – คู่มือโรงอาหารและร้านอาหารในมหาวิทยาลัย

รายวิชา SC17332 · Mini Project ธีม Smart Campus · **กลุ่มที่ 2**

## สมาชิก

| ที่ | ชื่อ–สกุล | รหัสนักศึกษา | GitHub username |
|----|-----------|--------------|-----------------|
| 1 | คุณวุฒิ ฉายรังษี| 6721207010 | kkkunwuttt |
| 2 | ดนัย ประชาดา | 6721207036 | dA9-j |
| 3 | อนุชิต โคตรจันทร์ | 6721207040 | Anucheese |
| 4 | อภิรักษ์ เย็นทรวง | 6721207045 | 6721207045APR |
| 5 | อภิวัฒน์ แหวนหล่อ | 6721207045 | Aphiwat78 |


## ลิงก์เว็บ (GitHub Pages)

(https://github.com/dA9-j/Canteen-Guide.git)

## ฟีเจอร์

- [x] F1 fetch `data/canteen.json` แล้วสร้างการ์ดเมนูด้วย DOM
- [x] F2 กรองตามประเภท + ช่วงราคา + ฮาลาล/มังสวิรัติ ใช้ร่วมกันได้
- [x] F3 เรียงราคาน้อย→มาก / มาก→น้อย
- [x] F4 ตะกร้า เพิ่ม ลด ลบ ราคารวม เก็บใน localStorage และแสดงจำนวนที่ nav ทุกหน้า
- [x] F5 ตั้งงบวันนี้ และเตือนเมื่อราคารวมเกินงบ
- [x] F6 ฟอร์มรีวิว (radio 1–5, textarea) มี validation และคำนวณคะแนนเฉลี่ยของร้าน
- [x] เสริม: ปุ่ม "วันนี้กินอะไรดี?" สุ่มเมนูตามงบ
- [x] เสริม: แสดง kcal โดยประมาณและพลังงานรวมในตะกร้า
- [x] เสริม: ป้าย "ขายดี" จากจำนวนครั้งที่เพิ่มลงตะกร้า

## แหล่งที่มาของข้อมูลและรูปภาพ

> ตอนนี้เป็นข้อมูลตัวอย่าง (ร้านสมมติ 5 ร้าน 24 เมนู และรูปภาพ SVG ชั่วคราว)
> ต้องแทนที่ด้วยข้อมูลจริง ราคาจริง และรูปที่กลุ่มถ่ายเอง แล้วระบุแหล่งที่มาที่นี่
<img width="500" height="500" alt="S__7102470_0" src="https://github.com/user-attachments/assets/7aabacd7-3537-427c-9000-23e0a45cbae6" />
<img width="500" height="500" alt="S__7102468_0" src="https://github.com/user-attachments/assets/2c45d075-eec7-4ddc-901b-7a2c385320e3" />
<img width="500" height="500" alt="S__7102478_0" src="https://github.com/user-attachments/assets/7f711580-6500-406e-894e-9ea5531618f3" />
<img width="500" height="500" alt="S__7102476_0" src="https://github.com/user-attachments/assets/a30d7dc5-ebe1-46d2-9eb8-772e9084bfbc" />
<img width="500" height="500" alt="S__7102474_0" src="https://github.com/user-attachments/assets/8d7cf929-2f66-478f-a4cb-ea10adc03c0e" />
<img width="500" height="500" alt="S__7102473_0" src="https://github.com/user-attachments/assets/073dc683-0492-4ee6-86a3-84e980771d78" />
<img width="500" height="500" alt="S__7102471_0" src="https://github.com/user-attachments/assets/c73b8f5f-191e-454e-a908-e93f411cca72" />
<img width="500" height="500" alt="S__7102469_0" src="https://github.com/user-attachments/assets/d625a9fa-b00b-4708-905a-352b8d69e247" />
<img width="500" height="500" alt="S__77611010" src="https://github.com/user-attachments/assets/3f0c3675-5d9e-415c-a553-bd12de08cde3" />
<img width="500" height="500" alt="S__7102475_0" src="https://github.com/user-attachments/assets/8bef2b50-c61a-4470-b37e-95da88544dd3" />
## ผล Lighthouse (Accessibility)

<img width="1917" height="871" alt="image" src="https://github.com/user-attachments/assets/c0afc039-b4fb-4851-9005-41e82f425020" />


## วิธีรันตอนพัฒนา

เปิดโฟลเดอร์ด้วย VS Code แล้วใช้ **Live Server** (fetch ใช้ไม่ได้เมื่อเปิดไฟล์ด้วย `file://`)
