# API Specification
Endpoint ทั้งหมดที่มีเครื่องหมาย + ต้อง Login ก่อนจึงจะใช้ได้  
Parameter/Request Body ทั้งหมดที่มีเครื่องหมาย * ต้องใส่มา  
ถ้าไม่มีจะตอบว่า
```json
{
    "status": "ERROR",
    "data": {
        "error": "Not logged in!"
    }
}
```
## ผู้ใช้
### GET /user/me (+)
รับข้อมูลผู้ใช้ที่ Log in อยู่ในขณะนี้
#### Response
```json
{
    "status": "SUCCESS",
    "data": {
        "user": {
            "id": "clpif6i6f00002juxqkiq3jjy",
            "email": "minatoa@holo.live",
            "firstName": "Minato",
            "lastName": "Aqua",
            "nickname": "Aqu-tan",
            "gender": "F"
        }
    }
}
```
### GET /user/<id> (+)
รับข้อมูลของผู้ใช้ตาม ID ที่ให้  
#### Parameters
- id: ID ของผู้ใช้ *
#### Response
Found user
```json
{
    "status": "SUCCESS",
    "data": {
        "user": {
            "id": "clpif6i6f00002juxqkiq3jjy",
            "firstName": "Minato",
            "lastName": "Aqua",
            "nickname": "Aqu-tan",
            "gender": "F"
        }
    }
}
```
User not found
```json
{
    "status": "ERROR",
    "data": {
        "error": "User not found!"
    }
}
```
### POST /user/create
ลงทะเบียนผู้ใช้
#### Request Body (application/x-www-form-urlencoded)
เป็นข้อมูลของผู้ใช้
- email: E-mail *
- password: รหัสผ่าน *
- firstName: ชื่อจริง
- lastName: นามสกุล
- nickname: ชื่อเล่น
- gender: เพศวิถี (ไม่ได้กำหนดตายตัว)
#### Response
Successful creation
```json
{
    "status": "SUCCESS",
    "data": {
        "user": {
            "id": "clpigy6jj0000zbgpixa9ptvv",
            "firstName": "Friend",
            "lastName": "A",
            "nickname": "A-chan",
            "gender": "F"
        }
    }
}
```
Missing email/password
```json
{
    "status": "ERROR",
    "data": {
        "error": "Missing email or password!"
    }
}
```
User with email already exists
```json
{
    "status": "ERROR",
    "data": {
        "error": "User with that e-mail already exists!"
    }
}
```
## การลงชื่อเข้าใช้
ข้อมูลทั้งหมดจะอยู่บน Cookie ของ Backend (ไม่ควรมีปัญหาเพราะมีโดเมนให้ใช้อยู่ ให้เป็นโดเมนเดียวกันกับ Frontend)
### POST /auth/login
#### Request Body (application/x-www-form-urlencoded)
- email: E-mail ของผู้ใช้ *
- password: Password *
#### Response
Successful login
```json
{
    "status": "SUCCESS",
    "data": {
        "user": {
            "id": "clpif6i6f00002juxqkiq3jjy",
            "email": "minatoa@holo.live",
            "firstName": "Minato",
            "lastName": "Aqua",
            "nickname": "Aqu-tan",
            "gender": "F"
        }
    }
}
```
Already logged in
```json
{
    "status": "ERROR",
    "data": {
        "error": "Already logged in!"
    }
}
```
Incorrect email/password
```json
{
    "status": "ERROR",
    "data": {
        "error": "E-mail or password incorrect!"
    }
}
```
Missing email/password
```json
{
    "status": "ERROR",
    "data": {
        "error": "Missing email or password!"
    }
}
```
### POST /auth/logout
Logout ผู้ใช้
#### Response
```json
{
    "status": "SUCCESS",
    "data": {
        "message": "Logged out!"
    }
}
```