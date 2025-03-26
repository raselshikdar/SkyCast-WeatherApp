document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const cityInput = document.querySelector('.city-input');
  const searchBtn = document.querySelector('.search-btn');
  const locationBtn = document.querySelector('.location-btn');
  const cityName = document.querySelector('.city-name');
  const tempValue = document.querySelector('.temp-value');
  const weatherDesc = document.querySelector('.description');
  const weatherIcon = document.querySelector('.weather-icon');
  const feelsLike = document.querySelector('.feels-like');
  const humidity = document.querySelector('.humidity');
  const wind = document.querySelector('.wind');

  // Event Listeners
  searchBtn.addEventListener('click', fetchWeather);
  locationBtn.addEventListener('click', fetchLocationWeather);
  cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchWeather();
  });

  async function fetchWeather() {
    const city = cityInput.value.trim();
    if (!city) return showError('Please enter a city name');
    
    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      updateWeatherUI(data);
    } catch (error) {
      showError(error.message);
    }
  }

  async function fetchLocationWeather() {
    if (!navigator.geolocation) {
      return showError('Geolocation not supported');
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `/api/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          const data = await response.json();
          
          if (data.error) throw new Error(data.error);
          
          updateWeatherUI(data);
        } catch (error) {
          showError('Failed to get location weather');
        }
      },
      () => {
        showError('Location access denied');
      }
    );
  }

  function updateWeatherUI(data) {
    cityName.textContent = `${data.location.name} (${data.location.country})`;
    tempValue.textContent = `${data.current.temp}°C`;
    weatherDesc.textContent = data.current.description;
    feelsLike.textContent = `Feels like: ${data.current.feels_like}°C`;
    humidity.textContent = `Humidity: ${data.current.humidity}%`;
    wind.textContent = `Wind: ${data.current.wind} km/h`;
    
    // Set weather icon (using Font Awesome classes)
    const iconClass = getWeatherIconClass(data.current.icon);
    weatherIcon.className = `fas ${iconClass}`;
    
    // Hide any previous errors
    const errorElement = document.querySelector('.error-message');
    if (errorElement) errorElement.style.display = 'none';
  }

  function getWeatherIconClass(iconCode) {
    const iconMap = {
      '01d': 'fa-sun',
      '01n': 'fa-moon',
      '02d': 'fa-cloud-sun',
      '02n': 'fa-cloud-moon',
      '03': 'fa-cloud',
      '04': 'fa-cloud-meatball',
      '09': 'fa-cloud-rain',
      '10': 'fa-cloud-showers-heavy',
      '11': 'fa-bolt',
      '13': 'fa-snowflake',
      '50': 'fa-smog'
    };
    return iconMap[iconCode] || iconMap[iconCode.slice(0, 2)] || 'fa-question';
  }

  function showError(message) {
    let errorElement = document.querySelector('.error-message');
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      document.querySelector('.weather-input').appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
});
