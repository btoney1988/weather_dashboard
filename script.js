
// Setting global variables
var apiKey = "&appid=0bf45eff92e1a09c8f83f6dc4844161d";
var date = new Date();
var cityName = JSON.parse(localStorage.getItem('cityName')) || [];
var year = moment().format('YYYY');
var mostRecent = cityName.length - 1;

$("#dailyForecast").hide();

// Making sure there is something in the city input
$("#searchTerm").keypress(function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    $("#searchBtn").click();
  }
});

// Function to make a list of the cities
function makeList(city, i) {
  var cityListItem = $("<button>").addClass("list-group-item list-group-item-action savedCities");
  cityListItem.attr("value", i);
  cityListItem.text(city);
  // Append the searched city to the city list
  $(".list").append(cityListItem);
}

// Function to  make the list for the Cities that were previously searched for
function savedCities() {
  if (cityName !== null) {
    $(".list").empty();
    // Loop to grab objectss from the local storage array
    for (var i = 0; i < cityName.length; i++) {
      makeList(cityName[i], i);
    }
    // When loading back into the site you will see your last searched name
    city = cityName[mostRecent];
    getWeather(city);
  }
}

// Function to get current conditions
function currentCondition(response) {
  // get the temperature and convert to fahrenheit 
  var tempF = (response.main.temp - 273.15) * 1.80 + 32;
  tempF = Math.floor(tempF);
  // Setting div ID currentCity to empty
  $('#currentCity').empty();

  // Setting up HTML layout for the Current Conditions section
  var card = $("<div>").addClass("card");
  var cardBody = $("<div>").addClass("card-body");
  var city = $("<h4>").addClass("card-title").text(response.name + " " + date.toLocaleDateString('en-US'));
  var temperature = $("<p>").addClass("card-text").text("Temperature: " + tempF + " °F");
  var humidity = $("<p>").addClass("card-text").text("Humidity: " + response.main.humidity + "%");
  var wind = $("<p>").addClass("card-text").text("Wind Speed: " + response.wind.speed + " MPH");
  var image = $("<img>").attr("src", "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png");
  var uvIdx = $('<p>').addClass('uvIdx');
  var latitude = response.coord.lat;
  var lon = response.coord.lon;
  // UV Index function  to grab the UVI from the API
  function getuvIdx() {
    var uvIdxUrl =
      'https://api.openweathermap.org/data/2.5/uvi?lat=' + latitude + '&lon=' + lon + apiKey;
    $.ajax({
      url: uvIdxUrl,
      method: 'GET'
    }).then(function (response) {
      // Setting up UV Index HTML
      var uviClass = $(".uvIdx");
      var uvi = response.value;
      var uviSpan = "<span id='uvi'>" + uvi + "</span>";
      uviClass.append("<p> UV Index:   " + uviSpan);
      // Depending on UV Index it will display the warning colors green, yellow, orange, red, and purple
      if (uvi < 3) {
        $("#uvi").attr("style", "background-color: green;");
      } else if (uvi < 6) {
        $("#uvi").attr("style", "background-color: yellow; color: black;");
      } else if (uvi < 8) {
        $("#uvi").attr("style", "background-color: orange; color: black;");
      } else if (uvi < 11) {
        $("#uvi").attr("style", "background-color: red;");
      } else if (11 <= uvi) {
        $("#uvi").attr("style", "background-color: purple;");
      }
    });
  }
  // Call UV Index Function
  getuvIdx();
  // Appending HTML together to display the current forecast
  city.append(image);
  cardBody.append(city, temperature, humidity, wind, uvIdx);
  card.append(cardBody);
  $("#currentCity").append(card);
}

// Function to get current forecast
function getForecast(city) {
  $("#dailyForecast").show();
  $.ajax({
    url: "https://api.openweathermap.org/data/2.5/forecast?q=" + city + apiKey,
    method: "GET"
  }).then(function (response) {
    // Setting div ID forecast to empty
    $('#forecast').empty();

    // Results array created from the API
    var results = response.list;

    // For loop to go through the results array to grab the full 5-day forecast
    for (var i = 0; i < results.length; i++) {
      var month = results[i].dt_txt.split('-')[1].split(' ')[0];
      var day = results[i].dt_txt.split('-')[2].split(' ')[0];

      // API returns multiple hours per day when searching 5-day forcast. Selecting the correct times 
      if (results[i].dt_txt.indexOf("12:00:00") !== -1) {

        // Get the temperature and convert to fahrenheit 
        var fahrenheit = (results[i].main.temp - 273.15) * 1.80 + 32;
        var temp = Math.floor(fahrenheit);

        // Setting up HTML for 5-day forecast cards
        var card = $("<div>").addClass("card col-xl-2 col-lg-3 mt-2 ml-2 mr-2 bg-primary text-white");
        var cardBody = $("<div>").addClass("card-body p-3");
        var cityDate = $("<h6>").addClass("card-title").text(month + "/" + day + "/" + year);
        var temperature = $("<p>").addClass("card-text").text("Temperature: " + temp + " °F");
        var humidity = $("<p>").addClass("card-text").text("Humidity: " + results[i].main.humidity + "%");
        var image = $("<img>").attr("src", "https://openweathermap.org/img/w/" + results[i].weather[0].icon + ".png");

        // Appending HTML together
        cardBody.append(cityDate, image, temperature, humidity);
        card.append(cardBody);
        $("#forecast").append(card);

      }
    }
  });
}
// Get weather function 
function getWeather(city) {
  // URL to call API
  var queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + apiKey;
  $.ajax({
    url: queryUrl,
    method: "GET"
  })
    .then(function (response) {
      city = response.name;
      localStorage.setItem("mostRecent", JSON.stringify(city));
      // Setting up the objects for the saved cities for the city list in order to call on the local storage
      var name = localStorage.getItem("cityName");
      var cityName = [];
      if (name) {
        cityName = JSON.parse(name);
      }
      // Function to see if the same city is entered twice it will not add to the array
      var found = cityName.find(function (element) {
        console.log
        return (element === city);
      });
      // If not found it will add to the local storage array
      if (!found) {
        cityName.push(city);

        // Setting local storage to a string
        localStorage.setItem("cityName", JSON.stringify(cityName));
        // Call makeList function
        makeList(city);

      }
      // Call on currentCondition and forecast functions
      currentCondition(response);
      getForecast(city);
    });
}

$(document).ready(function () {
  // Click function for City list
  $(document).on("click", ".savedCities", function () {
    var cityClick = $(this).text();
    // Query with the clicked city
    var queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cityClick + apiKey;

    $.ajax({
      url: queryUrl,
      method: "GET"
    })
      .then(function (response) {
        // Call the function based off the clicked city
        currentCondition(response);
        getForecast(cityClick);
      });
  });

  // On click function for search button
  $("#searchBtn").on("click", function (event) {
    event.preventDefault();
    var city = $("#searchTerm").val();

    // Resetting input box
    $("#searchTerm").val("");

    getWeather(city);
  });

  // Call saved cities function to get the local storage list when opening the page
  savedCities();

});