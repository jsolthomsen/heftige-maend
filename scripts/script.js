// Definerer konstanter for SVG-dimensioner og afstande
const w = 1000;
const h = 500;
const padding = 10;
const axisPadding = 70;

// Initialiserer tooltip-element
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Asynkron funktion til at hente data og render diagrammet
async function fetchDataAndRender() {
  try {
    // Henter data fra "/data/albums.json"
    const data = await fetchContent("/data/albums.json");

    // Opretter SVG-element
    const svg = d3.select("body").append("svg").attr("width", w).attr("height", h + 50);

    // Opretter en gruppe til søjler
    const barsGroup = svg.append("g").attr("class", "bars-group");

    // Initialiserer skalaer og akser
    let ratingYScale;
    let favoritesYScale;
    let xScale;
    let xAxis;
    let ratingYAxis;
    let favoritesYAxis;

    let dataset = data;

    // Initial opsætning af diagrammet
    init(dataset, false);

    // Lytter til klik på kategorier og opdaterer diagrammet
    d3.selectAll("#rating, #productionYear, #favorites").on("click", function (e) {
      let id = e.target.id;
      let isFastest = id === "favorites";

      // Sorterer data baseret på den valgte kategori
      sortData(id);

      // Udskriver sorteret data til konsolen
      console.log("Sorted data by " + id + " : ", dataset);

      // Opdaterer diagrammet med den sorterende kategori
      updateChart(id);
    });

    // Initial opsætning af diagrammet
    function init(dataset, isFastest) {
      setUp(dataset, isFastest);

      // Opretter standard søjlediagram
      createDefaultChart(dataset);
      console.log("yScale domain:", ratingYScale.domain());

      // Tilføjer akser til diagrammet
      addAxes();
    }

    // Opsætter skalaer og akser
    function setUp(dataset, isFastest) {
      ratingYScale = createRatingScaleY(dataset);
      favoritesYScale = createFavoritesScaleY(dataset);
      xScale = createScaleX(dataset);

      xAxis = createAxisX(xScale, isFastest);
      ratingYAxis = createAxisY(ratingYScale);
      favoritesYAxis = createAxisY(favoritesYScale);
    }

    // Opretter standard søjlediagram
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

    // Opretter x-akse skala
    function createScaleX(dataset) {
      return (
        d3
          .scaleBand()
          .domain(dataset.map((d, i) => i))
          .range([padding + axisPadding, w - padding - axisPadding])
      );
    }

    // Opretter y-akse skala for rating
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

    // Opretter y-akse skala for favorites
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

    // Opretter y-akse
    function createAxisY(yScale) {
      return d3
        .axisLeft()
        .scale(yScale)
        .ticks(5);
    }

    // Opretter x-akse
    function createAxisX(xScale) {
      return d3
        .axisBottom()
        .scale(xScale)
        .tickFormat(function (d) {
          return dataset[d].albumName;
        });
    }

    // Tilføjer akser til diagrammet
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

    // Formatterer x-aksen
    function formatAxisX() {
      svg
        .select("#xAxis")
        .call(xAxis)
        .call(xAxis.tickSize(0))
        .selectAll("text")
        .attr("transform", "translate(-10,5)rotate(-45)")
        .style("text-anchor", "end");
    }

    // Opdaterer diagrammet baseret på den valgte kategori
    function updateChart(id) {
      // Genererer en tilfældig farve for transitions
      const randomColor = d3.interpolateRainbow(Math.random());

      // Opdaterer søjler med transitions
      barsGroup
        .selectAll(".bar")
        .data(dataset)
        .transition()
        .duration(1000)
        .attr("x", function (d, i) {
          return xScale(i) + padding;
        })
        .attr("y", function (d) {
          // Justerer y-position baseret på den valgte kategori
          if (id === "favorites") {
            return favoritesYScale(d.favorites);
          }
          return ratingYScale(d.rating);
        })
        .attr("width", w / dataset.length - 2 * padding - (2 * axisPadding) / dataset.length)
        .attr("height", function (d) {
          // Justerer søjlens højde baseret på den valgte kategori
          if (id === "favorites") {
            return h - padding - axisPadding - favoritesYScale(d.favorites);
          } else {
            return h - padding - axisPadding - ratingYScale(d.rating);
          }
        })
        .attr("fill", randomColor);

      // Opdaterer tekstetiketter for søjler med transitions
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
          // Opdaterer tekstindholdet baseret på den valgte kategori
          if (id === "favorites") {
            return d.favorites;
          } else {
            return d.rating;
          }
        })
        .attr("fill", randomColor);

      // Opdaterer tekstetiketter for data med transitions
      barsGroup
        .selectAll(".bar-label")
        .data(data)
        .transition()
        .duration(1000)
        .text(function (d) {
          // Opdaterer tekstindholdet baseret på den valgte kategori
          if (id === "favorites") {
            return d.favorites;
          } else {
            return d.rating;
          }
        })
        .attr("y", function (d) {
          // Justerer y-position for tekstetiketter baseret på den valgte kategori
          if (id === "favorites") {
            return favoritesYScale(d.favorites) - 10;
          } else {
            return ratingYScale(d.rating) - 10;
          }
        });

      // Opdaterer x-aksen
      svg.select("#xAxis").call(xAxis);

      // Tilføjer "hover" effekt til vores barchart ved brug af tooltip
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

    // Sorterer data baseret på den valgte kategori
    function sortData(id) {
      if (id === "rating") {
        dataset.sort(function (a, b) {
          svg.select("#yAxis").call(ratingYAxis)
          return a.rating - b.rating;
        });
      } else if (id === "productionYear") {
        dataset.sort(function (a, b) {
          svg.select("#yAxis").call(ratingYAxis)
          return a.productionYear - b.productionYear;
        });
      } else if (id === "favorites") {
        dataset.sort(function (a, b) {
          svg.select("#yAxis").call(favoritesYAxis);
          return a.favorites - b.favorites;
        });
      }

      // Opdaterer diagrammet efter sortering
      updateChart();
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Kalder funktionen til at hente data og render diagrammet
fetchDataAndRender();

// Asynkron funktion til at hente data fra en given URL
async function fetchContent(url) {
  let request = await fetch(url);
  let json = await request.json();
  return json;
}
