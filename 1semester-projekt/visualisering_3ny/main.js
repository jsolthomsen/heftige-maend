let data;

//HENT DATA
d3.json("http://localhost:3000/attacks")
  .then((responseData) => {
    data = responseData.attacks;
    // Behandle dataen og opret diagrammet
    handleData(data);
  })
  .catch((error) => {
    console.error("There was a problem with the fetch operation:", error);
  });

// Funktion til at håndtere dataen
function handleData(data) {
  console.log("Data from server:", data);

  // Tjek om nødvendige nøgler findes i mindst ét element i data
  const keyCheck =
    data.length > 0 &&
    data[0].hasOwnProperty("antal_personer") &&
    data[0].hasOwnProperty("fatal") &&
    data[0].hasOwnProperty("sex_id");

  if (!keyCheck) {
    console.error(
      "Data is missing necessary keys. Please check your data structure."
    );
    return;
  }

  // Konverter dataformatet til det forventede format
  const formattedData = data.map((d) => ({
    gender: d.sex_id === 7 ? "Female" : "Male",
    fatality: d.fatal === "Y" ? "Fatal" : "Non-Fatal",
    population: parseInt(d.antal_personer),
  }));

  // Opret diagrammet med den formaterede data
  const chart = createChart(data); //har ændret formattedData til data

  // Tilføj diagrammet til DOM'en eller gør det, der er nødvendigt for at vise det.
  document.body.appendChild(chart);
}

/*
//fiktivt datasæt
const data = [
  { gender: "Male", fatality: "Non-Fatal", population: 24 },
  { gender: "Male", fatality: "Fatal", population: 53 },
  { gender: "Male", fatality: "andet", population: 0 },
  { gender: "Female", fatality: "Non-Fatal", population: 15 },
  { gender: "Female", fatality: "Fatal", population: 7 },
  { gender: "Female", fatality: "andet", population: 0 },
];
*/

function createChart(data) {
  // Specify the chart’s dimensions.
  const width = 928;
  const height = 500;
  const marginTop = 10;
  const marginRight = 10;
  const marginBottom = 20;
  const marginLeft = 40;

  console.log(data);

  // Determine the series that need to be stacked.
  const series = d3
    .stack()
    .keys(d3.union(data.map((d) => d.fatal))) // distinct series keys, in input order
    .value(([, D], key) => D.get(key).antal_personer)(
    // get value for each series key and stack
    d3.index(
      data,
      (d) => d.sex_id,
      (d) => d.fatal
    )
  ); // group by stack then series key

  // Prepare the scales for positional and color encodings.
  const x = d3
    .scaleBand()
    .domain(
      d3.groupSort(
        data,
        (D) => -d3.sum(D, (d) => d.antal_personer),
        (d) => d.sex_id
      )
    )
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(series, (d) => d3.max(d, (d) => d[1]))])
    .rangeRound([height - marginBottom, marginTop]);

  // Angiv dine egne farver i et array
  const customColors = ["blue", "red"];

  const color = d3
    .scaleOrdinal()
    .domain(series.map((d) => d.key))
    .range(customColors)
    .unknown("#ccc");

  // A function to format the value in the tooltip.
  const formatValue = (x) => (isNaN(x) ? "N/A" : x.toLocaleString("en"));

  // Create the SVG container.
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  // Append a group for each series, and a rect for each element in the series.
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
        `${d.data[0]} ${d.key}\n${formatValue(
          d.data[1].get(d.key).antal_personer
        )}`
    );

  // Append the horizontal axis.
  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .call((g) => g.selectAll(".domain").remove());

  // Append the vertical axis.
  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y).ticks(null, "s"))
    .call((g) => g.selectAll(".domain").remove());

  //Legend

  // Farveskala til legenden
  const legendColor = d3
    .scaleOrdinal()
    .domain(series.map((d) => d.key).reverse()) // Reverse rækkefølgen af domænet
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
    .style("font-size", "12px")
    .text((d) => d);

  // Return the chart with the color scale as a property (for the legend).
  return Object.assign(svg.node(), { scales: { color } });
}

const chart = createChart(data);

// Tilføj diagrammet til DOM'en eller gør det, der er nødvendigt for at vise det.
document.body.appendChild(chart);
