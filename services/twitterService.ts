// Twitter API Service for fetching city updates
import axios from 'axios';
import Constants from 'expo-constants';
import { SocialUpdate } from './apiService';

// Get Twitter Bearer Token from environment variables
const TWITTER_BEARER_TOKEN = process.env.EXPO_PUBLIC_TWITTER_BEARER_TOKEN || 
  Constants.expoConfig?.extra?.TWITTER_BEARER_TOKEN || 
  (Constants.manifest as any)?.extra?.TWITTER_BEARER_TOKEN;

class TwitterService {
  private apiUrl = 'https://api.twitter.com/2';
  // Simple in-memory cache and rate-limit tracking
  private accountCache: Map<string, { expiresAt: number; data: SocialUpdate[] }> = new Map();
  private searchCache: Map<string, { expiresAt: number; data: SocialUpdate[] }> = new Map();
  private rateLimitedUntilEpochMs: number | null = null;

  private isRateLimited(): boolean {
    return this.rateLimitedUntilEpochMs !== null && Date.now() < this.rateLimitedUntilEpochMs;
  }

  private setRateLimitFromHeaders(headers: any) {
    const resetHeader = headers?.['x-rate-limit-reset'];
    const resetSeconds = resetHeader ? Number(resetHeader) : null;
    if (resetSeconds && !Number.isNaN(resetSeconds)) {
      this.rateLimitedUntilEpochMs = resetSeconds * 1000;
    } else {
      // default 15 minutes window
      this.rateLimitedUntilEpochMs = Date.now() + 15 * 60 * 1000;
    }
  }

  private cacheGet(store: Map<string, { expiresAt: number; data: SocialUpdate[] }>, key: string): SocialUpdate[] | null {
    const entry = store.get(key);
    if (entry && entry.expiresAt > Date.now()) return entry.data;
    if (entry) store.delete(key);
    return null;
  }

  private cacheSet(store: Map<string, { expiresAt: number; data: SocialUpdate[] }>, key: string, data: SocialUpdate[], ttlMs: number) {
    store.set(key, { expiresAt: Date.now() + ttlMs, data });
  }

  // Time window helper (RFC3339) for limiting results to recent days
  private getStartTimeIso(days: number = 2): string {
    const sinceMs = Date.now() - days * 24 * 60 * 60 * 1000;
    return new Date(sinceMs).toISOString();
  }

