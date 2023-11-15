document.addEventListener('DOMContentLoaded', function () {
    const width = 1000;
    const height = 600;


    const svg = d3.select('body').append('svg')
        .attr('width', width)
        .attr('height', height);


    const g = svg.append('g');


    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);


    let mergedData; // Declare mergedData in the outer scope


    const fictiveData = {
        data: [
            { "name": "Canada", "value": 50 },
            { "name": "United States of America", "value": 75 },
            { "name": "Brazil", "value": 30 },
            { "name": "Russia", "value": 60 },
            { "name": "China", "value": 80 },
            // ... (other data)
        ]
    };


    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
        .then(data => {
            const countries = topojson.feature(data, data.objects.countries);
            const projection = d3.geoMercator().fitSize([width, height], countries);
            const pathGenerator = d3.geoPath().projection(projection);


            // Normalize case for fictive data names
            const normalizedFictiveDataNames = fictiveData.data.map(data => data.name.toLowerCase().trim());


            // Print out unique country names from both datasets
            const uniqueFictiveDataNames = new Set(normalizedFictiveDataNames);
            const uniqueFeatureNames = new Set(countries.features.map(feature => feature.properties.name.toLowerCase().trim()));


            console.log('Unique Fictive Data Names:', Array.from(uniqueFictiveDataNames));
            console.log('Unique Feature Names:', Array.from(uniqueFeatureNames));


            // Function to calculate similarity ratio between two strings
            function calculateSimilarity(str1, str2) {
                const normalize = str => str.toLowerCase().trim();
                const normalizedStr1 = normalize(str1);
                const normalizedStr2 = normalize(str2);


                let longer = normalizedStr1;
                let shorter = normalizedStr2;


                if (normalizedStr1.length < normalizedStr2.length) {
                    longer = normalizedStr2;
                    shorter = normalizedStr1;
                }


                const longerLength = longer.length;


                if (longerLength === 0) {
                    return 1.0; // Both strings are empty, perfect match
                }


                return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
            }


            // Function to calculate edit distance between two strings
            function editDistance(str1, str2) {
                str1 = str1.toLowerCase();
                str2 = str2.toLowerCase();


                const costs = new Array();
                for (let i = 0; i <= str1.length; i++) {
                    let lastValue = i;
                    for (let j = 0; j <= str2.length; j++) {
                        if (i === 0) {
                            costs[j] = j;
                        } else {
                            if (j > 0) {
                                let newValue = costs[j - 1];
                                if (str1.charAt(i - 1) !== str2.charAt(j - 1)) {
                                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                                }
                                costs[j - 1] = lastValue;
                                lastValue = newValue;
                            }
                        }
                    }
                    if (i > 0) {
                        costs[str2.length] = lastValue;
                    }
                }
                return costs[str2.length];
            }


            mergedData = countries.features.map(feature => {
                let featureName = feature.properties.name || feature.properties;
           
                if (typeof featureName === 'object') {
                    featureName = featureName.name;
                }
           
                const lowerCaseFeatureName = featureName.toLowerCase().trim();
           
                // Find the best match
                const matches = normalizedFictiveDataNames.map(fictiveName => ({
                    name: fictiveName,
                    similarity: calculateSimilarity(lowerCaseFeatureName, fictiveName),
                }));
           
                const bestMatch = matches.reduce((best, current) => (current.similarity > best.similarity ? current : best));
           
                console.log('Matching:', bestMatch.similarity > 0.5, 'Best Match:', bestMatch.name);
           
                if (bestMatch.similarity > 0.5) {
                    const countryData = fictiveData.data.find(data => data.name.toLowerCase().trim() === bestMatch.name.toLowerCase().trim());
           
                    return {
                        ...feature,
                        value: countryData.value,
                        name: countryData.name,
                    };
                } else {
                    console.warn(`Country data not found for: ${featureName}`);
                    return {
                        ...feature,
                        value: 0,
                        name: '',
                    };
                }
            });
           
// ...


           


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
        .catch(error => console.error('Error loading world map data:', error));
});
