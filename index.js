const canvas = document.getElementById("mainCanvas");

const ctx = canvas.getContext("2d");

function randint(x, y){
    return Math.floor(Math.random() * (y - x) + x);
}

{//capillary bed generation 2.0
    var graph = new GR_Graph();
    const enter = graph.addNode(new Vector(0, 300), 999);
    const middle = graph.addNode(new Vector(200, 300), 0);
    const middle2 = graph.addNode(new Vector(400, 301), 0);
    const middle3 = graph.addNode(new Vector(600, 300), 0);
    
    const exit = graph.addNode(new Vector(950, 300), 999);
    graph.connectNodes(enter, middle);
    graph.connectNodes(middle, middle2);
    graph.connectNodes(middle2, middle3);
    graph.connectNodes(exit, middle3);
    graph.sizeCap = 40; //not a hard cap; just signals when the graph is big enough
    graph.minBound = new Vector(0, 0);
    graph.maxBound = new Vector(canvas.width, canvas.height);
    graph.center = graph.maxBound.add(graph.minBound).divScalarSelf(2);
    graph.newConnect = function(node_plus, node_minus, direction){
        for (const neighbor of [node_plus, node_minus])
            if (neighbor == exit || neighbor == enter || neighbor.neighbors.size > 4){
                return false;
            } 

        const node2 = graph.addNode(node_plus.pos.add(node_minus.pos).divScalarSelf(2), 0);
        
        node2.pos.set(undefined, node2.pos.y + 99*direction)

        graph.connectNodes(node_plus, node2);
        graph.connectNodes(node2, node_minus);

        graph.addToPQs(node2);
        for (let i = 0; i < Math.floor(node_plus.pos.distanceFrom(node_minus.pos))/100; i++)
            graph.dimerize(node2);
    }
    graph.dimerize = function(node){//dimer
        const newCenter = node.pos.clone();
        const radius = new Vector(-30, 0);
        node.pos.copy(newCenter.add(radius));
        radius.rotateDegreesSelf(180);
        const node2 = graph.addNode(newCenter.add(radius), node.value);

        const it = node.neighbors.values();
        let disconnects = [];
        let searchCount = 0;
        let disconnectBool = true;
        while (searchCount < node.neighbors.size){
            const nb = it.next().value;
            if (disconnectBool){
                disconnects.push(nb);
            }
            disconnectBool = !disconnectBool;
            searchCount++;
        }
        graph.connectNodes(node2, node);
        disconnects.forEach(disconnect => {
            graph.connectNodes(disconnect, node2);
            graph.disconnectNodes(disconnect, node);
        });
        graph.addToPQs(node2);
    }
    graph.tensionOfNode = function(node){
        let ret = 0;
        node.neighbors.forEach(nb => {
            ret += nb.pos.distanceFrom(node);
        });
        return ret;
    }
    graph.findEdgePath = function(){
        const direction = Math.floor(Math.random()*2)*2 - 1;// either 0 or 1
        //start at enter and end at exit
        let ret = [];
        let stack = new GR_PriorityQueue(function(a, b){return a.pos.y * direction > b.pos.y * direction;});
        let targetNode = enter;
        let visited = new Set();
        while (targetNode != exit){
            visited.add(targetNode);
            targetNode.neighbors.forEach(nb => {
                if (!visited.has(nb)){
                    stack.add(nb);
                    nb.prev = targetNode;
                }
            });
            const next = stack.remove();
            targetNode = next;
        }
        while (targetNode != enter){
            ret.push(targetNode);
            targetNode = targetNode.prev;
        }
        return [ret, direction];
    }
    
    graph.dimerOrder = new GR_PriorityQueue(function(a, b){return (graph.tensionOfNode(a) > graph.tensionOfNode(b) || b == exit || b == enter) && !(a == exit || a == enter);})
    graph.addToPQs = function(node){
        graph.dimerOrder.add(node);
    }
    graph.nodes.forEach(graph.addToPQs);

    graph.iterate = function(){
        if (graph.size() > graph.sizeCap) return;
        if (Math.random() < 0.90) return;
        if (Math.random() > 0.5){
            let edgePath, direction;
            [edgePath, direction] = graph.findEdgePath();
            graph.nodes.forEach(node => {node.value = 0})
            edgePath.forEach(node => {node.value = 5})
            const ni_1 = randint(1, edgePath.length - 1);
            const ni_2 = randint(1, edgePath.length - 1);
            if (ni_1 == ni_2) return;
            graph.newConnect(edgePath[ni_1], edgePath[ni_2], direction);

        }
        /* const node = graph.dimerOrder.remove();
        graph.dimerize(node);
        graph.dimerOrder.add(node); */

    }
    graph.spaceNode = function(node){
        const acc = new Vector(0, 0);
        let count = 0;
        for (let ni = 0; ni < graph.size(); ni++){
            const nb = graph.getNode(ni);
            count++;
            const disp = nb.pos.sub(node.pos);
            acc.subSelf(disp.normalize().mulScalarSelf(Math.min(100, 700/(disp.length()))));
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
    graph.spaceOut = function(rep){
        for (let i = 0; i < graph.sizeCap*rep; i++){
            const index = graph.randomNodeIndex();
            const node = graph.getNode(index);
            graph.spaceNode(node);
        }
    }
}
function mainloop(){
    graph.spaceOut(1);
    graph.iterate(); 
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    graph.nodes.forEach(node => {
        
        ctx.beginPath();
        ctx.ellipse(node.pos.x, node.pos.y, node.value, node.value, 0, 0, Math.PI*2);
        ctx.closePath();
        ctx.fillStyle = 'red';
        if (node.value < 999) ctx.fill(); 
        node.neighbors.forEach(nb => {
            ctx.beginPath();
            ctx.moveTo(node.pos.x, node.pos.y);
            ctx.lineTo(nb.pos.x, nb.pos.y);
            ctx.strokeStyle = "red";
            ctx.stroke();
        });
    });
}


setInterval(mainloop, 50);

