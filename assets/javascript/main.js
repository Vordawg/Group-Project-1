
var bitcoinMiner = [];
var eletricRate;
var hashRate;
var blocksPerDay;

// Postal Address function to get the local postal address
function getPostalAddress() {
    event.preventDefault();

    // Clear any error message.
    $("#errorMessage").empty();

    var street = $("#street").val().trim();
    var city = $("#city").val().trim();
    var state = $("#state").val().trim();
    var zipCode = $("#zipcode").val().trim();

    // Make sure all the input fields are filled out.
    if (street.length == 0 || city.length == 0 || state.length == 0 || zipCode == 0) {
        var errorMessage;
        errorMessage = "Please enter a full address.";
        $("#errorMessage").text(errorMessage);
    }
    else {
        var queryURL = "https://cors-anywhere.herokuapp.com/https://www.yaddress.net/api/Address?AddressLine1=" + encodeURIComponent(street);
        queryURL += "&AddressLine2=" + encodeURIComponent(city + " " + state + " " + zipCode);
        queryURL += "&UserKey";
        $.ajax({
            url: queryURL,
            method: "GET",
            headers: { "Access-Control-Allow-Origin": "*" }
        }).then(function (response) {
            if (response.ErrorCode == 0) {
                // Address is correct.
                street = response.AddressLine1;
                $("#street").val(street);

                city = response.City;
                $("#city").val(city);

                state = response.State;
                $("#state").val(state);

                zipCode = response.Zip;
                $("#zipcode").val(zipCode);

                //Proceed to the eletric rate.
                getEletricRate();
            }
            else {
                // Address is incorrect
                var errorMessage;
                errorMessage = "Please enter a correct address.";
                // Add extra error message handling.
                if (response.ErrorCode == 2 || response.ErrorCode == 3 || response.ErrorCode == 4 || response.ErrorCode == 5 || response.ErrorCode == 8) {
                    errorMessage += " " + response.ErrorMessage + ".";
                }
                $("#errorMessage").text(errorMessage);
            }
        });
    }
}

// Eletric Rate function to get the local eletric rate
function getEletricRate() {

    var street = $("#street").val();
    var city = $("#city").val();
    var state = $("#state").val();
    var zipCode = $("#zipcode").val();

    var addressString = encodeURIComponent(street + " " + city + " " + state + " " + zipCode);

    var queryURL = "https://developer.nrel.gov/api/census_rate/v3.json?api_key=WqBuSzoSbgbnKIqWHqwRteyGXs7hLFf4jBz54Luk&address=" + addressString;

    eletricRate = 0;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        eletricRate = response.outputs.residential / 100;
        console.log("Eletric Rate: " + eletricRate);

        getHashRate();
    });
}

// Terahashes function to get the terahashes rate.
function getHashRate() {

    hashRate = 0;

    // Opens a AJAX Query to block chain to get the current hash rate.
    $.ajax({
        // Block Chain Link
        url: "https://blockchain.info/q/hashrate", success: function (result) {

            //the API returns terahash per second, but we need terahashes per day at the given hash rate.
            console.log("Hashrate: " + result);

            // Conver the gigahash to terahash by dividing by 1000
            hashRate = (result / 1000) * 60 * 60 * 24;

            console.log("Terahashes per day of BTC network: " + hashRate);
            getBlocksPerDay();
        }
    });
}

//This number would be more accurate with an API call for the block height and using moment.js to calculate the difference over 24 hours, but we can use this as a working estimate (1 block every 10 minutes)
function getBlocksPerDay() {

    var milliSeconds = Date.now() - 86400000;
    console.log("Milliseconds: " + milliSeconds);

    var queryURL = "https://blockchain.info/blocks/" + milliSeconds + "?format=json&cors=true";
    blocksPerDay = 0;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        blocksPerDay = response.blocks.length;
        console.log("Blocks per day: " + blocksPerDay);

        setupMiners();
    });
}

// BitCoin mined per day
function bitCoinPerDay() {
    var bitcoinPerDay = blocksPerDay * 12.5;
    console.log("BitCoin per day: " + bitcoinPerDay);

    return bitcoinPerDay;
}

//we take hashes per day and divide that by bitcoin per day. This gives us the average amount of hashes to mine 1 BitCoin
function averageMiningHash() {
    var bitcoinPerDay = bitCoinPerDay();
    var terahashPerBTC = hashRate / bitcoinPerDay;

    console.log("Terahash per Bitcoin: " + terahashPerBTC);

    return terahashPerBTC;
}

