import './style.css'

// i know i can to this better but this is just fine for now

function get(key: string) {
    return (window.localStorage.getItem(key) as string);
}

if(!window.localStorage.getItem("GRID_SIZE")) {
    window.localStorage.setItem("GRID_SIZE" , "25");
}

if(!window.localStorage.getItem("WALLS")) {
    window.localStorage.setItem("WALLS" , "true");
}

if(!window.localStorage.getItem("GAME_SPEED")) {
    window.localStorage.setItem("GAME_SPEED" , "12");
}

if(!window.localStorage.getItem("SNAKE_COLOR")) {
    window.localStorage.setItem("SNAKE_COLOR" , "crimson");
}

const ROW_COUNT = parseInt(get("GRID_SIZE"));
const CELL_COUNT = parseInt(get("GRID_SIZE"));

const CELL_SIZE = 500/CELL_COUNT;

const WALLS = get("WALLS") == "true";

const iterations_per_second = parseInt(get("GAME_SPEED"));

const snakeColor = (get("SNAKE_COLOR") as any);

type Position = [number , number];

function copyPosition(pos : Position): Position {
    return [pos[0] , pos[1]]
}

function set_at(grid: CellType[][] , pos: Position , value: CellType) {
    grid[pos[0]][pos[1]] = value;
}

enum CellType {
    SNAKE = snakeColor,
    FOOD = 'yellow',
    NOTHING = 'black',
    WALLS = '#1b1b24'
}

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d') as CanvasRenderingContext2D;

let grid: CellType[][] = [];

function random_numebr(min: number , max: number): number {
    return Math.floor((Math.random() * max) + min);
}

function generate_random_coordinate() : Position {
    return [random_numebr(0 , ROW_COUNT) , random_numebr(0 , CELL_COUNT)];
}

function generate_valid_random_coordinate(grid: CellType[][]): Position {

    let pos = generate_random_coordinate(); 

    while(grid[pos[0]][pos[1]] == CellType.WALLS) {
        pos = generate_random_coordinate();
    }

    return pos;

};

for (let i = 0; i < ROW_COUNT; i++) {
    let row = [];
    for (let j = 0; j < CELL_COUNT; j++) {
      row.push(CellType.NOTHING);
    }
    grid.push(row);
}

if(WALLS) {

    for(let j = 0 ; j < CELL_COUNT ; j++) {
        grid[0][j] = CellType.WALLS;
        grid[ROW_COUNT-1][j] = CellType.WALLS;
    };

    for(let i = 0 ; i < ROW_COUNT ; i++) {
        grid[i][0] = CellType.WALLS;
        grid[i][CELL_COUNT-1] = CellType.WALLS;
    }

}

function render(timestamp: number) {

    for (let i = 0; i < ROW_COUNT; i++) {
      for (let j = 0; j < CELL_COUNT; j++) {
        const cell = grid[i][j];
        const x = j * CELL_SIZE;
        const y = i * CELL_SIZE;
        context.fillStyle = (cell as string);
        context.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }

    requestAnimationFrame(render);

}

let loopIds: number[] = [];
let score = 0;

let direction = "";

window.onkeydown = (key) => {

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

};

let head: Position = generate_valid_random_coordinate(grid);
let food: Position = generate_valid_random_coordinate(grid);
let cleaner = copyPosition(head);
let tail: Position[] = [];

function game_loop() {

    if(tail.length > 0) {
        cleaner = (tail.pop() as Position);
        tail.unshift(copyPosition(head));
    } else {
        cleaner = copyPosition(head);
    }

    if (direction == 'r') {
        head[1] = (head[1] + 1) % CELL_COUNT;
    } else if (direction == 'd') {
        head[0] = (head[0] + 1) % ROW_COUNT;
    } else if (direction == 'l') {
        head[1] = (head[1] - 1 + CELL_COUNT) % CELL_COUNT;
    } else if (direction == 'u') {
        head[0] = (head[0] - 1 + ROW_COUNT) % ROW_COUNT;
    }

    if(direction !== '') {
        if(grid[head[0]][head[1]] == CellType.WALLS || grid[head[0]][head[1]] == CellType.SNAKE) {
            clearInterval(loopIds[1]);
            window.alert(`Game over your score is ${score}`)
            return
        }
    }

    for(let i = 0; i < tail.length; i++) {
        set_at(grid, tail[i], CellType.SNAKE);
    }

    if(head[0] == food[0] && head[1] == food[1]) {
        score += 1;
        food = generate_valid_random_coordinate(grid);
        tail.push(cleaner);
    };

    set_at(grid, cleaner, CellType.NOTHING);
    set_at(grid, head, CellType.SNAKE);
    set_at(grid, food, CellType.FOOD);

}

loopIds.push(requestAnimationFrame(render));
loopIds.push(setInterval(game_loop, 1000/iterations_per_second));