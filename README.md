# Bus Tracking App

## Tech Stack
- **Web Frontend:** React, Tailwind CSS, Bootstrap, Google Maps JavaScript API, Chart.js, Axios, Socket.IO-client
- **Mobile Frontend:** React Native, react-native-maps, react-native-nfc-manager, twrnc, i18n-js, React Navigation, Axios, Socket.IO-client
- **Backend:** Node.js, Express, Socket.IO, Mongoose, JWT, bcrypt, natural (sentiment analysis)
- **Database:** MongoDB (Atlas)
- **Geolocation:** Google Maps API (JavaScript API, Distance Matrix, react-native-maps)
- **Notifications:** Firebase Cloud Messaging (FCM), Web Push API
- **Payments:** Telebirr/CBE Birr API
- **Testing:** Jest, React Testing Library, Postman, Cypress
- **CI/CD:** GitHub Actions

---

## Backend Features (Node.js/Express)
- **Authentication:**
  - Register, login, JWT-based auth, role-based access
  - Password reset and change (with Firebase integration)
- **Stations:**
  - CRUD, assign admin, view stations
- **Buses:**
  - CRUD, assign to route, update status/location, view live buses
- **Users/Drivers:**
  - CRUD, assign bus, view drivers
- **Routes:**
  - View all routes, buses on a route, and route info for a bus
- **Anonymous Passengers:**
  - View nearby stations, buses for a route, make payments, view payment history
- **Notifications:**
  - Send to device, multiple devices, or topic (driver, route, station, etc.) via Firebase
  - Subscribe/unsubscribe to topics
- **Feedback:**
  - Submit, view, and update feedback; sentiment analysis
- **Analytics:**
  - Performance, ridership, feedback analytics
- **Payments:**
  - Mobile wallet integration, payment history, QR/NFC support

---

## Key API Endpoints

### Auth
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login
- `GET /api/auth/profile` — Get current user profile
- `PUT /api/auth/profile` — Update profile

### Password Management
- `POST /api/password/forgot` — Send password reset email
- `POST /api/password/reset` — Reset password with token
- `POST /api/password/change` — Change password (authenticated)

### Anonymous Passenger
- `GET /api/anonymous/nearby-stations?lat={lat}&lng={lng}&maxDistance={meters}`
- `GET /api/anonymous/route-buses?route={routeId}`
- `POST /api/anonymous/payment` — Make payment
- `GET /api/anonymous/payment-history/:deviceId`

### Notifications
- `POST /api/notifications/driver` — Notify a driver
- `POST /api/notifications/drivers` — Notify all drivers
- `POST /api/notifications/route` — Notify route passengers
- `POST /api/notifications/station` — Notify station passengers
- `POST /api/notifications/subscribe` — Subscribe device to topic
- `POST /api/notifications/unsubscribe` — Unsubscribe device from topic

### Buses & Routes
- `GET /api/buses/:busId/route-info` — Get route info for a bus
- `GET /api/routes/:routeNumber/buses` — Get all buses on a route
- `GET /api/routes` — Get all routes with their buses

### Payments
- `POST /api/payments` — Make payment
- `GET /api/payments/history` — Get payment history

---

## Setup & Configuration

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Environment variables:**
   - Create a `.env` file in the root with:
     - `MONGODB_URI=...`
     - `JWT_SECRET=...`
     - `JWT_EXPIRES_IN=1d`
     - `FIREBASE_CONFIG=...` (or use `server/config/firebase-service-account.json`)
     - `FRONTEND_URL=...`
4. **Firebase:**
   - Place your Firebase service account JSON in `server/config/firebase-service-account.json`
5. **Run the server:**
   ```bash
   npm run dev
   ```

---

## Contributors
- **Dagmawi:** Web Frontend (Admin Web App)
- **Habte:** Web Frontend (Admin Web App)
- **Biruk:** Mobile Frontend (Passenger Mobile App)
- **Dawit:** Backend (APIs and Real-time Services)

---

## Notes
- Ensure all sensitive keys are kept out of version control.
- For production, set up HTTPS, input validation, and rate limiting.
- See code comments and controller files for more details on each endpoint and business logic.

Dagmawi: Web Frontend (Admin Web App)
Responsibilities:

Develop the React-based admin dashboard with Tailwind CSS and Bootstrap.
Implement pages: Login, Dashboard, StationManagement, BusManagement, UserDriverManagement, RealTimeMonitoring, MessagingNotifications, FeedbackManagement, Analytics.
Build components: MapView (Google Maps JavaScript API), DataTable, ChartComponent (Chart.js), NotificationForm, FeedbackCard.

Habte :web Fronted(admin Web App)
Integrate with backend APIs (Axios) for data fetching and updates.
Handle real-time bus tracking and notifications via Socket.IO-client.
Implement role-based authentication (Main Admin, Station Admin) using JWT.
Create visualizations for bus performance, ridership, and feedback analytics.

from Mobile Frontend(Passenger Mobile App)
Responsibilities:
Implement screens:
PaymentScreen, ProfileScreen.
Build components: MapComponent (react-native-maps), RouteCard, FeedbackForm, PaymentForm, NotificationBanner.

Biruk: Mobile Frontend (Passenger Mobile App)
Develop the React Native app for iOS and Android.
Implement screens: HomeScreen, RouteScreen, FeedbackScreen, NotificationScreen
Integrate Google Maps API for real-time bus tracking and route visualization.
Implement payment features: fare estimation, QR/NFC payments (react-native-nfc-manager), payment history.
Set up Firebase Cloud Messaging (FCM) for push notifications.
Add multilingual support with i18n-js (if needed).
Ensure simple, user-friendly UI with twrnc.
Integrate with backend APIs (Axios) and Socket.IO for real-time updates.

Dawit: Backend (APIs and Real-time Services)
Responsibilities:

Develop Node.js/Express backend with REST APIs for:
Authentication (POST /api/auth/login, POST /api/auth/password-reset).
Stations (POST/PUT/DELETE /api/stations,POST /api/stations/assign-admin).
Buses (POST/PUT/DELETE /api/buses, PUT /api/buses/:id/route, PUT /api/buses/:id/status).
Users/Drivers (POST/PUT /api/drivers, POST /api/drivers/assign-bus).
Real-time tracking (GET /api/buses/live, PUT /api/buses/:id/location).
Notifications (POST/GET /api/notifications).
Feedback (POST/GET/PUT /api/feedback).
Analytics (GET /api/analytics/performance, GET /api/analytics/ridership).
Payments (POST /api/payments, GET /api/payments/history).
Implement Socket.IO for real-time bus location updates and notifications.
Integrate Google Maps Distance Matrix API for ETA calculations.
Set up payment gateway (e.g., Telebirr, CBE Birr) for mobile app.
Implement JWT authentication with role-based access.
Add sentiment analysis for feedback using natural or similar library.
Ensure security: HTTPS, input sanitization, rate limiting.