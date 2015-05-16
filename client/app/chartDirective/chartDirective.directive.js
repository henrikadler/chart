'use strict';

angular.module('chartsApp.directive', ['d3'])
 .directive('barChart', ['$window', '$timeout', 'd3Service', 
	function($window, $timeout, d3Service) {
  
 		/**
		 * Create and add the Chart container.
		 */
		var createChartContainer = function(d3, element, width, height) {
			var svg = d3.select(element[0])
				.append('svg')
				.style('width', width || '100%')
				.style('height', height || '100%');
			return svg;
		};
		
		/**
		 * Clear the chart.
		 */
		var clearChart = function(svg) {
			svg.selectAll('*').remove();
		};
		
		
		
		/**
		 * Create a svg gradient. that can be used as fill...
		 */
		var createGradient = function(svg, name, color1, color2) {
			var linearGradient = svg.append('defs').append('linearGradient');
			linearGradient
				.attr('id', name)
				.attr('x1', '0')
				.attr('y1', '0')
				.attr('x2', '0')
				.attr('y2', '100%')
				.selectAll("stop")
				      .data([
				        {offset: "0%", color: color1},
				        {offset: "100%", color: color2}
				      ])
				    .enter().append("stop")
				      .attr("offset", function(d) { return d.offset; })
				      .attr("stop-color", function(d) { return d.color; });
		};
		
		/**
		 * Create a glow filter efftect that can be applied to a svg element.
		 * 
		 * @param  {Object} svg The root SVG element object ("the svg canvas") to append filter to.
		 */
		var createGlowFilter = function(svg) {
			var glow = svg.select('defs').append('filter')
				.attr('id', 'glow');
			var feGaussianBlur = glow.append('feGaussianBlur')
				.attr('stdDeviation', '3')
				.attr('result', 'coloredBlur')
			var feMerge = glow.append('feMerge');
			feMerge.append('feMergeNode')
				.attr('in', 'SourceGraphic');
			feMerge.append('feMergeNode')
				.attr('in', 'coloredBlur');
		};
		
		return {
			restrict: 'A',
			scope: {
				data: '=',
				label: '@',
				onClick: '&'
			},
			link: function(scope, ele, attrs) {
				d3Service.d3().then(function(d3) {
					var renderTimeout;
					var margin = parseInt(attrs.margin) || 20,
						barHeight = parseInt(attrs.barHeight) || 20,
						barWidth = 140,
						barPadding = parseInt(attrs.barPadding) || 5;
					
					var margin_x = 32;
					var margin_y = 20;

					var svg = createChartContainer(d3, ele, '100%', '100%');
					
	 
					//Force an angular digest cycle at resize...
					$window.onresize = function() {
						scope.$apply();
					};
	 
					//Re-render the chart when the root element width is changed...
					scope.$watch(function() {
						return angular.element($window)[0].innerWidth;
					}, function() {
						scope.render(scope.data);
					});
	 
					//Re-render the chart if the data gets updated
					scope.$watch('data', function(newData) {
						scope.render(newData);
					}, true);
	 
					//Our render function (called by angular)
					scope.render = function(data) {
					
						var containerElement = d3.select(ele[0])[0][0];
						var width = containerElement.offsetWidth - margin;
						var height = containerElement.offsetHeight - margin;
						console.log('width', width);
						console.log('height', height)
						
						clearChart(svg);
						createGradient(svg, 'lgrad', 'rgba(255,255,255,1)', 'rgba(255,255,255,0.1)');
						createGlowFilter(svg);
	 
						//Write "NO DATA on center of chart if no data is present..."
						if (!data) {
							svg.append('text')
								.attr('fill', 'red')
								.attr('x', width/2)
								.attr('y', height/2)
								.attr('text-anchor', 'middle')
								.text(function(d) {	
									return "NO DATA";
								});
							return;
						}
					
						//Convert data scale to svg image scale (NOTE: that we reverse the y axis here!)
						var rounded_max_y = 10 + (5 * Math.round(d3.max(scope.data)/5));

						//Create x and y "re-scaling" functions
						var y = d3.scale.linear().domain([0, rounded_max_y]).range([height - margin_y, 0 + margin_y]);
						var x = d3.scale.linear().domain([0, scope.data.length]).range([0 + margin_x, width - margin_x]);
						
						/**
						 * The areaFunction defines how d3 should should render the area chart. It does that by overriding
						 * some of the d3.svg.area functions. It uses the x and y re-scaling functions above to convert data
						 * to "svg coordinates". It also specifies the interpolation function to use (defines how the chart line
						 * between two points should be rendered in the chart).
						 * There are several different types of interpolation styles that can be used, like: 
						 * 'linear', 'monotone', 'bundle', 'step', step-before', 'step-after', 
						 * 'basis', 'basis-open','basis-closed', 'cardinal', 'cardinal-open', 'cardinal-closed'
						 * See: https://www.dashingd3js.com/svg-paths-and-d3js
						 */
						var areaFunction = d3.svg.area()
							.x(function(d, i) { return x(i); })
							.y0(y(0))
							.y1(function(d) { return y(d); })
							.interpolate('linear');
							
						//Draw the x axis
						svg.append("line")
							.attr('class', 'xAxis')
							.attr("x1", x(0))
							.attr("y1", y(0))
							.attr("x2", x(scope.data.length))
							.attr("y2", y(0));
						
						//Draw the y axis
						svg.append("line")
							.attr('class', 'yAxis')
							.attr("x1", x(0))
							.attr("y1", y(0))
							.attr("x2", x(0))
							.attr("y2", y(rounded_max_y));
						
						//Draw the area chart
						var area = svg.append("path")
							.attr("class", "area")
							.attr("d", areaFunction(scope.data))
							.attr('stroke', '#BFB9DC')
							.attr('stroke-width', 1)

						//Draw the y grid
						svg.selectAll(".yGrids")
							.data(y.ticks(6)).enter().append('line')
								.attr("class", "yGrids")
								.attr("y1", function(d) { return y(d); })
								.attr("x1", x(0))
								.attr("y2", function(d) { return y(d); })
								.attr("x2", x(scope.data.length))
								
						//Draw the yLabels
						svg.selectAll(".yLabel")
							.data(y.ticks(6)).enter().append("text")
								.attr("class", "yLabel")
								.text(String)
								.attr("x", 25)
								.attr("y", function(d) { return 5 + y(d) })
								.attr("text-anchor", "end");
									
						//Draw the xLabels
						svg.selectAll(".xLabel")
							.data(x.ticks(5)).enter().append('text')
								.attr("class", "xLabel")
								.text(String)
								.attr("x", function(d) { return x(d) })
								.attr("y", 18 + y(0))
								.attr("text-anchor", "middle")
								
						//Draw the x ticks
						svg.selectAll(".xTicks")
							.data(x.ticks(5)).enter().append("line")
								.attr("class", "xTicks")
								.attr("x1", function(d) { return x(d); })
								.attr("y1", y(0))
								.attr("x2", function(d) { return x(d); })
								.attr("y2", 5 + y(0))
								
							/*
							//HORIZONTAL BAR CHART
				
						//Remove existing timer (if it exists)...
						if (renderTimeout) {
							clearTimeout(renderTimeout);
						}
	 
						//Start new timer...
						renderTimeout = $timeout(function() {

							

							var	height = scope.data.length * (barHeight + barPadding),
								color = d3.scale.category20(),
								xScale = d3.scale.linear()
									.domain([0, d3.max(data, function(d) {
										return d.score;
									})])
									.range([0, width]);
			 
							svg.attr('height', height);
							
							svg.selectAll('rect').data(data).enter().append('rect')
								.on('click', function(d,i) {
									return scope.onClick({item: d});
								})
								.attr('height', barHeight)
								.attr('width', barWidth)
								.attr('x', bar_x)
								.attr('y', function(d,i) {
									bar_y = i * (barHeight + barPadding) + barPadding;
									return  bar_y;
								})
								.attr('fill', function(d) {
									//return color(d.score);
									return 'url(#lgrad)'; //'#E2DFF0';
								})
								.attr('stroke', 'black') //'#BFB9DC')
								.attr('stroke-width', 1)
								.transition()
									.duration(300)
									.attr('width', function(d) {
										return xScale(d.score);
									});
									
							//Add the text in the bar items...
							svg.selectAll('text').data(data).enter().append('text')
								.attr('fill', '#fff')
								.attr('y', function(d,i) {
									return i * (barHeight + barPadding) + barPadding + 15;
								})
								.attr('x', 15)
								.text(function(d) {
									return d.name + " (scored: " + d.score + ")";
								});

						}, 200); */
					};
				});
			}
		}
	}
])