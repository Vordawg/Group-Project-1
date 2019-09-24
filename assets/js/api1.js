// pull the hash rate from the blockchain API - Done accessible by getHashRate() method.
//run the hash rate through an equation to calculate how many kilowatt hours it would take to mine 1 bitcoin whats the equation??
//pull the utility data for user location with the openei API to calculate users cost per kilowatt hour in electricity rates
//use the users data to calculate how much it would cost them to mine 1 bitcoin

// Get the total amount of miners running based on the amount of hash rate and ghs of each miner.
function getTotalRunning(hashrate, ghsOfMiner) {
    // Returns Divides the hash rate which is in GHS by the GHS of each miner.
    return hashrate / ghsOfMiner;
}

// Get the total power required to run all the miners for 1 hour based on the kWh per miner.
function getTotalPower1Hour(totalMiners, kWh) {
    // Returns Multiplies the total miners by the amount of kWh each miner consumes.
    return totalMiners * kWh;
}

// Get the amount of kWh required to mine 1 bitcoin based on the total power required to run all the miners.
function getkWhPerBitcoin(totalPower) {
    // Returns total power divided by 75 (amount of bitcoins mined in a hour)
    return totalPower / 75;
}

// Main function which calculates the kWh required to mine 1 bitcoin.
function calculate(ghs, kWh, zipCode) {
    // Opens a AJAX Query to block chain to get the current hash rate.
    $.ajax({
        // Block Chain Link
        url: "https://blockchain.info/q/hashrate", success: function (result) {
            // Logs the current hash rate for debugging purposes.
            console.log("Hashrate: " + result);
            // Calculates the total miners equivalent to the hash rate.
            var totalMiners = getTotalRunning(result, ghs);
            // Logs the total miners for debugging purposes.
            console.log("Total Miners: " + totalMiners);
            // Calculates the total power required to run all the powers based on the kWh provided.
            var totalPower = getTotalPower1Hour(totalMiners, kWh);
            // Logs the total power for debugging purposes.
            console.log("Total Power: " + totalPower);
            // Calculates kWh required to mine 1 bitcoin.
            var kWhPerBitcoin = getkWhPerBitcoin(totalPower);
            // Logs the kWh required to mine 1 bitcoin for debugging purposes.
            console.log("kWh Per Bitcoin: " + kWhPerBitcoin);
            // Returns the kwHPerBitcoin number.

            var queryURL = "https://developer.nrel.gov/api/cleap/v1/cities?api_key=WqBuSzoSbgbnKIqWHqwRteyGXs7hLFf4jBz54Luk&zip=" + zipCode;

            var gisjoinKey = "";


            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function (response) {

                gisjoinKey = response.result[0].gisjoin;
                gisjoinKey = gisjoinKey.trim();

                if (gisjoinKey.length > 0) {

                    queryURL = "https://developer.nrel.gov/api/cleap/v1/energy_expenditures_and_ghg_by_sector?api_key=WqBuSzoSbgbnKIqWHqwRteyGXs7hLFf4jBz54Luk&gisjoin=" + gisjoinKey;


                    $.ajax({
                        url: queryURL,
                        method: "GET"
                    }).then(function (response) {


                        var housingUnits = response.result.residential.housing_units;

                        var electricRate = response.result.residential.elec_mwh / housingUnits / 1000;

                        console.log("Electric Rate: " + electricRate);

                        var costPerBitcoin = electricRate * kWhPerBitcoin;

                        costPerBitcoin = costPerBitcoin.toFixed(2);

                        console.log("Cost Per Bitcoin: $" + costPerBitcoin);

//design the web page 
//and call the function and provide the parameters and it does the magic :o  

                        return costPerBitcoin;
                    });

                }

            });

        }
    });
}
