const canvas = document.getElementById("mainCanvas");

const ctx = canvas.getContext("2d");
{//capillary bed generation
    var graph = new GR_Graph();
    const enter = graph.addNode(new Vector(0, 300), "enter");
    for (let i = 50; i < 950; i += 50){
        graph.addNode(new Vector(Math.random() * 850 + 50, Math.random() * 500 + 50));
    }
    const exit = graph.addNode(new Vector(950, 300), "exit");
    graph.disconnectMostPopular = function(node, index){
        let mostPopularNode = -1;
        let maxNeighborCount = 0;
        node.neighbors.forEach(ni => {
            const nb = graph.getNode(ni);
            if (nb.neighbors.size > maxNeighborCount){
                maxNeighborCount = nb.neighbors.size;
                mostPopularNode = ni;
            }
        });
        graph.disconnectNodes(mostPopularNode, index);
    }
    graph.findNew = function(index){
        const other = graph.randomNodeIndex();
        if (other != index && other != enter && other != exit)
            graph.connectNodes(other, index);
    }
    graph.checkDistances = function(node, index){
        node.neighbors.forEach(ni => {
            if (ni != enter && ni != exit){
                const nb = graph.getNode(ni);
                const disp = node.pos.sub(nb.pos);
                const dist = disp.length();
                if (dist > graph.maxDist){ //shift closer
                    successful = false;
                    if (Math.random() > 0.5)
                        graph.newDist(index, ni, graph.maxDist);
                    else
                        graph.disconnectNodes(index, ni);
                }
            }
        });
        for (let ni = 0; ni < graph.size(); ni++){
            if (ni != enter && ni != exit && ni != index){
                const nb = graph.getNode(ni);
                const disp = node.pos.sub(nb.pos);
                const dist = disp.length();
                if (dist < graph.minDist){ //shift closer
                    successful = false;
                    graph.newDist(index, ni, graph.minDist);
                }
            }
        }
    }
    graph.maxDist = 300;
    graph.minDist = 150;
    graph.minBound = new Vector(0, 0);
    graph.maxBound = new Vector(canvas.width, canvas.height);
    graph.runRule = function(node, index){
        let successful = true;
        switch(node.value){
            case ("enter"):
                { //ensure only 1 connection
                    if (node.neighbors.size < 1){
                        successful = false;
                        graph.findNew(index);
                    } else if (node.neighbors.size > 1){
                        successful = false;
                        graph.disconnectMostPopular(node, index);
                    }
                    graph.checkDistances(node, index);
                } break;
            case ("exit"):
                { //ensure only 1 connection
                    if (node.neighbors.size < 1){
                        successful = false;
                        graph.findNew(index);
                    } else if (node.neighbors.size > 1){
                        successful = false;
                        graph.disconnectMostPopular(node, index);
                    }
                    graph.checkDistances(node, index);
                } break;
            default:
                {
                    if (node.neighbors.size < 2){
                        successful = false;
                        graph.findNew(index);
                    } else if (node.neighbors.size > 3){
                        successful = false;
                        graph.disconnectMostPopular(node, index);
                    }
                    graph.checkDistances(node, index);
                    
                    if (node.pos.x < graph.minBound.x || 
                        node.pos.x > graph.maxBound.x ||
                        node.pos.y < graph.minBound.y ||
                        node.pos.y > graph.maxBound.y 
                    ){
                        successful = false;
                        node.pos.clampSelf(graph.minBound, graph.maxBound);
                    } 
                    
                } break;

        }
        return successful;
    }
}
function mainloop(){
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    graph.nodes.forEach(node => {
        ctx.beginPath();
        ctx.ellipse(node.pos.x, node.pos.y, 10, 10, 0, 0, Math.PI*2);
        ctx.closePath();
        ctx.fillStyle = 'red';
        ctx.fill();
        node.neighbors.forEach(ni => {
            const nb = graph.getNode(ni);
            ctx.beginPath();
            ctx.moveTo(node.pos.x, node.pos.y);
            ctx.lineTo(nb.pos.x, nb.pos.y);
            ctx.strokeStyle = "red";
            ctx.stroke();
        });
    });
}

while(!graph.iterate()){};
setInterval(mainloop, 50);

