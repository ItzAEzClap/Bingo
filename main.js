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

function createBingoBoard() {
    const min = getComputedStyle(document.body).getPropertyValue('--minSize');
    const val = shuffle(VALUES);
    let minFontSize = Infinity;;
    
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
    }

    for (let child of board.children) child.style.fontSize = `${minFontSize}px`;
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
    const start = board.children[fromX + fromY * SIZE];
    const startRect = start.getBoundingClientRect();
    const endRect = board.children[toX + toY * SIZE].getBoundingClientRect();
    const line = document.createElement("div");
    line.className = "line";
    line.setAttribute("path", `${fromX}, ${fromY}, ${toX}, ${toY}`);
    lineContainer.appendChild(line);
    
    const lineRect = line.getBoundingClientRect();
    const rotateOffset = lineRect.height * Math.SQRT1_2;
    const offset = 2;

    switch (direction) {
        case DIRECTIONS.HORIZONTAL:
            line.style.left = `${startRect.x}px`;
            line.style.width = `${endRect.x - startRect.x + endRect.width}px`;
            line.style.top = `${startRect.y + (startRect.height - parseInt(getComputedStyle(line).height)) / 2}px`;
            break;
        case DIRECTIONS.VERTICAL:
            line.style.top = `${startRect.y}px`;
            line.style.height = `${endRect.y - startRect.y + endRect.height}px`;
            line.style.left = `${startRect.x + (startRect.width - parseInt(getComputedStyle(line).width)) / 2}px`;
            break;
        case DIRECTIONS.DIAGONAL_LEFT_TO_RIGHT:
            line.style.top = `${startRect.y - offset}px`;
            line.style.left = `${startRect.x + rotateOffset - offset}px`;
            line.style.width = `${(endRect.x - startRect.x + endRect.width) * Math.SQRT2 - rotateOffset + offset}px`;
           
            line.style.transformOrigin = "top left";
            line.style.transform = "rotate(45deg)";
            break;
        case DIRECTIONS.DIAGONAL_RIGHT_TO_LEFT:
            line.style.left = `${startRect.x + rotateOffset - offset}px`;
            line.style.top = `${startRect.y + startRect.height - (getExtraHeight(start) / 2 + offset)}px`;
            line.style.width = `${(endRect.x - startRect.x + endRect.width) * Math.SQRT2 - rotateOffset + offset}px`;
            
            line.style.transformOrigin = "bottom left";
            line.style.transform = "rotate(-45deg)";
            break;
        default: return
    }

    changeOpacity(fromX, fromY, direction, ACTIONS.ADD);
    line.style.borderRadius = `${lineRect.width}px`;
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
}


window.onmouseup = (e) => {
    if (e.srcElement.className !== "bingo-cell") return;

    const element = e.srcElement;
    if (element.getAttribute("checked") === "true") {
        element.removeChild(element.lastChild);
        checkBingo(element, ACTIONS.REMOVE);
        element.setAttribute("checked", "false");
    } else {
        const xImg = new Image();
        xImg.src = "imgs/x-thin.png";
        xImg.width = (parseInt(getComputedStyle(element).width) + 20);
        element.appendChild(xImg);

        checkBingo(element, ACTIONS.ADD);
        element.setAttribute("checked", "true");
    }
};

window.onload = () => {
    board.style.gridTemplateColumns = `repeat(${SIZE}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${SIZE}, 1fr)`;

    createBingoBoard();
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
    for (const line of lineContainer.children) {
        const [fromX, fromY, toX, toY] = line.getAttribute("path").split(", ").map(x => parseInt(x));
        let direction;
        if (fromX === toX) direction = DIRECTIONS.VERTICAL;
        if (fromY === toY) direction = DIRECTIONS.HORIZONTAL;
        if (fromX === 0 && fromY === 0 && toX === SIZE - 1 && toY === SIZE - 1) direction = DIRECTIONS.DIAGONAL_LEFT_TO_RIGHT;
        if (fromX === 0 && fromY === SIZE - 1 && toX === SIZE - 1 && toY === 0) direction = DIRECTIONS.DIAGONAL_RIGHT_TO_LEFT;

        const start = board.children[fromX + fromY * SIZE];
        const startRect = start.getBoundingClientRect();
        const endRect = board.children[toX + toY * SIZE].getBoundingClientRect();
        const rotateOffset = 14 * Math.SQRT1_2;
        const offset = 2;

        switch (direction) {
            case DIRECTIONS.HORIZONTAL:
                line.style.left = `${startRect.x}px`;
                line.style.width = `${endRect.x - startRect.x + endRect.width}px`;
                line.style.top = `${startRect.y + (startRect.height - parseInt(getComputedStyle(line).height)) / 2}px`;
                break;
            case DIRECTIONS.VERTICAL:
                line.style.top = `${startRect.y}px`;
                line.style.height = `${endRect.y - startRect.y + endRect.height}px`;
                line.style.left = `${startRect.x + (startRect.width - parseInt(getComputedStyle(line).width)) / 2}px`;
                break;
            case DIRECTIONS.DIAGONAL_LEFT_TO_RIGHT:
                console.log(startRect.x, rotateOffset)
                line.style.top = `${startRect.y - offset}px`;
                line.style.left = `${startRect.x + rotateOffset - offset}px`;
                line.style.width = `${(endRect.x - startRect.x + endRect.width) * Math.SQRT2 - rotateOffset + offset}px`;
                break;
            case DIRECTIONS.DIAGONAL_RIGHT_TO_LEFT:
                line.style.left = `${startRect.x + rotateOffset - offset}px`;
                line.style.top = `${startRect.y + startRect.height - (getExtraHeight(start) / 2 + offset)}px`;
                line.style.width = `${(endRect.x - startRect.x + endRect.width) * Math.SQRT2 - rotateOffset + offset}px`;
                break;
            default: return
        }
    }
}