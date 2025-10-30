import axios from 'axios';
import { newsApiService } from './newsApiService';
import { twitterService } from './twitterService';

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
  category?: string;
  hasLocation?: boolean;
  location?: {
    name: string;
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  sourceUrl?: string;
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
    category: 'emergency',
    hasLocation: true,
    location: {
      name: 'Twin City Area',
      address: 'Twin City, State',
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    }
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
    category: 'maintenance',
    hasLocation: true,
    location: {
      name: 'Oak Street',
      address: 'Oak Street, Twin City',
      coordinates: {
        latitude: 40.7589,
        longitude: -73.9851
      }
    }
  },
  {
    id: '7',
    source: 'twitter',
    title: 'Road Closure Alert - Main Street',
    content: 'Main Street between 1st and 3rd Avenue will be closed for emergency repairs starting tomorrow at 6 AM. Expected duration: 2-3 days. Use alternate routes via Elm Street.',
    timestamp: '2024-01-14T09:45:00Z',
    hasMedia: false,
    author: '@TwinCityTraffic',
    category: 'traffic',
    hasLocation: true,
    location: {
      name: 'Main Street (1st - 3rd Ave)',
      address: 'Main Street, Twin City',
      coordinates: {
        latitude: 40.7505,
        longitude: -73.9934
      }
    },
    likes: 34,
    shares: 18,
  },
  {
    id: '8',
    source: 'facebook',
    title: 'Traffic Accident on Highway 101',
    content: 'Multi-vehicle accident reported on Highway 101 South near exit 15. Traffic is backed up for 2 miles. Emergency services on scene. Avoid the area if possible.',
    timestamp: '2024-01-14T08:20:00Z',
    hasMedia: false,
    author: 'Twin City Police Department',
    category: 'emergency',
    hasLocation: true,
    location: {
      name: 'Highway 101 South - Exit 15',
      address: 'Highway 101, Twin City',
      coordinates: {
        latitude: 40.7282,
        longitude: -74.0776
      }
    },
    likes: 67,
    shares: 42,
  },
  {
    id: '9',
    source: 'whatsapp',
    title: 'Power Outage in Downtown Area',
    content: 'Power outage affecting downtown area due to equipment failure. Crews are working to restore power. Estimated restoration time: 2-3 hours. Emergency shelter available at City Hall.',
    timestamp: '2024-01-13T19:30:00Z',
    hasMedia: false,
    author: 'Twin City Power Company',
    category: 'emergency',
    hasLocation: true,
    location: {
      name: 'Downtown Area',
      address: 'Downtown Twin City',
      coordinates: {
        latitude: 40.7614,
        longitude: -73.9776
      }
    },
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
      // Try to fetch real tweets from Twitter API
      const realTweets = await twitterService.fetchAllTweets();
      
      // If we have real tweets, use them
      if (realTweets.length > 0) {
        console.log(`[ApiService] Successfully fetched ${realTweets.length} real tweets`);
        return realTweets;
      }
      
      // Fallback to mock data if no real tweets available
      console.warn('[ApiService] No real Twitter data available - using mock data');
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
      console.log('[ApiService] Fetching all updates from APIs...');
      
      // Try to fetch from all sources simultaneously
      const [realNewsData, twitterUpdates] = await Promise.all([
        newsApiService.fetchAllNews(),
        twitterService.fetchAllTweets(),
      ]);
      
      // Combine all real data
      const allRealData = [...realNewsData, ...twitterUpdates];
      
      // If we have real data, use it
      if (allRealData.length > 0) {
        console.log(`[ApiService] Successfully fetched ${allRealData.length} updates (${realNewsData.length} news + ${twitterUpdates.length} tweets)`);
        return allRealData;
      }
      
      // If no real data, check if API keys are configured
      const hasNewsAPIKey = process.env.EXPO_PUBLIC_NEWS_API_KEY && 
                           process.env.EXPO_PUBLIC_NEWS_API_KEY !== 'your_newsapi_key_here';
      const hasGNewsKey = process.env.EXPO_PUBLIC_GNEWS_API_KEY && 
                         process.env.EXPO_PUBLIC_GNEWS_API_KEY !== 'your_gnews_api_key_here';
      
      if (hasNewsAPIKey || hasGNewsKey) {
        // API keys are configured but returned no data - might be network issue or API problem
        console.warn('[ApiService] API keys configured but no news fetched - possible network or API issue');
        console.warn('[ApiService] Returning empty array instead of mock data');
        return [];
      }
      
      // No API keys configured - only then use mock data as last resort
      console.warn('[ApiService] No API keys configured and no real news data - using mock data');
      console.warn('[ApiService] To get real news, configure EXPO_PUBLIC_NEWS_API_KEY and/or EXPO_PUBLIC_GNEWS_API_KEY');
      
      // Fallback to mock data only if no API keys are set
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
    } catch (error: any) {
      console.error('[ApiService] Error fetching all updates:', error?.message || error);
      // Don't return mock data on error - return empty array or handle error properly
      console.error('[ApiService] Returning empty array due to error');
      return [];
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