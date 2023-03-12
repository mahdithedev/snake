import './style.css'

// i know i can to this better but this is just fine for now
if(!window.localStorage.getItem("GRID_DIMENSION")) {
    window.localStorage.setItem("GRID_DIMENSION" , "500");
}

if(!window.localStorage.getItem("GRID_SIZE")) {
    window.localStorage.setItem("GRID_SIZE" , "25");
}

if(!window.localStorage.getItem("WALLS")) {
    window.localStorage.setItem("WALLS" , "true");
}

if(!window.localStorage.getItem("FPS")) {
    window.localStorage.setItem("FPS" , "12");
}

if(!window.localStorage.getItem("SNAKE_COLOR")) {
    window.localStorage.setItem("SNAKE_COLOR" , "crimson");
}

function get(key: string): string {
    return (window.localStorage.getItem(key) as string);
}

const ROW_COUNT = parseInt(get("GRID_SIZE"));
const CELL_COUNT = parseInt(get("GRID_SIZE"));

const ROW_HEIGHT = `${parseInt(get("GRID_DIMENSION"))/ROW_COUNT}px`;
const CELL_WIDTH = `${parseInt(get("GRID_DIMENSION"))/CELL_COUNT}px`;

const WALLS = get("WALLS") == "true";

const FPS = parseInt(get("FPS"));

const snakeColor = get("SNAKE_COLOR");

type Position = [number , number];

function copyPosition(pos : Position): Position {
    return [pos[0] , pos[1]]
}

function set_at(grid: number[][] , pos: Position , value: number) {
    grid[pos[0]][pos[1]] = value;
}

function isGameover(grid: number[][] , head: Position) : boolean {

    let cell = grid[head[0]][head[1]];

    if(cell == 1 || cell == 3) {
        return true;
    }

    return false;
}

let grid_element = (document.querySelector(".grid") as HTMLDivElement);
grid_element.style.width = get("GRID_DIMENSION") + "px";
grid_element.style.height = get("GRID_DIMENSION") + "px";
let grid: number[][] = [];

function random_numebr(min: number , max: number): number {
    return Math.floor((Math.random() * max) + min);
}

function generate_random_coordinate() : Position {
    return [random_numebr(0 , ROW_COUNT) , random_numebr(0 , CELL_COUNT)];
}

function generate_valid_random_coordinate(grid: number[][]): Position {

    let pos = generate_random_coordinate();

    while(grid[pos[0]][pos[1]] !== 0) {
        pos = generate_random_coordinate();
    }

    return pos;

};

for(let i = 0 ; i < ROW_COUNT ; i++) {
    
    let row_element = document.createElement("div");
    row_element.className = `row-${i}`;
    row_element.style.height = ROW_HEIGHT;
    row_element.style.width = "100%";

    let row = []

    for(let j = 0 ; j < CELL_COUNT ; j++) {

        let cell_element = document.createElement("div");
        cell_element.className = `cell-${i}-${j}`;
        cell_element.style.width = CELL_WIDTH;
        cell_element.style.height = "100%";
        cell_element.style.display = "inline-block"

        row_element.appendChild(cell_element);

        row.push(0);

    }

    grid.push(row);
    
    grid_element.appendChild(row_element);

}

if(WALLS) {
    
    for(let i = 0 ; i < ROW_COUNT ; i++) {
        grid[i][0] = 3;
        grid[i][CELL_COUNT-1] = 3;
    }

    for(let i = 0 ; i < ROW_COUNT ; i++) {
        grid[0][i] = 3;
        grid[ROW_COUNT-1][i] = 3;
    }

}

function render_loop(now: number) {

    for(let i = 0 ; i < grid.length ; i++) {
        for(let j = 0 ; j < grid[i].length ; j++) {

            // i intentianliy use a number to color translation instead of using colors directly
            let cell = (document.querySelector(`.cell-${i}-${j}`) as HTMLDivElement);

            let newBackgroundColor = "black"

            if(grid[i][j] == 1) {
                newBackgroundColor = snakeColor;
            }

            if(grid[i][j] == 2) {
                newBackgroundColor ="yellow";
            }

            if(grid[i][j] == 3) {
                newBackgroundColor = "#1b1b24";
            }

            cell.style.backgroundColor = newBackgroundColor;
            (document.querySelector(".score") as HTMLDivElement).innerText = `score is ${score}`;

        }
    }

    requestAnimationFrame(render_loop);

}

let head : Position = generate_valid_random_coordinate(grid);
let tail : Position[] = [];
let prevhead : Position = copyPosition(head);
let cleaningEntity : Position = copyPosition(head);
let loopIds: number[] = [];
let score = 0;

function game_loop() {

    set_at(grid , cleaningEntity , 0);

    if(isGameover(grid , head)) {
        clearInterval(loopIds[1]);
        window.cancelAnimationFrame(loopIds[0]);
        window.alert("Game is over");
    };

    set_at(grid , head , 1);

    tail.forEach(pos => {
        set_at(grid , pos , 1);
    });

    if(direction == "") {
        return;
    }

    if(direction == "u") {
        prevhead = copyPosition(head);
        head[0] = (head[0] - 1 + ROW_COUNT)%(CELL_COUNT);
    }

    if(direction == "d") {
        prevhead = copyPosition(head);
        head[0] = (head[0] + 1)%(ROW_COUNT);
    }

    if(direction == "r") {
        prevhead = copyPosition(head);
        head[1] = (head[1] + 1)%(CELL_COUNT);
    }

    if(direction == "l") {
        prevhead = copyPosition(head);
        head[1] = (head[1] - 1 + CELL_COUNT)%(CELL_COUNT);
    }

    if(food[0] == -1 && food[1] == -1) {
        food = generate_valid_random_coordinate(grid);
        set_at(grid , food , 2);
    }

    let foodEaten = false;

    if(head[0] == food[0] && head[1] == food[1]) {
        food = [-1 , -1];
        foodEaten = true;
        score++;
    }

    if(tail.length > 0) {
        cleaningEntity = (tail.pop() as Position);
        tail.unshift(copyPosition(prevhead));
    } else {
        cleaningEntity = copyPosition(prevhead);
    }
    
    if(foodEaten) {
        tail.push(copyPosition(cleaningEntity));
    }

};

loopIds.push(requestAnimationFrame(render_loop));
loopIds.push(setInterval(game_loop , 1000/FPS));

let direction = "";
let food : Position = [-1 , -1]; 

window.addEventListener("keypress" , (key) => {

    if(key.code == "KeyW" && direction != "d") {
        direction = "u";
    }

    if(key.code == "KeyS" && direction != "u") {
        direction = "d";
    }

    if(key.code == "KeyD" && direction != "l") {
        direction = "r"
    }

    if(key.code == "KeyA" && direction != "r") {
        direction = "l";
    }

})