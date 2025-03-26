const fetch = require('node-fetch');

module.exports = async (req, res) => {
    try {
        // Validate API key
        const API_KEY = process.env.OPENWEATHER_API_KEY;
        if (!API_KEY) {
            throw new Error('OpenWeather API key not configured');
        }

        // Extract query parameters
        const { city, lat, lon, units = 'metric' } = req.query;

        // Validate input parameters
        if (!city && (!lat || !lon)) {
            return res.status(400).json({
                error: 'Please provide either city name or coordinates'
            });
        }

        // Get coordinates if city name is provided
        let coordinates = { lat, lon };
        if (city) {
            const geoResponse = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
            );
            
            if (!geoResponse.ok) {
                throw new Error('Failed to fetch city coordinates');
            }

            const geoData = await geoResponse.json();
            if (!geoData || geoData.length === 0) {
                return res.status(404).json({
                    error: 'City not found'
                });
            }

            coordinates = {
                lat: geoData[0].lat,
                lon: geoData[0].lon
            };
        }

        // Fetch all weather data in parallel
        const [currentWeather, airQuality, forecast] = await Promise.all([
            this.fetchWeatherData('weather', coordinates, units, API_KEY),
            this.fetchWeatherData('air_pollution', coordinates, null, API_KEY),
            this.fetchWeatherData('forecast', coordinates, units, API_KEY)
        ]);

        // Process and combine the data
        const responseData = {
            location: {
                name: currentWeather.name,
                country: currentWeather.sys?.country,
                coordinates
            },
            current: this.processCurrentWeather(currentWeather),
            airQuality: this.processAirQuality(airQuality),
            forecast: this.processForecast(forecast),
            units
        };

        // Cache control headers
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.status(200).json(responseData);

    } catch (error) {
        console.error('Weather API error:', error);
        res.status(500).json({
            error: error.message || 'Failed to fetch weather data'
        });
    }
};

// Helper methods
module.exports.fetchWeatherData = async (endpoint, { lat, lon }, units, apiKey) => {
    const baseUrl = 'https://api.openweathermap.org/data/2.5';
    let url = `${baseUrl}/${endpoint}?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    
    if (units) {
        url += `&units=${units}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint} data`);
    }
    return response.json();
};

module.exports.processCurrentWeather = (data) => {
    return {
        temp: data.main.temp,
        feels_like: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        wind_speed: data.wind.speed,
        wind_deg: data.wind.deg,
        weather: data.weather.map(w => ({
            main: w.main,
            description: w.description,
            icon: w.icon
        })),
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        visibility: data.visibility,
        clouds: data.clouds?.all,
        rain: data.rain?.['1h'],
        snow: data.snow?.['1h'],
        dt: data.dt
    };
};

module.exports.processAirQuality = (data) => {
    const mainPollutant = data.list[0].main;
    const components = data.list[0].components;
    
    return {
        aqi: mainPollutant.aqi,
        pollutants: {
            co: components.co,
            no: components.no,
            no2: components.no2,
            o3: components.o3,
            so2: components.so2,
            pm2_5: components.pm2_5,
            pm10: components.pm10,
            nh3: components.nh3
        },
        dt: data.list[0].dt
    };
};

module.exports.processForecast = (data) => {
    return data.list.map(item => ({
        dt: item.dt,
        temp: item.main.temp,
        feels_like: item.main.feels_like,
        temp_min: item.main.temp_min,
        temp_max: item.main.temp_max,
        pressure: item.main.pressure,
        humidity: item.main.humidity,
        weather: item.weather.map(w => ({
            main: w.main,
            description: w.description,
            icon: w.icon
        })),
        clouds: item.clouds?.all,
        wind_speed: item.wind.speed,
        wind_deg: item.wind.deg,
        rain: item.rain?.['3h'],
        snow: item.snow?.['3h']
    }));
};
