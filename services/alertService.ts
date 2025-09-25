// Alert service for Twin City Updates
export interface Alert {
  id: string;
  type: 'weather' | 'traffic' | 'emergency' | 'maintenance' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location?: string;
  startTime: string;
  endTime?: string;
  isActive: boolean;
  icon: string;
  color: string;
  actions?: AlertAction[];
}

export interface AlertAction {
  id: string;
  label: string;
  action: string;
  type: 'link' | 'phone' | 'info';
}

// Mock alert data
const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'weather',
    priority: 'high',
    title: 'Heavy Rain Expected',
    description: '100% chance of heavy rainfall expected in Twin Cities area from 2 PM to 8 PM today. Flash flooding possible in low-lying areas.',
    location: 'Twin Cities Area',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    icon: '🌧️',
    color: '#3b82f6',
    actions: [
      {
        id: '1',
        label: 'Weather Details',
        action: 'weather',
        type: 'link'
      },
      {
        id: '2',
        label: 'Emergency Contacts',
        action: 'tel:112',
        type: 'phone'
      }
    ]
  },
  {
    id: '2',
    type: 'traffic',
    priority: 'medium',
    title: 'Road Closure - Main Street',
    description: 'Main Street between 1st and 3rd Avenue is closed for emergency repairs. Use alternative routes via Elm Street or Oak Avenue.',
    location: 'Main Street (1st - 3rd Ave)',
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    icon: '🚧',
    color: '#f59e0b',
    actions: [
      {
        id: '3',
        label: 'View Map',
        action: 'maps',
        type: 'link'
      },
      {
        id: '4',
        label: 'Traffic Info',
        action: 'traffic',
        type: 'link'
      }
    ]
  },
  {
    id: '3',
    type: 'emergency',
    priority: 'critical',
    title: 'Emergency Services Alert',
    description: 'Emergency services are responding to an incident in downtown area. Please avoid the area and follow official instructions.',
    location: 'Downtown Area',
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    icon: '🚨',
    color: '#dc2626',
    actions: [
      {
        id: '5',
        label: 'Emergency Info',
        action: 'emergency',
        type: 'link'
      },
      {
        id: '6',
        label: 'Call 911',
        action: 'tel:911',
        type: 'phone'
      }
    ]
  },
  {
    id: '4',
    type: 'maintenance',
    priority: 'low',
    title: 'Water Service Maintenance',
    description: 'Scheduled water service maintenance on Oak Street tomorrow from 9 AM to 3 PM. Low water pressure expected.',
    location: 'Oak Street',
    startTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    icon: '🔧',
    color: '#10b981',
    actions: [
      {
        id: '7',
        label: 'Service Info',
        action: 'maintenance',
        type: 'link'
      }
    ]
  },
  {
    id: '5',
    type: 'weather',
    priority: 'medium',
    title: 'Heat Wave Warning',
    description: 'Temperatures expected to reach 38°C today. Stay hydrated and avoid prolonged sun exposure.',
    location: 'Twin Cities Area',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    icon: '🌡️',
    color: '#f97316',
    actions: [
      {
        id: '8',
        label: 'Weather Forecast',
        action: 'weather',
        type: 'link'
      },
      {
        id: '9',
        label: 'Health Tips',
        action: 'health',
        type: 'link'
      }
    ]
  }
];

// Alert service functions
export const alertService = {
  // Get active alerts
  getActiveAlerts: async (): Promise<Alert[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter active alerts and sort by priority
    const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
    return mockAlerts
      .filter(alert => alert.isActive)
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  },

  // Get alerts by type
  getAlertsByType: async (type: Alert['type']): Promise<Alert[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockAlerts.filter(alert => alert.type === type && alert.isActive);
  },

  // Get alerts by priority
  getAlertsByPriority: async (priority: Alert['priority']): Promise<Alert[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockAlerts.filter(alert => alert.priority === priority && alert.isActive);
  },

  // Get priority color
  getPriorityColor: (priority: Alert['priority']): string => {
    const colors = {
      'critical': '#dc2626', // Red
      'high': '#f59e0b',     // Orange
      'medium': '#3b82f6',   // Blue
      'low': '#10b981'       // Green
    };
    return colors[priority];
  },

  // Get priority label
  getPriorityLabel: (priority: Alert['priority']): string => {
    const labels = {
      'critical': 'CRITICAL',
      'high': 'HIGH',
      'medium': 'MEDIUM',
      'low': 'LOW'
    };
    return labels[priority];
  },

  // Get type label
  getTypeLabel: (type: Alert['type']): string => {
    const labels = {
      'weather': 'WEATHER',
      'traffic': 'TRAFFIC',
      'emergency': 'EMERGENCY',
      'maintenance': 'MAINTENANCE',
      'general': 'GENERAL'
    };
    return labels[type];
  },

  // Format time remaining
  getTimeRemaining: (endTime: string): string => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Expired';
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  },

  // Check if alert is urgent (expires within 1 hour)
  isUrgent: (alert: Alert): boolean => {
    if (!alert.endTime) return false;
    const now = new Date();
    const end = new Date(alert.endTime);
    const diff = end.getTime() - now.getTime();
    return diff <= 60 * 60 * 1000 && diff > 0; // 1 hour in milliseconds
  }
};
