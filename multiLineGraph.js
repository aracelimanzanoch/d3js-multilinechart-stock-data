// Sampe of daily SPY stock data from one month to plot
var stock_data_sample = "date,price,moving_avg_20d,upper_bband,lower_bband\n\
20090601,92.90,89.05,91.95,86.14,5.81\n\
20090602,92.98,89.24,92.61,85.87,6.75\n\
20090603,91.80,89.39,92.93,85.85,7.09\n\
20090604,92.66,89.51,93.31,85.70,7.61\n\
20090605,92.68,89.69,93.73,85.65,8.08\n\
20090608,92.30,89.75,93.90,85.59,8.31\n\
20090609,92.77,89.91,94.27,85.56,8.71\n\
20090610,92.54,90.08,94.57,85.60,8.97\n\
20090611,92.95,90.38,94.79,85.98,8.81\n\
20090612,93.20,90.66,95.04,86.27,8.77\n\
20090615,91.07,90.86,94.91,86.82,8.09\n\
20090616,89.83,90.88,94.90,86.87,8.04\n\
20090617,89.74,90.91,94.90,86.91,7.98\n\
20090618,90.40,90.99,94.86,87.12,7.74\n\
20090619,90.74,91.15,94.67,87.63,7.04\n\
20090622,88.02,91.19,94.56,87.83,6.73\n\
20090623,88.09,91.12,94.68,87.56,7.12\n\
20090624,88.84,91.17,94.58,87.76,6.82\n\
20090625,90.78,91.25,94.53,87.97,6.57\n\
20090626,90.54,91.24,94.53,87.95,6.58\n\
20090629,91.39,91.17,94.37,87.96,6.41\n\
20090630,90.65,91.05,94.15,87.95,6.20\n";

// Domain for plotting
var domElement = "body";

// Main variables
let data = null,
    margin = null,
    width = null,
    height = null,
    x = null,
    xAxis = null,
    y = null,
    yAxis = null,
    color = null,
    svg = null,
    line = null,
    timeseries2plot = null,
    t2plot = null,
    legend = null,
    mouseG = null;

// Execute refactorized script
data = loadData(stock_data_sample);  // Parse sample data
setupCanvasSize()  // Set canvas margins, weight, height
setLinesColorScale()  // Set general color scale (20)
setupScales()  // Set X, Y scales
setupAxis()  // Set X, Y axis
interpolateLines()  // Interpolate lines from parsed data
appendSvg(domElement)  // Add general svg
mapLines()  // Map lines
setupScaleDomains()  // Set scale domains
drawLegend()  // Draw legend
setLabels()  // Set text labels

// Add interactions
setLineFollower()
setMouseInteractions()

// Functions definitions
function loadData(stock_data_sample) {
    // Parse time format
    var parseDate = d3.time.format("%Y%m%d").parse;
    // Parse sample data as array
    var data = d3.csv.parse(stock_data_sample);
    // Cast date column as time type
    data.forEach(function(d) {
       d.date = parseDate(d.date);
     });
    return data;
}

function setupCanvasSize() {
    // Setup canvas margins and size
    margin = {
        top: 100,
        right: 250,
        bottom: 100,
        left: 500
      },
      width = 1500 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;
    }

function setLinesColorScale() {
    color = d3.scale.category20();
}

function setupScales() {
    // Set time scale for x axis
    x = d3.time.scale()
      .range([0, width]);

    // Set linear scale for y axis
    y = d3.scale.linear()
      .range([height-2, 0]);
}

function setupAxis() {
    // Set x axis
    xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    // Set y axis
    yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");
}

function interpolateLines() {
    // Set line
    line = d3.svg.line()
      .interpolate("basis")
      .x(function(d) {
        return x(d.date);
      })
      .y(function(d) {
        return y(d.price);
      });
}

function appendSvg(domElement) {
    // Add SVG element to body section
    svg = d3.select(domElement).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    color.domain(d3.keys(data[0]).filter(function(key) {
      return key !== "date";
    }));
}

function mapLines() {
    timeseries2plot = color.domain().map(function(name) {
      return {
        name: name,
        values: data.map(function(d) {
          return {
            date: d.date,
            price: +d[name]
          };
        })
      };
    });
}

