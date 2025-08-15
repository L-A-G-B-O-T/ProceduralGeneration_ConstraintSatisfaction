
function TileGeneration(){

}

let map = [];

let mapHeight = 14;
let mapLength = 20;

let types = 3;

/* 0 - undeclared
1 - tissues
2 - blood */

for (let i = 0; i < mapHeight; i++){
    map.push(Array(mapLength).fill(0));
}

const firstCol = [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1];
const stack = [];

for (let i = 0; i < mapHeight; i++){
    map[i][0] = firstCol[i];
    map[i][mapLength-1] = firstCol[i];
}

function checkConflicts(x, y){
    let conflicts = 0;
    const range = 1;
    switch(map[x][y]){
        case 0:
            conflicts = 5;
            break;
        case 1:
            {
                if (map[x+1][y] == 1 && map[x][y+1] == 1 && map[x][y-1] == 1 && map[x-1][y] == 1)
                    conflicts += 3;
            }
            break;
        case 2: 
            {
                if (map[x][y+1] != 2 && map[x][y-1] != 2)
                    conflicts++;
                /*if (map[x+1][y] != 2 && map[x-1][y] != 2)
                    conflicts++; */
                if (map[x+1][y] == 2 && map[x][y+1] == 2 && map[x][y-1] == 2 && map[x-1][y] == 2)
                    conflicts++;
            }
            break;
    }
    return conflicts;
}

function SolveConflicts(){
    let success = true;

    for (let i = 0; i < mapHeight * mapLength; i++){
        const x = Math.floor(Math.random() * (mapHeight - 2)) + 1;
        const y = Math.floor(Math.random() * (mapLength - 2)) + 1;
        const conflicts = checkConflicts(x, y);
        const tries = 3;
        if (conflicts > 0 || map[x][y] == 0){
            success = false;
            let bestType = 0;
            let minConflicts = conflicts;
            let tempType, tempConflicts;
            for (let j = 0; j < tries; j++){
                tempType = Math.floor(Math.random() * (types - 1)) + 1;
                map[x][y] = tempType;
                tempConflicts = checkConflicts(x, y);
                if (tempConflicts < minConflicts || bestType == 0){
                    minConflicts = tempConflicts;
                    bestType = tempType;
                }
            }
            map[x][y] = bestType;
        }
    }
    return success;
}


