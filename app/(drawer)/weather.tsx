import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  MapPin, 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye, 
  Gauge, 
  Sun, 
  AlertTriangle,
  RefreshCw,
  Calendar,
  CloudRain,
  CloudSnow,
  Cloud,
  CloudLightning,
} from 'lucide-react-native';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { weatherService, WeatherData, ForecastData, WeatherAlerts } from '../../services/weatherService';

const { width } = Dimensions.get('window');

export default function WeatherScreen() {
  const { state } = useApp();
  const { t } = useLanguage();
  const isDarkMode = state.preferences.darkMode;
  
  const [currentWeather, setCurrentWeather] = useState<WeatherData[]>([]);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlerts[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCity, setSelectedCity] = useState<'Islamabad' | 'Rawalpindi'>('Islamabad');

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      const [weatherData, forecastData, alertsData] = await Promise.all([
        weatherService.getCurrentWeather(),
        weatherService.getForecast('both'),
        weatherService.getWeatherAlerts(),
      ]);
      
      setCurrentWeather(weatherData);
      setForecast(forecastData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeatherData();
    setRefreshing(false);
  };

  const getCurrentWeatherForCity = (city: string): WeatherData | undefined => {
    return currentWeather.find(weather => weather.city === city);
  };

  const getForecastForCity = (city: string): ForecastData[] => {
    return forecast.filter(item => item.city === city).slice(0, 7);
  };

  const getAlertsForCity = (city: string): WeatherAlerts[] => {
    return alerts.filter(alert => alert.city === city);
  };

  const renderWeatherIcon = (condition: string, size: number = 24) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'sunny': <Sun size={size} color="#fbbf24" />,
      'partly-cloudy-day': <Cloud size={size} color="#9ca3af" />,
      'cloudy': <Cloud size={size} color="#6b7280" />,
      'rainy': <CloudRain size={size} color="#3b82f6" />,
      'thunderstorm': <CloudLightning size={size} color="#7c3aed" />,
      'snowy': <CloudSnow size={size} color="#e5e7eb" />,
    };
    
    return iconMap[condition] || <Cloud size={size} color="#9ca3af" />;
  };

  const renderCurrentWeather = (weather: WeatherData) => {
    const uvInfo = weatherService.getUVDescription(weather.uvIndex);
    
    return (
      <View key={weather.id} style={[styles.currentWeatherCard, isDarkMode && styles.currentWeatherCardDark]}>
        <View style={styles.weatherHeader}>
          <View style={styles.locationInfo}>
            <MapPin size={20} color={isDarkMode ? '#60a5fa' : '#2563eb'} />
            <Text style={[styles.cityName, isDarkMode && styles.cityNameDark]}>
              {weather.city}
            </Text>
          </View>
          <Text style={[styles.lastUpdated, isDarkMode && styles.lastUpdatedDark]}>
            Updated {new Date(weather.timestamp).toLocaleTimeString()}
          </Text>
        </View>

        <View style={styles.mainWeatherInfo}>
          <View style={styles.temperatureSection}>
            <View style={styles.weatherIcon}>
              {renderWeatherIcon(weather.condition, 48)}
            </View>
            <View style={styles.temperatureInfo}>
              <Text style={[styles.temperature, isDarkMode && styles.temperatureDark]}>
                {weatherService.formatTemperature(weather.temperature)}
              </Text>
              <Text style={[styles.feelsLike, isDarkMode && styles.feelsLikeDark]}>
                Feels like {weatherService.formatTemperature(weather.feelsLike)}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.condition, isDarkMode && styles.conditionDark]}>
            {weather.condition}
          </Text>
          <Text style={[styles.description, isDarkMode && styles.descriptionDark]}>
            {weather.description}
          </Text>
        </View>

        <View style={styles.weatherDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Droplets size={20} color={isDarkMode ? '#60a5fa' : '#2563eb'} />
              <Text style={[styles.detailLabel, isDarkMode && styles.detailLabelDark]}>
                Humidity
              </Text>
              <Text style={[styles.detailValue, isDarkMode && styles.detailValueDark]}>
                {weather.humidity}%
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Wind size={20} color={isDarkMode ? '#60a5fa' : '#2563eb'} />
              <Text style={[styles.detailLabel, isDarkMode && styles.detailLabelDark]}>
                Wind
              </Text>
              <Text style={[styles.detailValue, isDarkMode && styles.detailValueDark]}>
                {weather.windSpeed} km/h {weather.windDirection}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Eye size={20} color={isDarkMode ? '#60a5fa' : '#2563eb'} />
              <Text style={[styles.detailLabel, isDarkMode && styles.detailLabelDark]}>
                Visibility
              </Text>
              <Text style={[styles.detailValue, isDarkMode && styles.detailValueDark]}>
                {weather.visibility} km
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Gauge size={20} color={isDarkMode ? '#60a5fa' : '#2563eb'} />
              <Text style={[styles.detailLabel, isDarkMode && styles.detailLabelDark]}>
                Pressure
              </Text>
              <Text style={[styles.detailValue, isDarkMode && styles.detailValueDark]}>
                {weather.pressure} hPa
              </Text>
            </View>
          </View>

          <View style={styles.uvSection}>
            <Sun size={20} color={uvInfo.color} />
            <Text style={[styles.detailLabel, isDarkMode && styles.detailLabelDark]}>
              UV Index
            </Text>
            <View style={styles.uvInfo}>
              <Text style={[styles.uvValue, isDarkMode && styles.uvValueDark, { color: uvInfo.color }]}>
                {weather.uvIndex} - {uvInfo.level}
              </Text>
              <Text style={[styles.uvAdvice, isDarkMode && styles.uvAdviceDark]}>
                {uvInfo.advice}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderForecastItem = (item: ForecastData) => (
    <View key={item.id} style={[styles.forecastItem, isDarkMode && styles.forecastItemDark]}>
      <View style={styles.forecastDay}>
        <Text style={[styles.forecastDayText, isDarkMode && styles.forecastDayTextDark]}>
          {item.day}
        </Text>
        <Text style={[styles.forecastDate, isDarkMode && styles.forecastDateDark]}>
          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>
      </View>
      
      <View style={styles.forecastWeather}>
        {renderWeatherIcon(item.condition, 24)}
        <Text style={[styles.forecastCondition, isDarkMode && styles.forecastConditionDark]}>
          {item.condition}
        </Text>
      </View>
      
      <View style={styles.forecastPrecipitation}>
        <CloudRain size={16} color={isDarkMode ? '#60a5fa' : '#2563eb'} />
        <Text style={[styles.forecastPrecipitationText, isDarkMode && styles.forecastPrecipitationTextDark]}>
          {item.precipitation}%
        </Text>
      </View>
      
      <View style={styles.forecastTemps}>
        <Text style={[styles.forecastHigh, isDarkMode && styles.forecastHighDark]}>
          {weatherService.formatTemperature(item.highTemp)}
        </Text>
        <Text style={[styles.forecastLow, isDarkMode && styles.forecastLowDark]}>
          {weatherService.formatTemperature(item.lowTemp)}
        </Text>
      </View>
    </View>
  );

  const renderWeatherAlert = (alert: WeatherAlerts) => (
    <View key={alert.id} style={[styles.alertCard, isDarkMode && styles.alertCardDark]}>
      <View style={styles.alertHeader}>
        <AlertTriangle 
          size={20} 
          color={
            alert.severity === 'extreme' ? '#dc2626' :
            alert.severity === 'high' ? '#ea580c' :
            alert.severity === 'moderate' ? '#d97706' : '#65a30d'
          } 
        />
        <Text style={[styles.alertType, isDarkMode && styles.alertTypeDark]}>
          {alert.type.toUpperCase()}
        </Text>
        <Text style={[styles.alertSeverity, isDarkMode && styles.alertSeverityDark]}>
          {alert.severity.toUpperCase()}
        </Text>
      </View>
      
      <Text style={[styles.alertTitle, isDarkMode && styles.alertTitleDark]}>
        {alert.title}
      </Text>
      
      <Text style={[styles.alertDescription, isDarkMode && styles.alertDescriptionDark]}>
        {alert.description}
      </Text>
      
      <Text style={[styles.alertExpiry, isDarkMode && styles.alertExpiryDark]}>
        Expires: {new Date(alert.expiresAt).toLocaleString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={isDarkMode ? "#111827" : "#ffffff"}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDarkMode ? '#60a5fa' : '#2563eb'} />
          <Text style={[styles.loadingText, isDarkMode && styles.loadingTextDark]}>
            Loading weather data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentWeatherData = getCurrentWeatherForCity(selectedCity);
  const cityForecast = getForecastForCity(selectedCity);
  const cityAlerts = getAlertsForCity(selectedCity);

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={isDarkMode ? "#111827" : "#ffffff"}
      />
      
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>
          Twin Cities Weather
        </Text>
        <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
          <RefreshCw 
            size={24} 
            color={isDarkMode ? '#60a5fa' : '#2563eb'} 
            style={[styles.refreshIcon, refreshing && styles.refreshing]} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[isDarkMode ? '#60a5fa' : '#2563eb']}
            tintColor={isDarkMode ? '#60a5fa' : '#2563eb'}
          />
        }
      >
        {/* City Selector */}
        <View style={[styles.citySelector, isDarkMode && styles.citySelectorDark]}>
          <TouchableOpacity
            style={[
              styles.cityButton,
              selectedCity === 'Islamabad' && styles.selectedCityButton,
              selectedCity === 'Islamabad' && isDarkMode && styles.selectedCityButtonDark
            ]}
            onPress={() => setSelectedCity('Islamabad')}
          >
            <Text style={[
              styles.cityButtonText,
              isDarkMode && styles.cityButtonTextDark,
              selectedCity === 'Islamabad' && styles.selectedCityButtonText,
              selectedCity === 'Islamabad' && isDarkMode && styles.selectedCityButtonTextDark
            ]}>
              Islamabad
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.cityButton,
              selectedCity === 'Rawalpindi' && styles.selectedCityButton,
              selectedCity === 'Rawalpindi' && isDarkMode && styles.selectedCityButtonDark
            ]}
            onPress={() => setSelectedCity('Rawalpindi')}
          >
            <Text style={[
              styles.cityButtonText,
              isDarkMode && styles.cityButtonTextDark,
              selectedCity === 'Rawalpindi' && styles.selectedCityButtonText,
              selectedCity === 'Rawalpindi' && isDarkMode && styles.selectedCityButtonTextDark
            ]}>
              Rawalpindi
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current Weather */}
        {currentWeatherData && renderCurrentWeather(currentWeatherData)}

        {/* Weather Alerts */}
        {cityAlerts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
              Weather Alerts
            </Text>
            {cityAlerts.map(renderWeatherAlert)}
          </View>
        )}

        {/* 7-Day Forecast */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={isDarkMode ? '#60a5fa' : '#2563eb'} />
            <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
              7-Day Forecast
            </Text>
          </View>
          {cityForecast.map(renderForecastItem)}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  loadingTextDark: {
    color: '#9ca3af',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerDark: {
    backgroundColor: '#1f2937',
    borderBottomColor: '#374151',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerTitleDark: {
    color: '#f9fafb',
  },
  refreshIcon: {
    marginRight: 4,
  },
  refreshing: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  citySelector: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  citySelectorDark: {
    backgroundColor: '#1f2937',
  },
  cityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedCityButton: {
    backgroundColor: '#2563eb',
  },
  selectedCityButtonDark: {
    backgroundColor: '#1d4ed8',
  },
  cityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  cityButtonTextDark: {
    color: '#9ca3af',
  },
  selectedCityButtonText: {
    color: '#ffffff',
  },
  selectedCityButtonTextDark: {
    color: '#f9fafb',
  },
  currentWeatherCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  currentWeatherCardDark: {
    backgroundColor: '#1f2937',
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  cityNameDark: {
    color: '#f9fafb',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#6b7280',
  },
  lastUpdatedDark: {
    color: '#9ca3af',
  },
  mainWeatherInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  temperatureSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  weatherIcon: {
    marginRight: 16,
  },
  temperatureInfo: {
    alignItems: 'center',
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  temperatureDark: {
    color: '#f9fafb',
  },
  feelsLike: {
    fontSize: 16,
    color: '#6b7280',
  },
  feelsLikeDark: {
    color: '#9ca3af',
  },
  condition: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  conditionDark: {
    color: '#f9fafb',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  descriptionDark: {
    color: '#9ca3af',
  },
  weatherDetails: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 2,
  },
  detailLabelDark: {
    color: '#9ca3af',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  detailValueDark: {
    color: '#f9fafb',
  },
  uvSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  uvSectionDark: {
    backgroundColor: '#374151',
  },
  uvInfo: {
    marginLeft: 8,
    flex: 1,
  },
  uvValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  uvValueDark: {
    color: '#f9fafb',
  },
  uvAdvice: {
    fontSize: 12,
    color: '#6b7280',
  },
  uvAdviceDark: {
    color: '#9ca3af',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  sectionTitleDark: {
    color: '#f9fafb',
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  forecastItemDark: {
    backgroundColor: '#1f2937',
  },
  forecastDay: {
    flex: 1,
  },
  forecastDayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  forecastDayTextDark: {
    color: '#f9fafb',
  },
  forecastDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  forecastDateDark: {
    color: '#9ca3af',
  },
  forecastWeather: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  forecastCondition: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  forecastConditionDark: {
    color: '#9ca3af',
  },
  forecastPrecipitation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  forecastPrecipitationText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  forecastPrecipitationTextDark: {
    color: '#9ca3af',
  },
  forecastTemps: {
    alignItems: 'flex-end',
  },
  forecastHigh: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  forecastHighDark: {
    color: '#f9fafb',
  },
  forecastLow: {
    fontSize: 14,
    color: '#6b7280',
  },
  forecastLowDark: {
    color: '#9ca3af',
  },
  alertCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  alertCardDark: {
    backgroundColor: '#451a03',
    borderLeftColor: '#d97706',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400e',
    marginLeft: 8,
  },
  alertTypeDark: {
    color: '#fbbf24',
  },
  alertSeverity: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#92400e',
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#fbbf24',
    borderRadius: 4,
  },
  alertSeverityDark: {
    color: '#451a03',
    backgroundColor: '#fbbf24',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 4,
  },
  alertTitleDark: {
    color: '#fbbf24',
  },
  alertDescription: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 8,
  },
  alertDescriptionDark: {
    color: '#fbbf24',
  },
  alertExpiry: {
    fontSize: 12,
    color: '#92400e',
    fontStyle: 'italic',
  },
  alertExpiryDark: {
    color: '#fbbf24',
  },
});
