
// set parameters for SVG
var svgWidth = 960;
var svgHeight = 600;

var margin = {
  top: 10,
  right: 40,
  bottom: 90,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// create SVG wrapper and append a group to hold the chart 
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


// set initial param
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";
console.log(chosenXAxis)
console.log(chosenYAxis)

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
  };
  
// function used for updating x-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
        d3.max(data, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
  
  };

  // update xAxis var when label is clicked
  function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  };
  
  // update yAxis var when label is clicked
  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }
  
  // update circles group with transitions
  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }  
  // update circles group with transitions
  function renderLabels(cLabels, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  
    cLabels.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));
  
    return cLabels;
  }
  
  // update circles group with new tooltip
  function updateToolTip(circlesGroup, chosenXAxis, chosenYAxis) {
  
    if (chosenXAxis === "poverty") {
      var xlabel = "In Poverty (%): ";
    }
    else if (chosenXAxis === "age") {
        var xlabel = "Age (Median): ";
    }
    else {
      var xlabel = "Household Income (Median): $";
    };  

    if (chosenYAxis === "healthcare") {
      var ylabel = "Lacks Healthcare (%): ";
    }
    else if (chosenXAxis === "obesity") {
        var ylabel = "Obese (%): ";
    }
    else {
      var ylabel = "Smokers (%): ";
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(d => {
        return (`${d.state} (${d.abbr})<br>${ylabel}${d[chosenYAxis]}<br>${xlabel}${d[chosenXAxis]}`);
      });
  
    circlesGroup.call(toolTip);


    circlesGroup
    // mouseover event - show tooltip
        .on("mouseover", function(data) {
      toolTip.show(data);
        })
      // onmouseout event - hide tooltip
        .on("mouseout", function(data, index) {
        toolTip.hide(data);
        });
  
    return circlesGroup;
  };


//////////////////////////////////////////
////////// D3 - Generate Chart ///////////
//////////////////////////////////////////

  // Retrieve data from the CSV file and execute everything below
d3.csv("https://raw.githubusercontent.com/sskinner99/D3-challenge/main/assets/data/data.csv?raw=true").then(function(censusData, err) {
    if (err) throw err;
  
    // parse data
    censusData.forEach(data => {
      data.poverty = parseFloat(data.poverty);
      data.age = parseFloat(data.age);
      data.income = parseFloat(data.income);
      data.healthcare = parseFloat(data.healthcare);
      data.smokes = parseFloat(data.smokes);
      data.obesity = parseFloat(data.obesity);
    });
  
    // xLinearScale function above csv import
    var xLinearScale = xScale(censusData, chosenXAxis);    
    // yLinearScale function above csv import
    var yLinearScale = yScale(censusData, chosenYAxis);
  
    // // Create y scale function
    // var yLinearScale = d3.scaleLinear()
    //   .domain([0, d3.max(censusData, d => d.healthcare)])
    //   .range([height, 0]);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);

    // append initial circles
    var gGroup = chartGroup.selectAll("g")
        .data(censusData)
        .enter()
        .append("g")
        .classed("circles", true);
    
    var circlesGroup = gGroup.append("circle")
        .data(censusData)
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 20)
      .attr("fill", "purple")
      .attr("opacity", ".5");
  
    // label within circle
    var cLabels = chartGroup.selectAll(".circles")
     .append("text")
     .text( d => d.abbr)
     .attr("text-anchor", "middle")
     .attr("alignment-baseline", "middle")
     .attr("font-size",".8em")
     .attr("style","stroke:white;")
     .attr("x", d => xLinearScale(d[chosenXAxis]))  
     .attr("y", d => yLinearScale(d[chosenYAxis]));

    // Create group for x-axis labels
    var xLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var povertyLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 15)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");
  
    var ageLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 35)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");
      
    var incomeLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 55)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");

    // Create group for y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")

    var healthcareLabel = yLabelsGroup.append("text")
      .attr("x", 0 - (height/2))
      .attr("y", 0 - (margin.left/3))
      .attr("value", "healthcare") // value to grab for event listener
      .classed("active", true)
      .text("Lacks Healthcare (%)");    
      
    var obesityLabel = yLabelsGroup.append("text")
      .attr("x", 0 - (height/2))
      .attr("y", -20 - (margin.left/3))
      .attr("value", "obesity") // value to grab for event listener
      .classed("inactive", true)
      .text("Obese (%)");   

    var smokesLabel = yLabelsGroup.append("text")
      .attr("x", 0 - (height/2))
      .attr("y", -40 - (margin.left/3))
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .text("Smokers (%)");
  
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);
  
    // x axis labels event listener
    xLabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
  
          // replaces chosenXaxis with value
          chosenXAxis = value;
  
          // console.log(chosenXAxis)
  
          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(censusData, chosenXAxis);
  
          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);
  
          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,  yLinearScale, chosenYAxis);
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

          // update labels on circles
          cLabels = renderLabels(cLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
  
          // changes classes to change bold text
          if (chosenXAxis === "income") {
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "age") {
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
    // y axis labels event listener
    yLabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {
  
          // replaces chosenXaxis with value
          chosenYAxis = value;
  
          // console.log(chosenYAxis)
  
          // functions here found above csv import
          // updates y scale for new data
          yLinearScale = yScale(censusData, chosenYAxis);
  
          // updates y axis with transition
          yAxis = renderYAxes(yLinearScale, yAxis);
  
          // updates circles with new y values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,  yLinearScale, chosenYAxis);
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(circlesGroup, chosenYAxis);
          
          // update labels on circles
          cLabels = renderLabels(cLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
  
          // changes classes to change bold text
          if (chosenYAxis === "smokes") {
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "obesity") {
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

  }).catch(function(error) {
    console.log(error);
  });
  
