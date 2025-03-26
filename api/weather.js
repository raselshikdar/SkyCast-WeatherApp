const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    const { city, lat, lon, units = 'metric' } = req.query;
    const API_KEY = process.env.OPENWEATHER_API_KEY;

    if (!API_KEY) throw new Error('API key not configured');
    if (!city && (!lat || !lon)) {
      return res.status(400).json({ error: 'Please provide city or coordinates' });
    }

    // Get coordinates
    let coordinates = { lat, lon };
    if (city) {
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
      );
      const geoData = await geoRes.json();
      if (!geoData.length) throw new Error('City not found');
      coordinates = { lat: geoData[0].lat, lon: geoData[0].lon };
    }

    // Fetch weather data
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&units=${units}&appid=${API_KEY}`
    );
    
    if (!weatherRes.ok) throw new Error('Weather data unavailable');
    
    const weatherData = await weatherRes.json();
    
    res.json({
      location: {
        name: weatherData.name,
        country: weatherData.sys?.country
      },
      current: {
        temp: Math.round(weatherData.main.temp),
        feels_like: Math.round(weatherData.main.feels_like),
        humidity: weatherData.main.humidity,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
        wind: (weatherData.wind.speed * 3.6).toFixed(1) // Convert to km/h
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
