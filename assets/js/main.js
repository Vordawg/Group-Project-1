var bitcoinMiner = [];

// Postal Address function to get the local postal address
function getPostalAddress() {
    event.preventDefault();

    var street = $("#street").val();
    var city = $("#city").val();
    var state = $("#state").val();
    var zipCode = $("#zipcode").val();

    var queryURL = "https://www.yaddress.net/api/address?AddressLine1=" + encodeURIComponent(street.trim());
    queryURL += "&AddressLine2=" + encodeURIComponent(city.trim() + " " + state.trim() + " " + zipCode.trim());
    queryURL += "&cors=true";

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        if (response.ErrorCode == 0) {
            // Address is correct.
            street = response.AddressLine1;
            $("#street").text(street);

            city = response.City;
            $("#city").text(city);

            state = response.State;
            $("#state").text(state);

            zipCode = response.Zip;
            $("#zipcode").text(zipCode);

            //Proceed to the calculations.
            setupMiners();
        }
        else {
            // Address is incorrect

        }
    });
}

// Eletric Rate function to get the local eletric rate
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

// Terahashes function to get the terahashes rate.
function getHashRate() {

    var hashRate = 0;

    // Opens a AJAX Query to block chain to get the current hash rate.
    $.ajax({
        // Block Chain Link
        url: "https://blockchain.info/q/hashrate", success: function (result) {

            //the API returns terahash per second, but we need terahashes per day at the given hash rate.
            console.log("Hashrate: " + result);

            //Terahash per day conversion
            hashRate = result * 60 * 60 * 24;
            console.log("Terahashes per day of BTC network: " + hashrate);
        }
    });
    return hashRate;
}

//This number would be more accurate with an API call for the block height and using moment.js to calculate the difference over 24 hours, but we can use this as a working estimate (1 block every 10 minutes)
function getBlocksPerDay() {

    var today = new Date();

    var myFormat = "MM/DD/YYYY hh:mm:ss";
    var convertedDate = moment(today, myFormat);
    convertedDate = convertedDate.add(moment.duration(-1, "days"));

    var milliSeconds = convertedDate.milliseconds() + 1000 * (convertedDate.seconds() + 60 * (convertedDate.minutes() + 60 * convertedDate.hours()));

    console.log(milliSeconds);

    var queryURL = "https://blockchain.info/blocks/" + milliSeconds + "?format=json&cors=true";
    var blocksPerDay = 0;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        blocksPerDay = response.blocks.length;
    });

    return blocksPerDay;
}

// BitCoin mined per day
function bitCoinPerDay() {
    var blocksPerDay = getBlocksPerDay();
    var bitcoinPerDay = blocksPerDay * 12.5;
    console.log("BitCoin per day: " + bitcoinPerDay);

    return bitcoinPerDay;
}

//we take hashes per day and divide that by bitcoin per day. This gives us the average amount of hashes to mine 1 BitCoin
function averageMiningHash() {
    var hashrate = getHashRate();
    var bitcoinPerDay = bitCoinPerDay();
    var terahashPerBTC = hashrate / bitcoinPerDay;

    return terahashPerBTC;
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
    var miningCostPerHour = kWhPerHour * electRate;
    console.log('cost per hour to run miner $ ' + miningCostPerHour);
    minerStagingArea.metMiningCostPerHour(miningCostPerHour);

    // here we calculate how many hours of mining it would take with 1 miner given the miners wattage
    var howManyHours = terahashPerBTC / minerTerahashPerHour;
    console.log('it will take about ' + howManyHours + 'hours to mine 1 BTC');
    minerStagingArea.setMiningHours(howManyHours);

    // this is the total cost to mine 1BTC at the given moment with 1 miner
    var costBTC = howManyHours * eletricRate
    console.log('it will cost ' + costBTC + ' dollars to mine 1 BTC');
    inerStagingArea.setBitcoinCost(costBTC);

    bitcoinMiner.push(stagingArea);
}

function setupMiners() {
    // Call APIs once for all the miners
    var eletricRate = getEletricRate();
    var terahashPerBTC = averageMiningHash();

    // Add miners
    stageMiners("AntMiner S9", 16, 33, eletricRate, terahashPerBTC);
    stageMiners("DragonMiner", 16, 38.4, eletricRate, terahashPerBTC);
    stageMiners("Antminer t17", 40, 52.8, eletricRate, terahashPerBTC);
}

$("#submit").on("click", getPostalAddress);
