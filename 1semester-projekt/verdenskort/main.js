let mergedData;
let countryData;
let pathGenerator;
let zoom;
let svg;
let g;
let zoomContainer;
let width;
let height;

document.addEventListener('DOMContentLoaded', function () {
    width = 1200;
    height = 800;

    svg = d3.select('body').append('svg')
        .attr('width', width)
        .attr('height', height);

    zoomContainer = svg.append('g');
    g = zoomContainer.append('g');

    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    zoom = d3.zoom().on("zoom", function (event) {
        g.attr("transform", event.transform);
        g.selectAll('path')
            .attr('d', d => pathGenerator(d));
    });

    svg.call(zoom.transform, d3.zoomIdentity);

    d3.json('http://localhost:3000/attacks')
        .then(serverData => {
            if (serverData && serverData.attacks) {
                mergedData = serverData.attacks.map(serverItem => ({
                    name: serverItem.name ? serverItem.name.toLowerCase() : null,
                    value: serverItem.value
                }));

                console.log('Merged Data:', mergedData);

                d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
                    .then(data => {
                        if (data && data.objects && data.objects.countries) {
                            const countries = topojson.feature(data, data.objects.countries);
                            const projection = d3.geoMercator()
                                .fitSize([width, height], countries)
                                .scale(150)
                                .translate([width / 2, height / 1.5]);
                            pathGenerator = d3.geoPath().projection(projection);

                            // Set the global countries variable
                            window.countries = countries;

                            const maxDataValue = d3.max(mergedData, d => d.value);
                            const colorScale = d3.scaleSequential(d3.interpolateReds)
                                .domain([1, 200, 1000, maxDataValue])
                                .nice();

                            





const legendValues = [0, 1, 100, 1000];

const colorForZero = 'gray';

const legendColors = legendValues.map(value => (value === 0 ? colorForZero : colorScale(value)));


const legend = zoomContainer.append('g')  
  .attr('id', 'legend')  
  .attr('transform', 'translate(0, ' + (height - 100) + ')');


legend.selectAll('rect')
  .data(legendColors)
  .enter()
  .append('rect')
  .attr('width', 18)
  .attr('height', 18)
  .attr('x', 10)
  .attr('y', (d, i) => i * 25)
  .attr('class', 'legend-rect')
  .style('fill', d => d);

legend.selectAll('text')
  .data(legendValues)
  .enter()
  .append('text')
  .attr('x', 35)
  .attr('y', (d, i) => i * 25 + 9)
  .attr('dy', '0.32em')
  .attr('class', 'legend-text')
  .text(d => d);

  svg.append(() => legend.node());



                            const unmatchedCountries = mergedData.filter(d => {
                                const matchingFeature = countries.features.find(f => f.properties && f.properties.name && typeof f.properties.name === 'string' && f.properties.name.trim().toLowerCase() === (d.name && typeof d.name === 'string' ? d.name.trim().toLowerCase() : ''));
                                return !matchingFeature;
                            });

                            console.log('Unmatched Countries:', unmatchedCountries);

                            const countriesFiltered = countries.features.filter(country => country.properties.name !== 'Antarctica');

                            g.selectAll('path')
                                .data(countriesFiltered)
                                .enter().append('path')
                                .attr('class', 'country')
                                .attr('d', pathGenerator)
                                .attr('fill', d => {
                                    const matchingData = mergedData.find(data => {
                                        const countryName = data.name ? data.name.trim().toLowerCase() : '';
                                        return countryName === d.properties.name.trim().toLowerCase();
                                    });
                                    return matchingData ? colorScale(matchingData.value) : 'gray';
                                })
                                .on('mouseover', function (event, d) {
                                    const feature = d && d.type === 'Feature' ? d : d3.select(this).datum();
                                
                                    if (feature && feature.properties && feature.properties.name) {
                                        const countryName = feature.properties.name;
                                        const countryNameFromFeature = countryName.toLowerCase();
                                
                                        countryData = mergedData.find(data => {
                                            const dataName = data.name ? data.name.trim().toLowerCase() : '';
                                            return dataName === countryNameFromFeature;
                                        });
                                
                                        if (countryData && countryData.value) {
                                            tooltip.transition()
                                                .duration(200)
                                                .style('opacity', .9);
                                
                                            tooltip.html(`<strong>${countryName}</strong><br/>Value: ${countryData.value}`)
                                                .style('left', (event.clientX + 10) + 'px')
                                                .style('top', (event.clientY + 10) + 'px');
                                        }
                                        tooltip.classed('active', true);
                                    }
                                })
                                
                                .on('mouseout', function () {
                                    tooltip.transition()
                                        .duration(500)
                                        .style('opacity', 0);
                                    tooltip.classed('active', false);
                                })
                                .on('click', function (event, d) {
                                    clicked(event, this, d);
                                });
                        } else {
                            console.error('Invalid world map data structure:', data);
                        }
                    })
                    .catch(error => console.error('Error loading world map data:', error));
            } else {
                console.error('Invalid server response:', serverData);
            }
        })
        .catch(error => console.error('Error loading data from the server:', error));
});


function clicked(event, element, d) {
    if (!pathGenerator) {
        console.error('Path generator is not defined.');
        return;
    }

    const isSelected = d3.select(element).classed("active");

    if (isSelected) {
        reset(event);
    } else {
        const [[x0, y0], [x1, y1]] = pathGenerator.bounds(d.geometry);
        event.stopPropagation();

        const scaleFactor = Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height));
        const translateX = width / 2 - scaleFactor * (x0 + x1) / 2;
        const translateY = height / 2 - scaleFactor * (y0 + y1) / 2;

        d3.selectAll('.country.active') 
            .classed('active', false)
            .transition().duration(750).attr('d', pathGenerator);

        d3.select(element)
            .classed('active', true)
            .attr('d', pathGenerator);

        svg.transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity.translate(translateX, translateY).scale(scaleFactor)
        );
    }
}

function reset(event, d) {
    if (!window.countries || window.countries.length === 0 || !pathGenerator) {
        console.error('Countries data or path generator is not defined.');
        return;
    }

    const bounds = calculateBounds(window.countries);


    if (!areValidBounds(bounds)) {
        console.error('Invalid bounds:', bounds);
        return;
    }

    
    const duration = 750;

    
    const transform = d3.zoomIdentity;

    
    svg.transition().duration(duration).call(zoom.transform, transform);
    
    
    d3.selectAll('.country.active')
        .classed('active', false)
        .transition().duration(duration).attr('d', pathGenerator);
}



function calculateBounds(data) {
    const bounds = [[Infinity, Infinity], [-Infinity, -Infinity]];

    data.features.forEach(feature => {
        const geometry = feature.geometry;
        const bbox = d3.geoBounds(geometry);

        bounds[0][0] = Math.min(bounds[0][0], bbox[0][0]);
        bounds[0][1] = Math.min(bounds[0][1], bbox[0][1]);
        bounds[1][0] = Math.max(bounds[1][0], bbox[1][0]);
        bounds[1][1] = Math.max(bounds[1][1], bbox[1][1]);
    });

    return bounds;
}

function areValidBounds(bounds) {
    return (
        Array.isArray(bounds) &&
        bounds.length === 2 &&
        Array.isArray(bounds[0]) &&
        bounds[0].length === 2 &&
        Array.isArray(bounds[1]) &&
        bounds[1].length === 2 &&
        isFinite(bounds[0][0]) &&
        isFinite(bounds[0][1]) &&
        isFinite(bounds[1][0]) &&
        isFinite(bounds[1][1])
    );
}
