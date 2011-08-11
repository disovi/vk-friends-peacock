(function() {
    peacock_view = {};
    
    var w = screen.availWidth + 200,
        h = screen.availHeight + 200,
        fill = d3.scale.category10();

    peacock_view.plot = function(ex_data) {
        
        var nodes = [],
            links = [];
        
        data = clone(ex_data);
        
        d3.selectAll("svg").remove();
        
        var vis = d3.select(".graph").append("svg:svg")
            .attr("width", w)
            .attr("height", h)
            .append("svg:g");
                
        var force = d3.layout.force()
              .distance(700)
              .linkDistance(700)
              .charge(-300)
              .theta(.1)
              .size([w, h]);
                  
        var sorted_data = [];
        
        // Prepare data
        data.friends.forEach(function(e) {
            e.name = e.uid;
           
        // Trying remove node without links
        // if (e.friends !== undefined && e.friends.length > 0)
                sorted_data.push(e);
        });
        
        data.friends = sorted_data;
        
        nodes = data.friends;
        
        nodes.push({
                uid: data.uid, 
                first_name: data.first_name, 
                last_name: data.last_name,
                photo: data.photo});
        data.friends.forEach(function(friend) {
                if (friend.friends === undefined)
                    return;
                    
                friend.friends.forEach(function(mutual_friend) {
                    
                    var to = -1;
                    var from = -1;
                    nodes.filter(function(e, i, a) {
                        if (e.uid === mutual_friend.uid)
                            to = i;
                        
                        if (e.uid === friend.uid)
                            from = i;
                    });
                    if (nodes[from] === undefined || nodes[to] === undefined) {
                        console.log('Current user is supposed to be deleted:', mutual_friend.uid);
                        return;
                    }
                    // skip main
                    if (nodes[from].uid == data.uid || nodes[to].uid == data.uid)
                        return;
                        
                    links.push({source: from, target: to, weight: mutual_friend.weight});
                    
                });
        });

        // Plot        
        force
            .nodes(nodes)
            .links(links)
            .start();
        
        var link = vis.selectAll("line.link")
                    .data(links)
                    .enter().append("svg:line")
                    .attr("class", "link")
                    .attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; })
                    .style("stroke", function(d, i) {
                        if (d.weight > 0 && d.weight <= 5)
                            return d3.rgb("#ccc");
                        else if (d.weight > 5 && d.weight <= 10)
                            return d3.rgb("green");
                        else if (d.weight > 10 && d.weight <= 20)
                            return d3.rgb("green").darker(2);
                        else if (d.weight > 20 && d.weight <= 30)
                            return d3.rgb("red").darker(2);
                        else if (d.weight > 30)
                            return d3.rgb("red").darker(3);
                    })
                    .style("stroke-width", function(d) { return d.weight; });
        
        var node = vis.selectAll("g.node")
                    .data(nodes)
                .enter().append("svg:g")
                    .attr("class", "node")
                    .attr("r", "8")
                    .attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; })
                    .attr("width", "30px")
                    .attr("height", "30px")
                    .call(force.drag);
        
        node.append("svg:a")
            .attr("xlink:href", function(d) { return "http://vk.com/id" + d.uid; })
            .append("svg:text")
            .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
            .attr("dy", ".31em")
            .attr("fill", function(d) { if (d.uid == data.uid) return d3.rgb("red"); })
            .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
            .text(function(d) { return d.first_name + " " + d.last_name; } );
        
        // function(d) { return "alert(peacock(" + d.uid + "));"; }
        
        node.append("svg:image")
            .attr("class", "node")
            .attr("onclick", function(d) { return "peacock(" + d.uid + ", 1);"; } )
            .attr("xlink:href", function(d) { return d.photo; })
            .attr("x", "-20px")
            .attr("y", "-20px")
            .attr("width", function(d) { return d.uid == data.uid ? "100px" : "30px"; })
            .attr("height", function(d) { return d.uid == data.uid ? "100px" : "30px"; });
    
          force.on("tick", function(e) {
              
            var owner;
            
              // Push different nodes in different directions for clustering.
              var k = 30 * e.alpha;
              
              var angle = 360 / 10;
              var l = 1000;
    /*         nodes.forEach(function(o, i) {
                o.y += l * Math.sin(angle * o.gr_id) + h/2;
                o.x += l * Math.cos(angle * o.gr_id) + w/2;
              });
            */
            nodes.filter(function(e, i, a) {
                if (e.uid === data.uid)
                    owner = i;
            });
            
            nodes[owner].x = w / 2;
            nodes[owner].y = h / 2;
        
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
          
          
           node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
          });
    };

    peacock_view.stop = function() { force.stop(); };
    peacock_view.get_nodes = function() { return nodes; };
    peacock_view.get_links = function() { return links; };
    
})();


function clone(obj) {
    // A clone of an object is an empty object 
            // with a prototype reference to the original.

    // a private constructor, used only by this one clone.
            function Clone() { } 
    Clone.prototype = obj;
    var c = new Clone();
            c.constructor = Clone;
            return c;
}