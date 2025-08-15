const canvas = document.getElementById("mainCanvas");

const ctx = canvas.getContext("2d");

const colorconv = {
    0 : "black",
    1 : "brown",
    2 : "red",
};

function printArr(arr){
    for (let i = 0; i < arr.length; i++){
        for (let j = 0; j < arr[i].length; j++){
            ctx.fillStyle = colorconv[arr[i][j]];

            ctx.fillRect(j*20, i*20, 20, 20);
        }
    }
}

function mainloop(){
    const succ = SolveConflicts();
    printArr(map);
    if (!succ) setTimeout(mainloop, 50);
}

mainloop();

