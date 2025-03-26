const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    const { city, lat, lon } = req.query;
    const API_KEY = process.env.OPENWEATHER_API_KEY;

    if (!API_KEY) throw new Error('Server configuration error');
    if (!city && (!lat || !lon)) return res.status(400).json({ error: 'Invalid request' });

    // Get coordinates
    let coords = { lat, lon };
    if (city) {
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
      );
      const geoData = await geoRes.json();
      if (!geoData[0]) throw new Error('City not found');
      coords = { lat: geoData[0].lat, lon: geoData[0].lon };
    }

    // Fetch weather data
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${API_KEY}`
    );
    
    if (!weatherRes.ok) throw new Error('Weather service unavailable');
    
    const weatherData = await weatherRes.json();
    
    res.json({
      name: weatherData.name,
      country: weatherData.sys?.country,
      temp: Math.round(weatherData.main.temp),
      feels_like: Math.round(weatherData.main.feels_like),
      humidity: weatherData.main.humidity,
      wind: (weatherData.wind.speed * 3.6).toFixed(1), // Convert to km/h
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
