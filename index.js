const canvas = document.getElementById("mainCanvas");

const ctx = canvas.getContext("2d");
/* {//capillary bed generation
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
} */

function randint(x, y){
    return Math.floor(Math.random() * (y - x) + x);
}

{//capillary bed generation 2.0
    var graph = new GR_Graph();
    const enter = graph.addNode(new Vector(0, 300), 999);
    const middle = graph.addNode(new Vector(Math.random() * 100 + 425, Math.random() * 100 + 250), 0);
    const exit = graph.addNode(new Vector(950, 300), 999);
    graph.connectNodes(enter, middle);
    graph.connectNodes(exit, middle);
    graph.sizeCap = 40; //not a hard cap; just signals when the graph is big enough
    graph.minBound = new Vector(0, 0);
    graph.maxBound = new Vector(canvas.width, canvas.height);

    graph.runRule = function(node){
        if (graph.size() > graph.sizeCap) return true;
        if (node != enter && node != exit){
            //replace node with a dimer or a tri-loop
            if (node.neighbors.size <= 2 || node.neighbors.size == 3 && Math.random() < 0.5){//tri-loop
                const newCenter = node.pos.clone();
                const radius = new Vector(-30, 0);
                node.pos.copy(newCenter.add(radius));

                radius.rotateDegreesSelf(120);
                const node2 = graph.addNode(newCenter.add(radius), node.value);
                
                radius.rotateDegreesSelf(120);
                const node3 = graph.addNode(newCenter.add(radius), node.value);

/*                 const node4 = graph.addNode(newCenter, node.value); */
                

                const it = node.neighbors.values();
                let disconnects = [];

                while (node.neighbors.size > 1){
                    const nb = it.next().value;
                    graph.disconnectNodes(nb, node);
                    disconnects.push(nb);
                }
                graph.connectNodes(node2, node);
                graph.connectNodes(node3, node);
                graph.connectNodes(node2, node3);
                graph.connectNodes(node2, disconnects[0]);
/*                 graph.connectNodes(node4, node);
                graph.connectNodes(node4, node2);
                graph.connectNodes(node4, node3); */
                if (disconnects[1] != undefined) graph.connectNodes(node3, disconnects[1]);
                node.value += 1;
                node2.value += 1;
                graph.nodeOrder.add(node2);
                node3.value += 1;
                graph.nodeOrder.add(node3);
/*                 node4.value += 0;
                graph.nodeOrder.add(node4); */

            } else {//dimer
                const newCenter = node.pos.clone();
                const radius = new Vector(-30, 0);
                node.pos.copy(newCenter.add(radius));
                radius.rotateDegreesSelf(180);
                const node2 = graph.addNode(newCenter.add(radius), node.value);

                const it = node.neighbors.values();
                let disconnects = [];
                let disconnectBool = true;
                while (node.neighbors.size > 1){
                    const nb = it.next().value;
                    if (disconnectBool){
                        graph.disconnectNodes(nb, node);
                        disconnects.push(nb);
                    }
                    disconnectBool = !disconnectBool;
                }
                graph.connectNodes(node2, node);
                disconnects.forEach(disconnect => {
                    graph.connectNodes(disconnect, node2);
                });
                node.value += 4;
                node2.value += 4;
                graph.nodeOrder.add(node2);
            }
        }
        return false;
    }
    graph.nodeOrder = new GR_PriorityQueue();
    graph.nodes.forEach(node => {graph.nodeOrder.add(node)});
    graph.iterate = function(){
        let successful = true;
            for (let i = 0; i < this.size(); i++){
                const node = graph.nodeOrder.remove();
                successful = successful && graph.runRule(node);
                graph.nodeOrder.add(node)
            }
            return successful;
    }
    graph.spaceNode = function(node){
        const acc = new Vector(0, 0);
        let count = 0;
        for (let ni = 0; ni < graph.size(); ni++){
            const nb = graph.getNode(ni);
            count++;
            const disp = nb.pos.sub(node.pos);
            acc.subSelf(disp.normalize().mulScalarSelf(Math.min(100, 50000/(disp.length()**2))));
            if (node.neighbors.has(nb)){
                acc.addSelf(nb.pos.sub(node.pos));
            }
        }
        acc.divScalarSelf(count);
        node.pos.addSelf(acc);
        node.pos.clampSelf(graph.minBound, graph.maxBound);
        if (node == enter) node.pos.set(0);
        if (node == exit) node.pos.set(950)
    }
    graph.spaceOut = function(){
        for (let i = 0; i < graph.sizeCap*5; i++){
            const index = graph.randomNodeIndex();
            const node = graph.getNode(index);
            graph.spaceNode(node);
        }
    }
}
function mainloop(){
    graph.iterate();graph.spaceOut();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    graph.nodes.forEach(node => {
        
        ctx.beginPath();
        ctx.ellipse(node.pos.x, node.pos.y, node.value, node.value, 0, 0, Math.PI*2);
        ctx.closePath();
        ctx.fillStyle = 'red';
        if (node.value != 999) ctx.fill(); 
        node.neighbors.forEach(nb => {
            ctx.beginPath();
            ctx.moveTo(node.pos.x, node.pos.y);
            ctx.lineTo(nb.pos.x, nb.pos.y);
            ctx.strokeStyle = "red";
            ctx.stroke();
        });
    });
}
/* 
for (let i = 0; i < 30; i++){
    
    graph.spaceOut();
}

for (let i = 0; i < 500; i++){
    graph.spaceOut();
} */

setInterval(mainloop, 50);

