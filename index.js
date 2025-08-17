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
{//capillary bed generation 2.0
    var graph = new GR_Graph();
    const enter = graph.addNode(new Vector(0, 300), "enter");
    const middle = graph.addNode(new Vector(Math.random() * 100 + 425, Math.random() * 100 + 250));
    const exit = graph.addNode(new Vector(950, 300), "exit");
    graph.connectNodes(enter, middle);
    graph.connectNodes(exit, middle);
    graph.sizeCap = 40; //not a hard cap; just signals when the graph is big enough
    graph.runRule = function(node, index){
        if (graph.size() > graph.sizeCap) return true;
        if (node.value != "enter" && node.value != "exit"){
            //replace node with a dimer or a tri-loop
            if (node.neighbors.size <= 3){//tri-loop
                const newCenter = node.pos.clone();
                const radius = new Vector(-30, 0);
                node.pos.copy(newCenter.add(radius));

                radius.rotateDegreesSelf(120);
                const index2 = graph.addNode(newCenter.add(radius));
                
                radius.rotateDegreesSelf(120);
                const index3 = graph.addNode(newCenter.add(radius));
                

                const it = node.neighbors.values();
                let disconnects = [];
                while (node.neighbors.size > 1){
                    const ni = it.next().value;
                    console.log(ni);
                    graph.disconnectNodes(ni, index);
                    disconnects.push(ni);
                }
                graph.connectNodes(index2, index);
                graph.connectNodes(index3, index);
                graph.connectNodes(index2, index3);
                graph.connectNodes(index2, disconnects[0]);
                if (disconnects[1] != undefined) graph.connectNodes(index3, disconnects[1]);

            } else {//dimer
                const newCenter = node.pos.clone();
                const radius = new Vector(-30, 0);
                node.pos.copy(newCenter.add(radius));
                radius.rotateDegreesSelf(180);
                const index2 = graph.addNode(newCenter.add(radius));

                const it = node.neighbors.values();
                let disconnects = [];
                let disconnectBool = true;
                while (node.neighbors.size > 1){
                    const ni = it.next().value;
                    console.log(ni);
                    if (disconnectBool){
                        graph.disconnectNodes(ni, index);
                        disconnects.push(ni);
                    }
                    disconnectBool = !disconnectBool;
                }
                graph.connectNodes(index2, index);
                disconnects.forEach(disconnect => {
                    graph.connectNodes(disconnect, index2);
                });
            }
        }
        return false;
    }
    graph.spaceNode = function(node){
        if (node.value == "enter" || node.value == "exit") return;
        const acc = new Vector(0, 0);
        let count = 0;
        for (let ni = 0; ni < graph.size(); ni++){
            const nb = graph.getNode(ni);
            count++;
            const disp = nb.pos.sub(node.pos);
            acc.subSelf(disp.normalize().mulScalarSelf(Math.min(100, 50000/(disp.length()**2))));
            if (node.neighbors.has(ni)){
                acc.addSelf(nb.pos.sub(node.pos));
            }
        }
        acc.divScalarSelf(count);
        node.pos.addSelf(acc);
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
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    graph.nodes.forEach(node => {
/*         ctx.beginPath();
        ctx.ellipse(node.pos.x, node.pos.y, 10, 10, 0, 0, Math.PI*2);
        ctx.closePath();
        ctx.fillStyle = 'red';
        ctx.fill(); */
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

for (let i = 0; i < 30; i++){
    graph.iterate();
    graph.spaceOut();
}

for (let i = 0; i < 500; i++)
    graph.spaceOut();

setInterval(mainloop, 50);

