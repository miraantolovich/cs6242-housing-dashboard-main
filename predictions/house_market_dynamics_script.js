async function getPrediction(city, state) {
    const response = await fetch(`http://localhost:5000/predict?city=${city}&state=${state}`);
    const data = await response.json();
    return data;
}

// Set up map variables
var mapMargin = {top:10, left:10, right:10, bottom:10};
var mapWidth = 400 - mapMargin.left - mapMargin.right;
var mapHeight = 300 - mapMargin.top - mapMargin.bottom;

var mapChart = d3.select(".map-container")
                    .append("svg")
                    .attr("width", mapWidth + mapMargin.left + mapMargin.right)
                    .attr("height", mapHeight + mapMargin.top + mapMargin.bottom)
                    .append("g")
                    .attr("transform", "translate("+mapMargin.left+","+mapMargin.top+")");

// Set up chart variables
var chartMargin = {top:50, left:90, right:125, bottom:50};
var chartWidth = 400 - chartMargin.left - chartMargin.right;
var chartHeight = 300 - chartMargin.top - chartMargin.bottom;

var lineChart = d3.select(".chart")
                    .append("svg")
                    .attr("width", chartWidth + chartMargin.left + chartMargin.right)
                    .attr("height", chartHeight + chartMargin.top + chartMargin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");

// Set up prediction variables
var predMargin = {top:50, left:90, right:50, bottom:50};
var predWidth = 400 - predMargin.left - predMargin.right;
var predHeight = 300 - predMargin.top - predMargin.bottom;

var predChart = d3.select(".prediction")
                    .append("svg")
                    .attr("width", predWidth + predMargin.left + predMargin.right)
                    .attr("height", predHeight + predMargin.top + predMargin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + predMargin.left + "," + predMargin.top + ")");

// Set up the map 
var projection = d3.geoAlbers()
                    .scale(500)
                    .translate([mapWidth / 2, mapHeight / 2]);

var mapPath = d3.geoPath().projection(projection);

function type(d) {
    return {
        State: d.State,
        Year: +d.Year,
        Population: +d.Population,
        Employment: +d.Employment,
        AVG_Price: +d["AVG Price"].replace('$', '')
    };
}       

function drawLineChart(data) {

    lineChart.selectAll("*").remove();

    var xScale = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return +d.Year; }))
        .range([0, chartWidth]);
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return Math.max(+d.Population, +d.Employment, +d.AVG_Price); })])
        .range([chartHeight, 0]);
    var xAxis = d3.axisBottom(xScale)
        .tickValues(d3.range(d3.min(data, function(d) { return +d.Year; }), d3.max(data, function(d) { return +d.Year; }) + 1, 5))
        .tickFormat(d3.format("d"));
    var yAxis = d3.axisLeft(yScale);

    var lines = [
        { name: "Population", color: "blue", values: data.map(function(d) { return { x: +d.Year, y: +d.Population }; }) },
        { name: "Employment", color: "green", values: data.map(function(d) { return { x: +d.Year, y: +d.Employment }; }) },
        { name: "AVG Price", color: "red", values: data.map(function(d) { return { x: +d.Year, y: +d['AVG_Price'] }; }) }
    ];
    var line = d3.line()
        .x(function(d) { return xScale(d.x); })
        .y(function(d) { return yScale(d.y); });
    lines.forEach(function(l) {
        lineChart.append("path")
        .datum(l.values)
        .attr("fill", "none")
        .attr("stroke", l.color)
        .attr("stroke-width", 1.5)
        .attr("d", line);
    });

    lineChart.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(xAxis);
    lineChart.append("g")
        .attr("class", "y-axis")
        .call(yAxis);
    lineChart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -1 * (chartMargin.left - 5))
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "10px")
        .text("Value");
    lineChart.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight + 35)
        .style("text-anchor", "middle")
        .style("font-size", "10px")
        .text("Year");

    var legend = lineChart.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (chartWidth + 10) + ", 20)")
        .selectAll("g")
        .data(lines)
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
    
    legend.append("rect")
        .attr("x", 0)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", function(d) { return d.color; });
    
    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", "0.32em")
        .style("font-size", "14px")
        .text(function(d) { return d.name; });

    lineChart.attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");
}



