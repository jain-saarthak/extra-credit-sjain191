// Winners: https://www.kaggle.com/datasets/brandonconrady/us-presidential-election-results-1788-2020?resource=download

// Results: https://www.kaggle.com/datasets/tunguz/us-elections-dataset

var winners = [], elections = [], json, svg, x, y, xAxis, yAxis
const margin = {top: 30, right: 30, bottom: 70, left: 60}, newWidth = 1000 - margin.left - margin.right, newHeight = 600 - margin.top - margin.bottom
var color = d3.scaleLinear()
    .range(["rgb(69,173,168)", "#d62728", "#1f77b4"]);
var projection = d3.geoAlbersUsa().translate([newWidth / 2.5, newHeight / 1.65]).scale([1000]);          // scale things down so see entire US        
var path = d3.geoPath().projection(projection);          // path generator that will convert GeoJSON to SVG paths
var legendText = ["Republican", "Democratic"];

// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', function () {
    Promise.all([d3.csv('data/processed_winners.csv'), d3.csv('data/processed_elections.csv'), d3.json('data/us-states.json')])
        .then(function (values) {
            winners = values[0]
            elections = values[1]
            json = values[2]

            drawVisualization()
            drawGraph(json)
        })
})

function drawVisualization() {
    let doc = document.getElementById("dropdown")
    let year = doc.options[doc.selectedIndex].text
    let winningData = winners.filter(d => d['ElectionYear'] == year)
    document.getElementById('winningParty').innerText = winningData[0].PartyAffiliation;
    document.getElementById('winningPresident').innerText = winningData[0].Winner;
    document.getElementById('winningVicePresident').innerText = winningData[0]["Vice President"];
    drawGraph(json)
}

function drawGraph(json) {
    d3.select("#my_dataviz").selectAll('*').remove()
    svg = d3.select("#my_dataviz").append("svg").attr("width", 1000).attr("height", 600).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    let doc = document.getElementById("dropdown")
    let year = doc.options[doc.selectedIndex].text
    let filteredElections = elections.filter(d => d['year'] == year)
    color.domain([0, 1, 2]); 
    for (var i = 0; i < filteredElections.length; i++) {
        // Grab State Name
        var dataState = filteredElections[i].state;

        // Find the corresponding state inside the GeoJSON
        for (var j = 0; j < json.features.length; j++) {
            var jsonState = json.features[j].properties.name;
            var democrats = 'Not Given', republicans = 'Not Given'
            if (dataState == jsonState) {
                democrats = +filteredElections[i].democratic, republicans = +filteredElections[i].republican
                // Copy the data value into the JSON
                var dataValue
                if (democrats > republicans) {
                    dataValue = 2
                } else if (democrats < republicans) {
                    dataValue = 1
                } 

                json.features[j].properties.visited = dataValue;
                json.features[j].properties.democrats = democrats;
                json.features[j].properties.republicans = republicans;                

                // Stop looking through the JSON
                break;
            }
        }
    }

    var toolTip = d3.select('body').append('div').attr('class', 'tooltip').attr('width', '125px').attr('height', '100px').style('position', 'absolute').style('text-align', 'center').style('background-color', 'white').style('border', 'solid').style('border-width', '2px').style('border-radius', '4px').style('pointer-events', 'none')

    svg.selectAll("path").data(json.features).enter().append("path").attr("d", path).style("stroke", "#000").style("stroke-width", "1.5").style("fill", d => d.properties.visited ? color(d.properties.visited) : "rgb(213, 222, 217)")
    .on('mouseover', function(d, i) {
        toolTip.style('opacity', 1);
        toolTip.html('State: ' + i.properties.name + '<br>' + 'Democrats: ' + i.properties.democrats.toLocaleString() + '<br>' + 'Republicans: ' + i.properties.republicans.toLocaleString()).style('left', (d.pageX) + 'px').style('top', (d.pageY - 30) + 'px');
        d3.select(this).attr('fill', '#8dd3c7').style('cursor', 'pointer')
    })
    .on('mouseout', function() {
        toolTip.style('opacity', 0)
        d3.select(this).style('cursor', 'default')
    })

    var keyColor = d3.scaleOrdinal().domain(legendText).range(["#d62728", "#1f77b4", "rgb(213,222,217)"])

    var size = 20
    // Key Color
    svg.selectAll("mydots").data(legendText).enter().append("rect").attr("x", 250).attr("y", (d, i) => (5 + i * (size + 4))).attr("width", size).attr("height", size).style("fill", d => keyColor(d))

    // Key Value
    svg.selectAll("mylabels").data(legendText).enter().append("text").attr("x", 250 + size * 1.5).attr("y", (d, i) => (6 + i * (size + 5) + (size / 2))).text(function (d) { return d }).attr("text-anchor", "left").style("alignment-baseline", "middle")
}