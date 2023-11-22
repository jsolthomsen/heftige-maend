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
      const transition = svg.transition().duration(1000);
      const detailData = d.parent.children || [];
      const detailGroups = svg.selectAll(".detail")
          .data(detailData)
          .enter()
          .append("g")
          .attr("class", "detail");
     
      x.domain([d.parent.x0, d.parent.x1]);
      y.domain([d.parent.y0, d.parent.y1]);
  
      svg.selectAll("text")
          .transition(transition)
          .style("opacity", "0");

          svg.selectAll("rect")
          .transition(transition)
          .attr("x", function(d) { return x(d.parent.x0); })
          .attr("y", function(d) { return y(d.parent.y0); })
          .attr("width", function(d) { return x(d.parent.x1) - x(d.parent.x0); })
          .attr("height", function(d) { return y(d.parent.y1) - y(d.parent.y0); });
      // Laver rektanglerne med fatal/non-fatal + tekst med navn og værdien på dem
         detailGroups.append("rect")
              .transition()
              .duration(1000)
              .attr("x", function(d) { return x(d.x0); })
              .attr("y", function(d) { return y(d.y0); })
              .attr("width", function(d) { return x(d.x1) - x(d.x0); })
              .attr("height", function(d) { return y(d.y1) - y(d.y0); })
              .style("fill", function(d) { return d.data.name === 'Fatal' ? 'red' : 'green'; });
          
              detailGroups.append("text")
              .transition()
              .duration(1000)
              .attr("x", function(d) { return x((d.x0 + d.x1) / 2); })
              .attr("y", function(d) { return y((d.y0 + d.y1) / 2); })
              .text(function(d) { return d.data.name; })
              .style("text-anchor", "middle")
              .attr("font-size", "32px")
              .attr("fill", "white");
        
              detailGroups.append("text")
              .transition()
              .duration(1000)
              .attr("x", function(d) { return x((d.x0 + d.x1) / 2); })
              .attr("y", function(d) { return y(((d.y0 + d.y1) / 2)) + 30; })
              .text(function(d) { return d.data.value; })
              .style("text-anchor", "middle")
              .attr("font-size", "32px")
              .attr("fill", "white");
  }
// Zoomer ud når man double-clicker - skal evt. aktiveres anderledes.
    function resetZoom() {
        const transition = svg.transition().duration(1000);
        x.domain([0, width]);
        y.domain([0, height]);
    
        svg.selectAll("rect")
            .transition(transition)
            .attr("x", (d) => x(d.parent.x0))
            .attr("y", (d) => y(d.parent.y0))
            .attr("width", (d) => x(d.parent.x1) - x(d.parent.x0))
            .attr("height", (d) => y(d.parent.y1) - y(d.parent.y0));
    
        svg.selectAll("text")
            .transition()
            .duration(1500)
            .style("opacity", "1")
            .attr("x", (d) => x(d.parent.x0) + 5)
            .attr("y", (d) => y(d.parent.y0) + 20);
            
      svg.selectAll(".detail").remove();
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
      .attr('x', function (d) { return d.parent.x0; })
      .attr('y', function (d) { return d.parent.y0; })
      .attr('width', function (d) { return d.parent.x1 - d.parent.x0; })
      .attr('height', function (d) { return d.parent.y1 - d.parent.y0; })
      .style("stroke", "black")
      .style("fill", "darkred")
      .on("click", zoom);
      
  // Sætter tekst på de enkelte arealer
      svg
      .selectAll("text")
      .data(root.leaves())
      .enter()
      .append("text")
        .attr("x", function(d){ return d.parent.x0+5})
        .attr("y", function(d){ return d.parent.y0+20}) 
        .text(function(d){  
          console.log(d);
          return d.parent.data.name 
        })
        .attr("font-size", "18px")
        .attr("fill", "white")

        svg.on("dblclick", resetZoom)
  }

  // Funktion for at sætte gruppering til aktiviter til at være så mange som der er i vores aktiviteter array.
  // Retunerer et objekt som har den rigtige struktur til et treemap
  function groupActivities(data, activities) {
    let grouped = {};
    data.forEach(d => {
      activities.forEach(activity => {
          if (d.activity.toLowerCase().includes(activity.toLowerCase())) {
              if (!grouped[activity]) {
                  grouped[activity] = { 'Fatal': 0, 'Non-Fatal': 0 };
              }
              if (d.fatal === 'Y') {
                  grouped[activity]['Fatal'] += 1;
              } else {
                  grouped[activity]['Non-Fatal'] += 1;
              }
          }
      });
  });
  return {
    name: "Activities",
    children: Object.entries(grouped).map(([activity, counts]) => ({
        name: activity,
        children: Object.entries(counts).map(([type, count]) => ({
            name: type,
            value: count
        }))
    }))
};
}