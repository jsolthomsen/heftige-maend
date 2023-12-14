// Variabeldeklarationer
let mergedData;
let countryData;
let pathGenerator;
let zoom;
let svg;
let g;
let zoomContainer;
let width;
let height;
let legendHeight;

// Vent på at DOM'en er indlæst, før koden udføres
document.addEventListener("DOMContentLoaded", function () {
  width = 1200;
  height = 650;
  legendHeight = 20;

  // Opret SVG-container
  svg = d3
    .select("#worldmap")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Opret grupperingselementer til zoom
  zoomContainer = svg.append("g");
  g = zoomContainer.append("g");

  // Opret tooltip-element til at vise landeoplysninger ved hover
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Opsæt zoom-funktionalitet
  zoom = d3.zoom().on("zoom", function (event) {
    g.attr("transform", event.transform);
    g.selectAll("path").attr("d", (d) => pathGenerator(d));
  });

  // Anvend initial zoom-transform for at undgå initialt zoom-out
  svg.call(zoom.transform, d3.zoomIdentity);

  // Hent data fra serveren
  d3.json("https://nodejs-9zav.onrender.com/values")
    .then((serverData) => {
      // Kontroller om serverdataen er gyldig
      if (serverData && serverData.attacks) {
        // Behandl og fusioner data fra serveren
        mergedData = serverData.attacks.map((serverItem) => ({
          name: serverItem.name ? serverItem.name.toLowerCase() : null,
          value: serverItem.value,
        }));

        // Opret søjlediagram til top 5 lande - i bunden af kode
        createBarChart(mergedData, "#bar-chart-container");

        d3.json(
          "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
        )
          .then((data) => {
            // Kontroller om verdenskortdataen er gyldig
            if (data && data.objects && data.objects.countries) {
              // Konverter rå data til features
              const countries = topojson.feature(data, data.objects.countries);

              // Opsæt projektion baseret på dimensioner og landegrænser
              const projection = d3
                .geoMercator()
                .fitSize([width, height], countries)
                .scale(150)
                .translate([width / 2, height / 1.5]);

              // Konfigurer pathGenerator med den valgte projektion
              pathGenerator = d3.geoPath().projection(projection);

              // Gem landeobjekter globalt
              window.countries = countries;

              // Opsæt farveskala baseret på dataintervaller
              const maxDataValue = d3.max(mergedData, (d) => d.value);
              const colorScale = d3
                .scaleSequential(d3.interpolateReds)
                .domain([1, 200, 2000])
                .nice();

              // Opret container for legenden og placer den i bunden af ​​visualiseringen
              const legendContainer = zoomContainer
                .append("g")
                .attr("class", "legend-container")
                .attr(
                  "transform",
                  "translate(10, " + (height - legendHeight) + ")"
                );

              // Definer værdier for farvegradienten
              const legendValues = d3.range(0, 1.01, 1.01 / 100);

              // Opsæt bredde og farveskala for legenden
              const legendWidth = 300;
              const legendRectWidth = legendWidth;

              const legendColorScale = d3
                .scaleSequential(d3.interpolateReds)
                .domain([0, 1])
                .nice();

              // Opret et gradientforløb for farvelegenden
              const defs = legendContainer.append("defs");
              const linearGradient = defs
                .append("linearGradient")
                .attr("id", "legend-gradient")
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "70%")
                .attr("y2", "0%")
                .attr("x3", "100%")
                .attr("y3", "0%");

              // Tilføj farvepunkter til gradienten baseret på legendValues
              linearGradient
                .selectAll("stop")
                .data(legendValues)
                .enter()
                .append("stop")
                .attr("offset", (d) => d * 100 + "%")
                .attr("stop-color", (d) => legendColorScale(d));

              // Opret et rektangel for farvelegenden og anvend gradienten
              legendContainer
                .append("rect")
                .attr("width", legendWidth)
                .attr("height", legendHeight)
                .style("fill", "url(#legend-gradient)");

              // Definer tickværdier for legenden
              const tickValues = [1, 100, "500+"];

              // Tilføj linjer til at repræsentere tickværdier i legenden
              legendContainer
                .selectAll(".tick")
                .data(tickValues)
                .enter()
                .append("line")
                .attr("class", "tick")
                .attr(
                  "x1",
                  (d) =>
                    legendRectWidth *
                    (tickValues.indexOf(d) / (tickValues.length - 1))
                )
                .attr(
                  "x2",
                  (d) =>
                    legendRectWidth *
                    (tickValues.indexOf(d) / (tickValues.length - 1))
                )
                .attr("y1", 0)
                .attr("y2", legendHeight)
                .style("stroke", (d) => legendColorScale(d))
                .style("stroke-width", 2);

              // Tilføj en grå boks over gradienten for at repræsentere "no value"
              legendContainer
                .append("rect")
                .attr("width", legendHeight)
                .attr("height", legendHeight)
                .attr("x", 0)
                .attr("y", -80)
                .style("fill", "gray");

              // Tilføj tekst til den grå boks
              legendContainer
                .append("text")
                .attr("x", 70)
                .attr("y", -65)
                .attr("text-anchor", "middle")
                .attr("fill", "white")
                .attr("font-size", "25px")
                .text("= No Value");

              // Tilføj tekstetiketter til legenden
              legendContainer
                .selectAll(".tick-label")
                .data(tickValues)
                .enter()
                .append("text")
                .attr("class", "tick-label")
                .attr(
                  "x",
                  (d) =>
                    legendRectWidth *
                    (tickValues.indexOf(d) / (tickValues.length - 1))
                )
                .attr("y", -20)
                .attr("text-anchor", "middle")
                .attr("fill", "white")
                .attr("font-size", "25px")
                .text((d) => d);

              // Opret en pil for at angive værdien på kortet
              const arrowSize = 10;
              const arrow = legendContainer
                .append("polygon")
                .attr(
                  "points",
                  `0,0 ${arrowSize / 2},${arrowSize} ${arrowSize},0`
                )
                .style("fill", "black")
                .style("opacity", 0);

              // Find lande uden matchende data
              const unmatchedCountries = mergedData.filter((d) => {
                const matchingFeature = countries.features.find(
                  (f) =>
                    f.properties &&
                    f.properties.name &&
                    typeof f.properties.name === "string" &&
                    f.properties.name.trim().toLowerCase() ===
                      (d.name && typeof d.name === "string"
                        ? d.name.trim().toLowerCase()
                        : "")
                );
                return !matchingFeature;
              });

              // Filtrer Antarktis ud fra landeobjekterne
              const countriesFiltered = countries.features.filter(
                (country) => country.properties.name !== "Antarctica"
              );

              // Visualisér lande på kortet
              g.selectAll("path")
                .data(countriesFiltered)
                .enter()
                .append("path")
                .attr("class", "country")
                .attr("d", pathGenerator)
                .attr("fill", (d) => {
                  // Find matchende data for hvert land baseret på navn
                  const matchingData = mergedData.find((data) => {
                    const countryName = data.name
                      ? data.name.trim().toLowerCase()
                      : "";
                    return (
                      countryName === d.properties.name.trim().toLowerCase()
                    );
                  });
                  // Anvend farveskala baseret på matchende data eller grå, hvis ikke fundet
                  return matchingData ? colorScale(matchingData.value) : "gray";
                })
                .on("mouseover", function (event, d) {
                  // Vis tooltip og pil, når der holdes musen over et land
                  const feature =
                    d && d.type === "Feature" ? d : d3.select(this).datum();
                  if (
                    feature &&
                    feature.properties &&
                    feature.properties.name
                  ) {
                    const countryName = feature.properties.name;
                    const countryNameFromFeature = countryName.toLowerCase();

                    // Find data for det aktuelle land
                    countryData = mergedData.find((data) => {
                      const dataName = data.name
                        ? data.name.trim().toLowerCase()
                        : "";
                      return dataName === countryNameFromFeature;
                    });

                    // Vis tooltip med landeoplysninger
                    if (countryData && countryData.value) {
                      tooltip.transition().duration(200).style("opacity", 0.9);

                      tooltip
                        .html(
                          `<strong>${countryName}</strong><br/>Value: ${countryData.value}`
                        )
                        .style("left", event.pageX + 30 + "px")
                        .style("top", event.pageY - 30 + "px");

                      // Animer pilens position baseret på værdien
                      arrow
                        .transition()
                        .duration(200)
                        .style("opacity", 1)
                        .attr("transform", function () {
                          const legendScale = d3
                            .scaleLinear()
                            .domain([1, 200, 2000])
                            .range([0, legendWidth, legendWidth]);

                          const translateY = -arrowSize - 2;
                          const arrowPosition = countryData.value || 0;
                          const translateX = legendScale(arrowPosition);
                          return `translate(${
                            translateX - arrowSize / 2
                          }, ${translateY})`;
                        });
                    }
                    // Marker tooltip som aktiv
                    tooltip.classed("active", true);
                  }
                })
                .on("mouseout", function () {
                  // Skjul tooltip og pil, når musen forlader landet
                  tooltip.transition().duration(500).style("opacity", 0);
                  tooltip.classed("active", false);

                  arrow.transition().duration(200).style("opacity", 0);
                })
                .on("click", function (event, d) {
                  clicked(event, this, d);
                });
            } else {
              console.error("Invalid world map data structure:", data);
            }
          })
          .catch((error) =>
            console.error("Error loading world map data:", error)
          );
      } else {
        console.error("Invalid server response:", serverData);
      }
    })
    .catch((error) =>
      console.error("Error loading data from the server:", error)
    );
});

