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
var currIndex;
var maxIndex;

d3.select('.comment')
	.style("width", function() {
		return document.getElementById('comment-bar').offsetWidth;
	})

var map = new Datamap({
	scope: 'world',
	element: document.getElementById('map'),
	width: document.getElementById('map').offsetWidth - 30,
	data: commentData,
	done: function(datamap) {
		datamap.svg.selectAll('.datamaps-subunit')
			.on('click', function(geo) {
				d3.selectAll('div.comment').remove();
				d3.selectAll('svg#country').remove();
				d3.selectAll('nav').remove();
				draw_single_country(geo);
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

d3.json('/static/comments.json', function(error, data) {

	commentCountries = [];

	var commentData = add_fillKey(data);
	map.updateChoropleth(commentData);

	for (item in commentData) {
		if ('comments' in commentData[item]) {
			commentCountries.push(item);
		}
	}

    var
      legendBarWidth = 30,
      legendBarHeight = 10,
      legendOffsetX = 30,
      legendOffsetY = document.getElementById('map').offsetHeight - 100;

    d3.select('svg')
      .append('g')
      .attr('class', 'legend')
      .append('text')
      .text("Article Downloads:")
      .attr('x', legendOffsetX)
      .attr('y', legendOffsetY);;

    // draw the legend
    d3.select('.legend').selectAll('.legend')
    .data(colorScale)
    .enter()
      .append('rect')
        .attr('x', legendOffsetX)
        .attr('y', function(d,i) {
          return legendOffsetY + 5 + legendBarHeight*i;
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
          return legendOffsetY + 5 + (legendBarHeight*0.9) + legendBarHeight*i;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .attr("fill", "black");

    // add initial comment from random country
	var tc = Math.floor((Math.random() * commentCountries.length));
	var ti = commentCountries[tc];

	d3.select('.datamaps-subunit.' + ti)
		.attr('class', function(geo) {
			draw_single_country(geo);
			return 'hi';
		});
	});

// functions
function loadComment(c, n) {
	d3.selectAll('div.comment').remove();
	currIndex = n;

	d3.select('.back-button')
		.classed('active', false);
	d3.select('.next-button')
		.classed('active', false);		

	d3.select('.comment-box')
		.append('div')
		.attr('class', 'comment')
		.append('p')
		.html(function() {
			return '<span class="lquote">&ldquo;</span>' + commentData[c].comments[n] + '<br /><span class="attribute">&mdash; ' + commentData[c].kind[n] + '</span>';
		});

	if (currIndex == 0) {
		d3.select('.back-button')
			.classed('disabled', true);
	} else {
		d3.select('.back-button')
			.classed('disabled', false);
	}

	if (currIndex == maxIndex) {
		d3.select('.next-button')
			.classed('disabled', true);
	} else {
		d3.select('.next-button')
			.classed('disabled', false);
	}

	for (j=0; j<=maxIndex; j++) {
		if (j == n) {
			d3.select('.num'+j)
				.classed('active', true);
		} else {
			d3.select('.num'+j)
				.classed('active', false);
		}
	}

};

function loadNext(c) {
	var next = currIndex + 1;
	loadComment(c, next);
};

function loadPrevious(c) {
	var prev = currIndex - 1;
	loadComment(c, prev);
}

function add_fillKey(data) {
	new_data = data;
	for (item in new_data) {
		new_data[item]['fillKey'] = t(data[item]['downloads']);
	}
	return new_data;
}

function draw_single_country(geo) {
	var tempData;
	var tempItem;
	currIndex = 0;

	for (item in commentData) {
		if (geo.id == item) {
			tempData = commentData[item];
			tempItem = item;
			if ('comments' in tempData) {
				maxIndex = tempData.comments.length - 1;
			} else {
				maxIndex = 0;
			}
		}
	}

	d3.select('.comment-box')
		.append('div')
		.attr('class', 'comment')
		.append('p')
		.html(function() {
			if ('comments' in tempData) {
				return '<span class="lquote">&ldquo;</span>' + tempData.comments[0] + '<br /><span class="attribute">&mdash; ' + tempData.kind[0] + '</span>';
			} else {
				return 'No user comments yet from ' + geo.properties.name;
			}
		});

	var gj = {"type": "FeatureCollection","features":[geo]};

	var projection = d3.geo.equirectangular()
	    .scale(1)
	    .translate([0, 0]);

	var path = d3.geo.path()
		.projection(projection);

	var b = path.bounds(gj.features[0]),
	    s = .95 / Math.max((b[1][0] - b[0][0]) / 200, (b[1][1] - b[0][1]) / 200),
	    t = [(170 - s * (b[1][0] + b[0][0])) / 2, (200 - s * (b[1][1] + b[0][1])) / 2];

	projection
		.scale(s)
		.translate(t);

	d3.select('.country')
    	.append('svg')
    	.attr('id', 'country')
    	.attr('width', 170)
    	.attr('height', 200);

	d3.select('#country')
		.selectAll('path')
		.data(gj.features)
			.enter()
			.append('path')
		.attr('d', path)
		.attr('fill', 'rgb(131,145,186)');

	d3.select('#country')
		.append('text')
		.text(function() {
			return geo.properties.name;
		})
		.attr('class', 'wrap')
		.style('text-anchor', 'middle')
		.style('font-size', '1.8em')
		.style('font-weight', 'bold');

	d3plus.textwrap()
		.container(d3.select(".wrap"))
		.width(170)
		.x(0)
		.y(25)
		.draw();

	d3.select('#country')
		.append('text')
		.text(function() {
			return tempData.downloads + ' downloads';
		})
		.attr('x', 170/2)
		.attr('y', 168)
		.style('text-anchor', 'middle')

	d3.select('#country')
		.append('text')
		.text(function() {
			return tempData.num_comments + ' user comments';
		})
		.attr('x', 170/2)
		.attr('y', 185)
		.style('text-anchor', 'middle');

	if (tempData['num_comments'] > 0) {
    	d3.select('.dots')
    		.append('nav')
    		.append('ul')
    		.attr('class', 'pagination')
    		.append('li')
    		.attr('class', 'back-button')
    		.classed('disabled', true)
    		.html(function() {
    			var s = currIndex - 1;
    			return '<a onClick="loadPrevious(\'' + tempItem + '\'); return false;" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>'
    		});

    	d3.select('.pagination')
	    	.selectAll('li')
    		.data(tempData.comments, function(d, i) {
    			return d;
    		})
    		.enter()
    		.append('li')
    		.attr('class', function(d, i) {
    			return 'num' + i;
    		})
    		.classed('active', function(d, i) {
    			if (i == 0) {
    				return true;
    			} else {
    				return false;
    			}
    		})
    		.html(function(d, i) {
    			var n = i + 1;
    			return '<a onClick="loadComment(\'' + tempItem + '\', + ' + i + '); return false;" href="#">' + n + '</a>';
    		});   

    	d3.select('.pagination')
    		.append('li')
    		.attr('class', 'next-button')
    		.html(function() {
    			var s = currIndex + 1;
    			return '<a onClick="loadNext(\'' + tempItem + '\'); return false;" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>'
    		});
    }
}