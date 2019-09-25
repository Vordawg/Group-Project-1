var eletricRate = 0;

function getEletricRate(address) {

    var addressString = encodeURIComponent(address);
    var queryURL = "https://developer.nrel.gov/api/census_rate/v3.json?api_key=WqBuSzoSbgbnKIqWHqwRteyGXs7hLFf4jBz54Luk&address=" + addressString;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        eletricRate = response.outputs.residential;
    });

    return eletricRate;
}