// Funktion kaldt ved klik på et land
function clicked(event, element, d) {
  // Kontroller om pathGenerator er defineret
  if (!pathGenerator) {
    console.error("Path generator is not defined.");
    return;
  }

  // Kontroller om landet er markeret som aktivt
  const isSelected = d3.select(element).classed("active");

  if (isSelected) {
    // Nulstil visualiseringen ved klik på et allerede markeret land
    reset(event);
  } else {
    hideAllFins();
    // Beregn bounds for det valgte land
    const [[x0, y0], [x1, y1]] = pathGenerator.bounds(d.geometry);
    event.stopPropagation();

    // Beregn zoom-parametre for at centrere og zoome til det valgte land
    const scaleFactor = Math.min(
      8,
      0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)
    );
    const translateX = width / 2 - (scaleFactor * (x0 + x1)) / 2;
    const translateY = height / 2 - (scaleFactor * (y0 + y1)) / 2;

    // Nulstil andre markerede lande og animer zoom og pan til det valgte land
    d3.selectAll(".country.active")
      .classed("active", false)
      .transition()
      .duration(750)
      .attr("d", pathGenerator);

    d3.select(element).classed("active", true).attr("d", pathGenerator);

    svg
      .transition()
      .duration(750)
      .call(
        zoom.transform,
        d3.zoomIdentity.translate(translateX, translateY).scale(scaleFactor)
      );
  }
}

