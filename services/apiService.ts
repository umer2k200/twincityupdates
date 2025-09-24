import axios from 'axios';

export interface SocialUpdate {
  id: string;
  source: 'whatsapp' | 'twitter' | 'facebook';
  title: string;
  content: string;
  timestamp: string;
  hasMedia: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'link';
  author?: string;
  likes?: number;
  shares?: number;
}

// Mock API responses for testing
const mockUpdates: SocialUpdate[] = [
  {
    id: '1',
    source: 'twitter',
    title: 'City Council Meeting Update',
    content: 'The city council approved the new community center project with unanimous support. Construction begins next month with an estimated completion date of December 2024.',
    timestamp: '2024-01-15T10:30:00Z',
    hasMedia: false,
    author: '@TwinCityGov',
    likes: 45,
    shares: 12,
  },
  {
    id: '2',
    source: 'facebook',
    title: 'Public Transportation Schedule Changes',
    content: 'Metro bus routes 15 and 22 will have temporary schedule changes due to road construction on Main Street. Alternative routes have been established.',
    timestamp: '2024-01-15T08:15:00Z',
    hasMedia: true,
    mediaUrl: 'https://images.pexels.com/photos/1756957/pexels-photo-1756957.jpeg?auto=compress&cs=tinysrgb&w=800',
    mediaType: 'image',
    author: 'Twin City Transit',
    likes: 23,
    shares: 8,
  },
  {
    id: '3',
    source: 'whatsapp',
    title: 'Emergency Weather Alert',
    content: 'Severe thunderstorm warning issued for Twin City area. Residents advised to stay indoors until 8 PM. Emergency shelters are available at City Hall and Community Center.',
    timestamp: '2024-01-15T06:45:00Z',
    hasMedia: false,
    author: 'Emergency Services',
  },
  {
    id: '4',
    source: 'twitter',
    title: 'Local Business Spotlight',
    content: 'Congratulations to Twin City Bakery for winning the Regional Small Business Award! Their commitment to the community and quality products makes us proud.',
    timestamp: '2024-01-14T16:20:00Z',
    hasMedia: true,
    mediaUrl: 'https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=800',
    mediaType: 'image',
    author: '@TwinCityBiz',
    likes: 78,
    shares: 25,
  },
  {
    id: '5',
    source: 'facebook',
    title: 'Community Event Announcement',
    content: 'Join us for the annual Twin City Summer Festival on July 15-17! Live music, local vendors, food trucks, and family activities. Free admission for all residents.',
    timestamp: '2024-01-14T14:10:00Z',
    hasMedia: true,
    mediaUrl: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800',
    mediaType: 'image',
    author: 'Twin City Events',
    likes: 156,
    shares: 89,
  },
  {
    id: '6',
    source: 'whatsapp',
    title: 'Water Service Maintenance',
    content: 'Scheduled water service maintenance on Oak Street between 9 AM - 3 PM tomorrow. Residents may experience low water pressure during this time.',
    timestamp: '2024-01-14T12:30:00Z',
    hasMedia: false,
    author: 'Public Works',
  },
];

class ApiService {
  private baseUrl = 'https://api.twincityupdates.com'; // Replace with actual API URL
  
  // WhatsApp Business API integration
  async fetchWhatsAppUpdates(): Promise<SocialUpdate[]> {
    try {
      // In production, replace with actual WhatsApp Business API call
      // const response = await axios.get(`${this.baseUrl}/whatsapp/messages`, {
      //   headers: {
      //     'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      //     'Content-Type': 'application/json',
      //   },
      // });
      
      // For now, return mock data filtered by WhatsApp
      return mockUpdates.filter(update => update.source === 'whatsapp');
    } catch (error) {
      console.error('Error fetching WhatsApp updates:', error);
      return mockUpdates.filter(update => update.source === 'whatsapp');
    }
  }

  // Twitter API integration
  async fetchTwitterUpdates(): Promise<SocialUpdate[]> {
    try {
      // In production, replace with actual Twitter API v2 call
      // const response = await axios.get(`${this.baseUrl}/twitter/tweets`, {
      //   headers: {
      //     'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
      //     'Content-Type': 'application/json',
      //   },
      //   params: {
      //     'tweet.fields': 'created_at,public_metrics,attachments',
      //     'user.fields': 'username,name',
      //     'expansions': 'author_id,attachments.media_keys',
      //   },
      // });
      
      return mockUpdates.filter(update => update.source === 'twitter');
    } catch (error) {
      console.error('Error fetching Twitter updates:', error);
      return mockUpdates.filter(update => update.source === 'twitter');
    }
  }

  // Facebook Graph API integration
  async fetchFacebookUpdates(): Promise<SocialUpdate[]> {
    try {
      // In production, replace with actual Facebook Graph API call
      // const response = await axios.get(`${this.baseUrl}/facebook/posts`, {
      //   headers: {
      //     'Authorization': `Bearer ${FACEBOOK_ACCESS_TOKEN}`,
      //     'Content-Type': 'application/json',
      //   },
      //   params: {
      //     'fields': 'id,message,created_time,attachments,likes.summary(true),shares',
      //   },
      // });
      
      return mockUpdates.filter(update => update.source === 'facebook');
    } catch (error) {
      console.error('Error fetching Facebook updates:', error);
      return mockUpdates.filter(update => update.source === 'facebook');
    }
  }

  // Fetch all updates from all sources
  async fetchAllUpdates(): Promise<SocialUpdate[]> {
    try {
      const [whatsappUpdates, twitterUpdates, facebookUpdates] = await Promise.all([
        this.fetchWhatsAppUpdates(),
        this.fetchTwitterUpdates(),
        this.fetchFacebookUpdates(),
      ]);

      const allUpdates = [...whatsappUpdates, ...twitterUpdates, ...facebookUpdates];
      
      // Sort by timestamp (newest first)
      return allUpdates.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Error fetching all updates:', error);
      return mockUpdates.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }
  }

  // Search updates by keyword
  searchUpdates(updates: SocialUpdate[], query: string): SocialUpdate[] {
    if (!query.trim()) return updates;
    
    const searchTerm = query.toLowerCase();
    return updates.filter(update => 
      update.title.toLowerCase().includes(searchTerm) ||
      update.content.toLowerCase().includes(searchTerm) ||
      update.author?.toLowerCase().includes(searchTerm)
    );
  }

  // Filter updates by source
  filterUpdatesBySource(updates: SocialUpdate[], source: string): SocialUpdate[] {
    if (source === 'all') return updates;
    return updates.filter(update => update.source === source);
  }
}

export const apiService = new ApiService();