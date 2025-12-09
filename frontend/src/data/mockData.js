// Mock Users (Customers)
export const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    password: "customer123",
    phone: "123-456-7890",
    points: 450,
    memberSince: "2024-01-15",
    role: "customer",
    totalSpent: 1250
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    password: "customer123",
    phone: "098-765-4321",
    points: 720,
    memberSince: "2023-11-20",
    role: "customer",
    totalSpent: 2100
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    password: "customer123",
    phone: "555-123-4567",
    points: 320,
    memberSince: "2024-03-10",
    role: "customer",
    totalSpent: 890
  },
  {
    id: 4,
    name: "Sarah Williams",
    email: "sarah@example.com",
    password: "customer123",
    phone: "555-987-6543",
    points: 890,
    memberSince: "2023-08-05",
    role: "customer",
    totalSpent: 3200
  }
];

// Organization User (Highest Level)
export const organizationUser = {
  id: 1000,
  name: "Organization Manager",
  email: "org@sparkle.com",
  password: "org123",
  role: "organization",
  totalLocations: 5,
  totalRevenue: 125000
};

// Admin User
export const adminUser = {
  id: 999,
  name: "Admin",
  email: "admin@sparkle.com",
  password: "admin123",
  role: "admin"
};

// Mock Offers
export const offers = [
  {
    id: 1,
    title: "Basic Wash - 50% Off",
    description: "Get 50% off on your next basic wash service",
    discount: 50,
    pointsRequired: 100,
    validUntil: "2025-12-31",
    image: "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Basic+Wash",
    active: true
  },
  {
    id: 2,
    title: "Premium Wash Free",
    description: "Redeem points for a free premium wash with wax",
    discount: 100,
    pointsRequired: 500,
    validUntil: "2025-12-31",
    image: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Premium+Wash",
    active: true
  },
  {
    id: 3,
    title: "Interior Detailing 30% Off",
    description: "Save 30% on complete interior detailing service",
    discount: 30,
    pointsRequired: 200,
    validUntil: "2025-06-30",
    image: "https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Interior+Detail",
    active: true
  },
  {
    id: 4,
    title: "Monthly Membership Discount",
    description: "Get 20% off monthly unlimited wash membership",
    discount: 20,
    pointsRequired: 150,
    validUntil: "2025-12-31",
    image: "https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Membership",
    active: true
  }
];

// Mock Transactions
export const transactions = [
  {
    id: 1,
    userId: 1,
    userName: "John Doe",
    type: "wash",
    service: "Basic Wash",
    amount: 25,
    pointsEarned: 25,
    date: "2024-11-28",
    status: "completed"
  },
  {
    id: 2,
    userId: 2,
    userName: "Jane Smith",
    type: "wash",
    service: "Premium Wash",
    amount: 45,
    pointsEarned: 45,
    date: "2024-11-27",
    status: "completed"
  },
  {
    id: 3,
    userId: 1,
    userName: "John Doe",
    type: "redeem",
    service: "50% Off Basic Wash",
    amount: 0,
    pointsEarned: -100,
    date: "2024-11-25",
    status: "completed"
  },
  {
    id: 4,
    userId: 3,
    userName: "Mike Johnson",
    type: "wash",
    service: "Express Wash",
    amount: 15,
    pointsEarned: 15,
    date: "2024-11-26",
    status: "completed"
  },
  {
    id: 5,
    userId: 4,
    userName: "Sarah Williams",
    type: "wash",
    service: "Deluxe Wash + Wax",
    amount: 60,
    pointsEarned: 60,
    date: "2024-11-24",
    status: "completed"
  },
  {
    id: 6,
    userId: 2,
    userName: "Jane Smith",
    type: "redeem",
    service: "Free Premium Wash",
    amount: 0,
    pointsEarned: -500,
    date: "2024-11-20",
    status: "completed"
  }
];

// Points Conversion Rate
export const pointsConfig = {
  conversionRate: 1, // $1 spent = 1 point
  redeemRate: 100, // 100 points = $10 discount
  minimumRedeem: 50
};

// Wash Services
export const services = [
  {
    id: 1,
    name: "Express Wash",
    price: 15,
    duration: "10 min"
  },
  {
    id: 2,
    name: "Basic Wash",
    price: 25,
    duration: "20 min"
  },
  {
    id: 3,
    name: "Premium Wash",
    price: 45,
    duration: "30 min"
  },
  {
    id: 4,
    name: "Deluxe Wash + Wax",
    price: 60,
    duration: "45 min"
  },
  {
    id: 5,
    name: "Interior Detailing",
    price: 80,
    duration: "60 min"
  }
];