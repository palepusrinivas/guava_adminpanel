export interface Driver {
  id: string;
  name: string;
  rides: number;
  earnings: number;
  rating: number;
  image?: string;
}

export interface Transaction {
  id: string;
  amount: string;
  type: string;
  date: string;
  icon?: string;
}

export interface Trip {
  id: string;
  user: string;
  trips: number;
  status: string;
  rating: number;
  time: string;
}

export interface DashboardState {
  stats: {
    data: {
      totalUsers: number;
      activeDrivers: number;
      totalRides: number;
      totalRevenue: number;
      percentageChanges: {
        users: number;
        drivers: number;
        rides: number;
        revenue: number;
      };
    } | null;
    isLoading: boolean;
    error: string | null;
  };
  recentActivities: {
    items: any[];
    isLoading: boolean;
    error: string | null;
  };
  leaderboard: {
    drivers: Driver[];
    isLoading: boolean;
    error: string | null;
  };
  transactions: {
    items: Transaction[];
    isLoading: boolean;
    error: string | null;
  };
  trips: {
    items: Trip[];
    isLoading: boolean;
    error: string | null;
  };
}