// Funktion til at nulstille zoom og aktive lande
function reset(event, d) {
  // Kontroller om landeobjekter og pathGenerator er defineret
  if (!window.countries || window.countries.length === 0 || !pathGenerator) {
    console.error("Countries data or path generator is not defined.");
    return;
  }

  // Beregn bounds for alle lande
  const bounds = calculateBounds(window.countries);

  // Kontroller om bounds er gyldige
  if (!areValidBounds(bounds)) {
    console.error("Invalid bounds:", bounds);
    return;
  }

  // Animer zoom og pan tilbage til det fulde kortudsyn
  const duration = 750;
  const transform = d3.zoomIdentity;
  svg.transition().duration(duration).call(zoom.transform, transform);

  // Nulstil visualisering af aktive lande
  d3.selectAll(".country.active")
    .classed("active", false)
    .transition()
    .duration(duration)
    .attr("d", pathGenerator)
    .on("end", function () {
      showAllFins();
    });
}
// Funktion til at skjule alle finner
function hideAllFins() {
  const fins = document.querySelectorAll(".fin");
  fins.forEach((fin) => {
    fin.style.display = "none";
  });
}

// Funktion til at vise alle finner
function showAllFins() {
  const fins = document.querySelectorAll(".fin");
  fins.forEach((fin, index) => {
    fin.style.display = "block";
  });
}

