const w = 1000;
const h = 500;

const padding = 10;

const axisPadding = 70;

const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

async function fetchDataAndRender() {
  try {
    const data = await fetchContent("/data/albums.json");
    const svg = d3.select("body").append("svg").attr("width", w).attr("height", h + 50);

    const barsGroup = svg.append("g").attr("class", "bars-group");

    let yScale = null;
    let xScale = null;
    let xAxis = null;
    let yAxis = null;

    let dataset = data;

    init(dataset, false);

    d3.selectAll("#rating, #productionYear, #favorites").on("click", function (e) {
      let id = e.target.id;
      let isFastest = id === "favorites";

      sortData(id);

      console.log("Sorted data by " + id + " : ", dataset);

      updateChart();
    });

    function init(dataset, isFastest) {
      setUp(dataset, isFastest);

      createDefaultChart(dataset);
      console.log("yScale domain:", yScale.domain());

      addAxes();
    }

    function setUp(dataset, isFastest) {
      yScale = createScaleY(dataset);
      xScale = createScaleX(dataset);

      xAxis = createAxisX(xScale, isFastest);
      yAxis = createAxisY(yScale);
    }

    function createDefaultChart(dataset) {
      barsGroup
        .selectAll(".bar")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function (d, i) {
          return xScale(i) + padding;
        })
        .attr("y", function (d) {
          return yScale(d.rating);
        })
        .attr(
          "width",
          w / dataset.length - 2 * padding - (2 * axisPadding) / dataset.length
        )
        .attr("height", function (d) {
          const height = h - padding - axisPadding - yScale(d.rating);
          return height;
        })
        .attr("fill", function (d) {
          return "rgb(0, 0, " + (256 - d.rating) + ")";
        });

      barsGroup
        .selectAll(".bar-label")
        .data(dataset)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", function (d, i) {
          return xScale(i) + padding + (w / dataset.length - 2 * padding) / 2;
        })
        .attr("y", function (d) {
          return yScale(d.rating) - 10; 
        })
        .attr("text-anchor", "middle")
        .text(function (d) {
          return d.rating;
        });
    }

    function createScaleX(dataset) {
      return (
        d3
          .scaleBand()
          .range([padding + axisPadding, w - padding - axisPadding])
          .domain(dataset.map((d, i) => i))
      );
    }

    function createScaleY(dataset) {
        return d3
          .scaleLinear()
          .domain([
            0,
            d3.max(dataset, function (d) {
              return +d.rating;
            }),
          ])
          .range([h - padding - axisPadding, padding + axisPadding])
          .nice();
      }      
      

    function createAxisY(yScale) {
      return d3.axisLeft().scale(yScale).ticks(5);
    }


function createAxisX(xScale, isFastest) {
    return d3
      .axisBottom()
      .scale(xScale)
      .tickFormat(function (d) {
        return dataset[d].albumName; 
      });
  }
  

    function addAxes() {
      svg
        .append("g")
        .attr("transform", "translate(0," + (h - padding - axisPadding) + ")")
        .attr("id", "xAxis");

      svg
        .append("g")
        .attr("transform", "translate(" + (padding + axisPadding) + ",0)")
        .attr("id", "yAxis")
        .call(yAxis);

      formatAxisX();
    }

    function formatAxisX() {
      svg
        .select("#xAxis")
        .call(xAxis)
        .call(xAxis.tickSize(0))
        .selectAll("text")
        .attr("transform", "translate(-10,5)rotate(-45)")
        .style("text-anchor", "end");
    }

    function updateChart() {
        const randomColor = d3.interpolateRainbow(Math.random());
    
        barsGroup
            .selectAll(".bar")
            .data(dataset)
            .transition()
            .duration(1000)
            .attr("x", function (d, i) {
                return xScale(i) + padding;
            })
            .attr("y", function (d) {
                return yScale(d.rating);
            })
            .attr("width", w / dataset.length - 2 * padding - (2 * axisPadding) / dataset.length)
            .attr("height", function (d) {
                return h - padding - axisPadding - yScale(d.rating);
            })
            .attr("fill", randomColor);
    
        barsGroup
            .selectAll(".bar-label")
            .data(dataset)
            .transition()
            .duration(1000)
            .attr("x", function (d, i) {
                return xScale(i) + padding + (w / dataset.length - 2 * padding) / 2;
            })
            .attr("y", function (d) {
                return yScale(d.rating) - 10;
            })
            .text(function (d) {
                return d.rating;
            })
            .attr("fill", randomColor);
    
        svg.select("#xAxis").call(xAxis);
        svg.select("#yAxis").call(yAxis);
    
        barsGroup.selectAll(".bar")
            .on("mouseover", function (event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
    
                const tooltipContent = `${d.albumName}<br>Year: ${d.productionYear}<br>Rating: ${d.rating}<br>Favorites: ${d.favorites}`;
                tooltip.html(tooltipContent)
                    .style("left", (event.pageX || event.clientX + window.pageXOffset) + "px")
                    .style("top", (event.pageY || event.clientY + window.pageYOffset - 28) + "px");
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    }
    
    

    function sortData(by) {
      if (by === "rating") {
        dataset.sort(function (a, b) {
          return a.rating - b.rating;
        });
      } else if (by === "productionYear") {
        dataset.sort(function (a, b) {
          return a.productionYear - b.productionYear;
        });
      } else if (by === "favorites") {
        dataset.sort(function (a, b) {
          return a.favorites - b.favorites;
        });
      }

      updateChart();
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

fetchDataAndRender();

async function fetchContent(url) {
  let request = await fetch(url);
  let json = await request.json();
  return json;
}
