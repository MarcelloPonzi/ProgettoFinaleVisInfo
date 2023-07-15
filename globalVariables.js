export var parentElement = document.getElementById("svg-container");
export var parentWidth = parentElement.clientWidth;
export var parentHeight = parentElement.clientHeight;
export var svg = d3.select("#svg-container")
    .append("svg")
    .attr("id", "graph")
    .attr("width", parentWidth)
    .attr("height", parentHeight)
    .attr("class", "graph-svg")
export const DEFAULT_LINK_COLOR = "yellow"
export const DEFAULT_NODE_COLOR = "green"