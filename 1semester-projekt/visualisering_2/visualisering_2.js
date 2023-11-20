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

d3.json("http://localhost:3000/activities-fatal")
  .then(function(data) {
    createTreemap(data);
  })
  .catch(function(error) {
    console.error("Error fetching the data: ", error);
  });

  function createTreemap(data) {
    // List of activities to group by
    let activities = ["Surfing", "Swimming", "Spearfishing", "Bathing", "Wading", "Diving", "Standing", "Snorkeling", "Scuba Diving", "Body Boarding",];
    
    let groupedData = groupActivities(data, activities);
  
    var root = d3.hierarchy(groupedData).sum(function(d){ return d.value})

    d3.treemap()
    .size([width, height])
    .padding(2)
    (root)

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
     
      svg
      .selectAll("text")
      .data(root.leaves())
      .enter()
      .append("text")
        .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
        .attr("y", function(d){ return d.y0+20})    // +20 to adjust position (lower)
        .text(function(d){ return d.data.name })
        .attr("font-size", "20px")
        .attr("fill", "white")
      
  }
  
  function groupActivities(data, activities) {
    let grouped = {};
  
    data.forEach(d => {
      // Check if the activity matches any of the specified activities
      activities.forEach(activity => {
        if (d.activity.toLowerCase().includes(activity.toLowerCase())) {
          if (!grouped[activity]) {
            grouped[activity] = { Yes: 0, No: 0 };
          }
  
          // Count Yes and No
          if (d.fatal === "Y") {
            grouped[activity].Yes += 1;
          } else if (d.fatal === "N") {
            grouped[activity].No += 1;
          }
        }
      });
    });
  
    // Convert grouped data into a format suitable for a D3 treemap
    return {
      name: "Activities",
      children: Object.entries(grouped).map(([activity, counts]) => ({
        name: activity,
        children: Object.entries(counts).map(([fatal, count]) => ({
          name: fatal,
          value: count
        }))
      }))
    };
  }
  




