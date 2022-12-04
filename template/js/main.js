// Hint: This is a good place to declare your global variables

// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', function () {
    // Hint: create or set your svg element inside this function

    // This will load your CSV files and store them into an array.
    Promise.all([d3.json('data/us-states.json'), d3.csv('data/sampleData.csv')])
        .then(function (values) {
            const json = values[0]
            const data = values[1]
            console.log('loaded sampleData.csv', data)

            // Hint: This is a good spot for doing data wrangling

            drawMap()
        })
})

// Use this function to draw the choropleth map
function drawMap() {
}