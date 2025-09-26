import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Share,
  Linking,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Share2, ExternalLink, Clock, MapPin, User, Navigation } from 'lucide-react-native';
// Conditional import for maps to avoid web bundling issues
let MapView: any = null;
let Marker: any = null;

// Only import maps on native platforms
if (Platform.OS !== 'web') {
  try {
    const maps = require('react-native-maps');
    MapView = maps.MapView;
    Marker = maps.Marker;
  } catch (error) {
    console.log('Maps not available:', error instanceof Error ? error.message : 'Unknown error');
  }
}
import * as Location from 'expo-location';
import { useApp } from '../../contexts/AppContext';
import { useLocalSearchParams, router } from 'expo-router';

export default function NewsDetailScreen() {
  const { state } = useApp();
  const params = useLocalSearchParams();
  const isDarkMode = state.preferences.darkMode;
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  // Parse the news data from params
  const newsData = params.newsData ? JSON.parse(params.newsData as string) : null;

  // Get user's current location
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        // Check if location services are available
        const isLocationEnabled = await Location.hasServicesEnabledAsync();
        if (!isLocationEnabled) {
          console.log('Location services are disabled');
          return;
        }

        // Request permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permission not granted');
          return;
        }

        // Get current position with accuracy settings
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation(location);
      } catch (error) {
        console.log('Location not available:', error instanceof Error ? error.message : 'Unknown error');
        // Don't show error to user, just silently handle it
      }
    };

    if (newsData?.hasLocation) {
      getUserLocation();
    }
  }, [newsData]);

  if (!newsData) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={isDarkMode ? "#111827" : "#ffffff"}
        />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, isDarkMode && styles.errorTextDark]}>
            News not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    try {
      const shareContent = {
        title: newsData.title || 'Twin City Updates',
        message: `${newsData.title}\n\n${newsData.content}\n\nSource: ${newsData.source}\nTime: ${newsData.timestamp}\n\nShared from Twin City Updates app`,
        url: newsData.mediaUrl || 'https://twincityupdates.com'
      };

      const result = await Share.share(shareContent);
      
      if (result.action === Share.sharedAction) {
        console.log('Content shared successfully');
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing content:', error);
      Alert.alert('Error', 'Failed to share content. Please try again.');
    }
  };

  const handleOpenSource = () => {
    if (newsData.sourceUrl) {
      Linking.openURL(newsData.sourceUrl).catch(() => {
        Alert.alert('Error', 'Could not open the source URL');
      });
    }
  };

  const handleOpenInMaps = () => {
    if (newsData.location) {
      const { latitude, longitude } = newsData.location.coordinates;
      const url = `https://maps.google.com/maps?q=${latitude},${longitude}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Could not open maps');
      });
    }
  };

  const handleGetDirections = () => {
    if (newsData.location && newsData.location.coordinates) {
      const { latitude, longitude } = newsData.location.coordinates;
      
      if (userLocation && userLocation.coords) {
        // User location available - get turn-by-turn directions
        const userLat = userLocation.coords.latitude;
        const userLng = userLocation.coords.longitude;
        const url = `https://maps.google.com/maps/dir/${userLat},${userLng}/${latitude},${longitude}`;
        Linking.openURL(url).catch(() => {
          Alert.alert('Error', 'Could not open directions');
        });
      } else {
        // User location not available - just open maps to the destination
        const url = `https://maps.google.com/maps?q=${latitude},${longitude}`;
        Linking.openURL(url).catch(() => {
          Alert.alert('Error', 'Could not open maps');
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={isDarkMode ? "#111827" : "#ffffff"}
      />

      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={isDarkMode ? '#f9fafb' : '#1f2937'} />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Share2 size={20} color={isDarkMode ? '#f9fafb' : '#1f2937'} />
          </TouchableOpacity>
          
          {newsData.sourceUrl && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleOpenSource}
            >
              <ExternalLink size={20} color={isDarkMode ? '#f9fafb' : '#1f2937'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* News Image */}
        {newsData.image && (
          <View style={styles.imageContainer}>
            <View style={[styles.imagePlaceholder, isDarkMode && styles.imagePlaceholderDark]}>
              <Text style={[styles.imageText, isDarkMode && styles.imageTextDark]}>
                📰
              </Text>
            </View>
          </View>
        )}

        {/* News Content */}
        <View style={styles.newsContent}>
          {/* Title */}
          <Text style={[styles.title, isDarkMode && styles.titleDark]}>
            {newsData.title}
          </Text>

          {/* Meta Information */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <User size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
              <Text style={[styles.metaText, isDarkMode && styles.metaTextDark]}>
                {newsData.source}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Clock size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
              <Text style={[styles.metaText, isDarkMode && styles.metaTextDark]}>
                {formatDate(newsData.timestamp)}
              </Text>
            </View>
            
            {newsData.location && (
              <View style={styles.metaItem}>
                <MapPin size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <Text style={[styles.metaText, isDarkMode && styles.metaTextDark]}>
                  {newsData.location.name}
                </Text>
              </View>
            )}
          </View>

          {/* Category */}
          {newsData.category && (
            <View style={styles.categoryContainer}>
              <Text style={[styles.categoryLabel, isDarkMode && styles.categoryLabelDark]}>
                Category:
              </Text>
              <View style={[styles.categoryBadge, isDarkMode && styles.categoryBadgeDark]}>
                <Text style={[styles.categoryText, isDarkMode && styles.categoryTextDark]}>
                  {newsData.category.charAt(0).toUpperCase() + newsData.category.slice(1)}
                </Text>
              </View>
            </View>
          )}

          {/* Content */}
          <Text style={[styles.content, isDarkMode && styles.contentDark]}>
            {newsData.content}
          </Text>

          {/* Location Section */}
          {newsData.hasLocation && newsData.location && newsData.location.name && newsData.location.address && newsData.location.coordinates && (
            <View style={[styles.locationSection, isDarkMode && styles.locationSectionDark]}>
              <View style={styles.locationHeader}>
                <MapPin size={20} color={isDarkMode ? '#60a5fa' : '#2563eb'} />
                <Text style={[styles.locationTitle, isDarkMode && styles.locationTitleDark]}>
                  Location
                </Text>
              </View>
              
              <Text style={[styles.locationName, isDarkMode && styles.locationNameDark]}>
                {newsData.location.name}
              </Text>
              
              <Text style={[styles.locationAddress, isDarkMode && styles.locationAddressDark]}>
                {newsData.location.address}
              </Text>

              {/* Map */}
              {newsData.location.coordinates.latitude && newsData.location.coordinates.longitude && MapView && (
                <View style={styles.mapContainer}>
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude: newsData.location.coordinates.latitude,
                      longitude: newsData.location.coordinates.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    mapType={isDarkMode ? 'satellite' : 'standard'}
                  >
                    {Marker && (
                      <Marker
                        coordinate={{
                          latitude: newsData.location.coordinates.latitude,
                          longitude: newsData.location.coordinates.longitude,
                        }}
                        title={newsData.location.name}
                        description={newsData.location.address}
                      />
                    )}
                    {userLocation && userLocation.coords && Marker && (
                      <Marker
                        coordinate={{
                          latitude: userLocation.coords.latitude,
                          longitude: userLocation.coords.longitude,
                        }}
                        title="Your Location"
                        pinColor="blue"
                      />
                    )}
                  </MapView>
                </View>
              )}
              
              {/* Fallback for web or when maps are not available */}
              {newsData.location.coordinates.latitude && newsData.location.coordinates.longitude && !MapView && (
                <View style={styles.mapContainer}>
                  <View style={[styles.mapFallback, isDarkMode && styles.mapFallbackDark]}>
                    <MapPin size={32} color={isDarkMode ? '#60a5fa' : '#2563eb'} />
                    <Text style={[styles.mapFallbackText, isDarkMode && styles.mapFallbackTextDark]}>
                      Map not available on this platform
                    </Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.locationActions}>
                <TouchableOpacity
                  style={[styles.locationButton, isDarkMode && styles.locationButtonDark]}
                  onPress={handleOpenInMaps}
                >
                  <MapPin size={16} color={isDarkMode ? '#60a5fa' : '#2563eb'} />
                  <Text style={[styles.locationButtonText, isDarkMode && styles.locationButtonTextDark]}>
                    Open in Maps
                  </Text>
                </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.locationButton, isDarkMode && styles.locationButtonDark]}
                    onPress={handleGetDirections}
                  >
                    <Navigation size={16} color={isDarkMode ? '#60a5fa' : '#2563eb'} />
                    <Text style={[styles.locationButtonText, isDarkMode && styles.locationButtonTextDark]}>
                      {userLocation && userLocation.coords ? 'Get Directions' : 'Open in Maps'}
                    </Text>
                  </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Additional Details */}
          {newsData.additionalInfo && (
            <View style={[styles.additionalInfo, isDarkMode && styles.additionalInfoDark]}>
              <Text style={[styles.additionalInfoTitle, isDarkMode && styles.additionalInfoTitleDark]}>
                Additional Information:
              </Text>
              <Text style={[styles.additionalInfoText, isDarkMode && styles.additionalInfoTextDark]}>
                {newsData.additionalInfo}
              </Text>
            </View>
          )}

          {/* Tags */}
          {newsData.tags && newsData.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={[styles.tagsLabel, isDarkMode && styles.tagsLabelDark]}>
                Tags:
              </Text>
              <View style={styles.tags}>
                {newsData.tags.map((tag: string, index: number) => (
                  <View
                    key={index}
                    style={[styles.tag, isDarkMode && styles.tagDark]}
                  >
                    <Text style={[styles.tagText, isDarkMode && styles.tagTextDark]}>
                      #{tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerDark: {
    backgroundColor: '#1f2937',
    borderBottomColor: '#374151',
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  scrollContent: {
    flex: 1,
  },
  imageContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderDark: {
    backgroundColor: '#374151',
  },
  imageText: {
    fontSize: 48,
    color: '#9ca3af',
  },
  imageTextDark: {
    color: '#6b7280',
  },
  newsContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 32,
    marginBottom: 16,
  },
  titleDark: {
    color: '#f9fafb',
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  metaTextDark: {
    color: '#9ca3af',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  categoryLabelDark: {
    color: '#d1d5db',
  },
  categoryBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  categoryBadgeDark: {
    backgroundColor: '#1e40af',
    borderColor: '#3b82f6',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  categoryTextDark: {
    color: '#60a5fa',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 24,
  },
  contentDark: {
    color: '#d1d5db',
  },
  additionalInfo: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 24,
  },
  additionalInfoDark: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  additionalInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  additionalInfoTitleDark: {
    color: '#f9fafb',
  },
  additionalInfoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6b7280',
  },
  additionalInfoTextDark: {
    color: '#9ca3af',
  },
  tagsContainer: {
    marginBottom: 24,
  },
  tagsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  tagsLabelDark: {
    color: '#f9fafb',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagDark: {
    backgroundColor: '#374151',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  tagTextDark: {
    color: '#9ca3af',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
  },
  errorTextDark: {
    color: '#9ca3af',
  },
  locationSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  locationSectionDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  locationTitleDark: {
    color: '#f1f5f9',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  locationNameDark: {
    color: '#f8fafc',
  },
  locationAddress: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  locationAddressDark: {
    color: '#94a3b8',
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    flex: 1,
  },
  locationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
    gap: 6,
  },
  locationButtonDark: {
    backgroundColor: '#1e40af',
    borderColor: '#1e3a8a',
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  locationButtonTextDark: {
    color: '#60a5fa',
  },
  mapFallback: {
    height: 200,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  mapFallbackDark: {
    backgroundColor: '#334155',
  },
  mapFallbackText: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  mapFallbackTextDark: {
    color: '#94a3b8',
  },
});
