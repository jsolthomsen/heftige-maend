document.addEventListener('DOMContentLoaded', function () {
    
    function swim() {
        const shark = document.querySelector(".shark");
        const water = document.querySelector(".water");
    
        if (shark && water) {
            shark.classList.add("shark-delay");
    
            // Nulstil vandanimationen
            water.style.animation = "none";
            void water.offsetWidth; // Trigger reflow (repaint) for at annullere animationen
            water.style.animation = null;
    
            setTimeout(function () {
                shark.classList.remove("shark-delay");
                water.style.animation = "riseAndFall 20s linear"; // Start vandanimationen igen
            }, 0); // Nulstil med en lille forsinkelse for at sikre, at det sker umiddelbart efter
    
            generateBubbles();

            setTimeout(function () {
                water.style.animationPlayState = "paused"; // Stop vandanimationen
            }, 20000); // Fjern .shark-delay efter yderligere 20 sekunder
        } else {
            console.error("Couldn't find shark or water element.");
        }
    }

    function generateBubbles() {
        const numBubbles = 20; // Antallet af bobler
        const water = document.querySelector(".water");
    
        for (let i = 0; i < numBubbles; i++) {
            const bubble = document.createElement("div");
            bubble.classList.add("bubble");
            bubble.style.left = Math.random() * 100 + "%";
            bubble.style.animationDuration = Math.random() * 3 + 2 + "s";
            water.appendChild(bubble);
        }
    }
    
    swim(); // Start svømmeanimationen ved indlæsning
    
    setInterval(swim, 120000); // Gentag svømmeanimationen hvert andet minut
    
    const width = 1000;
    const height = 600;
    
    const svg = d3.select('body').append('svg')
        .attr('width', width)
        .attr('height', height);
    
    const g = svg.append('g');
    
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);
    
    const d3 = require('d3');
    const topojson = require('topojson-client');
    const pgp = require('pg-promise')();
    const connection = {
        host: 'cornelius.db.elephantsql.com',
        port: 5432,
        database: 'unuklejt',
        user: 'unuklejt',
        password: 'Z5NH7zyiMpplaW6mEOTWyWqTM50a-11s'
    };
    const db = pgp(connection);
    
    let mergedData; // Declare mergedData in the outer scope
    
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
        .then(data => {
            const countries = topojson.feature(data, data.objects.countries);
            const projection = d3.geoMercator().fitSize([width, height], countries);
            const pathGenerator = d3.geoPath().projection(projection);
    
            // Fetch data from ElephantSQL
            db.any('SELECT country, value FROM sharkattacks') // replace 'your_table_name' with the actual table name
                .then(sqlData => {
                    // Map SQL data to match the structure of fictiveData
                    const serverData = {
                        data: sqlData.map(row => ({
                            name: row.country,
                            value: row.value
                        }))
                    };
    
                    // Now you can use serverData instead of fictiveData
                    mergedData = countries.features.map(feature => {
                        // Your existing matching and merging logic...
                    });
    
                    // Continue with the rest of your D3.js code...
    
                    // Dynamically set color scale domain based on data values
                    const maxDataValue = d3.max(mergedData, d => d.value);
                    const colorScale = d3.scaleSequential(d3.interpolateBlues)
                        .domain([0, maxDataValue])
                        .nice();
    
                    console.log('Color Scale Domain:', colorScale.domain());
    
                    // Draw map with colored countries
                    // ...
    
                    g.selectAll('path')
                        .data(mergedData)
                        .enter().append('path')
                        .attr('class', 'country')
                        .attr('d', pathGenerator)
                        .attr('fill', d => colorScale(d.value))
                        // ...
                        .on('mouseover', function (event, d) {
                            console.log('Mouseover event triggered:', event, d);
    
                            // Check if 'd' is a GeoJSON feature
                            const feature = d && d.type === 'Feature' ? d : d3.select(this).datum();
    
                            if (feature && feature.properties && feature.properties.name) {
                                const countryName = feature.properties.name;
    
                                console.log('Country data found:', feature);
    
                                tooltip.transition()
                                    .duration(200)
                                    .style('opacity', .9);
    
                                tooltip.html(`<strong>${countryName}</strong><br/>Value: ${feature.value}`)
                                    .style('left', (event.pageX) + 'px')
                                    .style('top', (event.pageY - 28) + 'px');
                            } else {
                                console.error('Country data not found or invalid:', feature);
                            }
                        })
                        .on('mouseout', function () {
                            tooltip.transition()
                                .duration(500)
                                .style('opacity', 0);
                        });
    
                    // ...
                })
                .catch(error => console.error('Error loading data from ElephantSQL:', error));
        })
        .catch(error => console.error('Error loading world map data:', error));
    
});
