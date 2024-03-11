const board = document.getElementById("bingo-board");
const lineContainer = document.getElementById("line-container");
const SIZE = 4;
const VALUES = [
    "Chattriga",
    "Behöver rast",
    "Skit",
    "Hörni",
    "Ser ni där bak?",
    "Är detta tydligt ?",
    "Stavning är inte min starka sida",
    "Är det tillräckligt stort ?",
    "Carina sa/Enligt Carina",
    "Jag vet att den här genomgången redan är lång",
    "Ändrar uppgiften",
    "Fel formel",
    "Lite längre lektion än vad jag tänkte mig",
    "Lång tid dåligt förklarat",
    "Motsäger sig själv",
    "Öhh (3+ sek)",
];
const DIRECTIONS = {
    HORIZONTAL: 0,
    VERTICAL: 1,
    DIAGONAL_LEFT_TO_RIGHT: 2,
    DIAGONAL_RIGHT_TO_LEFT: 3
};
const ACTIONS = {
    ADD: 0,
    REMOVE: 1
};
const LOCALSTORAGEKEY = "bingo-bingo";
let boardInfo;

function createBingoBoard() {
    const useStorageInfo = boardInfo.values.length === SIZE * SIZE;
    if (!useStorageInfo) {
        boardInfo.values = [];
        boardInfo.marked = [];
    }
    const min = getComputedStyle(document.body).getPropertyValue('--minSize');
    const val = useStorageInfo ? boardInfo.values : shuffle(VALUES);
    let minFontSize = Infinity;

    for (let i = 0; i < SIZE * SIZE; i++) {
        const cell = document.createElement("div");
        cell.setAttribute("checked", false);
        cell.className = "bingo-cell";

        cell.textContent = val[i] || "";
        cell.style.maxWidth = `calc(${min} / ${SIZE})`;
        cell.style.maxHeight = `calc(${min} / ${SIZE})`;
        board.appendChild(cell);

        cell.style.width = `calc(${cell.style.maxWidth} - ${getExtraWidth(cell)}px`;
        cell.style.height = `calc(${cell.style.maxHeight} - ${getExtraHeight(cell)}px)`;
        minFontSize = Math.min(fitText(cell), minFontSize);

        if (useStorageInfo) { if (boardInfo.marked.includes(i)) addMark(cell, true); }
        else boardInfo.values.push(val[i]);
    }

        
    localStorage.setItem(LOCALSTORAGEKEY, JSON.stringify(boardInfo))
    for (let child of board.children) {
        if (useStorageInfo) checkBingo(child, ACTIONS.ADD);
        child.style.fontSize = `${minFontSize}px`;
    }
};

function checkBingo(cell, action) {
    let children = Array.from(board.children);
    let index = children.indexOf(cell);
    let x = index % SIZE;
    let y = (index - x) / SIZE;

    // Vertical and Horizontal and Diagonal
    let vBingo = true;
    let hBingo = true;
    let leftToRight = true;
    let rightToLeft = true;
    for (let i = 0; i < SIZE; i++) {
        vBingo &= children[x + i * SIZE].children.length;
        hBingo &= children[i + y * SIZE].children.length;
        leftToRight &= children[i + i * SIZE].children.length;
        rightToLeft &= children[i + (SIZE - 1 - i) * SIZE].children.length;
    }

    if (action === ACTIONS.ADD) {
        if (vBingo) addLine(x, 0, x, SIZE - 1, DIRECTIONS.VERTICAL);
        if (hBingo) addLine(0, y, SIZE - 1, y, DIRECTIONS.HORIZONTAL);
        if (leftToRight) addLine(0, 0, SIZE - 1, SIZE - 1, DIRECTIONS.DIAGONAL_LEFT_TO_RIGHT);
        if (rightToLeft) addLine(0, SIZE - 1, SIZE - 1, 0, DIRECTIONS.DIAGONAL_RIGHT_TO_LEFT);
    } else if (action === ACTIONS.REMOVE) {
        if (!vBingo) removeLine(x, 0, x, SIZE - 1, DIRECTIONS.VERTICAL);
        if (!hBingo) removeLine(0, y, SIZE - 1, y, DIRECTIONS.HORIZONTAL);
        if (!leftToRight) removeLine(0, 0, SIZE - 1, SIZE - 1, DIRECTIONS.DIAGONAL_LEFT_TO_RIGHT);
        if (!rightToLeft) removeLine(0, SIZE - 1, SIZE - 1, 0, DIRECTIONS.DIAGONAL_RIGHT_TO_LEFT);
    }
};

