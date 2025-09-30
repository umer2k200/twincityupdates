// News API Service for Twin City Updates
// Integrates NewsAPI.org and GNews for Pakistani news

import axios from 'axios';
import { SocialUpdate } from './apiService';

const NEWS_API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY;
const GNEWS_API_KEY = process.env.EXPO_PUBLIC_GNEWS_API_KEY;

class NewsApiService {
  private newsApiUrl = 'https://newsapi.org/v2';
  private gnewsApiUrl = 'https://gnews.io/api/v4';

  // Fetch news from NewsAPI.org
  async fetchNewsApi(): Promise<SocialUpdate[]> {
    if (!NEWS_API_KEY || NEWS_API_KEY === 'your_newsapi_key_here') {
      console.log('NewsAPI key not configured - skipping NewsAPI integration');
      return [];
    }

    try {
      const response = await axios.get(`${this.newsApiUrl}/everything`, {
        params: {
          q: '(Islamabad OR Rawalpindi) AND (news OR update OR event OR traffic OR weather)',
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 30,
          apiKey: NEWS_API_KEY
        }
      });

      // Filter to only include articles specifically about Rawalpindi or Islamabad
      const filteredArticles = response.data.articles.filter((article: any) => {
        const text = (article.title + ' ' + article.description).toLowerCase();
        return text.includes('islamabad') || text.includes('rawalpindi');
      });

      console.log(`NewsAPI: Found ${filteredArticles.length} articles about Islamabad/Rawalpindi`);

      return filteredArticles.map((article: any, index: number) => ({
        id: `newsapi-${index}-${Date.now()}`,
        source: 'twitter', // Using twitter as generic news source
        title: article.title || 'Untitled',
        content: article.description || article.content || 'No content available',
        timestamp: article.publishedAt,
        hasMedia: !!article.urlToImage,
        mediaUrl: article.urlToImage,
        mediaType: 'image' as const,
        author: article.source.name,
        // Remove mocked likes and shares - don't show them
        category: this.categorizeNews(article.title + ' ' + article.description),
        hasLocation: this.hasLocationInfo(article.title + ' ' + article.description),
        sourceUrl: article.url,
      }));
    } catch (error) {
      console.error('Error fetching from NewsAPI:', error);
      return [];
    }
  }

  // Fetch news from GNews API
  async fetchGNews(): Promise<SocialUpdate[]> {
    if (!GNEWS_API_KEY || GNEWS_API_KEY === 'your_gnews_api_key_here') {
      console.log('GNews API key not configured - skipping GNews integration');
      return [];
    }

    try {
      const response = await axios.get(`${this.gnewsApiUrl}/search`, {
        params: {
          q: '(Islamabad OR Rawalpindi) twin cities Pakistan',
          lang: 'en',
          country: 'pk',
          max: 30,
          apikey: GNEWS_API_KEY
        }
      });

      // Filter to only include articles specifically about Rawalpindi or Islamabad
      const filteredArticles = response.data.articles.filter((article: any) => {
        const text = (article.title + ' ' + article.description).toLowerCase();
        return text.includes('islamabad') || text.includes('rawalpindi');
      });

      console.log(`GNews: Found ${filteredArticles.length} articles about Islamabad/Rawalpindi`);

      return filteredArticles.map((article: any, index: number) => ({
        id: `gnews-${index}-${Date.now()}`,
        source: 'facebook', // Using facebook as another generic news source
        title: article.title || 'Untitled',
        content: article.description || article.content || 'No content available',
        timestamp: article.publishedAt,
        hasMedia: !!article.image,
        mediaUrl: article.image,
        mediaType: 'image' as const,
        author: article.source.name,
        // Remove mocked likes and shares - don't show them
        category: this.categorizeNews(article.title + ' ' + article.description),
        hasLocation: this.hasLocationInfo(article.title + ' ' + article.description),
        sourceUrl: article.url,
      }));
    } catch (error) {
      console.error('Error fetching from GNews:', error);
      return [];
    }
  }

