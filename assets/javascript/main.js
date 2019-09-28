var bitcoinMiner = [];
var eletricRate;
var hashRate;
var blocksPerDay;

// Postal Address function to get the local postal address
function getPostalAddress() {
    event.preventDefault();

    var street = $("#streethelp").val().trim();
    var city = $("#cityhelp").val().trim();
    var state = $("#statehelp").val().trim();
    var zipCode = $("#zipcode").val().trim();

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
            $("#streethelp").text(street);

            city = response.City;
            $("#cityhelp").text(city);

            state = response.State;
            $("#statehelp").text(state);

            zipCode = response.Zip;
            $("#zipcode").text(zipCode);

            //Proceed to the eletric rate.
            getEletricRate();
        }
        else {
            // Address is incorrect

        }
    });
}

// Eletric Rate function to get the local eletric rate
function getEletricRate() {

    var street = $("#streethelp").val();
    var city = $("#cityhelp").val();
    var state = $("#statehelp").val();
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


    var milliSeconds = Date.now() - 86400000; console.log("Milliseconds: " + milliSeconds);

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
    console.log('cost per hour to run miner $' + miningCostPerHour);
    minerStagingArea.metMiningCostPerHour(miningCostPerHour);

    // here we calculate how many hours of mining it would take with 1 miner given the miners wattage

    var howManyHours = terahashPerBTC / minerTerahashPerHour;
    console.log('it will take about ' + howManyHours + ' hours to mine 1 bitcoin');
    minerStagingArea.setMiningHours(howManyHours);

    // this is the total cost to mine 1BTC at the given moment with 1 miner
    var costBTC = howManyHours * eletricRate
    console.log('it will cost ' + costBTC + ' dollars to mine 1 bitcoin');
    minerStagingArea.setBitcoinCost(costBTC);

    bitcoinMiner.push(minerStagingArea);
}

function setupMiners() {
    var terahashPerBTC = averageMiningHash();

    // Add miners
    stageMiners("AntMiner S9", 16, 33, eletricRate, terahashPerBTC);
    stageMiners("DragonMiner", 16, 38.4, eletricRate, terahashPerBTC);
    stageMiners("Antminer t17", 40, 52.8, eletricRate, terahashPerBTC);

    var cost1 = bitcoinMiner[0].bitcoinCost;
    var cost2 = bitcoinMiner[1].bitcoinCost;
    var cost3 = bitcoinMiner[2].bitcoinCost;

    cost1 = cost1.toFixed(2);
    cost2 = cost2.toFixed(2);
    cost3 = cost3.toFixed(2);

    new Chart(document.getElementById("bar-chart"), {
        type: 'bar',
        data: {
          labels: [bitcoinMiner[0].model, bitcoinMiner[1].model, bitcoinMiner[2].model],
          datasets: [
            {
              label: "Cost (USD)",
              backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f"],
              data: [cost1, cost2, cost3]
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