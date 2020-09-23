
// Setting global variables
var apiKey = "&appid=0bf45eff92e1a09c8f83f6dc4844161d";
var date = new Date();
var cityName = JSON.parse(localStorage.getItem('cityName')) || [];

$("#dailyForecast").hide();

// Function to make a list of the cities
function makeList(city, i) {
  var cityListItem = $("<button>").addClass("list-group-item list-group-item-action savedCities");
  cityListItem.attr("value", i)
  cityListItem.text(city);
  cityListItem.append('<i class="fa fa-trash" aria-hidden="true"></i>');

  $(".list").append(cityListItem);
}

function savedCities() {
  if (cityName !== null) {
    $(".list").empty();

    for (var i = 0; i < cityName.length; i++) {
      makeList(cityName[i], i);
    }
  }
}


// Function to get current conditions
function getCurrentConditions(response) {
  // get the temperature and convert to fahrenheit 
  var tempF = (response.main.temp - 273.15) * 1.80 + 32;
  tempF = Math.floor(tempF);
  $('#currentCity').empty();

  // Setting up HTML layout
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
  function getuvIdx() {
    var uvIdxUrl =
      'https://api.openweathermap.org/data/2.5/uvi?lat=' + latitude + '&lon=' + lon + apiKey;
    $.ajax({
      url: uvIdxUrl,
      method: 'GET'
    }).then(function (response) {
      var uviClass = $(".uvIdx");
      var uvi = response.value
      var uviSpan = "<span id='uvi'>" + uvi + "</span>";
      uviClass.append("<p> UV Index:   " + uviSpan);

      if (uvi < 3) {
        $("#uvi").attr("style", "background-color: green;")

      } else if (uvi < 6) {
        $("#uvi").attr("style", "background-color: yellow; color: black;")
      } else if (uvi < 8) {
        $("#uvi").attr("style", "background-color: orange; color: black;")
        // uviSpan.attr("style", "color:white;")
      } else if (uvi < 11) {
        $("#uvi").attr("style", "background-color: red;")
        // uviSpan.attr("style", "color:white;")
      } else if (11 <= uvi) {
        $("#uvi").attr("style", "background-color: purple;")
        // uviSpan.attr("style", "color:white;")
      }
    });
  }
  getuvIdx();

  city.append(image)
  cardBody.append(city, temperature, humidity, wind, uvIdx);
  card.append(cardBody);
  $("#currentCity").append(card);
}

// Function to get current forecast
function getCurrentForecast(city) {
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
      var month = results[i].dt_txt.split('-')[1].split(' ')[0]
      var day = results[i].dt_txt.split('-')[2].split(' ')[0];
      var year = moment().format('YYYY')

      // API returns multiple hours per day when searching 5-day forcast. Selecting the correct times 
      if (results[i].dt_txt.indexOf("12:00:00") !== -1) {

        // Get the temperature and convert to fahrenheit 
        var fahrenheit = (results[i].main.temp - 273.15) * 1.80 + 32;
        var temp = Math.floor(fahrenheit);

        // Setting up HTML for 5-day forecast cards
        var card = $("<div>").addClass("card col-md-2 ml-4 bg-primary text-white");
        var cardBody = $("<div>").addClass("card-body p-3")
        var cityDate = $("<h6>").addClass("card-title").text(month + "/" + day + "/" + year);
        var temperature = $("<p>").addClass("card-text").text("Temperature: " + temp + " °F");
        var humidity = $("<p>").addClass("card-text").text("Humidity: " + results[i].main.humidity + "%");
        var image = $("<img>").attr("src", "https://openweathermap.org/img/w/" + results[i].weather[0].icon + ".png")

        // Appending HTML together
        cardBody.append(cityDate, image, temperature, humidity);
        card.append(cardBody);
        $("#forecast").append(card);

      }
    }
  });
}

// Making sure there is something in the city input
$("#searchTerm").keypress(function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    $("#searchBtn").click();
  }
});

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
      getCurrentConditions(response);
      getCurrentForecast(cityClick);
    });
});


$("#searchBtn").on("click", function (event) {
  event.preventDefault();
  var city = $("#searchTerm").val();
  console.log(city);

  // clear input box
  $("#searchTerm").val("");

  // full url to call api
  var queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + apiKey;

  $.ajax({
    url: queryUrl,
    method: "GET"
  })
    .then(function (response) {
      console.log(response)

      city = response.name;

      // Setting up the objects for the saved cities for the city list
      var name = localStorage.getItem("cityName");
      var cityName = [];
      if (name) {
        cityName = JSON.parse(name);
      }
      var found = cityName.find(function (element) {
        return (element === city)
      });
      console.log(found);
      if (!found) {
        cityName.push(city);
        var index = $("#searchTerm").attr('save-id');

        var inputId = '#input-' + index;
        var value = $(inputId).val();

        cityName[index] = value;



        localStorage.setItem("cityName", JSON.stringify(cityName));
        makeList(city);
      }

      getCurrentConditions(response);
      getCurrentForecast(city);


    })

});

// Delete city function
$(document).on("click", ".fa-trash", function () {

  x = parseInt($(this).parent().val());

  console.log(x);
  console.log(cityName[x]);
  cityName.splice(x, 1);
  console.log(cityName)
  localStorage.setItem("cityName", JSON.stringify(cityName))

  savedCities();

  return false;
});

savedCities();