function removeLine(fromX, fromY, toX, toY, direction) {
    for (let i = 0; i < lineContainer.children.length; i++) {
        const line = lineContainer.children[i];
        if (line.getAttribute("path") !== `${fromX}, ${fromY}, ${toX}, ${toY}`) continue;
        lineContainer.removeChild(line);
        i--;
    }

    changeOpacity(fromX, fromY, direction, ACTIONS.REMOVE);
};

function addLine(fromX, fromY, toX, toY, direction) {
    const line = document.createElement("div");
    line.className = "line";
    line.setAttribute("path", `${fromX}, ${fromY}, ${toX}, ${toY}`);
    lineContainer.appendChild(line);

    fixStyleLine(line, fromX, fromY, toX, toY, direction);
    changeOpacity(fromX, fromY, direction, ACTIONS.ADD);
};

function fixStyleLine(line, fromX, fromY, toX, toY, direction, RECURSIVE = true) {
    const start = board.children[fromX + fromY * SIZE];
    const end = board.children[toX + toY * SIZE];
    const startRect = start.getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();
    const endRect   = end.getBoundingClientRect();
    
    line.style.width = `${boardRect.height / SIZE / 15}px`
    line.style.height = `${boardRect.height / SIZE / 15}px`
    const lineRect = line.getBoundingClientRect();
    line.style.borderRadius = `${Math.min(lineRect.width, lineRect.height)}px`;
    const rotateOffset = lineRect.height * (Math.SQRT1_2 - 0.25);

    switch (direction) {
        case DIRECTIONS.HORIZONTAL:
            line.style.left = `${startRect.x}px`;
            line.style.width = `${endRect.x - startRect.x + endRect.width}px`;
            line.style.top = `${startRect.y + (startRect.height - lineRect.height) / 2}px`;
            break;
        case DIRECTIONS.VERTICAL:
            line.style.top = `${startRect.y}px`;
            line.style.height = `${endRect.y - startRect.y + endRect.height}px`;
            line.style.left = `${startRect.x + (startRect.width - lineRect.height) / 2}px`;
            break;
        case DIRECTIONS.DIAGONAL_LEFT_TO_RIGHT:
            line.style.top = `${startRect.y}px`;
            line.style.left = `${startRect.x + rotateOffset}px`;
            line.style.width = `${(endRect.x - startRect.x + endRect.width) * Math.SQRT2 - rotateOffset}px`;

            line.style.transformOrigin = "top left";
            line.style.transform = "rotate(45deg)";
            break;
        case DIRECTIONS.DIAGONAL_RIGHT_TO_LEFT:
            line.style.left = `${startRect.x + rotateOffset}px`;
            line.style.top = `calc(100vh - ${board.children[0].getBoundingClientRect().y + lineRect.width / 2}px)`;
            line.style.width = `${(endRect.x - startRect.x + endRect.width) * Math.SQRT2 - rotateOffset}px`;

            line.style.transformOrigin = "bottom left";
            line.style.transform = "rotate(-45deg)";
            break;
        default: return
    }

    if (RECURSIVE) setTimeout(() => fixStyleLine(line, fromX, fromY, toX, toY, direction, false), 0);
};

function addMark(element, fromLocalStorage = false) {
    const xImg = new Image();
    xImg.src = "imgs/x-thin.png";
    xImg.width = element.getBoundingClientRect().width;
    element.setAttribute("checked", "true");
    element.appendChild(xImg);
    

    if (fromLocalStorage) return;
    let idx = Array.from(board.children).indexOf(element);
    boardInfo.marked.push(idx);
    localStorage.setItem(LOCALSTORAGEKEY, JSON.stringify(boardInfo));
};

