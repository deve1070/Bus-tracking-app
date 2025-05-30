# Bus Tracking App API Documentation

## Authentication Endpoints

### POST /api/auth/register
Register a new user
- **Body**: 
  ```json
  {
    "email": "string",
    "password": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "MainAdmin | StationAdmin | Driver",
    "phoneNumber": "string",
    "username": "string"
  }
  ```

### POST /api/auth/login
Login user
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

### POST /api/auth/refresh-token
Refresh authentication token
- **Headers**: `Authorization: Bearer <refresh_token>`

### POST /api/auth/logout
Logout user
- **Headers**: `Authorization: Bearer <token>`

## Password Management

### POST /api/password/forgot
Request password reset
- **Body**:
  ```json
  {
    "email": "string"
  }
  ```

### POST /api/password/reset
Reset password
- **Body**:
  ```json
  {
    "token": "string",
    "password": "string"
  }
  ```

## Bus Management

### GET /api/bus
Get all buses
- **Query Parameters**:
  - `status`: active | inactive
  - `routeId`: string

### GET /api/bus/:id
Get bus by ID

### POST /api/bus
Create new bus
- **Body**:
  ```json
  {
    "busNumber": "string",
    "routeNumber": "string",
    "capacity": number,
    "route": {
      "stations": ["string"],
      "estimatedTime": number
    },
    "schedule": "string"
  }
  ```

### PUT /api/bus/:id
Update bus
- **Body**: Same as POST

### DELETE /api/bus/:id
Delete bus

## Route Management

### GET /api/route
Get all routes

### GET /api/route/:id
Get route by ID

### POST /api/route
Create new route
- **Body**:
  ```json
  {
    "name": "string",
    "stations": ["string"],
    "schedule": "string",
    "fare": number
  }
  ```

### PUT /api/route/:id
Update route
- **Body**: Same as POST

### DELETE /api/route/:id
Delete route

## Station Management

### GET /api/station
Get all stations

### GET /api/station/:id
Get station by ID

### POST /api/station
Create new station
- **Body**:
  ```json
  {
    "name": "string",
    "location": {
      "type": "Point",
      "coordinates": [number, number]
    }
  }
  ```

### PUT /api/station/:id
Update station
- **Body**: Same as POST

### DELETE /api/station/:id
Delete station

## Bus Assignment Requests

### GET /api/bus-assignment
Get all bus assignment requests
- **Query Parameters**:
  - `status`: pending | approved | rejected
  - `driverId`: string
  - `stationId`: string

### POST /api/bus-assignment
Create bus assignment request
- **Body**:
  ```json
  {
    "driver": "string",
    "station": "string"
  }
  ```

### PUT /api/bus-assignment/:id
Update bus assignment request status
- **Body**:
  ```json
  {
    "status": "pending | approved | rejected"
  }
  ```

## Feedback Management

### GET /api/feedback
Get all feedback
- **Query Parameters**:
  - `type`: COMPLAINT | SUGGESTION | PRAISE
  - `category`: complaint | suggestion | other
  - `sentiment`: positive | negative | neutral
  - `status`: open | resolved

### POST /api/feedback
Create feedback
- **Body**:
  ```json
  {
    "type": "COMPLAINT | SUGGESTION | PRAISE",
    "category": "complaint | suggestion | other",
    "message": "string",
    "text": "string",
    "sentiment": "positive | negative | neutral",
    "relatedBusId": "string"
  }
  ```

### PUT /api/feedback/:id
Update feedback status
- **Body**:
  ```json
  {
    "status": "open | resolved"
  }
  ```

## GPS Tracking

### POST /api/gps/update
Update bus location
- **Body**:
  ```json
  {
    "busId": "string",
    "location": {
      "type": "Point",
      "coordinates": [number, number]
    },
    "speed": number,
    "heading": number
  }
  ```

### GET /api/gps/bus/:busId
Get bus location

## Notifications

### GET /api/notification
Get user notifications
- **Query Parameters**:
  - `type`: delay | routeChange | general
  - `read`: boolean

### POST /api/notification
Create notification
- **Body**:
  ```json
  {
    "recipient": "string",
    "message": "string",
    "type": "delay | routeChange | general"
  }
  ```

### PUT /api/notification/:id/read
Mark notification as read

## Payment Management

### GET /api/payment
Get all payments
- **Query Parameters**:
  - `status`: pending | completed | failed
  - `userId`: string
  - `routeId`: string

### POST /api/payment
Create payment
- **Body**:
  ```json
  {
    "amount": number,
    "route": "string",
    "method": "Telebirr | CBEBirr | other"
  }
  ```

### PUT /api/payment/:id
Update payment status
- **Body**:
  ```json
  {
    "status": "pending | completed | failed"
  }
  ```

## Anonymous Passenger

### POST /api/anonymous-passenger
Track anonymous passenger
- **Body**:
  ```json
  {
    "deviceId": "string",
    "currentLocation": {
      "type": "Point",
      "coordinates": [number, number]
    }
  }
  ```

### GET /api/anonymous-passenger/:deviceId
Get passenger location

## Analytics

### GET /api/analytics
Get analytics data
- **Query Parameters**:
  - `type`: ROUTE | BUS | STATION | PAYMENT | FEEDBACK
  - `period`: DAILY | WEEKLY | MONTHLY
  - `startDate`: string (ISO date)
  - `endDate`: string (ISO date)
  - `routeId`: string (optional)
  - `busId`: string (optional)
  - `stationId`: string (optional)

### POST /api/analytics/calculate-daily
Trigger daily analytics calculation
- **Headers**: `Authorization: Bearer <token>`
- **Access**: Admin only

## Route Information

### GET /api/route-info
Get route information
- **Query Parameters**:
  - `routeId`: string
  - `stationId`: string

### GET /api/route-info/nearby
Get nearby routes
- **Query Parameters**:
  - `latitude`: number
  - `longitude`: number
  - `radius`: number (in meters) 