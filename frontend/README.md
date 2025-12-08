# Rewards Program Frontend

React frontend for the Rewards Program Management System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
REACT_APP_API_URL=http://localhost:8000
```

3. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Features

- **Login Page**: Role-based login (Admin, Organization, Business)
- **Admin Dashboard**: Create businesses, view organizations and businesses
- **Organization Dashboard**: Create business logins, manage businesses
- **Business Dashboard**: Navigation hub for business features
- **Upload Page**: Upload Excel/CSV files, preview and approve transactions
- **Transactions Page**: View transactions in list or summary mode, filter by phone/license

## Routes

- `/` - Login page
- `/admin` - Admin dashboard (protected)
- `/org/dashboard` - Organization dashboard (protected)
- `/business/dashboard` - Business dashboard (protected)
- `/business/upload` - Upload transactions (protected)
- `/business/transactions` - View transactions (protected)

## File Structure

```
src/
  ├── components/
  │   └── ProtectedRoute.js    # Route protection component
  ├── pages/
  │   ├── LoginPage.js         # Login page
  │   ├── AdminPage.js         # Admin dashboard
  │   ├── OrgDashboard.js      # Organization dashboard
  │   ├── BusinessDashboard.js # Business dashboard
  │   ├── UploadPage.js        # Transaction upload page
  │   └── TransactionsPage.js  # Transactions view page
  ├── services/
  │   └── api.js               # API service functions
  ├── App.js                   # Main app component with routing
  ├── index.js                 # Entry point
  └── index.css                # Global styles
```

