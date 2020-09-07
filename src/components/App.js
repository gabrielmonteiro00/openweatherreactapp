import React from 'react';
import logo from '../logo.png';
import './App.css';
import cities from "../assets/city.list.json";
import axios from "axios"; // comand yarn add axios - to perform the http requests

export default class App extends React.Component{

  constructor(props) {
    super(props);

    this.state = { 
      newSearchString: '', // the search term
      foundCityByLocation: false, // var to check if the user has found the city by its location
      foundCityByName: false, // var to check if the user has found the city by its location
      myCity: [], // The city, or cities found
      lat: 0, // latitude
      lon: 0, // longitute
      hasWeatherData: false,
      weatherData: '',
      temperature: 0
    };
 
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    
  }
 
  handleSubmit(e){
    // To prevente page from refresh
    e.preventDefault();
    let searchstring = this.state.newSearchString;

    if (searchstring.length > 0){
      this.myCity = cities.filter(function (city) {
        if (city.name == searchstring) { console.log(city); return city; }
      });

      if (this.myCity.length > 0){
        this.setState({
          myCity: this.myCity[0],
          lat: this.myCity[0].coord.lat,
          lon: this.myCity[0].coord.lon
        })
        this.getWeatherData();
      }

    }else{ // If the search field is empty, let find the weather based on location...
      this.getWeatherData();
    }

  }
  
  getWeatherData(){
    let lat = this.state.lat;
    let lon = this.state.lon;
    let url = 'https://api.openweathermap.org/data/2.5/onecall?lat='+lat+'&lon='+lon+'&exclude=hourly,minutely&units=metric&appid=a9d12df6c21e95231c7157c8b3cab58c';
    // URL from OpenWeatherMap
     
    axios.get(url)
    .then(res => {
      console.log(res);

      const weather = res.data.current.weather[0];
      var temperature = res.data.current.temp;
      temperature = temperature.toFixed(1); // To get only one decimal

      this.setState({
          weatherData: weather,
          hasWeatherData: true,
          temperature: temperature,
      })

    })
  }

  handleTextChange(e){
    this.setState({
      newSearchString: e.target.value
    });
    
  }

  // This method is called first
  componentDidMount() { 
    // get location from browser
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        console.log("Latitude is :", position.coords.latitude);
        console.log("Longitude is :", position.coords.longitude);
        
        let latitude = position.coords.latitude.toPrecision(6);
        let longitude = position.coords.longitude.toPrecision(6);
    
        this.setState({
          lat: latitude,
          lon: longitude,
        });
        
        
        let locationCities = cities.filter(function (city) {
           // Get cities in some lat and lon range from location
           if(
                (latitude - city.coord.lat < 0.1) && (Math.abs(latitude - city.coord.lat) > 0) &&  (Math.abs(latitude - city.coord.lat) < 0.1) 
                && 
                (longitude - city.coord.lon < 0.1) && (Math.abs(longitude - city.coord.lon) > 0) &&  (Math.abs(longitude - city.coord.lon) < 0.1) 
              ) 
             {
              return city;
            }

        });

        // If there are more than one city, find the most accurate one, by proximity with lat and lon values.
        if(locationCities.length == 0){
          this.setState({
            foundCityByLocation: false
          })
        }else{        
          if(locationCities.length > 1){

            var index = 0;
            var value = 5.00000000;
            for (var i = 0; i < locationCities.length; i++) {
              let val1 = Math.abs(longitude - locationCities[i].coord.lon);
              let val2 = Math.abs(latitude - locationCities[i].coord.lat);
              let sum = val1+val2;
              console.log(sum);
              if (sum < value) {
                value = sum;
                index = i;
              }
            }

            // Set the most accurate city based on location, in the state.
            this.setState({
              myCity: locationCities[index],
              foundCityByLocation: true,
              lat: locationCities[index].coord.lat,
              lon:locationCities[index].coord.lon
            })

          }else{
             // Has found just one city
             this.setState({
              myCity: locationCities[0],
              foundCityByLocation: true,
              lat: locationCities[0].coord.lat,
              lon:locationCities[0].coord.lon
            })
          }
        }
      });
 
    } else {
      // Do not have permission to use location...
      this.setState({
        foundCityByLocation: false
      })
    }
  }

  
  render(){
    const hasWeatherData = this.state.hasWeatherData;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h4>
            Allow and confirm your location
          </h4>
          <form onSubmit={this.handleSubmit}>
          {/* {this.state.myCity.length > 0 && */}
            <p>{this.state.myCity.name} - {this.state.myCity.country}</p> 
          {/* } */}
            <button type="submit">Go</button>
            <h6>
              ... or enter one below
            </h6>
          
            <input value={this.newSearchString} onChange={this.handleTextChange}/>
            
          </form>
          <div>
          {hasWeatherData
            ? <div><h1>{this.state.temperature} °C</h1><img src={`http://openweathermap.org/img/w/${this.state.weatherData.icon}.png`}></img> {this.state.weatherData.main}</div>
            : <p></p>
          }
          {hasWeatherData
            ? <div><i>{this.state.weatherData.description}</i></div>
            : <p></p>
          }
        
          </div>
          </header>
      </div>
    );
  }
}

// export default App;
