import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Dimensions,
  Share,
  Alert
} from 'react-native';
import { Twitter, Facebook, MessageCircle, Heart, Share2, ExternalLink, Bookmark, BookmarkCheck, MapPin } from 'lucide-react-native';
import { SocialUpdate } from '../services/apiService';
import { getThemeColors } from '../constants/colors';

interface UpdateCardProps {
  update: SocialUpdate;
  isDarkMode?: boolean;
  onPress?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  showSaveButton?: boolean;
}

const { width } = Dimensions.get('window');

export function UpdateCard({ 
  update, 
  isDarkMode = false, 
  onPress, 
  onSave, 
  isSaved = false, 
  showSaveButton = false 
}: UpdateCardProps) {
  const colors = getThemeColors(isDarkMode);
  
  const handleShare = async () => {
    try {
      const shareContent = {
        title: update.title || 'Twin City Updates',
        message: `${update.title}\n\n${update.content}\n\nSource: ${getSourceName(update.source)}\nTime: ${formatTimestamp(update.timestamp)}\n\nShared from Twin City Updates app`,
        url: update.mediaUrl || 'https://twincityupdates.com'
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
  const getSourceIcon = (source: string) => {
    const iconProps = { size: 18, color: colors.text.primary };
    
    switch (source) {
      case 'twitter':
        return <Twitter {...iconProps} color="#1da1f2" />;
      case 'facebook':
        return <Facebook {...iconProps} color="#1877f2" />;
      case 'whatsapp':
        return <MessageCircle {...iconProps} color="#25d366" />;
      default:
        return <MessageCircle {...iconProps} />;
    }
  };

  const getSourceName = (source: string) => {
    switch (source) {
      case 'twitter':
        return 'Twitter';
      case 'facebook':
        return 'Facebook';
      case 'whatsapp':
        return 'WhatsApp Business';
      default:
        return 'Unknown';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const cardStyles = [
    styles.card,
    isDarkMode && styles.cardDark,
  ];

  const textStyles = [
    styles.text,
    isDarkMode && styles.textDark,
  ];

  return (
    <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.7}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.sourceInfo}>
          {getSourceIcon(update.source)}
          <View style={styles.sourceText}>
            <View style={styles.sourceNameRow}>
              <Text style={[styles.sourceName, isDarkMode && styles.textDark]}>
                {getSourceName(update.source)}
              </Text>
              {update.hasLocation && (
                <View style={styles.locationIndicator}>
                  <MapPin size={12} color={colors.primary} />
                </View>
              )}
            </View>
            {update.author && (
              <Text style={[styles.author, isDarkMode && styles.authorDark]}>
                {update.author}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.timestamp, isDarkMode && styles.timestampDark]}>
            {formatTimestamp(update.timestamp)}
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={(e) => {
                e.stopPropagation();
                handleShare();
              }}
            >
              <Share2 size={18} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            </TouchableOpacity>
            {showSaveButton && onSave && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onSave();
                }}
              >
                {isSaved ? (
                  <BookmarkCheck size={18} color={colors.primary} />
                ) : (
                  <Bookmark size={18} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      <Text style={[styles.title, isDarkMode && styles.textDark]}>
        {update.title}
      </Text>
      <Text style={[styles.content, isDarkMode && styles.contentDark]} numberOfLines={3}>
        {update.content}
      </Text>

      {/* Media */}
      {update.hasMedia && update.mediaUrl && (
        <View style={styles.mediaContainer}>
          <Image 
            source={{ uri: update.mediaUrl }} 
            style={styles.mediaImage}
            resizeMode="cover"
          />
          {update.mediaType === 'link' && (
            <View style={styles.linkOverlay}>
              <ExternalLink size={16} color="#ffffff" />
            </View>
          )}
        </View>
      )}

      {/* Footer with engagement metrics */}
      {(update.likes !== undefined || update.shares !== undefined) && (
        <View style={styles.footer}>
          <View style={styles.metrics}>
            {update.likes !== undefined && (
              <View style={styles.metric}>
                <Heart size={14} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <Text style={[styles.metricText, isDarkMode && styles.metricTextDark]}>
                  {update.likes}
                </Text>
              </View>
            )}
            {update.shares !== undefined && (
              <View style={styles.metric}>
                <Share2 size={14} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <Text style={[styles.metricText, isDarkMode && styles.metricTextDark]}>
                  {update.shares}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardDark: {
    backgroundColor: '#1f2937',
    shadowColor: '#000',
    shadowOpacity: 0.3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shareButton: {
    padding: 4,
  },
  saveButton: {
    padding: 4,
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sourceText: {
    marginLeft: 8,
    flex: 1,
  },
  sourceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sourceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  locationIndicator: {
    padding: 2,
  },
  author: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  authorDark: {
    color: '#9ca3af',
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  timestampDark: {
    color: '#9ca3af',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 22,
  },
  content: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  contentDark: {
    color: '#d1d5db',
  },
  text: {
    color: '#111827',
  },
  textDark: {
    color: '#f9fafb',
  },
  mediaContainer: {
    position: 'relative',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f3f4f6',
  },
  linkOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    padding: 4,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  metrics: {
    flexDirection: 'row',
    gap: 16,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  metricTextDark: {
    color: '#9ca3af',
  },
});