// Weather service for Twin Cities (Rawalpindi and Islamabad)
import axios from 'axios';

const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
export interface WeatherData {
  id: string;
  city: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  condition: string;
  description: string;
  icon: string;
  timestamp: string;
}

export interface ForecastData {
  id: string;
  city: string;
  date: string;
  day: string;
  highTemp: number;
  lowTemp: number;
  condition: string;
  description: string;
  icon: string;
  precipitation: number;
  humidity: number;
  windSpeed: number;
}

export interface WeatherAlerts {
  id: string;
  city: string;
  type: 'warning' | 'watch' | 'advisory';
  title: string;
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  issuedAt: string;
  expiresAt: string;
}

// Mock weather data for Twin Cities
const mockCurrentWeather: WeatherData[] = [
  {
    id: '1',
    city: 'Islamabad',
    temperature: 28,
    feelsLike: 32,
    humidity: 65,
    windSpeed: 12,
    windDirection: 'NW',
    pressure: 1013,
    visibility: 10,
    uvIndex: 7,
    condition: 'Partly Cloudy',
    description: 'Partly cloudy with some sunshine',
    icon: 'partly-cloudy-day',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    city: 'Rawalpindi',
    temperature: 30,
    feelsLike: 34,
    humidity: 58,
    windSpeed: 15,
    windDirection: 'W',
    pressure: 1011,
    visibility: 8,
    uvIndex: 8,
    condition: 'Sunny',
    description: 'Clear skies with bright sunshine',
    icon: 'sunny',
    timestamp: new Date().toISOString(),
  },
];

const mockForecastData: ForecastData[] = [
  // Islamabad 7-day forecast
  {
    id: 'isb-1',
    city: 'Islamabad',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: 'Tomorrow',
    highTemp: 31,
    lowTemp: 22,
    condition: 'Partly Cloudy',
    description: 'Partly cloudy with occasional sunshine',
    icon: 'partly-cloudy-day',
    precipitation: 20,
    humidity: 70,
    windSpeed: 10,
  },
  {
    id: 'isb-2',
    city: 'Islamabad',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 29,
    lowTemp: 20,
    condition: 'Rain',
    description: 'Light rain expected throughout the day',
    icon: 'rainy',
    precipitation: 80,
    humidity: 85,
    windSpeed: 8,
  },
  {
    id: 'isb-3',
    city: 'Islamabad',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 26,
    lowTemp: 18,
    condition: 'Cloudy',
    description: 'Overcast skies with cool temperatures',
    icon: 'cloudy',
    precipitation: 30,
    humidity: 75,
    windSpeed: 6,
  },
  {
    id: 'isb-4',
    city: 'Islamabad',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 32,
    lowTemp: 24,
    condition: 'Sunny',
    description: 'Clear skies and warm weather',
    icon: 'sunny',
    precipitation: 0,
    humidity: 55,
    windSpeed: 12,
  },
  {
    id: 'isb-5',
    city: 'Islamabad',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 30,
    lowTemp: 22,
    condition: 'Partly Cloudy',
    description: 'Mix of sun and clouds',
    icon: 'partly-cloudy-day',
    precipitation: 15,
    humidity: 60,
    windSpeed: 9,
  },
  {
    id: 'isb-6',
    city: 'Islamabad',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 27,
    lowTemp: 19,
    condition: 'Thunderstorm',
    description: 'Thunderstorms likely in the afternoon',
    icon: 'thunderstorm',
    precipitation: 90,
    humidity: 80,
    windSpeed: 18,
  },
  {
    id: 'isb-7',
    city: 'Islamabad',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 25,
    lowTemp: 17,
    condition: 'Rain',
    description: 'Heavy rain expected',
    icon: 'rainy',
    precipitation: 95,
    humidity: 88,
    windSpeed: 14,
  },
  // Rawalpindi 7-day forecast
  {
    id: 'rwp-1',
    city: 'Rawalpindi',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: 'Tomorrow',
    highTemp: 33,
    lowTemp: 24,
    condition: 'Sunny',
    description: 'Clear skies with hot weather',
    icon: 'sunny',
    precipitation: 5,
    humidity: 65,
    windSpeed: 12,
  },
  {
    id: 'rwp-2',
    city: 'Rawalpindi',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 31,
    lowTemp: 22,
    condition: 'Rain',
    description: 'Moderate rain showers',
    icon: 'rainy',
    precipitation: 70,
    humidity: 80,
    windSpeed: 10,
  },
  {
    id: 'rwp-3',
    city: 'Rawalpindi',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 28,
    lowTemp: 20,
    condition: 'Cloudy',
    description: 'Overcast conditions',
    icon: 'cloudy',
    precipitation: 25,
    humidity: 70,
    windSpeed: 8,
  },
  {
    id: 'rwp-4',
    city: 'Rawalpindi',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 35,
    lowTemp: 26,
    condition: 'Sunny',
    description: 'Hot and sunny weather',
    icon: 'sunny',
    precipitation: 0,
    humidity: 50,
    windSpeed: 14,
  },
  {
    id: 'rwp-5',
    city: 'Rawalpindi',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 32,
    lowTemp: 24,
    condition: 'Partly Cloudy',
    description: 'Mix of sun and clouds',
    icon: 'partly-cloudy-day',
    precipitation: 10,
    humidity: 58,
    windSpeed: 11,
  },
  {
    id: 'rwp-6',
    city: 'Rawalpindi',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 29,
    lowTemp: 21,
    condition: 'Thunderstorm',
    description: 'Strong thunderstorms expected',
    icon: 'thunderstorm',
    precipitation: 85,
    humidity: 75,
    windSpeed: 20,
  },
  {
    id: 'rwp-7',
    city: 'Rawalpindi',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 27,
    lowTemp: 19,
    condition: 'Rain',
    description: 'Heavy rainfall throughout the day',
    icon: 'rainy',
    precipitation: 90,
    humidity: 85,
    windSpeed: 16,
  },
];

