# API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
All prescription endpoints require authentication using JWT token in the Authorization header.

## Environment Variables
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Authentication Endpoints

### 1. Signup
- **Endpoint:** `POST /api/auth/signup`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "username": "testuser",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User created successfully",
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "testuser"
    }
  }
  ```

### 2. Login
- **Endpoint:** `POST /api/auth/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login successful",
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "testuser"
    }
  }
  ```

## Prescription Endpoints

### 1. Create Prescription
- **Endpoint:** `POST /api/prescriptions`
- **Headers:**
  ```
  Authorization: Bearer jwt_token_here
  Content-Type: multipart/form-data
  ```
- **Request Body:**
  ```
  prescriptionImage: (file) - Optional
  tabletNames: ["Paracetamol", "Ibuprofen"] - Array of strings
  description: "For fever and pain"
  instructions: "Take after meals"
  dosage: "500mg"
  medicationSchedule: "Every 6 hours"
  startDate: "2024-03-20"
  endDate: "2024-03-27"
  ```
- **Response:**
  ```json
  {
    "message": "Prescription created successfully",
    "prescription": {
      "id": "prescription_id",
      "tabletNames": ["Paracetamol", "Ibuprofen"],
      "description": "For fever and pain",
      "instructions": "Take after meals",
      "dosage": "500mg",
      "medicationSchedule": "Every 6 hours",
      "startDate": "2024-03-20T00:00:00.000Z",
      "endDate": "2024-03-27T00:00:00.000Z",
      "prescriptionImage": {
        "url": "cloudinary_url",
        "publicId": "cloudinary_public_id"
      },
      "isActive": true,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  }
  ```

### 2. Get All Prescriptions
- **Endpoint:** `GET /api/prescriptions`
- **Headers:**
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Response:**
  ```json
  [
    {
      "id": "prescription_id",
      "tabletNames": ["Paracetamol", "Ibuprofen"],
      "description": "For fever and pain",
      "instructions": "Take after meals",
      "dosage": "500mg",
      "medicationSchedule": "Every 6 hours",
      "startDate": "2024-03-20T00:00:00.000Z",
      "endDate": "2024-03-27T00:00:00.000Z",
      "prescriptionImage": {
        "url": "cloudinary_url",
        "publicId": "cloudinary_public_id"
      },
      "isActive": true,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ]
  ```

### 3. Get Single Prescription
- **Endpoint:** `GET /api/prescriptions/:id`
- **Headers:**
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Response:**
  ```json
  {
    "id": "prescription_id",
    "tabletNames": ["Paracetamol", "Ibuprofen"],
    "description": "For fever and pain",
    "instructions": "Take after meals",
    "dosage": "500mg",
    "medicationSchedule": "Every 6 hours",
    "startDate": "2024-03-20T00:00:00.000Z",
    "endDate": "2024-03-27T00:00:00.000Z",
    "prescriptionImage": {
      "url": "cloudinary_url",
      "publicId": "cloudinary_public_id"
    },
    "isActive": true,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
  ```

### 4. Update Prescription
- **Endpoint:** `PUT /api/prescriptions/:id`
- **Headers:**
  ```
  Authorization: Bearer jwt_token_here
  Content-Type: multipart/form-data
  ```
- **Request Body:**
  ```
  prescriptionImage: (file) - Optional
  tabletNames: ["Updated Tablet 1", "Updated Tablet 2"] - Array of strings
  description: "Updated description"
  instructions: "Updated instructions"
  dosage: "Updated dosage"
  medicationSchedule: "Updated schedule"
  startDate: "2024-03-20"
  endDate: "2024-03-27"
  isActive: true/false
  ```
- **Response:**
  ```json
  {
    "message": "Prescription updated successfully",
    "prescription": {
      "id": "prescription_id",
      "tabletNames": ["Updated Tablet 1", "Updated Tablet 2"],
      "description": "Updated description",
      "instructions": "Updated instructions",
      "dosage": "Updated dosage",
      "medicationSchedule": "Updated schedule",
      "startDate": "2024-03-20T00:00:00.000Z",
      "endDate": "2024-03-27T00:00:00.000Z",
      "prescriptionImage": {
        "url": "cloudinary_url",
        "publicId": "cloudinary_public_id"
      },
      "isActive": true,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  }
  ```

### 5. Delete Prescription
- **Endpoint:** `DELETE /api/prescriptions/:id`
- **Headers:**
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Response:**
  ```json
  {
    "message": "Prescription deleted successfully"
  }
  ```

## Error Responses

### 1. Authentication Error (401)
```json
{
  "message": "Authentication required"
}
```

### 2. Not Found Error (404)
```json
{
  "message": "Prescription not found"
}
```

### 3. Server Error (500)
```json
{
  "message": "Error message",
  "error": "Detailed error message"
}
```

## File Upload Specifications
- Supported file formats: jpg, jpeg, png, pdf
- Maximum file size: 10MB (default multer limit)
- Images are automatically resized to max 1000x1000 pixels
- Files are stored in the 'prescriptions' folder on Cloudinary

## Example Usage with curl

### Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Prescription
```bash
curl -X POST http://localhost:3000/api/prescriptions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "prescriptionImage=@/path/to/your/image.jpg" \
  -F "tabletNames=[]" \
  -F "description=For fever and pain" \
  -F "instructions=Take after meals" \
  -F "dosage=500mg" \
  -F "medicationSchedule=Every 6 hours" \
  -F "startDate=2024-03-20" \
  -F "endDate=2024-03-27"
```

### Get All Prescriptions
```bash
curl http://localhost:3000/api/prescriptions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Single Prescription
```bash
curl http://localhost:3000/api/prescriptions/PRESCRIPTION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Prescription
```bash
curl -X PUT http://localhost:3000/api/prescriptions/PRESCRIPTION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "prescriptionImage=@/path/to/your/new/image.jpg" \
  -F "tabletNames=[]" \
  -F "description=Updated description" \
  -F "instructions=Updated instructions" \
  -F "dosage=Updated dosage" \
  -F "medicationSchedule=Updated schedule" \
  -F "startDate=2024-03-20" \
  -F "endDate=2024-03-27"
```

### Delete Prescription
```bash
curl -X DELETE http://localhost:3000/api/prescriptions/PRESCRIPTION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
``` 