  // Fetch Pakistani news from RSS feeds
  async fetchPakistaniRSS(): Promise<SocialUpdate[]> {
    // RSS feeds for major Pakistani news sources
    const rssFeeds = [
      {
        name: 'Dawn News',
        url: 'https://www.dawn.com/feeds/home',
        source: 'whatsapp' as const
      },
      {
        name: 'The News',
        url: 'https://www.thenews.com.pk/rss/1/1',
        source: 'twitter' as const
      },
      {
        name: 'Express Tribune',
        url: 'https://tribune.com.pk/feed/home',
        source: 'facebook' as const
      }
    ];

    try {
      // For now, return empty array
      // In production, you'll need an RSS parser library
      // npm install rss-parser
      console.log('RSS feed parsing not yet implemented');
      return [];
    } catch (error) {
      console.error('Error fetching RSS feeds:', error);
      return [];
    }
  }

  // Categorize news based on keywords
  private categorizeNews(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('traffic') || lowerText.includes('road') || lowerText.includes('accident')) {
      return 'traffic';
    }
    if (lowerText.includes('weather') || lowerText.includes('rain') || lowerText.includes('temperature')) {
      return 'weather';
    }
    if (lowerText.includes('emergency') || lowerText.includes('alert') || lowerText.includes('urgent')) {
      return 'emergencies';
    }
    if (lowerText.includes('event') || lowerText.includes('festival') || lowerText.includes('celebration')) {
      return 'event';
    }
    if (lowerText.includes('business') || lowerText.includes('economy') || lowerText.includes('market')) {
      return 'business';
    }
    if (lowerText.includes('community') || lowerText.includes('local') || lowerText.includes('resident')) {
      return 'community';
    }
    if (lowerText.includes('travel') || lowerText.includes('tourism') || lowerText.includes('flight')) {
      return 'travel';
    }
    
    return 'news';
  }

  // Check if news has specific location information for Twin Cities
  private hasLocationInfo(text: string): boolean {
    const lowerText = text.toLowerCase();
    
    // Check for specific Twin Cities locations
    const twinCityLocations = [
      'islamabad', 'rawalpindi', 'twin cit',
      'f-6', 'f-7', 'f-8', 'f-9', 'f-10', 'f-11', // Islamabad sectors
      'g-6', 'g-7', 'g-8', 'g-9', 'g-10', 'g-11',
      'blue area', 'jinnah avenue', 'constitution avenue',
      'saddar', 'raja bazaar', 'committee chowk', 'murree road', // Rawalpindi areas
      'airport', 'islamabad airport', 'benazir airport',
      'faisal mosque', 'lok virsa', 'pakistan monument',
      'street', 'road', 'area', 'sector', 'plaza', 'market'
    ];
    
    return twinCityLocations.some(location => lowerText.includes(location));
  }

  // Fetch all news from available sources
  async fetchAllNews(): Promise<SocialUpdate[]> {
    console.log('Fetching news for Twin Cities (Islamabad & Rawalpindi)...');
    
    const [newsApiData, gnewsData, rssData] = await Promise.all([
      this.fetchNewsApi(),
      this.fetchGNews(),
      this.fetchPakistaniRSS()
    ]);

    const allNews = [...newsApiData, ...gnewsData, ...rssData];
    
    // Double filter to ensure only Twin Cities news
    const twinCitiesNews = allNews.filter(news => {
      const text = (news.title + ' ' + news.content).toLowerCase();
      return text.includes('islamabad') || 
             text.includes('rawalpindi') || 
             text.includes('twin cit');
    });

    console.log(`Total news fetched: ${allNews.length}, Twin Cities specific: ${twinCitiesNews.length}`);
    
    // Sort by timestamp (newest first)
    return twinCitiesNews.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}

export const newsApiService = new NewsApiService();
