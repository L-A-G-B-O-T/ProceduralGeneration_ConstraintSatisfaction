class GR_Node {
    constructor(start, value){
        this.pos = start;
        this.value = "";
        if (value != undefined) this.value = value;
        this.neighbors = new Set();
    }
}

class GR_Graph {
    constructor(){
        this.nodes = [];
        this.runRule = function(node){};
    }
    addNode(start, value){
        const n = new GR_Node(start, value);
        this.nodes.push(n);
        return this.nodes.length - 1;
    }
    getNode(index){
        return this.nodes[index];
    }
    size(){
        return this.nodes.length;
    }
    connectNodes(nodeIndex1, nodeIndex2){
        this.getNode(nodeIndex1).neighbors.add(nodeIndex2);
        this.getNode(nodeIndex2).neighbors.add(nodeIndex1);
    }
    disconnectNodes(nodeIndex1, nodeIndex2){
        this.getNode(nodeIndex1).neighbors.delete(nodeIndex2);
        this.getNode(nodeIndex2).neighbors.delete(nodeIndex1);
    }
    newDist(nodeIndex1, nodeIndex2, dist){
        const n1 = this.getNode(nodeIndex1);
        const n2 = this.getNode(nodeIndex2);
        const disp = n2.pos.sub(n1.pos);
        const newdisp = disp.normalize().mulScalarSelf(dist);
        n2.pos.copy(n1.pos.add(newdisp));
    }
    randomNodeIndex(){
        return Math.floor(Math.random() * this.nodes.length);
    }
    iterate(){
        let successful = true;
        for (let i = 0; i < this.size(); i++){
            const index = this.randomNodeIndex();
            const node = this.getNode(index);
            successful = successful && this.runRule(node, index);
        }
        return successful;
    }
}

