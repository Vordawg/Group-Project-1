var eletricRate = 0;

function getEletricRate(address) {

    var queryURL = "https://developer.nrel.gov/api/census_rate/v3.json?api_key=WqBuSzoSbgbnKIqWHqwRteyGXs7hLFf4jBz54Luk&address=49+Carriage+Dr+Milford+CT+06460";

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        eletricRate = response.outputs.residential
    });

    return eletricRate;
}