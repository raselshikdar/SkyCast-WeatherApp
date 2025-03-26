document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    cityInput: document.querySelector('.city-input'),
    searchBtn: document.querySelector('.search-btn'),
    locationBtn: document.querySelector('.location-btn'),
    cityName: document.querySelector('.city-name'),
    temp: document.querySelector('.temp-value'),
    description: document.querySelector('.description'),
    feelsLike: document.querySelector('.feels-like'),
    humidity: document.querySelector('.humidity'),
    wind: document.querySelector('.wind'),
    icon: document.querySelector('.weather-icon')
  };

  let errorTimeout;

  // Event Listeners
  elements.searchBtn.addEventListener('click', searchWeather);
  elements.locationBtn.addEventListener('click', getLocationWeather);
  elements.cityInput.addEventListener('keypress', e => e.key === 'Enter' && searchWeather());

  async function searchWeather() {
    const city = elements.cityInput.value.trim();
    if (!city) return showError('Please enter a city name');
    
    try {
      const data = await fetchData(`/api/weather?city=${encodeURIComponent(city)}`);
      updateUI(data);
    } catch (error) {
      showError(error);
    }
  }

  async function getLocationWeather() {
    if (!navigator.geolocation) return showError('Geolocation not supported');
    
    navigator.geolocation.getCurrentPosition(
      async position => {
        try {
          const data = await fetchData(
            `/api/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          updateUI(data);
        } catch (error) {
          showError(error);
        }
      },
      error => showError(error.message.includes('denied') ? 
        'Location access denied' : 'Failed to get location')
    );
  }

  async function fetchData(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Weather service unavailable');
      }
      return await response.json();
    } catch (error) {
      throw new Error('Connection failed. Try again later.');
    }
  }

  function updateUI(data) {
    elements.cityName.textContent = `${data.name}${data.country ? ` (${data.country})` : ''}`;
    elements.temp.textContent = `${data.temp}°C`;
    elements.description.textContent = data.description;
    elements.feelsLike.textContent = `Feels like: ${data.feels_like}°C`;
    elements.humidity.textContent = `Humidity: ${data.humidity}%`;
    elements.wind.textContent = `Wind: ${data.wind} km/h`;
    elements.icon.className = `wi wi-owm-${data.icon}`;
    clearError();
  }

  function showError(message) {
    clearTimeout(errorTimeout);
    const errorDiv = document.querySelector('.error') || createErrorElement();
    errorDiv.textContent = typeof message === 'string' ? message : 'Failed to get weather data';
    errorDiv.style.display = 'block';
    errorTimeout = setTimeout(() => errorDiv.style.display = 'none', 5000);
  }

  function createErrorElement() {
    const div = document.createElement('div');
    div.className = 'error';
    document.querySelector('.weather-input').appendChild(div);
    return div;
  }

  function clearError() {
    const errorDiv = document.querySelector('.error');
    if (errorDiv) errorDiv.style.display = 'none';
  }
});