function predResult(stateName) {
    d3.select("#cities-dropdown").remove();

    d3.csv("house_price_data.csv").then(function(data) {

        var filteredData = data.filter(function(d) {
            return d.State === stateName;
        });
  
    var groupedData = d3.nest()
                        .key(function(d) { return d.City; })
                        .entries(filteredData);

    var citiesList = groupedData.map(function(d) {
        return d.key;
    }).sort();

    var citySelect = d3.select(".prediction")
                        .append("select")
                        .attr("id", "cities-dropdown")
                        .attr("class", "dropdown")
    
    citySelect.selectAll("option")
                .data(citiesList)
                .enter()
                .append("option")
                .text(function(d) { return d + ", " + stateName; })
                .attr("value", function(d) { return d + ", " + stateName; });
     
    function getData() {

        predChart.selectAll("*:not(#chart-label)").remove();

        var cityState = citySelect.property("value").split(",");
        var city = cityState[0].trim();
        var state = cityState[1].trim();
        // console.log(city,", ",state);
  
        getPrediction(city, state).then(function(data) {
            
            // console.log(data);
            // console.log("Data type:", typeof data);

            if (typeof data === "string") {
                data = data.replace(/NaN/g, "null");
                data = JSON.parse(data);
            }
            
            var formattedData = data.map(function(d) {
                return {
                    year: +d[0],
                    month: +d[1],
                    price: +d[2],
                    date: new Date(+d[0], +d[1] - 1)
                };
            });

            var actualData = formattedData.filter(function(d) { return d.year < 2023; });
            var predictedData = formattedData.filter(function(d) { return d.year >= 2023; });

            var xScale = d3.scaleTime()
                .domain(d3.extent(formattedData, function(d) { return d.date; }))
                .range([0, predWidth]);

            var yScale = d3.scaleLinear()
                .domain([0, d3.max(formattedData, function(d) { return d.price; })])
                .range([predHeight, 0]);

            var actualLine = d3.line()
                .x(function(d) { return xScale(d.date); })
                .y(function(d) { return yScale(d.price); });
    
            var predictedLine = d3.line()
                .x(function(d) { return xScale(d.date); })
                .y(function(d) { return yScale(d.price); });

            predChart.append("path")
                .datum(actualData)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", actualLine);

            predChart.append("path")
                .datum(predictedData)
                .attr("fill", "none")
                .attr("stroke", "orange")
                .attr("stroke-width", 1.5)
                .attr("d", predictedLine);

            var xAxis = d3.axisBottom(xScale)
                        .ticks(d3.timeYear.every(4))
                        .tickFormat(d3.timeFormat("%Y"));

            predChart.append("g")
                .attr("transform", "translate(0," + predHeight + ")")
                .call(xAxis)
                .append("text")
                .attr("x", predWidth / 2)
                .attr("y", 35)
                .attr("fill", "black")
                .style("text-anchor", "middle")
                .text("Year");

            var yAxis = d3.axisLeft(yScale).ticks(5);

            predChart.append("g")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -predHeight / 2)
                .attr("y", -60)
                .attr("fill", "black")
                .style("text-anchor", "middle")
                .text("House Price");


        });
    }
  
    citySelect.on("change", getData);

    // Test
    // citySelect.on("change", function() { console.log(citySelect.property('value')) });
  
    }).catch(function(error) {
      console.log(error);
    });
  }
  
var tooltip = mapChart.append("text")
                    .attr("id", "tooltip")
                    .attr("x", 5)
                    .attr("y", 10)
                    .style("font-size","16px")
                    .style("visibility", "hidden");

var selectedState = null;
var clicked = 0;

var mapData;
d3.csv("map_data.csv", type).then( function(data) { mapData = data; });
d3.json("us-states_modified.json").then( function(data) {
    mapChart.append("g")
        .selectAll("path")
        .data(data.features)
        .enter().append("path")
        .attr("fill", "azure")
        .attr("d", mapPath)
        .style("stroke", "black")
        .on("mouseover", function(d) {
                                        if (clicked == 0) {
                                            d3.select(this).attr("fill", "magenta");
                                            d3.select('#tooltip').text("State: "+d.properties.name).style("visibility", "visible");
                                        }
                                    })
        .on("mouseout", function() {
                                        if (clicked == 0) {
                                            d3.select(this).attr("fill", "azure");
                                            d3.select('#tooltip').text("").style("visibility", "hidden");
                                            lineChart.selectAll("*").remove();
                                            predChart.selectAll("*").remove();
                                        }
                                    })
        .on("click", function(d) {
            if (clicked == 0) {
                clicked = 1;
            } else { 
                clicked = 0;
            };
            if (clicked == 1) {
                d3.select(selectedState).style("fill","magenta");
        
                if (selectedState === d.properties.name) {
                    lineChart.style("display", "none");
                    selectedState = null;
                } else {
                    clickedState = d.id;
        
                    var filteredData = mapData.filter(function(e) {
                        return e.State === clickedState;
                    });
        
                    drawLineChart(filteredData);
       
                    lineChart.style("display", "block");
                    lineChart.select("#chart-label").remove();
                    lineChart.append("text")
                        .attr("id", "chart-label")
                        .attr("x", 10 - chartMargin.left)
                        .attr("y", -25)
                        .text("Trands for State: " + clickedState)
                        .style("font-size", "12px");

                    predResult(clickedState);
                    
                    predChart.style("display", "block");
                    predChart.select("#chart-label").remove();
                    predChart.append("text")
                        .attr("id", "chart-label")
                        .attr("x", 10 - predMargin.left)
                        .attr("y", -25)
                        .text("AVG House Price Prediction for State: " + clickedState)
                        .style("font-size", "12px");
                }
            } else {
                mapChart.selectAll("path").attr("fill","azure");
                selectedState = null;
                d3.select("#cities-dropdown").remove();
                lineChart.selectAll("*").remove();
                predChart.selectAll("*").remove();
            }
        });
});