// Funktion til at beregne bounds for alle lande, infinity og -infinity er startværdier
function calculateBounds(data) {
  const bounds = [
    [Infinity, Infinity],
    [-Infinity, -Infinity],
  ];

  // Beregn bounds for hvert land og opdater det globale bounds-objekt, henter koordinater forEach
  data.features.forEach((feature) => {
    const geometry = feature.geometry;
    const bbox = d3.geoBounds(geometry);

    bounds[0][0] = Math.min(bounds[0][0], bbox[0][0]);
    bounds[0][1] = Math.min(bounds[0][1], bbox[0][1]);
    bounds[1][0] = Math.max(bounds[1][0], bbox[1][0]);
    bounds[1][1] = Math.max(bounds[1][1], bbox[1][1]);
  });

  return bounds;
}

// Funktion til at kontrollere gyldigheden af bounds, sørger for at der er reelt tal
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

// Funktion til at oprette et søjlediagram for de 5 lande med flest værdier
function createBarChart(data) {
  // Sorter data baseret på værdier i faldende rækkefølge
  data.sort((a, b) => b.value - a.value);

  // Definerer de 5 lande med flest værdier
  const top5Countries = [
    {
      name: "USA",
      value: 2171,
      flag: "verdenskort/flag/usaflag.png",
      fact: '<br>The states with the most shark attacks ever recorded are Florida, Hawaii, California, and the Carolinas. Florida is known as the "shark attack capital of the world" and accounts for more than half of all shark attacks in the USA each year.',
      source: "https://www.siyachts.com/where-most-shark-attacks-occur",
    },

    {
      name: "Australia",
      value: 1302,
      flag: "verdenskort/flag/australiaflag.png",
      fact: "<br>- On average, one person is killed by a shark attack per year in Australia.<br>- 5 people die from falling out of bed.<br>- 10 people get struck by lightning.",
      source:
        "https://www.oceanlifeeducation.com.au/wp-content/uploads/2020/12/Australian-Sharks-Fact-Sheet_watermark.pdf",
    },

    {
      name: "South Africa",
      value: 571,
      flag: "verdenskort/flag/southafricaflag.png",
      fact: "<br>South Africa's coastlines are one of the top three global hotspots for shark and ray diversity, with 204 different species recorded.",
      source:
        "https://oceanographicmagazine.com/features/in-search-of-sharks-in-south-africa/",
    },

    {
      name: "Papua New Guinea",
      value: 160,
      flag: "verdenskort/flag/papuanewguineaflag.png",
      fact: "<br>Papua New Guinea (PNG) is home to 132 species of sharks and rays, including some of the most endangered species like hammerheads, sawfish, and rhino rays. However, global populations of several of these magnificent species have declined by more than 70%, and without intervention, they will go extinct in our waters.",
      source:
        "https://www.wwfpacific.org/?379175/TOWARDS-SAVING-SHARKS-AND-RAYS-IN-PNG",
    },

    {
      name: "New Zealand",
      value: 126,
      flag: "verdenskort/flag/newzealandflag.png",
      fact: "<br>In January 2020, it was discovered that three deep-sea shark species off the coast of New Zealand glow in the dark. Mallefet, an expert in bioluminescence from The Catholic University of Louvain in Belgium, says that other studies suggest around 10 percent of the world's approximately 540 shark species can glow.",
      source:
        "https://www.nzgeo.com/stories/glow-in-the-dark-sharks/\nhttps://www.bbc.com/news/world-asia-56256808",
    },
  ];

  // Opsæt dimensioner for søjlediagrammet
  const barChartWidth = 550;
  const barChartHeight = 500;

  // Opret en SVG-container til søjlediagrammet
  const barChartSvg = d3
    .select("#bar-chart-container")
    .append("svg")
    .attr("width", 575)
    .attr("height", 500)
    .attr("viewBox", `20 -70 500 600`)
    .attr("class", "bar-chart");

  // Opsæt skalaer for søjlediagrammet
  const xScale = d3
    .scaleBand()
    .domain(top5Countries.map((d) => d.name))
    .range([0, barChartWidth])
    .padding(0.3);

  const yScale = d3.scaleLinear().domain([0, 3000]).range([barChartHeight, 0]);

  barChartSvg
    .selectAll(".bar")
    .data(top5Countries)
    .enter()
    .append("g")
    .attr("class", "bar-group")
    .attr("transform", (d) => `translate(${xScale(d.name)}, 0)`)
    .on("mouseover", function (event, d) {
      // Vis tooltip ved mouseover
      tooltip.transition().duration(200).style("opacity", 0.9);

      // Opdater tooltip-indhold
      tooltip
        .html(
          `<span class="tooltitle"><strong>${d.name}</strong><br/>Total shark attacks: ${d.value}</span><br><br/><strong>Fun Fact:</strong> ${d.fact}<br/><br/> <span id="source">Source: <a href="${d.source}" target="_blank">${d.source}</a></span>`
        )
        .style("left", "300px")
        .style("top", "2400px")
        .style("pointer-events", "auto");
    })
    .on("mouseout", function (d) {
      // Skjul tooltip ved mouseout
      tooltip.transition().duration(2000).style("opacity", 0);
    })

    .each(function (d) {
      // Tilføj flagbillede
      d3.select(this)
        .append("image")
        .attr("href", d.flag)
        .attr("width", xScale.bandwidth())
        .attr("height", xScale.bandwidth())
        .attr("y", yScale(d.value) - 70);

      // Tilføj søjle
      d3.select(this)
        .append("rect")
        .attr("class", "bar")
        .attr("y", yScale(d.value))
        .attr("width", xScale.bandwidth())
        .attr("height", barChartHeight - yScale(d.value))
        .attr("fill", "steelblue");
    });

  // Opret tooltip-element til at vise landeoplysninger ved hover
  const tooltip = d3
    .select("#bar-chart-container")
    .append("div")
    .attr("class", "tooltip2")
    .style("opacity", 0);

  tooltip
    .on("mouseover", function () {
      // Forhindre, at tooltip'en forsvinder ved mouseover
      tooltip.transition().duration(0);
    })
    .on("mouseout", function (d) {
      // Skjul tooltip ved mouseout
      tooltip.transition().duration(500).style("opacity", 0);
    });

  // Tilføj x-akse til søjlediagrammet
  barChartSvg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${barChartHeight})`)
    .call(d3.axisBottom(xScale).tickSize(0))
    .selectAll("text")
    .style("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("dy", "20");

  // Tilføj y-akse til søjlediagrammet
  barChartSvg
    .append("g")
    .attr("class", "y-axis")
    .call(
      d3
        .axisLeft(yScale)
        .ticks(d3.max(top5Countries, (d) => d.value) / 500)
        .tickFormat(d3.format(""))
    )
    .selectAll("text")
    .attr("font-size", "13px");
}