function setupScaleDomains() {
    // Set domains for each axis
    x.domain(d3.extent(data, function(d) {
      return d.date;
    }));

    y.domain([
      d3.min(timeseries2plot, function(c) {
        return d3.min(c.values, function(v) {
          return v.price;
        });
      }),
      d3.max(timeseries2plot, function(c) {
        return d3.max(c.values, function(v) {
          return v.price;
        });
      })
    ]);
}

function drawLegend() {
    legend = svg.selectAll('g')
          .data(timeseries2plot)
          .enter()
          .append('g')
          .attr('class', 'legend');

    legend.append('rect')
          .attr('x', width + 22)
          .attr('y', function(d, i) {
            return i * 20 - 50;
          })
          .attr('width', 20)
          .attr('height', 5)
          .style('fill', function(d) {
            return color(d.name);
          });

    legend.append('text')
          .attr('x', width + 44)
          .attr('y', function(d, i) {
            return (i * 20) - 45;
          })
          .text(function(d) {
            return d.name;
          });
}

function setLabels() {
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 8)
      .attr("dy", ".80em")
      .style("text-anchor", "end")
      .text("Price");
}

function setLineFollower() {
    t2plot = svg.selectAll(".t2plot")
      .data(timeseries2plot)
      .enter().append("g")
      .attr("class", "t2plot");

    t2plot.append("path")
      .attr("class", "line")
      .attr("d", function(d) {
        return line(d.values);
      })
      .style("stroke", function(d) {
        return color(d.name);
      });

    t2plot.append("text")
      .datum(function(d) {
        return {
          name: d.name,
          value: d.values[d.values.length - 1]
        };
      })
      .attr("transform", function(d) {
        return "translate(" + x(d.value.date) + "," + y(d.value.price) + ")";
      })
      .attr("x", 3)
      .attr("dy", ".50em")
      .text(function(d) {
        return d.name;
      });
}

function setMouseInteractions() {
    mouseG = svg.append("g")
      .attr("class", "mouse-over-effects");

    mouseG.append("path") // this is the black vertical line to follow mouse
      .attr("class", "mouse-line")
      .style("stroke", "black")
      .style("stroke-width", "2px")
      .style("opacity", "0");

    var lines = document.getElementsByClassName('line');

    var mousePerLine = mouseG.selectAll('.mouse-per-line')
      .data(timeseries2plot)
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
      .attr("r", 7)
      .style("stroke", function(d) {
        return color(d.name);
      })
      .style("fill", "false")
      .style("stroke-width", "5px")
      .style("opacity", "10");

    mousePerLine.append("text")
      .attr("transform", "translate(10,5)");

    mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
      .attr('width', width) // can't catch mouse events on a g element
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', function() { // on mouse out hide line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "10");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "10");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "10");
      })
      .on('mouseover', function() { // on mouse in show line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "10");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "10");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "10");
      })
      .on('mousemove', function() { // mouse moving over canvas
        var mouse = d3.mouse(this);
        d3.select(".mouse-line")
          .attr("d", function() {
            var d = "M" + mouse[0] + "," + height;
            d += " " + mouse[0] + "," + 0;
            return d;
          });

        d3.selectAll(".mouse-per-line")
          .attr("transform", function(d, i) {
            console.log(width/mouse[0])
            var xDate = x.invert(mouse[0]),
                bisect = d3.bisector(function(d) { return d.date; }).right;
                idx = bisect(d.values, xDate);

            var beginning = 0,
                end = lines[i].getTotalLength(),
                target = null;

            while (true){
              target = Math.floor((beginning + end) / 2);
              pos = lines[i].getPointAtLength(target);
              if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                  break;
              }
              if (pos.x > mouse[0])      end = target;
              else if (pos.x < mouse[0]) beginning = target;
              else break; //position found
            }

            d3.select(this).select('text')
              .text(y.invert(pos.y).toFixed(5));

            return "translate(" + mouse[0] + "," + pos.y +")";
          });
      });
}

/*  Araceli Manzano Chicano (aramanzano@uma.es)

    References: data - http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:bollinger_bands
                initial script - https://stackoverflow.com/questions/34886070/multiseries-line-chart-with-mouseover-tooltip/34887578#34887578
                d3 - https://www.analyticsvidhya.com/blog/2017/08/visualizations-with-d3-js/

*/
