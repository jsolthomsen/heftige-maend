let rawData;
let data;
const chartContainer = document.getElementById("chart-container");

// HENT DATA: Brug af d3.json til at hente data fra en ekstern API
d3.json("https://nodejs-9zav.onrender.com/attacks").then((responseData) => {
  rawData = responseData.attacks;
  // Behandler dataen og opret diagrammet
  handleData(rawData);
});

// Funktion til at håndtere dataen
function handleData(rawData) {
  // Konverter dataformatet til det forventede format
  const data = rawData.map((d) => ({
    gender: d.sex_id === 7 ? "Female" : "Male",
    fatality: d.fatal === "Y" ? "Fatal" : "Non-Fatal",
    population: parseInt(d.antal_personer),
  }));

  // Opret diagrammet med den formaterede data
  createChart(data);
}

// Funktion til oprettelse af diagram
function createChart(data) {
  // Specifikation af diagrammets dimensioner
  const width = 928;
  const height = 780;
  const marginTop = 50;
  const marginRight = 10;
  const marginBottom = 20;
  const marginLeft = 40;

  // Bestem hvilke serier der skal stables
  const series = d3
    .stack()
    .keys(d3.union(data.map((d) => d.fatality)))
    .value(([, D], key) => D.get(key).population)(
    // Hent værdi for hver serienøgle og stack
    d3.index(
      data,
      (d) => d.gender,
      (d) => d.fatality
    )
  );

  // Forbereder skalaer til positionering og farvekodning
  const x = d3
    .scaleBand()
    .domain(
      d3.groupSort(
        data,
        (D) => -d3.sum(D, (d) => d.population),
        (d) => d.gender
      )
    )
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(series, (d) => d3.max(d, (d) => d[1]))])
    .rangeRound([height - marginBottom, marginTop]);

  // Angiver egne farver
  const customColors = ["steelblue", "firebrick"];

  const color = d3
    .scaleOrdinal()
    .domain(series.map((d) => d.key))
    .range(customColors)
    .unknown("#ccc");

  // Funktion til at formatere værdien i tooltip
  const formatValue = (x) => (isNaN(x) ? "N/A" : x.toLocaleString("en"));

  // Opret SVG-containeren
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  // Tilføj en gruppe for hver serie og en rektangel for hvert element i serien
  svg
    .append("g")
    .selectAll()
    .data(series)
    .join("g")
    .attr("fill", (d) => color(d.key))
    .selectAll("rect")
    .data((D) => D.map((d) => ((d.key = D.key), d)))
    .join("rect")
    .attr("x", (d) => x(d.data[0]))
    .attr("y", (d) => y(d[1]))
    .attr("height", (d) => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .append("title")
    .text(
      (d) =>
        `${d.data[0]} ${d.key}\n${formatValue(d.data[1].get(d.key).population)}`
    );

  // Tilføj den horisontale akse
  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .call((g) => g.selectAll(".domain").remove())
    .selectAll("text") // Vælg alle aksetekster
    .style("font-size", "15px"); // Angiv ønsket fontstørrelse

  // Tilføj den vertikale akse
  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y).ticks(null, "s"))
    .call((g) => g.selectAll(".domain").remove())
    .selectAll("text") // Vælg alle aksetekster
    .style("font-size", "14px"); // Angiv ønsket fontstørrelse

  //Legend

  // Farveskala til legenden
  const legendColor = d3
    .scaleOrdinal()
    .domain(series.map((d) => d.key)) // Vend rækkefølgen af domænet
    .range(customColors);

  // Opret legend
  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - marginRight - 100},${marginTop})`); // Justér placeringen efter behov

  legend
    .selectAll("rect")
    .data(legendColor.domain())
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d, i) => i * 20)
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", (d) => legendColor(d));

  legend
    .selectAll("text")
    .data(legendColor.domain())
    .enter()
    .append("text")
    .attr("x", 25)
    .attr("y", (d, i) => i * 20 + 9)
    .attr("dy", "0.35em")
    .style("font-size", "16px")
    .text((d) => d);

  //tooltip

  // Vælg tooltip-elementet
  const tooltipFatality = d3.select("#tooltipFatality");

  // Tilføj et rektangel for hvert element i serien
  svg
    .append("g")
    .selectAll()
    .data(series)
    .join("g")
    .attr("fill", (d) => color(d.key))
    .selectAll("rect")
    .data((D) => D.map((d) => ((d.key = D.key), d)))
    .join("rect")
    .attr("x", (d) => x(d.data[0]))
    .attr("y", (d) => y(d[1]))
    .attr("height", (d) => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .on("mouseover", handleMouseOver)
    .on("mousemove", function (event) {
      tooltipFatality
        .style("left", event.pageX + 30 + "px")
        .style("top", event.pageY - 30 + "px");
    })
    .on("mouseout", handleMouseOut);

  // Funktion til at håndtere mouseover-event
  function handleMouseOver(event, d) {
    tooltipFatality.transition().duration(200).style("opacity", 0.9);
    tooltipFatality
      .html(
        `${d.data[0]} ${d.key}<br>${formatValue(
          d.data[1].get(d.key).population
        )}`
      )
      .style("left", event.pageX + 30 + "px")
      .style("top", event.pageY - 30 + "px");
  }

  // Funktion til at håndtere mouseout-event
  function handleMouseOut() {
    tooltipFatality.transition().duration(500).style("opacity", 0);
  }

  // Tilføj diagrammet til DOM'en eller gør det, der er nødvendigt for at vise det.
  chartContainer.appendChild(svg.node());
}