function getHashesToWin() {

    var hashesToWin = 0;

    // Opens a AJAX Query to block chain to get the current hashes to win.
    $.ajax({
        // Block Chain Link
        url: "https://blockchain.info/q/hashestowin", success: function (result) {

            //the API returns terahash per second, but we need terahashes per day at the given hash rate.
            console.log("Hashes to win: " + result);

            //Terahash per day conversion
            hashesToWin = result;
        }
    });
    return hashesToWin;
}

function stageMiners(model, teraHashPerSecond, kWhPerHour, eletricRate, terahashPerBTC) {

    var minerStagingArea = {
        model: "",
        teraHashPerSecond: "",
        kWhPerHour: "",
        terahashPerHour: "",
        miningCostPerHour: "",
        miningHours: "",
        bitcoinCost: "",
        eletricRate: "",

        setModel: function (input) {
            this.model = input;
        },

        setTeraHashPerSecond: function (input) {
            this.teraHashPerSecond = input;
        },

        setKWhPerHour: function (input) {
            this.kWhPerHour = input;
        },

        setTerahashPerHour: function (input) {
            this.terahashPerHour = input;
        },

        metMiningCostPerHour: function (input) {
            this.miningCostPerHour = input;
        },

        setMiningHours: function (input) {
            this.miningHours = input;
        },

        setBitcoinCost: function (input) {
            this.bitcoinCost = input;
        },

        setEletricRate: function (input) {
            this.eletricRate = input;
        }
    }

    minerStagingArea.setModel(model);
    minerStagingArea.setTeraHashPerSecond(teraHashPerSecond);
    minerStagingArea.setKWhPerHour(kWhPerHour);
    minerStagingArea.setEletricRate(eletricRate);

    // Here we take the miners terahash per second, and multiply up to terahash / hour
    var minerTerahashPerHour = teraHashPerSecond * 60 * 60;
    console.log('Miners Terahash per hour ' + minerTerahashPerHour);
    minerStagingArea.setTerahashPerHour(minerTerahashPerHour);

    //here we calculate the cost to run the miner for 1 hour
    var miningCostPerHour = kWhPerHour * eletricRate;

    miningCostPerHour = miningCostPerHour.toFixed(2);
    console.log('cost per hour to run miner $' + miningCostPerHour);

    minerStagingArea.metMiningCostPerHour(miningCostPerHour);

    // here we calculate how many hours of mining it would take with 1 miner given the miners wattage

    var howManyHours = terahashPerBTC / minerTerahashPerHour;
    console.log('it will take about ' + howManyHours + ' hours to mine 1 bitcoin');
    minerStagingArea.setMiningHours(howManyHours);

    // this is the total cost to mine 1BTC at the given moment with 1 miner
    var costBTC = howManyHours * eletricRate

    costBTC = costBTC.toFixed(2);
    console.log('it will cost ' + costBTC + ' dollars to mine 1 bitcoin');

    minerStagingArea.setBitcoinCost(costBTC);

    bitcoinMiner.push(minerStagingArea);
}

function setupMiners() {
    var terahashPerBTC = averageMiningHash();

    // Add miners

    stageMiners("AntMiner S9k-14TH/s", 14, 28.56, eletricRate, terahashPerBTC);
    stageMiners("Antminer S9j-14TH/s", 14, 31.536, eletricRate, terahashPerBTC);
    stageMiners("DragonMiner", 16, 38.4, eletricRate, terahashPerBTC);
    stageMiners("AntMiner S9e-16TH/s", 16, 30.72, eletricRate, terahashPerBTC);
    stageMiners("Antminer T17-40TH/s", 40, 50.16, eletricRate, terahashPerBTC);
    stageMiners("Antminer S17-53TH/s", 53, 57.24, eletricRate, terahashPerBTC);





    var cost1 = bitcoinMiner[0].bitcoinCost;
    var cost2 = bitcoinMiner[1].bitcoinCost;
    var cost3 = bitcoinMiner[2].bitcoinCost;
    var cost4 = bitcoinMiner[3].bitcoinCost;
    var cost5 = bitcoinMiner[4].bitcoinCost;
    var cost6 = bitcoinMiner[5].bitcoinCost;

    new Chart(document.getElementById("bar-chart"), {
        type: 'bar',
        data: {
            labels: [bitcoinMiner[0].model, bitcoinMiner[1].model, bitcoinMiner[2].model, bitcoinMiner[3].model, bitcoinMiner[4].model, bitcoinMiner[5].model, ],
            datasets: [
                {
                    label: "Cost (USD)",
                    backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#563D7C", "#E34C26", "#F1E05A"],
                    data: [cost1, cost2, cost3, cost4, cost5, cost6]
                }
            ]
        },
        options: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Estimated Cost Per Bitcoin (USD)'
            }
        }
    });

}

$("#submitButton").on("click", getPostalAddress);