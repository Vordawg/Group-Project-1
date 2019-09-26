function getEletricRate() {

    var street = $("#street").val();
    var city = $("#city").val();
    var state = $("#state").val();
    var zipCode = $("#zipcode").val();

    var addressString = encodeURIComponent(street + " " + city + " " + state + " " + zipCode);

    var queryURL = "https://developer.nrel.gov/api/census_rate/v3.json?api_key=WqBuSzoSbgbnKIqWHqwRteyGXs7hLFf4jBz54Luk&address=" + addressString;

    var eletricRate = 0;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        eletricRate = response.outputs.residential;
    });

    return eletricRate;
}

