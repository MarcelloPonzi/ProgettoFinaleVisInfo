export var parentElement = document.getElementById("svg-container");
export var parentWidth = parentElement.clientWidth;
export var parentHeight = parentElement.clientHeight;
export var svg = d3.select("#svg-container")
    .append("svg")
    .attr("id", "graph")
    .attr("width", parentWidth)
    .attr("height", parentHeight)
export const DEFAULT_COLOR = "blue"