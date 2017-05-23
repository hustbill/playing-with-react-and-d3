import React        from 'react';
import d3           from 'd3';
import dsv          from 'dsv-loader';

import DataCircles  from './data-circles';
import XYAxis       from './x-y-axis';


const xMax   = (data)  => d3.max(data, (d) => d[0]);
const yMax   = (data)  => d3.max(data, (d) => d[1]);
const xScale = (props) => {
  return d3.scale.linear()
    .domain([0, xMax(props.data)])
    .range([props.padding, props.width - props.padding * 2]);
};
const yScale = (props) => {
  return d3.scale.linear()
    .domain([0, yMax(props.data)])
    .range([props.height - props.padding, props.padding]);
};
const marshalProps = (props) => {
  const scales = { xScale: xScale(props), yScale: yScale(props) };
  return Object.assign({}, props, scales);
};


function createAdjacencyMatrix() {
  var nodes = require('dsv-loader!./nodelist.csv');
  var edges = require('dsv-loader!./edgelist.csv');
  var matrix = [];
  var edgeHash = {};
  var x, a, b;
  var xAxis, yAxis;

  for (x in edges) {
    var id = edges[x].source + "-" + edges[x].target;
    edgeHash[id] = edges[x];
  }

  //create all possible edges
  for (a in nodes) {
    for (b in nodes) {
      var grid = {id: nodes[a].id + "-" + nodes[b].id, x: b, y: a, weight: 0};
      if (edgeHash[grid.id]) {
        grid.weight = edgeHash[grid.id].weight;
      }
      matrix.push(grid);
    }
  }

  d3.select("svg")
  .append("g")
  .attr("transform", "translate(50,50)")
  .attr("id", "adjacencyG")
  .selectAll("rect")
  .data(matrix)
  .enter()
  .append("rect")
  .attr("width", 25)
  .attr("height", 25)
  .attr("x", function (d) {return d.x * 25})
  .attr("y", function (d) {return d.y * 25})
  .style("stroke", "black")
  .style("stroke-width", "1px")
  .style("fill", "red")
  .style("fill-opacity", function (d) {return d.weight * .2})
  .on("mouseover", gridOver)

  var scaleSize = nodes.length * 25;
  var nameScale = d3.scale.ordinal().domain(nodes.map(function (el) {return el.id})).rangePoints([0,scaleSize],1);

  xAxis = d3.svg.axis().scale(nameScale).orient("top").tickSize(4);
  yAxis = d3.svg.axis().scale(nameScale).orient("left").tickSize(4);
  d3.select("#adjacencyG").append("g").call(xAxis).selectAll("text").style("text-anchor", "end").attr("transform", "translate(-10,-10) rotate(90)");
  d3.select("#adjacencyG").append("g").call(yAxis);

  function gridOver(d,i) {
    d3.selectAll("rect").style("stroke-width", function (p) {return p.x == d.x || p.y == d.y ? "3px" : "1px"})
  }
}


class Matrix extends React.Component {
  const d3Props;
  constructor(props, context) {
    super(props, context);
    d3Props = marshalProps(props);
    createAdjacencyMatrix();
  }

  render() {
    return <svg width={d3Props.width} height={d3Props.height}>
      <DataCircles {...d3Props}/>
      <XYAxis {...d3Props}/>

    </svg>
  }
}

module.exports = Matrix;