function changeOpacity(fromX, fromY, direction, action) {
    for (let i = 0; i < SIZE; i++) {
        let x = 0, y = 0;

        if (direction === DIRECTIONS.HORIZONTAL) { x = i; y = fromY; }
        else if (direction === DIRECTIONS.VERTICAL) { x = fromX; y = i; }
        else if (direction === DIRECTIONS.DIAGONAL_LEFT_TO_RIGHT) { x = i; y = i; }
        else if (direction === DIRECTIONS.DIAGONAL_RIGHT_TO_LEFT) { x = i; y = SIZE - 1 - x; }

        const element = board.children[x + y * SIZE].lastChild;
        if (!(element instanceof Image)) continue;

        if (action === ACTIONS.ADD) {
            element.style.opacity = "65%";
        } else if (action === ACTIONS.REMOVE) {
            element.style.opacity = "100%";
            checkBingo(element.parentElement, ACTIONS.ADD);
        }
    }   
};

function getLocalStorage() {
    let storage = localStorage.getItem(LOCALSTORAGEKEY);    

    try { storage = JSON.parse(storage); }
    catch (error) { storage = {}; }

    if (!storage || storage.constructor.name !== "Object") storage = {};
    if (!storage.values) storage.values = [];
    if (!storage.marked) storage.marked = [];

    return storage;
};

function clearLocalStorage() {
    boardInfo.values = [];
    boardInfo.marked = [];
    localStorage.setItem(LOCALSTORAGEKEY, JSON.stringify(boardInfo));
    location.reload();
};

let selectedItem;
window.onmousedown = (e) => selectedItem = e.srcElement
window.onmouseup = (e) => {
    const element = e.srcElement;
    if (element.className !== "bingo-cell" || selectedItem !== element) return;

    if (element.getAttribute("checked") === "true") {
        element.removeChild(element.lastChild);
        checkBingo(element, ACTIONS.REMOVE);
        element.setAttribute("checked", "false");
    } else {
        addMark(element);
        checkBingo(element, ACTIONS.ADD);
    }

    selectedItem = undefined;
};

window.onload = () => {
    board.style.gridTemplateColumns = `repeat(${SIZE}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${SIZE}, 1fr)`;
    boardInfo = getLocalStorage();
    createBingoBoard();
    window.onresize();
};

window.onresize = () => {
    // Font- & Mark size
    let minFontSize = Infinity;
    for (const child of board.children) {
        minFontSize = Math.min(fitText(child), minFontSize)

        const element = child.lastChild
        if (!(element instanceof Image)) continue

        const parentRect = child.getBoundingClientRect()
        element.width = parentRect.width - 2
        element.height = parentRect.height - 2
    }

    for (const child of board.children) child.style.fontSize = `${minFontSize}px`;

    // Lines
    const boardRect = board.getBoundingClientRect();
    for (const line of lineContainer.children) {
        const [fromX, fromY, toX, toY] = line.getAttribute("path").split(", ").map(x => parseInt(x));
        let direction;
        if (fromX === toX) direction = DIRECTIONS.VERTICAL;
        if (fromY === toY) direction = DIRECTIONS.HORIZONTAL;
        if (fromX === 0 && fromY === 0 && toX === SIZE - 1 && toY === SIZE - 1) direction = DIRECTIONS.DIAGONAL_LEFT_TO_RIGHT;
        if (fromX === 0 && fromY === SIZE - 1 && toX === SIZE - 1 && toY === 0) direction = DIRECTIONS.DIAGONAL_RIGHT_TO_LEFT;

        fixStyleLine(line, fromX, fromY, toX, toY, direction);
    }

    // Clear-localstorage button position
    const localStorage = document.getElementById("clear-localstorage");
    const localStorageRect = localStorage.getBoundingClientRect();
    const bottom = boardRect.y + boardRect.height;

    localStorage.style.top = `calc(0.5 * (100vh + ${bottom - localStorageRect.height}px)`;
    const y1 = localStorage.getBoundingClientRect().y;
    localStorage.style.top = `calc(${bottom + boardRect.height / 5}px)`;
    const y2 = localStorage.getBoundingClientRect().y;

    if (y2 > y1) localStorage.style.top = `${y1}px`;
};