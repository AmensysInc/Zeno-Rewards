# Rewards Program Management System

A comprehensive rewards program management system with role-based access control for Admin, Organizations, and Businesses.

## Features

### Admin
- Create and manage businesses
- Track all organizations
- View all businesses across organizations

### Organizations
- Create multiple business logins for their organization
- View dashboard with business count
- Manage their businesses

### Businesses
- Dashboard with quick actions
- Upload transactions via Excel/CSV files
- Preview transactions before approval
- View and filter transactions
- Transaction summary grouped by phone number and license plate

## Backend Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables (create `.env` file):
```
DATABASE_URL=postgresql://admin:password@localhost:5432/rewards
SECRET_KEY=your-secret-key-here
```

3. Start the database (using Docker Compose):
```bash
docker-compose up -d db
```

4. Run the backend:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in frontend directory:
```
REACT_APP_API_URL=http://localhost:8000
```

4. Start the frontend:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

## Database Schema

- **Admin**: Admin users who can create businesses
- **Organization**: Organizations that can create multiple businesses
- **Business**: Businesses that can upload and manage transactions
- **Transaction**: Transactions with phone number and license plate as identifiers
- **Customer**: Customer information (for future use)

## Transaction File Format

When uploading transactions, the file should contain the following columns:
- `phone_number` (required)
- `license_plate` (required)
- `date` (required)
- `description` (optional)
- `quantity` (optional, default: 1)
- `amount` (optional, default: 0)

Supported formats: Excel (.xlsx, .xls) or CSV

## Security

- All passwords are hashed using bcrypt
- JWT tokens for authentication
- Role-based access control
- Data isolation between organizations and businesses

