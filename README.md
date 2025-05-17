Skip to content
Navigation Menu
deve1070
Bus-tracking-app

Type / to search
Code
Issues
Pull requests
Actions
Projects
Wiki
Security
Insights
Owner avatar
Bus-tracking-app
Public
deve1070/Bus-tracking-app
Go to file
t
This branch is 2 commits ahead of main.
Name		
deve1070
deve1070
update the readme
d1ad9f6
 · 
2 days ago
server
division of responsibility and set up
2 days ago
web
division of responsibility and set up
2 days ago
.env
division of responsibility and set up
2 days ago
README.md
update the readme
2 days ago
Repository files navigation
README
Tech Stack Web Frontend: React, Tailwind CSS, Bootstrap, Google Maps JavaScript API, Chart.js, Axios, Socket.IO-client.

Mobile Frontend: React Native, react-native-maps, react-native-nfc-manager, twrnc, i18n-js, React Navigation, Axios, Socket.IO-client.

Backend: Node.js, Express, Socket.IO, Mongoose, JWT, bcrypt, natural (sentiment analysis).

Database: MongoDB (Atlas).

Geolocation: Google Maps API (JavaScript API, Distance Matrix, react-native-maps).

Notifications: FCM (mobile), Web Push API (web).

Payments: Telebirr/CBE Birr API.

Testing: Jest, React Testing Library, Postman, Cypress. CI/CD: GitHub Actions.

Dagmawi: Web Frontend (Admin Web App) Responsibilities:

Develop the React-based admin dashboard with Tailwind CSS and Bootstrap. Implement pages: Login, Dashboard, StationManagement, BusManagement, UserDriverManagement, RealTimeMonitoring, MessagingNotifications, FeedbackManagement, Analytics. Build components: MapView (Google Maps JavaScript API), DataTable, ChartComponent (Chart.js), NotificationForm, FeedbackCard.

Habte :web Fronted(admin Web App) Integrate with backend APIs (Axios) for data fetching and updates. Handle real-time bus tracking and notifications via Socket.IO-client. Implement role-based authentication (Main Admin, Station Admin) using JWT. Create visualizations for bus performance, ridership, and feedback analytics.

from Mobile Frontend(Passenger Mobile App) Responsibilities: Implement screens: PaymentScreen, ProfileScreen. Build components: MapComponent (react-native-maps), RouteCard, FeedbackForm, PaymentForm, NotificationBanner.

Biruk: Mobile Frontend (Passenger Mobile App) Develop the React Native app for iOS and Android. Implement screens: HomeScreen, RouteScreen, FeedbackScreen, NotificationScreen Integrate Google Maps API for real-time bus tracking and route visualization. Implement payment features: fare estimation, QR/NFC payments (react-native-nfc-manager), payment history. Set up Firebase Cloud Messaging (FCM) for push notifications. Add multilingual support with i18n-js (if needed). Ensure simple, user-friendly UI with twrnc. Integrate with backend APIs (Axios) and Socket.IO for real-time updates.

Dawit: Backend (APIs and Real-time Services) Responsibilities:

Develop Node.js/Express backend with REST APIs for: Authentication (POST /api/auth/login, POST /api/auth/password-reset). Stations (POST/PUT/DELETE /api/stations,POST /api/stations/assign-admin). Buses (POST/PUT/DELETE /api/buses, PUT /api/buses/:id/route, PUT /api/buses/:id/status). Users/Drivers (POST/PUT /api/drivers, POST /api/drivers/assign-bus). Real-time tracking (GET /api/buses/live, PUT /api/buses/:id/location). Notifications (POST/GET /api/notifications). Feedback (POST/GET/PUT /api/feedback). Analytics (GET /api/analytics/performance, GET /api/analytics/ridership). Payments (POST /api/payments, GET /api/payments/history). Implement Socket.IO for real-time bus location updates and notifications. Integrate Google Maps Distance Matrix API for ETA calculations. Set up payment gateway (e.g., Telebirr, CBE Birr) for mobile app. Implement JWT authentication with role-based access. Add sentiment analysis for feedback using natural or similar library. Ensure security: HTTPS, input sanitization, rate limiting.

About
No description, website, or topics provided.
Resources
 Readme
 Activity
Stars
 0 stars
Watchers
 1 watching
Forks
 1 fork
Report repository
Releases
No releases published
Create a new release
Packages
No packages published
Publish your first package
Footer
© 2025 GitHub, Inc.
Footer navigation
Terms
Privacy
Security
Status
Docs
Contact
Manage cookies
Do not share my personal information
deve1070/Bus-tracking-app at dawit