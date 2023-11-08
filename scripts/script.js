let albumArray = [];
let ratingArray = [];

fetchContent("/data/albums.json").then((data) => {

var w = 500;
var h = 150;
var barPadding = 1;

var svg = d3.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

    albumArray = data;
    console.log(albumArray);

    for (i = 0; i < data.length; i++) {
        ratingArray.push(data[i].rating);
    }

    console.log(ratingArray);

    svg.selectAll("rect")
    .data(ratingArray)
    .enter()
    .append("rect")
    .attr("x", function(d, i) {
        return i * (w / ratingArray.length);
    })
    .attr("y", function (d) {
        return h - (d * 25);
    })
    .attr("width", w / ratingArray.length - barPadding)
    .attr("height", function(d) {
        return d * 25;
    })
    .attr("fill", function(d) {
        return "rgb(0,0, " + Math.round(d*25) + ")";
    });
    
    svg.selectAll("text")
        .data(ratingArray)
        .enter()
        .append("text")
        .text(function(d) {
            return d;
        })
        .attr("x", function(d, i) {
            return i * (w / ratingArray.length) + (w / ratingArray.length - barPadding) / 2;
        })
        .attr("y", function(d) {
            return h - (d * 25) + 18;
        })
        .attr("fill", "white")
        .attr("text-anchor", "middle");
})




//Magi - tak Thomas :)
async function fetchContent(url) {
    let request = await fetch(url);
    let json = await request.json();
    return json;
}

