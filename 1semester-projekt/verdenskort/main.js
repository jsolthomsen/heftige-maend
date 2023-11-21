const verdenskortet = document.getElementById("verdenskortet");
// Variabeldeklarationer
let mergedData;          // Samlet data fra serveren og verdenskortet
let countryData;         // Data for det aktuelt valgte land
let pathGenerator;       // Generator for projektion af landegrænser til SVG-stier
let zoom;                // Zoom-funktionalitet
let svg;                 // SVG-container til visualiseringen
let g;                   // Gruppeelement til landene
let zoomContainer;       // Container til zoom-funktionaliteten
let width;               // Bredde på visualiseringen
let height;              // Højde på visualiseringen
let legendHeight;        // Højden af ​​legen

// Vent på at DOM'en er indlæst, før koden udføres
document.addEventListener('DOMContentLoaded', function () {


    // Initialiser dimensionerne på visualiseringen
    width = 1200;
    height = 650;
    legendHeight = 20;

    // Opret SVG-container
    svg = d3.select('#verdenskortet').append('svg')
        .attr('width', width)
        .attr('height', height);

    // Opret grupperingselementer til zoom
    zoomContainer = svg.append('g');
    g = zoomContainer.append('g');

    // Opret tooltip-element til at vise landeoplysninger ved hover
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    // Opsæt zoom-funktionalitet
    zoom = d3.zoom().on("zoom", function (event) {
        g.attr("transform", event.transform);
        g.selectAll('path')
            .attr('d', d => pathGenerator(d));
    });

    // Anvend initial zoom-transform for at undgå initialt zoom-out
    svg.call(zoom.transform, d3.zoomIdentity);

    // Hent data fra serveren
    d3.json('http://localhost:3000/values')
        .then(serverData => {
            // Kontroller om serverdataen er gyldig
            if (serverData && serverData.attacks) {
                // Behandl og fusioner data fra serveren
                mergedData = serverData.attacks.map(serverItem => ({
                    name: serverItem.name ? serverItem.name.toLowerCase() : null,
                    value: serverItem.value
                }));

                // Udskriv fusioneret data til konsollen
                console.log('Merged Data:', mergedData);

                // Hent verdenskortdata
                d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
                    .then(data => {
                        // Kontroller om verdenskortdataen er gyldig
                        if (data && data.objects && data.objects.countries) {
                            // Konverter rå data til features
                            const countries = topojson.feature(data, data.objects.countries);

                            // Opsæt projektion baseret på dimensioner og landegrænser
                            const projection = d3.geoMercator()
                                .fitSize([width, height], countries)
                                .scale(150)
                                .translate([width / 2, height / 1.5]);

                            // Konfigurer pathGenerator med den valgte projektion
                            pathGenerator = d3.geoPath().projection(projection);

                            // Gem landeobjekter globalt
                            window.countries = countries;

                            // Opsæt farveskala baseret på dataintervaller
                            const maxDataValue = d3.max(mergedData, d => d.value);
                            const colorScale = d3.scaleSequential(d3.interpolateReds)
                                .domain([1, 200, 2000])
                                .nice();

                            // Opret container for legenden og placer den i bunden af ​​visualiseringen
                            const legendContainer = zoomContainer.append('g')
                                .attr('class', 'legend-container')
                                .attr('transform', 'translate(10, ' + (height - legendHeight) + ')');

                            // Definer værdier for farvegradienten
                            const legendValues = d3.range(0, 1.01, 1.01 / 100);

                            // Opsæt bredde og farveskala for legenden
                            const legendWidth = 300;
                            const legendRectWidth = legendWidth;

                            const legendColorScale = d3.scaleSequential(d3.interpolateReds)
                                .domain([0, 1])
                                .nice();

                            // Opret et gradientforløb for farvelegenden
                            const defs = legendContainer.append('defs');
                            const linearGradient = defs.append('linearGradient')
                                .attr('id', 'legend-gradient')
                                .attr('x1', '0%')
                                .attr('y1', '0%')
                                .attr('x2', '70%')
                                .attr('y2', '0%')
                                .attr('x3', '100%')
                                .attr('y3', '0%');

                            // Tilføj farvepunkter til gradienten baseret på legendValues
                            linearGradient.selectAll('stop')
                                .data(legendValues)
                                .enter().append('stop')
                                .attr('offset', d => d * 100 + '%')
                                .attr('stop-color', d => legendColorScale(d));

                            // Opret et rektangel for farvelegenden og anvend gradienten
                            legendContainer.append('rect')
                                .attr('width', legendWidth)
                                .attr('height', legendHeight)
                                .style('fill', 'url(#legend-gradient)');

                            // Definer tickværdier for legenden
                            const tickValues = [1, 100, '500+'];

                            // Tilføj linjer til at repræsentere tickværdier i legenden
                            legendContainer.selectAll('.tick')
                                .data(tickValues)
                                .enter().append('line')
                                .attr('class', 'tick')
                                .attr('x1', d => legendRectWidth * (tickValues.indexOf(d) / (tickValues.length - 1)))
                                .attr('x2', d => legendRectWidth * (tickValues.indexOf(d) / (tickValues.length - 1)))
                                .attr('y1', 0)
                                .attr('y2', legendHeight)
                                .style('stroke', d => legendColorScale(d))
                                .style('stroke-width', 2);

                            // Tilføj tekstetiketter til legenden
                            legendContainer.selectAll('.tick-label')
                                .data(tickValues)
                                .enter().append('text')
                                .attr('class', 'tick-label')
                                .attr('x', d => legendRectWidth * (tickValues.indexOf(d) / (tickValues.length - 1)))
                                .attr('y', -20)
                                .attr('text-anchor', 'middle')
                                .attr('fill', 'white')
                                .text(d => d);

                            // Opret en pil for at angive værdien på kortet
                            const arrowSize = 10;
                            const arrow = legendContainer.append('polygon')
                                .attr('points', `0,0 ${arrowSize / 2},${arrowSize} ${arrowSize},0`)
                                .style('fill', 'black')
                                .style('opacity', 0);

                            // Find lande uden matchende data
                            const unmatchedCountries = mergedData.filter(d => {
                                const matchingFeature = countries.features.find(f => f.properties && f.properties.name && typeof f.properties.name === 'string' && f.properties.name.trim().toLowerCase() === (d.name && typeof d.name === 'string' ? d.name.trim().toLowerCase() : ''));
                                return !matchingFeature;
                            });

                            // Udskriv lande uden matchende data til konsollen
                            console.log('Unmatched Countries:', unmatchedCountries);

                            // Filtrer Antarktis ud fra landeobjekterne
                            const countriesFiltered = countries.features.filter(country => country.properties.name !== 'Antarctica');

                            // Visualisér lande på kortet
                            g.selectAll('path')
                                .data(countriesFiltered)
                                .enter().append('path')
                                .attr('class', 'country')
                                .attr('d', pathGenerator)
                                .attr('fill', d => {
                                    // Find matchende data for hvert land
                                    const matchingData = mergedData.find(data => {
                                        const countryName = data.name ? data.name.trim().toLowerCase() : '';
                                        return countryName === d.properties.name.trim().toLowerCase();
                                    });
                                    // Anvend farveskala baseret på matchende data eller grå, hvis ikke fundet
                                    return matchingData ? colorScale(matchingData.value) : 'gray';
                                })
                                .on('mouseover', function (event, d) {
                                    // Vis tooltip og pil, når der holdes musen over et land
                                    const feature = d && d.type === 'Feature' ? d : d3.select(this).datum();
                                    if (feature && feature.properties && feature.properties.name) {
                                        const countryName = feature.properties.name;
                                        const countryNameFromFeature = countryName.toLowerCase();

                                        // Find data for det aktuelle land
                                        countryData = mergedData.find(data => {
                                            const dataName = data.name ? data.name.trim().toLowerCase() : '';
                                            return dataName === countryNameFromFeature;
                                        });

                                        // Vis tooltip med landeoplysninger
                                        if (countryData && countryData.value) {
                                            tooltip.transition()
                                                .duration(200)
                                                .style('opacity', .9);

                                            tooltip.html(`<strong>${countryName}</strong><br/>Value: ${countryData.value}`)
                                                .style('left', (event.clientX + 10) + 'px')
                                                .style('top', (event.clientY + 10) + 'px');

                                            // Animer pilens position baseret på værdien
                                            arrow.transition().duration(200)
                                                .style('opacity', 1)
                                                .attr('transform', function () {
                                                    const legendScale = d3.scaleLinear()
                                                        .domain([1, 200, 2000])
                                                        .range([0, legendWidth, legendWidth]);

                                                    const translateY = -arrowSize - 2;
                                                    const arrowPosition = countryData.value || 0;
                                                    const translateX = legendScale(arrowPosition);
                                                    return `translate(${translateX - arrowSize / 2}, ${translateY})`;
                                                });
                                        }
                                        // Marker tooltip som aktiv
                                        tooltip.classed('active', true);
                                    }
                                })
                                .on('mouseout', function () {
                                    // Skjul tooltip og pil, når musen forlader landet
                                    tooltip.transition()
                                        .duration(500)
                                        .style('opacity', 0);
                                    tooltip.classed('active', false);

                                    arrow.transition().duration(200)
                                        .style('opacity', 0);
                                })
                                .on('click', function (event, d) {
                                    // Kald klikfunktionen ved klik på et land
                                    clicked(event, this, d);
                                });
                        } else {
                            // Udskriv fejl, hvis verdenskortdatastrukturen er ugyldig
                            console.error('Invalid world map data structure:', data);
                        }
                    })
                    .catch(error => console.error('Error loading world map data:', error));
            } else {
                // Udskriv fejl, hvis serverens svar er ugyldigt
                console.error('Invalid server response:', serverData);
            }
        })
        .catch(error => console.error('Error loading data from the server:', error));
});