const mockWeatherAlerts: WeatherAlerts[] = [
  {
    id: '1',
    city: 'Islamabad',
    type: 'warning',
    title: 'Heat Wave Warning',
    description: 'High temperatures expected. Stay hydrated and avoid prolonged exposure to sun.',
    severity: 'moderate',
    issuedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    city: 'Rawalpindi',
    type: 'advisory',
    title: 'Air Quality Alert',
    description: 'Poor air quality due to dust and pollution. Limit outdoor activities.',
    severity: 'low',
    issuedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
  },
];

// Weather service functions
export const weatherService = {
  // Get current weather for both cities
  getCurrentWeather: async (): Promise<WeatherData[]> => {
    // If no API key, use mock data
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'your_openweathermap_api_key_here') {
      console.log('Using mock weather data - Add EXPO_PUBLIC_WEATHER_API_KEY to .env for real data');
      return mockCurrentWeather;
    }

    try {
      const cities = ['Islamabad', 'Rawalpindi'];
      const weatherPromises = cities.map(async (city) => {
        const response = await axios.get(`${WEATHER_BASE_URL}/weather`, {
          params: {
            q: `${city},PK`,
            appid: WEATHER_API_KEY,
            units: 'metric'
          }
        });

        const data = response.data;
        return {
          id: data.id.toString(),
          city: city,
          temperature: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
          windDirection: weatherService.getWindDirection(data.wind.deg),
          pressure: data.main.pressure,
          visibility: Math.round(data.visibility / 1000), // Convert to km
          uvIndex: 5, // OpenWeatherMap free tier doesn't include UV, using default
          condition: weatherService.mapWeatherCondition(data.weather[0].main),
          description: data.weather[0].description,
          icon: weatherService.mapWeatherIcon(data.weather[0].icon),
          timestamp: new Date().toISOString(),
        };
      });

      const weatherData = await Promise.all(weatherPromises);
      return weatherData;
    } catch (error) {
      console.error('Error fetching real weather data:', error);
      console.log('Falling back to mock weather data');
      return mockCurrentWeather;
    }
  },

  // Get 7-day forecast for a specific city
  getForecast: async (city: 'Islamabad' | 'Rawalpindi' | 'both'): Promise<ForecastData[]> => {
    // If no API key, use mock data
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'your_openweathermap_api_key_here') {
      if (city === 'both') {
        return mockForecastData;
      }
      return mockForecastData.filter(forecast => forecast.city === city);
    }

    try {
      const cities = city === 'both' ? ['Islamabad', 'Rawalpindi'] : [city];
      const forecastPromises = cities.map(async (cityName) => {
        const response = await axios.get(`${WEATHER_BASE_URL}/forecast`, {
          params: {
            q: `${cityName},PK`,
            appid: WEATHER_API_KEY,
            units: 'metric',
            cnt: 40 // 5 days, 3-hour intervals
          }
        });

        // Group by day and get daily forecast
        const dailyForecasts: ForecastData[] = [];
        const grouped = response.data.list.reduce((acc: any, item: any) => {
          const date = item.dt_txt.split(' ')[0];
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(item);
          return acc;
        }, {});

        Object.keys(grouped).slice(0, 7).forEach((date, index) => {
          const dayData = grouped[date];
          const temps = dayData.map((d: any) => d.main.temp);
          const conditions = dayData.map((d: any) => d.weather[0].main);
          
          dailyForecasts.push({
            id: `${cityName}-${index}`,
            city: cityName,
            date: date,
            day: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
            highTemp: Math.round(Math.max(...temps)),
            lowTemp: Math.round(Math.min(...temps)),
            condition: weatherService.mapWeatherCondition(conditions[0]),
            description: dayData[0].weather[0].description,
            icon: weatherService.mapWeatherIcon(dayData[0].weather[0].icon),
            precipitation: Math.round((dayData[0].pop || 0) * 100),
            humidity: dayData[0].main.humidity,
            windSpeed: Math.round(dayData[0].wind.speed * 3.6),
          });
        });

        return dailyForecasts;
      });

      const allForecasts = await Promise.all(forecastPromises);
      return allForecasts.flat();
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      console.log('Falling back to mock forecast data');
      if (city === 'both') {
        return mockForecastData;
      }
      return mockForecastData.filter(forecast => forecast.city === city);
    }
  },

  // Get weather alerts
  getWeatherAlerts: async (): Promise<WeatherAlerts[]> => {
    // If no API key, use mock data
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'your_openweathermap_api_key_here') {
      console.log('Using mock weather alerts - Add API key for real alerts');
      return mockWeatherAlerts;
    }

    try {
      // OpenWeatherMap's One Call API has alerts, but requires subscription
      // For free tier, we'll generate alerts based on severe conditions
      const weatherData = await weatherService.getCurrentWeather();
      const alerts: WeatherAlerts[] = [];

      weatherData.forEach((weather) => {
        // Generate alerts based on severe conditions
        if (weather.temperature > 35) {
          alerts.push({
            id: `heat-${weather.city}`,
            city: weather.city,
            type: 'warning',
            title: 'Heat Wave Warning',
            description: `High temperatures of ${weather.temperature}°C expected. Stay hydrated and avoid prolonged sun exposure.`,
            severity: 'high',
            issuedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          });
        }

        if (weather.condition === 'thunderstorm') {
          alerts.push({
            id: `storm-${weather.city}`,
            city: weather.city,
            type: 'warning',
            title: 'Thunderstorm Warning',
            description: 'Thunderstorms expected. Stay indoors and avoid outdoor activities.',
            severity: 'high',
            issuedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          });
        }

        if (weather.condition === 'rainy' && weather.windSpeed > 30) {
          alerts.push({
            id: `severe-${weather.city}`,
            city: weather.city,
            type: 'warning',
            title: 'Severe Weather Warning',
            description: 'Heavy rain and strong winds expected. Exercise caution.',
            severity: 'moderate',
            issuedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          });
        }
      });

      // If no severe conditions, return empty array or mock alerts for demonstration
      return alerts.length > 0 ? alerts : [];
    } catch (error) {
      console.error('Error generating weather alerts:', error);
      return mockWeatherAlerts;
    }
  },

  // Get weather icon emoji based on condition
  getWeatherIcon: (condition: string): string => {
    const iconMap: { [key: string]: string } = {
      'sunny': '☀️',
      'partly-cloudy-day': '⛅',
      'cloudy': '☁️',
      'rainy': '🌧️',
      'thunderstorm': '⛈️',
      'snowy': '❄️',
      'foggy': '🌫️',
      'windy': '💨',
    };
    
    return iconMap[condition] || '🌤️';
  },

  // Format temperature
  formatTemperature: (temp: number): string => {
    return `${Math.round(temp)}°C`;
  },

  // Get UV index description
  getUVDescription: (uvIndex: number): { level: string; color: string; advice: string } => {
    if (uvIndex <= 2) {
      return { level: 'Low', color: '#4ade80', advice: 'Safe to stay outside' };
    } else if (uvIndex <= 5) {
      return { level: 'Moderate', color: '#fbbf24', advice: 'Seek shade during midday' };
    } else if (uvIndex <= 7) {
      return { level: 'High', color: '#f97316', advice: 'Wear sunscreen and hat' };
    } else if (uvIndex <= 10) {
      return { level: 'Very High', color: '#ef4444', advice: 'Avoid sun exposure' };
    } else {
      return { level: 'Extreme', color: '#7c3aed', advice: 'Stay indoors if possible' };
    }
  },

  // Get wind direction arrow
  getWindDirectionArrow: (direction: string): string => {
    const directionMap: { [key: string]: string } = {
      'N': '↑',
      'NE': '↗️',
      'E': '→',
      'SE': '↘️',
      'S': '↓',
      'SW': '↙️',
      'W': '←',
      'NW': '↖️',
    };
    
    return directionMap[direction] || '→';
  },

  // Convert wind degrees to direction
  getWindDirection: (degrees: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  },

  // Map OpenWeatherMap condition to our app's condition
  mapWeatherCondition: (condition: string): string => {
    const conditionMap: { [key: string]: string } = {
      'Clear': 'sunny',
      'Clouds': 'cloudy',
      'Rain': 'rainy',
      'Drizzle': 'rainy',
      'Thunderstorm': 'thunderstorm',
      'Snow': 'snowy',
      'Mist': 'foggy',
      'Fog': 'foggy',
      'Haze': 'partly-cloudy-day',
    };
    return conditionMap[condition] || 'partly-cloudy-day';
  },

  // Map OpenWeatherMap icon to our app's icon
  mapWeatherIcon: (icon: string): string => {
    const iconMap: { [key: string]: string } = {
      '01d': 'sunny',
      '01n': 'sunny',
      '02d': 'partly-cloudy-day',
      '02n': 'partly-cloudy-day',
      '03d': 'cloudy',
      '03n': 'cloudy',
      '04d': 'cloudy',
      '04n': 'cloudy',
      '09d': 'rainy',
      '09n': 'rainy',
      '10d': 'rainy',
      '10n': 'rainy',
      '11d': 'thunderstorm',
      '11n': 'thunderstorm',
      '13d': 'snowy',
      '13n': 'snowy',
      '50d': 'foggy',
      '50n': 'foggy',
    };
    return iconMap[icon] || 'partly-cloudy-day';
  },
};
