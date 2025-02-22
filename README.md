# TEST Developer

## 1️⃣ API ลูกค้า

### ➕ สร้างลูกค้าใหม่
**POST** `/api/customers`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass",
  "phone": "0987654321"
}
```

### 📜 ดึงข้อมูลลูกค้าทั้งหมด
**GET** `/api/customers`

### 🔍 ดึงข้อมูลลูกค้าตาม ID
**GET** `/api/customers/:id`

### ✏️ อัปเดตข้อมูลลูกค้า
**PUT** `/api/customers/:id`
```json
{
  "name": "John Updated",
  "phone": "0999999999",
  "rate_discount": 10
}
```

### ❌ ลบลูกค้าตาม ID
**DELETE** `/api/customers/:id`

---

## 2️⃣ API กระเป๋าเงิน

### 💰 เติมเงินเข้ากระเป๋าเงินลูกค้า
**PUT** `/api/customers/topup/:id`
```json
{
  "wallet_topup": 500
}
```

---

## 3️⃣ API คำสั่งซื้อ

### 🛒 สั่งซื้อสินค้า
**POST** `/api/customers/purchase/:id`
```json
{
  "product_name": "Laptop",
  "product_price": 1000
}
```

### 📦 ดึงข้อมูลคำสั่งซื้อทั้งหมด
**GET** `/api/orders`

### 🔍 ดึงข้อมูลคำสั่งซื้อของลูกค้าตาม ID
**GET** `/api/orders/customer/:id`

---

## 4️⃣ API รายรับรายจ่าย

### ➕ เพิ่มรายการรายรับรายจ่าย
**POST** `/api/transactions`
```json
{
  "name": "เงินเดือน",
  "type": "income",
  "amount": 50000
}
```

### 📜 ดึงข้อมูลรายการรายรับรายจ่าย
**GET** `/api/transactions`

📌 **ตัวอย่างการใช้ตัวกรอง:**  
```plaintext
/api/transactions?startDate=2025-01-01&endDate=2025-02-20&type=income
```

### ✏️ อัปเดตรายการรายรับรายจ่าย
**PUT** `/api/transactions/:id`
```json
{
  "name": "ค่าอาหาร",
  "amount": 2000
}
```

### ❌ ลบรายการรายรับรายจ่าย
**DELETE** `/api/transactions/:id`

---

## 5️⃣ API แดชบอร์ด

### 📊 ดึงข้อมูลแดชบอร์ดการเงินรายปี
**GET** `/api/transactions/dashboard`