// Funktion kaldt ved klik på et land
function clicked(event, element, d) {
    // Kontroller om pathGenerator er defineret
    if (!pathGenerator) {
        console.error('Path generator is not defined.');
        return;
    }

    // Kontroller om landet er markeret som aktivt
    const isSelected = d3.select(element).classed("active");

    if (isSelected) {
        // Nulstil visualiseringen ved klik på et allerede markeret land
        reset(event);
    } else {
        // Beregn bounds for det valgte land
        const [[x0, y0], [x1, y1]] = pathGenerator.bounds(d.geometry);
        event.stopPropagation();

        // Beregn zoom-parametre for at centrere og zoome til det valgte land
        const scaleFactor = Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height));
        const translateX = width / 2 - scaleFactor * (x0 + x1) / 2;
        const translateY = height / 2 - scaleFactor * (y0 + y1) / 2;

        // Nulstil andre markerede lande og animer zoom og pan til det valgte land
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

// Funktion til at nulstille zoom og aktive lande
function reset(event, d) {
    // Kontroller om landeobjekter og pathGenerator er defineret
    if (!window.countries || window.countries.length === 0 || !pathGenerator) {
        console.error('Countries data or path generator is not defined.');
        return;
    }

    // Beregn bounds for alle lande
    const bounds = calculateBounds(window.countries);

    // Kontroller om bounds er gyldige
    if (!areValidBounds(bounds)) {
        console.error('Invalid bounds:', bounds);
        return;
    }

    // Animer zoom og pan tilbage til det fulde kortudsyn
    const duration = 750;
    const transform = d3.zoomIdentity;
    svg.transition().duration(duration).call(zoom.transform, transform);

    // Nulstil visualisering af aktive lande
    d3.selectAll('.country.active')
        .classed('active', false)
        .transition().duration(duration).attr('d', pathGenerator);
}

// Funktion til at beregne bounds for alle lande
function calculateBounds(data) {
    const bounds = [[Infinity, Infinity], [-Infinity, -Infinity]];

    // Beregn bounds for hvert land og opdater det globale bounds-objekt
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

// Funktion til at kontrollere gyldigheden af bounds
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