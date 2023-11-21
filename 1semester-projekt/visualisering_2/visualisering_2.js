// Deklaration af vores const
const margin = {top: 10, right: 10, bottom: 10, left: 10},
  width = 1200 - margin.left - margin.right,
  height = 800 - margin.top - margin.bottom;

const svg = d3.select("#my_dataviz")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
        
// Loader JSON-data fra localhost, og starter vores treemap funktion.
d3.json("http://localhost:3000/activities-fatal")
  .then(function(data) {
    createTreemap(data);
  })
  .catch(function(error) {
    console.error("Error fetching the data: ", error);
  });

  function createTreemap(data) {
    // Liste over de forskellige aktiviter - det er disse keywords vi leder efter for at kategoriser aktiveter..
    let activities = ["Surfing", "Swimming", "Spearfishing", "Bathing", "Wading", "Diving", "Standing", "Snorkeling", "Scuba Diving", "Body Boarding"];
    
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([0, height]);

    // Zoom-in funktion på treemaps enkelte arealer
    function zoom (event, d) {
      const transition = svg.transition().duration(750);
     
      x.domain([d.x0, d.x1]);
      y.domain([d.y0, d.y1]);
  
      svg.selectAll("text").style("display", "none");

      svg.selectAll("rect")
          .transition(transition)
          .attr("x", (d) => x(d.x0))
          .attr("y", (d) => y(d.y0))
          .attr("width", (d) => x(d.x1) - x(d.x0))
          .attr("height", (d) => y(d.y1) - y(d.y0));
         
  }
// Zoomer ud når man double-clicker - skal evt. aktiveres anderledes.
    function resetZoom() {
        const transition = svg.transition().duration(750);
        x.domain([0, width]);
        y.domain([0, height]);
    
        svg.selectAll("rect")
            .transition(transition)
            .attr("x", (d) => x(d.x0))
            .attr("y", (d) => y(d.y0))
            .attr("width", (d) => x(d.x1) - x(d.x0))
            .attr("height", (d) => y(d.y1) - y(d.y0));
    
        svg.selectAll("text")
            .transition(transition)
            .style("display", "block")
            .attr("x", (d) => x(d.x0) + 5)
            .attr("y", (d) => y(d.y0) + 20);
    }
// Deklarer aktivitet dataen som en gruppering - groupActivites defineres længere nede
    let groupedData = groupActivities(data, activities);
// definerer "root" til treemap - altså de enkelte arealer. Bruger hierarchy på dataen så arealerne bliver rigtige.
    var root = d3.hierarchy(groupedData).sum(function(d){ return d.value})
// Initaliser treemap
    d3.treemap()
    .size([width, height])
    .padding(2)
    (root)
// Laver de enkelte rektangler - altså arealerne over dataen.
    svg
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
      .attr('x', function (d) { return d.x0; })
      .attr('y', function (d) { return d.y0; })
      .attr('width', function (d) { return d.x1 - d.x0; })
      .attr('height', function (d) { return d.y1 - d.y0; })
      .style("stroke", "black")
      .style("fill", "darkred")
      .on("click", zoom)
      .on("dblclick", resetZoom);
  // Sætter tekst på de enkelte arealer
      svg
      .selectAll("text")
      .data(root.leaves())
      .enter()
      .append("text")
        .attr("x", function(d){ return d.x0+5})
        .attr("y", function(d){ return d.y0+20}) 
        .text(function(d){ return d.data.name })
        .attr("font-size", "18px")
        .attr("fill", "white")
  }

  // Funktion for at sætte gruppering til aktiviter til at være så mange som der er i vores aktiviteter array.
  // Retunerer et objekt som har den rigtige struktur til et treemap
  function groupActivities(data, activities) {
    let grouped = {};
    data.forEach(d => {
        activities.forEach(activity => {
            if (d.activity.toLowerCase().includes(activity.toLowerCase())) {
                if (!grouped[activity]) {
                    grouped[activity] = 0;
                }
                grouped[activity] += 1;
            }
        });
    });
    return {
        name: "Activities",
        children: Object.entries(grouped).map(([activity, count]) => ({
            name: activity,
            value: count
        }))
    };
}