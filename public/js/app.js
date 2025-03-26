class WeatherApp {
    constructor() {
        this.apiBase = '/api/weather';
        this.units = localStorage.getItem('weatherUnits') || 'metric';
        this.elements = {
            cityInput: document.querySelector('.city-input'),
            searchBtn: document.querySelector('.search-btn'),
            locationBtn: document.querySelector('.location-btn'),
            cityName: document.querySelector('.city-name'),
            datetime: document.querySelector('.datetime'),
            tempValue: document.querySelector('.temp-value'),
            tempUnit: document.querySelector('.temp-unit'),
            weatherIcon: document.querySelector('.weather-icon i'),
            feelsLike: document.querySelector('.feels-like'),
            humidity: document.querySelector('.humidity'),
            wind: document.querySelector('.wind'),
            forecastCards: document.querySelector('.forecast-cards'),
            aqiIndex: document.querySelector('.aqi-index'),
            aqiStatus: document.querySelector('.aqi-status'),
            pollutantsGrid: document.querySelector('.pollutants-grid'),
            errorModal: document.querySelector('.error-modal'),
            errorMessage: document.querySelector('.error-text'),
            unitToggle: document.querySelector('.unit-toggle')
        };

        this.init();
    }

    init() {
        this.elements.searchBtn.addEventListener('click', () => this.fetchWeather());
        this.elements.locationBtn.addEventListener('click', () => this.getLocation());
        this.elements.cityInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') this.fetchWeather();
        });
        this.elements.unitToggle.addEventListener('click', () => this.toggleUnit());
        
        // Load initial weather for default city
        this.fetchWeather({ city: 'London' });
    }

    async fetchWeather(params = {}) {
        try {
            this.showLoading();
            const queryParams = { ...params, units: this.units };
            const query = new URLSearchParams(queryParams).toString();
            const response = await fetch(`${this.apiBase}?${query}`);
            
            if(!response.ok) throw new Error('Failed to fetch weather data');
            
            const { current, daily, airQuality } = await response.json();
            this.updateCurrentWeather(current);
            this.updateForecast(daily);
            this.updateAirQuality(airQuality);
            this.updateDateTime();
            this.hideError();
        } catch(error) {
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    updateCurrentWeather(data) {
        const { temp, feels_like, humidity, weather, wind_speed } = data;
        const { description, icon } = weather[0];
        
        this.elements.cityName.textContent = this.elements.cityInput.value || 'Current Location';
        this.elements.tempValue.textContent = Math.round(temp);
        this.elements.feelsLike.textContent = `${Math.round(feels_like)}°`;
        this.elements.humidity.textContent = `${humidity}%`;
        this.elements.wind.textContent = `${Math.round(wind_speed * 3.6)} km/h`;
        this.elements.weatherIcon.className = this.getWeatherIcon(icon);
    }

    updateForecast(dailyForecast) {
        this.elements.forecastCards.innerHTML = dailyForecast.slice(0, 5).map(day => `
            <div class="forecast-card">
                <div class="forecast-date">${this.formatDate(day.dt)}</div>
                <i class="${this.getWeatherIcon(day.weather[0].icon)}"></i>
                <div class="forecast-temp">
                    <span>${Math.round(day.temp.max)}°</span>
                    <span>${Math.round(day.temp.min)}°</span>
                </div>
                <div class="forecast-description">${day.weather[0].description}</div>
            </div>
        `).join('');
    }

    updateAirQuality(airData) {
        const { main, components } = airData;
        const aqiLevels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
        
        this.elements.aqiIndex.textContent = main.aqi;
        this.elements.aqiStatus.textContent = aqiLevels[main.aqi - 1];
        this.elements.pollutantsGrid.innerHTML = `
            <div class="pollutant">
                <span>CO</span>
                <span>${components.co.toFixed(1)} µg/m³</span>
            </div>
            <div class="pollutant">
                <span>NO₂</span>
                <span>${components.no2.toFixed(1)} µg/m³</span>
            </div>
            <div class="pollutant">
                <span>O₃</span>
                <span>${components.o3.toFixed(1)} µg/m³</span>
            </div>
            <div class="pollutant">
                <span>PM2.5</span>
                <span>${components.pm2_5.toFixed(1)} µg/m³</span>
            </div>
        `;
    }

    getLocation() {
        if(!navigator.geolocation) {
            this.showError('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => this.fetchWeather({
                lat: position.coords.latitude,
                lon: position.coords.longitude
            }),
            error => {
                this.showError('Location access denied. Using default city.');
                this.fetchWeather({ city: 'London' });
            }
        );
    }

    toggleUnit() {
        this.units = this.units === 'metric' ? 'imperial' : 'metric';
        localStorage.setItem('weatherUnits', this.units);
        this.elements.tempUnit.textContent = this.units === 'metric' ? '°C' : '°F';
        this.fetchWeather({ city: this.elements.cityInput.value });
    }

    getWeatherIcon(iconCode) {
        const iconMap = {
            '01d': 'fas fa-sun',
            '01n': 'fas fa-moon',
            '02d': 'fas fa-cloud-sun',
            '02n': 'fas fa-cloud-moon',
            '03': 'fas fa-cloud',
            '04': 'fas fa-cloud-meatball',
            '09': 'fas fa-cloud-rain',
            '10': 'fas fa-cloud-showers-heavy',
            '11': 'fas fa-bolt',
            '13': 'fas fa-snowflake',
            '50': 'fas fa-smog'
        };
        return iconMap[iconCode] || iconMap[iconCode.slice(0, 2)] || 'fas fa-question';
    }

    formatDate(timestamp) {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    updateDateTime() {
        const now = new Date();
        this.elements.datetime.textContent = now.toLocaleString('en-US', {
            weekday: 'long',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorModal.classList.add('visible');
        setTimeout(() => this.hideError(), 5000);
    }

    hideError() {
        this.elements.errorModal.classList.remove('visible');
    }

    showLoading() {
        document.body.classList.add('loading');
    }

    hideLoading() {
        document.body.classList.remove('loading');
    }
}

document.addEventListener('DOMContentLoaded', () => new WeatherApp());
