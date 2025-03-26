# **SkyCast-WeatherApp**  

**SkyCast-WeatherApp** is an advanced weather forecasting web application that provides real-time weather updates using the **OpenWeather API**. Built with **HTML, CSS, and JavaScript**, this app offers accurate weather details, including temperature, wind speed, humidity, and more. The project is **open-source** and deployable on **Vercel**.  

## **📌 Features**  

✔️ **Search by City Name** – Get weather details for any city worldwide  
✔️ **Use Current Location** – Fetch real-time weather using Geolocation API  
✔️ **Detailed Forecast** – View temperature, humidity, wind speed, and conditions  
✔️ **Dynamic UI** – Updates weather information dynamically  
✔️ **Fully Responsive** – Works seamlessly on all devices  
✔️ **Secure API Handling** – Uses GitHub secret variables for API keys  

## **📂 Project Structure**  

```
weather-app/
├── api/
│   └── weather.js       # Serverless function for API proxy
├── css/
│   └── style.css        # Stylesheet for UI design
├── js/
│   └── script.js        # JavaScript for fetching & displaying data
├── index.html           # Main HTML file
├── README.md            # Project documentation
└── .gitignore           # Ignore unnecessary files
```

## **🚀 Live Demo**  

🔗 **[View on Vercel](https://your-vercel-url.vercel.app/)**  

## **📖 Installation Guide**  

### **1️⃣ Clone the Repository**  
```sh
git clone https://github.com/your-username/SkyCast-WeatherApp.git
cd SkyCast-WeatherApp
```

### **2️⃣ Install Dependencies (Optional for Future Enhancements)**  
```sh
npm install
```

### **3️⃣ Setup OpenWeather API Key**  

- Get an API key from [OpenWeather](https://openweathermap.org/api).  
- Go to **GitHub Repository Settings → Secrets and Variables → Actions**.  
- Add a new secret with the name:  
  ```
  OPENWEATHER_API_KEY = your_api_key_here
  ```

### **4️⃣ Run Locally (Live Server Required)**  
```sh
npx live-server
```

### **5️⃣ Deploy to Vercel**  
```sh
vercel deploy
```

## **🛠 Technologies Used**  

🔹 **Frontend:** HTML, CSS, JavaScript  
🔹 **API:** OpenWeather API  
🔹 **Deployment:** Vercel  
🔹 **Version Control:** Git & GitHub  

## **📝 License**  

This project is **open-source** and free to use. You are welcome to contribute, modify, and enhance it.  

## **📩 Contributing**  

Want to improve this project? Follow these steps:  

1. **Fork the Repository**  
2. **Create a New Branch:** `git checkout -b feature-branch`  
3. **Make Your Changes**  
4. **Commit Changes:** `git commit -m "Added new feature"`  
5. **Push to GitHub:** `git push origin feature-branch`  
6. **Create a Pull Request**  