  // Fetch tweets from a specific account (username)
  async fetchTweetsFromAccount(username: string, maxResults: number = 25): Promise<SocialUpdate[]> {
    if (!TWITTER_BEARER_TOKEN || TWITTER_BEARER_TOKEN === 'your_twitter_bearer_token_here') {
      console.warn('[TwitterService] Twitter Bearer Token not configured');
      console.warn('[TwitterService] To enable Twitter, set EXPO_PUBLIC_TWITTER_BEARER_TOKEN in EAS secrets');
      return [];
    }

    if (this.isRateLimited()) {
      const msLeft = (this.rateLimitedUntilEpochMs as number) - Date.now();
      console.warn(`[TwitterService] Skipping request due to active rate limit. Retry in ~${Math.ceil(msLeft / 1000)}s`);
      const cached = this.cacheGet(this.accountCache, username);
      return cached || [];
    }

    const cached = this.cacheGet(this.accountCache, username);
    if (cached) {
      return cached;
    }

    try {
      console.log(`[TwitterService] Fetching tweets from @${username}...`);
      
      // First, get the user ID from username
      const userResponse = await axios.get(`${this.apiUrl}/users/by/username/${username}`, {
        headers: {
          'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
        },
        timeout: 10000,
      });

      const userId = userResponse.data.data.id;

      // Get tweets from that user
      const tweetsResponse = await axios.get(`${this.apiUrl}/users/${userId}/tweets`, {
        headers: {
          'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
        },
        params: {
          'tweet.fields': 'created_at,public_metrics,attachments,entities',
          'user.fields': 'name,username,profile_image_url',
          'expansions': 'attachments.media_keys,author_id',
          'media.fields': 'url,preview_image_url,type',
          'max_results': maxResults,
          'start_time': this.getStartTimeIso(2),
        },
        timeout: 10000,
      });

      const tweets = tweetsResponse.data.data || [];
      const users = tweetsResponse.data.includes?.users || [];
      const media = tweetsResponse.data.includes?.media || [];

      console.log(`[TwitterService] Found ${tweets.length} tweets`);

      const mapped = tweets.map((tweet: any) => {
        const author = users.find((u: any) => u.id === tweet.author_id);
        const tweetMedia = media.filter((m: any) => 
          tweet.attachments?.media_keys?.includes(m.media_key)
        );

        return {
          id: tweet.id,
          source: 'twitter',
          title: this.extractTitle(tweet.text),
          content: this.formatTweetContent(tweet.text),
          timestamp: tweet.created_at,
          hasMedia: tweet.attachments?.media_keys?.length > 0,
          mediaUrl: tweetMedia[0]?.url || tweetMedia[0]?.preview_image_url,
          mediaType: this.getMediaType(tweetMedia[0]),
          author: author ? `@${author.username}` : 'Unknown',
          likes: tweet.public_metrics?.like_count || 0,
          shares: tweet.public_metrics?.retweet_count || 0,
          category: this.categorizeTweet(tweet.text),
          hasLocation: this.hasLocationInfo(tweet.text),
          sourceUrl: `https://twitter.com/${username}/status/${tweet.id}`,
        };
      });

      // cache for 60s to avoid repeated calls
      this.cacheSet(this.accountCache, username, mapped, 60 * 1000);
      return mapped;
    } catch (error: any) {
      console.error('[TwitterService] Error fetching tweets:', error?.message || error);
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.error('[TwitterService] Twitter authentication failed - check your Bearer Token');
      } else if (error?.response?.status === 429) {
        console.error('[TwitterService] Twitter rate limit exceeded');
        this.setRateLimitFromHeaders(error?.response?.headers);
        const resetAt = this.rateLimitedUntilEpochMs ? new Date(this.rateLimitedUntilEpochMs).toISOString() : 'unknown';
        console.warn(`[TwitterService] Will resume after: ${resetAt}`);
      }
      return [];
    }
  }

  // Search for tweets by keyword
  async searchTweets(query: string, maxResults: number = 25): Promise<SocialUpdate[]> {
    if (!TWITTER_BEARER_TOKEN || TWITTER_BEARER_TOKEN === 'your_twitter_bearer_token_here') {
      console.warn('[TwitterService] Twitter Bearer Token not configured');
      return [];
    }

    if (this.isRateLimited()) {
      const msLeft = (this.rateLimitedUntilEpochMs as number) - Date.now();
      console.warn(`[TwitterService] Skipping search due to active rate limit. Retry in ~${Math.ceil(msLeft / 1000)}s`);
      const cached = this.cacheGet(this.searchCache, query);
      return cached || [];
    }

    const cached = this.cacheGet(this.searchCache, query);
    if (cached) {
      return cached;
    }

    try {
      console.log(`[TwitterService] Searching for: ${query}`);
      
      const response = await axios.get(`${this.apiUrl}/tweets/search/recent`, {
        headers: {
          'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
        },
        params: {
          query: query,
          'tweet.fields': 'created_at,public_metrics,attachments,entities,author_id',
          'user.fields': 'name,username,profile_image_url',
          'expansions': 'attachments.media_keys,author_id',
          'media.fields': 'url,preview_image_url,type',
          max_results: maxResults,
          'start_time': this.getStartTimeIso(2),
        },
        timeout: 10000,
      });

      const tweets = response.data.data || [];
      const users = response.data.includes?.users || [];
      const media = response.data.includes?.media || [];

      console.log(`[TwitterService] Found ${tweets.length} tweets`);

      const mapped = tweets.map((tweet: any) => {
        const author = users.find((u: any) => u.id === tweet.author_id);
        const tweetMedia = media.filter((m: any) => 
          tweet.attachments?.media_keys?.includes(m.media_key)
        );

        return {
          id: tweet.id,
          source: 'twitter',
          title: this.extractTitle(tweet.text),
          content: this.formatTweetContent(tweet.text),
          timestamp: tweet.created_at,
          hasMedia: tweet.attachments?.media_keys?.length > 0,
          mediaUrl: tweetMedia[0]?.url || tweetMedia[0]?.preview_image_url,
          mediaType: this.getMediaType(tweetMedia[0]),
          author: author ? `@${author.username}` : 'Unknown',
          likes: tweet.public_metrics?.like_count || 0,
          shares: tweet.public_metrics?.retweet_count || 0,
          category: this.categorizeTweet(tweet.text),
          hasLocation: this.hasLocationInfo(tweet.text),
          sourceUrl: tweet.id ? `https://twitter.com/i/status/${tweet.id}` : undefined,
        };
      });

      this.cacheSet(this.searchCache, query, mapped, 60 * 1000);
      return mapped;
    } catch (error: any) {
      console.error('[TwitterService] Error searching tweets:', error?.message || error);
      if (error?.response?.status === 429) {
        this.setRateLimitFromHeaders(error?.response?.headers);
      }
      return [];
    }
  }

  // Extract title from tweet text
  private extractTitle(text: string): string {
    // Remove URLs, mentions, hashtags, collapse spaces
    let title = text
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/@[A-Za-z0-9_]+/g, '')
      .replace(/#[^\s#]+/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    // Take first 100 characters
    if (title.length > 100) {
      title = title.substring(0, 100) + '...';
    }
    
    return title || 'Twitter Update';
  }

  // Convert tweet text into a news-like description
  private formatTweetContent(text: string): string {
    const cleaned = text
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/@[A-Za-z0-9_]+/g, '')
      .replace(/#[^\s#]+/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    return cleaned ? (/\.$|!$|\?$/.test(cleaned) ? cleaned : cleaned + '.') : 'Update from Twitter.';
  }

  // Get media type
  private getMediaType(media: any): 'image' | 'video' | 'link' | undefined {
    if (!media) return undefined;
    
    if (media.type === 'photo') return 'image';
    if (media.type === 'video' || media.type === 'animated_gif') return 'video';
    return 'link';
  }

  // Categorize tweet based on keywords
  private categorizeTweet(text: string): string {
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
    if (lowerText.includes('business') || lowerText.includes('economy')) {
      return 'business';
    }
    if (lowerText.includes('community') || lowerText.includes('local')) {
      return 'community';
    }
    
    return 'news';
  }

  // Check if tweet has location info for Twin Cities
  private hasLocationInfo(text: string): boolean {
    const lowerText = text.toLowerCase();
    
    const twinCityLocations = [
      'islamabad', 'rawalpindi', 'twin cit',
      'f-6', 'f-7', 'f-8', 'f-9', 'f-10', 'f-11',
      'g-6', 'g-7', 'g-8', 'g-9', 'g-10', 'g-11',
      'blue area', 'jinnah avenue', 'constitution avenue',
      'saddar', 'raja bazaar', 'committee chowk', 'murree road',
      'airport', 'islamabad airport', 'benazir airport',
    ];
    
    return twinCityLocations.some(location => lowerText.includes(location));
  }

  // Fetch all tweets from configured Twitter accounts
  async fetchAllTweets(): Promise<SocialUpdate[]> {
    console.log('[TwitterService] Fetching tweets from all configured accounts...');
    
    // Twitter account usernames to fetch from
    const twitterAccounts = [
      'shaheryarhassan',  // Your city updates account
      'IsbTraffic',       // Islamabad Traffic Police updates
      // Add more accounts here if needed
      // Example: 'IslamabadGov', 'Rawalpindi_Updates', 'TwinCityAlerts'
    ];

    if (twitterAccounts.length === 0) {
      console.warn('[TwitterService] No Twitter accounts configured. Add usernames to fetchAllTweets()');
      return [];
    }

    try {
      const perAccount = await Promise.all(
        twitterAccounts.map(account => this.fetchTweetsFromAccount(account, 40))
      );

      // Traffic-focused search for Twin Cities
      const trafficQuery = '(traffic OR road OR accident OR closure OR jam OR diversion) (Islamabad OR Rawalpindi OR "twin cities") -is:retweet';
      const searched = await this.searchTweets(trafficQuery, 40);

      const flattenedTweets = [...perAccount.flat(), ...searched];
      
      console.log(`[TwitterService] Total tweets fetched: ${flattenedTweets.length}`);
      // De-duplicate by id
      const uniqueById = new Map<string, SocialUpdate>();
      for (const t of flattenedTweets) {
        if (!uniqueById.has(t.id)) uniqueById.set(t.id, t);
      }

      // Sort by timestamp (newest first)
      return Array.from(uniqueById.values()).sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('[TwitterService] Error fetching all tweets:', error);
      return [];
    }
  }
}

export const twitterService = new TwitterService();

