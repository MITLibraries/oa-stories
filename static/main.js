var color_q0 = 'rgb(255,255,255)',
	color_q1 = 'rgb(184,194,226)',
	color_q2 = 'rgb(131,145,186)',
	color_q3 = 'rgb(85,101,152)',
	color_q4 = 'rgb(47,63,119)',
	color_q5 = 'rgb(21,30,85)',
	colorScale = [
		color_q0,
		color_q1,
		color_q2,
		color_q3,
		color_q4,
		color_q5
	];

var t = d3.scale.threshold()
	.domain([1, 16, 268, 4393, 71964, 1178682])
	.range(['q0', 'q1', 'q2', 'q3', 'q4', 'q5']);

var commentData = {}

var map = new Datamap({
	scope: 'world',
	element: document.getElementById('map'),
	width: document.getElementById('map').offsetWidth - 30,
	data: commentData,
	// setProjection: function(element) {
 //          var projection = d3.geo.equirectangular()
 //          	.scale(element.offsetWidth/6.5)
 //            .translate([ element.offsetWidth / 2, element.offsetHeight / 2 ]);
 //          var path = d3.geo.path()
 //            .projection(projection);
          
 //          return {path: path, projection: projection};
 //        },
	done: function(datamap) {
		datamap.svg.selectAll('.datamaps-subunit').on('click', function(geo) {
			d3.selectAll('foreignobject').remove();
			d3.select("#info")
				.append("foreignobject")
				.attr("x", 0)
				.attr("height", 200)
				.append("xhtml:body")
				.attr("class", "infoText")
				.html(function() {
					var topLine = '<h2>User comments from ' + geo.properties.name + ':</h2>';
					var lines = '<ul>';
					for (item in commentData) {
						if (geo.id == item) {
							for (comment in commentData[item].comments) {
								lines += '<li>' + commentData[item].comments[comment] + '</li>';
							}
						}
					}
					lines += '</ul>';
					
					return topLine + lines;
				});
		});
    },
	fills: {
	    defaultFill: 'rgb(255,255,255)',
	    q0: color_q0,
	    q1: color_q1,
	    q2: color_q2,
	    q3: color_q3,
	    q4: color_q4,
	    q5: color_q5
	 },
	geographyConfig: {
		// borderColor: 'rgb(0,0,0)';
		// },
		// borderWidth: 2,
	    popupTemplate: function(geo, data) {
	      	if (data == null) {
	        	return '<div class="hoverinfo">No data from ' + geo.properties.name + '</div>';
	        }
	      	return '<div class="hoverinfo">' + data.downloads + ' downloads and ' + data.num_comments + ' comments from ' + geo.properties.name + '</div>';
	    }
	},
	responsive: true
});

window.addEventListener('resize', function() {
        map.resize();
    });

var infoBox = d3.select(".info")
	.append("div")
	.attr("id", "info");

d3.json('/static/comments.json', function(error, data) {

	function add_fillKey(data) {
		new_data = data;
		for (item in new_data) {
			new_data[item]['fillKey'] = t(data[item]['downloads']);
		}
		return new_data;
	}
		var commentData = add_fillKey(data);
	map.updateChoropleth(commentData);

        d3.select('svg')
          .append('g')
          .attr('class', 'legend');

        var
          legendBarWidth = 30,
          legendBarHeight = 10,
          legendOffsetX = 30,
          legendOffsetY = document.getElementById('map').offsetHeight - 100;

        // draw the legend
        d3.select('.legend').selectAll('.legend')
        .data(colorScale)
        .enter()
          .append('rect')
            .attr('x', legendOffsetX)
            .attr('y', function(d,i) {
              return legendOffsetY + legendBarHeight*i;
            })
            .attr('width', legendBarWidth)
            .attr('height', legendBarHeight)
            .attr('fill', function(d){ return d; });

        // draw the legend text labels
        d3.select('.legend').selectAll('.legend')
        .data(colorScale)
        .enter()
          .append('text')
            .text(function(d,i) {
              var quantizedRange = t.invertExtent('q'+i);
              	if (i == 0) {
              		return '0 - ' + quantizedRange[1];
              	} else {
	              return quantizedRange[0] + ' - ' +
	              quantizedRange[1];
          		}
            })
            .attr('x', legendOffsetX+(legendBarWidth*1.25))
            .attr('y', function(d,i){
              return legendOffsetY + (legendBarHeight*0.9) + legendBarHeight*i;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "10px")
            .attr("fill", "black");

    
	});

// window.addEventListener('resize', function() {
//     map.resize();
// });