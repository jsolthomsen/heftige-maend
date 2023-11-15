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

    let ratingYScale;
    let favoritesYScale;
    let productionYearYScale;
    let xScale;
    let xAxis;
    let ratingYAxis;
    let favoritesYAxis;
    let productionYearYAxis;

    let dataset = data;

    init(dataset, false);

    d3.selectAll("#rating, #productionYear, #favorites").on("click", function (e) {
      let id = e.target.id;
      let isFastest = id === "favorites";

      sortData(id);

      console.log("Sorted data by " + id + " : ", dataset);

      updateChart(id);
    });

    function init(dataset, isFastest) {
      setUp(dataset, isFastest);

      createDefaultChart(dataset);
      console.log("yScale domain:", ratingYScale.domain());

      addAxes();
    }

    function setUp(dataset, isFastest) {
      ratingYScale = createRatingScaleY(dataset);
      favoritesYScale = createFavoritesScaleY(dataset);
      productionYearYScale = createProductionYearScaleY(dataset);
      xScale = createScaleX(dataset);

      xAxis = createAxisX(xScale, isFastest);
      ratingYAxis = createAxisY(ratingYScale);
      favoritesYAxis = createAxisY(favoritesYScale);
      productionYearYAxis = createAxisY(productionYearYScale);
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
          return ratingYScale(d.rating);
        })
        .attr(
          "width",
          w / dataset.length - (2 * padding) - (2 * axisPadding) / dataset.length
        )
        .attr("height", function (d) {
          return h - padding - axisPadding - ratingYScale(d.rating);
        })
        .attr("fill", function (d) {
          return "rgb(0, 0, " + (255 - d.rating) + ")";
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
          return ratingYScale(d.rating) - 10; 
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
          .domain(dataset.map((d, i) => i))
          .range([padding + axisPadding, w - padding - axisPadding])
      );
    }

    function createRatingScaleY(dataset) {
        return d3
          .scaleLinear()
          .domain([
            0,
            d3.max(dataset, function (d) {
              return + d.rating;
            }),
          ])
          .range([h - padding - axisPadding, padding + axisPadding])
          .nice();
      }     
      function createFavoritesScaleY(dataset) {
        return d3
          .scaleLinear()
          .domain([
            0,
            d3.max(dataset, function (d) {
              return + d.favorites;
            }),
          ])
          .range([h - padding - axisPadding, padding + axisPadding])
          .nice();
      }      
      function createProductionYearScaleY(dataset) {
        return d3
          .scaleLinear()
          .domain([
            0,
            d3.max(dataset, function (d) {
              return + d.productionYear;
            }),
          ])
          .range([h - padding - axisPadding, padding + axisPadding])
          .nice();
      }    
      

    function createAxisY(yScale) {
      return d3
        .axisLeft()
        .scale(yScale)
        .ticks(5);
    }


function createAxisX(xScale) {
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
        .call(ratingYAxis);

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

    function updateChart(id) {
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
              if (id === "favorites") {
                return favoritesYScale(d.favorites);
              } else if (id === "rating") {
                return ratingYScale(d.rating);
              } else {
                return productionYearYScale(d.productionYear);
              }
            })
            .attr("width", w / dataset.length - 2 * padding - (2 * axisPadding) / dataset.length)
            .attr("height", function (d) {
              if (id === "favorites") {
                return h - padding - axisPadding - favoritesYScale(d.favorites);
              } else if (id === "rating"){
                return h - padding - axisPadding - ratingYScale(d.rating);
              } else {
                return h - padding - axisPadding - productionYearYScale(d.productionYear);
              }
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
                return ratingYScale(d.rating) - 10;
            })
            .text(function (d) {
              if (id === "favorites") {
                return d.favorites;
              } else if (id === "rating") {
                return d.rating; 
              } else {
                return d.productionYear;
              }
            })
            .attr("fill", randomColor);

            barsGroup
            .selectAll(".bar-label")
            .data(data)
            .transition()
            .duration(1000)
            .text(function (d) {
              if (id === "favorites") {
                return d.favorites;
              } else if (id === "rating"){
                return d.rating; 
              } else {
                return d.productionYear;
              }
            })
            .attr("y", function (d) {
              if (id === "favorites") {
                return favoritesYScale(d.favorites) - 10; 
              } else if (id === "rating"){
                return ratingYScale(d.rating) - 10; 
              } else {
                return productionYearYScale(d.productionYear) - 10;
              }
            }); 
    
        svg.select("#xAxis").call(xAxis);
        
    
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
    
    function sortData(id) {
      // De forskellige sorteringer alt efter kategori
      if (id === "rating") {
        dataset.sort(function (a, b) {
          svg.select("#yAxis").call(ratingYAxis)
          return a.rating - b.rating;
        });
      } else if (id === "productionYear") {
        dataset.sort(function (a, b) {
          svg.select("#yAxis").call(productionYearYAxis)
          return a.productionYear - b.productionYear;
        });
      } else if (id === "favorites") {
        dataset.sort(function (a, b) {
          svg.select("#yAxis").call(favoritesYAxis);
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
