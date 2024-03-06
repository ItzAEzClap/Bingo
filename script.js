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
]
const DIRECTIONS = {
    HORIZONTAL: 0,
    VERTICAL: 1,
    DIAGONAL_LEFT_TO_RIGHT: 2,
    DIAGONAL_RIGHT_TO_LEFT: 3
}


function shuffle(values) {
    return values.map(e => { return {val: e, s: Math.random() }; }).sort((a, b) => a.s - b.s).map(e => e.val);
}

function createGrid() {
    const min = getComputedStyle(document.body).getPropertyValue('--minSize')
    let minFontSize = Infinity;
    const val = shuffle(VALUES)
    for (let i = 0; i < SIZE * SIZE; i++) {
        const cell = document.createElement("div");
        cell.className = "bingo-cell";
        cell.textContent = val[i] || ""
        cell.setAttribute("checked", false)
        cell.style.maxWidth = `calc(${min} / ${SIZE})`;
        cell.style.maxHeight = `calc(${min} / ${SIZE})`;
        board.appendChild(cell);
        cell.style.width = `calc(${cell.style.maxWidth} - ${getExtraWidth(cell)}px`
        cell.style.height = `calc(${cell.style.maxHeight} - ${getExtraHeight(cell)}px)`

        
        minFontSize = Math.min(fitText(cell), minFontSize)
    }

    for (let child of board.children) child.style.fontSize = `${minFontSize}px`
}


function getExtraWidth(cell) {
    const style = getComputedStyle(cell);
    const padding = (parseInt(style.paddingLeft) || 0) + (parseInt(style.paddingRight) || 0)
    const border = (parseInt(style.borderLeft) || 0) + (parseInt(style.borderRight) || 0)
    return padding + border;
}

function getExtraHeight(cell) {
    const style = getComputedStyle(cell);
    const padding = (parseInt(style.paddingTop) || 0) + (parseInt(style.paddingBottom) || 0)
    const border = (parseInt(style.borderTop) || 0) + (parseInt(style.borderBottom) || 0)
    return padding + border;
}

window.onload = () => {
    board.style.gridTemplateColumns = `repeat(${SIZE}, 1fr)`
    board.style.gridTemplateRows = `repeat(${SIZE}, 1fr)`


    createGrid()
};

function fitText(element) {
    const maxFontSize = 100;
    let width = element.clientWidth;
    let contentWidth = element.scrollWidth;
    let height = element.clientHeight;
    let contentHeight = element.scrollHeight;
    let fontSize = Math.ceil(parseInt(window.getComputedStyle(element).getPropertyValue('font-size'))) || 10;

    if (contentWidth > width || contentHeight > height) {
        fontSize = Math.min(Math.ceil(fontSize * width / contentWidth), Math.ceil(fontSize * height / contentHeight));
        if (fontSize > maxFontSize) fontSize = maxFontSize
        else fontSize--;

        element.style.fontSize = `${fontSize}px`;
    } else {
        while (true) {
            fontSize++;
            if (fontSize > maxFontSize) fontSize = maxFontSize;

            element.style.fontSize = `${fontSize}px`;

            width = element.clientWidth;
            contentWidth = element.scrollWidth;
            height = element.clientHeight;
            contentHeight = element.scrollHeight;

            if (contentWidth > width || contentHeight > height) {
                element.style.fontSize = `${fontSize - 1}px`;
                break;
            }

            if (fontSize >= maxFontSize) break;
        }
    }

    return fontSize
}

const mouse = { x: 0, y: 0, down: false };


window.onmousemove = (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
}

window.onmousedown = (e) => {
    window.onmousemove(e);
    mouse.down = true;
}

const ACTIONS = {
    ADD: 0,
    REMOVE: 1
}
window.onmouseup = (e) => {
    window.onmousemove(e);
    mouse.down = false;
    if (e.srcElement.className !== "bingo-cell") return

    const element = e.srcElement
    if (element.getAttribute("checked") === "true") {
        element.removeChild(element.lastChild)
        checkBingo(element, ACTIONS.REMOVE)
        element.setAttribute("checked", "false")

    } else {
        const xImg = new Image()
        xImg.src = "imgs/x-thin.png"
        xImg.width = (parseInt(getComputedStyle(element).width) + 20)
        element.appendChild(xImg)

        checkBingo(element, ACTIONS.ADD)
        element.setAttribute("checked", "true")
    }
}

function removeLine(fromX, fromY, toX, toY, direction) {
    for (const line of lineContainer.children) {
        if (line.getAttribute("path") !== `${fromX}, ${fromY}, ${toX}, ${toY}`) continue
        lineContainer.removeChild(line)
    }

    for (let i = 0; i < SIZE; i++) {
        let x = 0, y = 0

        if (direction === DIRECTIONS.HORIZONTAL) { x = i; y = fromY; }
        else if (direction === DIRECTIONS.VERTICAL) { x = fromX; y = i; }
        else if (direction === DIRECTIONS.DIAGONAL_LEFT_TO_RIGHT) { x = i; y = i; }
        else if (direction === DIRECTIONS.DIAGONAL_RIGHT_TO_LEFT) { x = i; y = SIZE - 1 - x; }

        const element = board.children[x + y * SIZE].lastChild
        if (element instanceof Image) element.style.opacity = "100%"
    }   
}

function checkBingo(cell, action) {
    let children = Array.from(board.children)
    let index = children.indexOf(cell)
    let x = index % SIZE
    let y = (index - x) / SIZE

    // Vertical and Horizontal and Diagonal
    let vBingo = true
    let hBingo = true
    let leftToRight = true
    let rightToLeft = true
    for (let i = 0; i < SIZE; i++) {
        if (children[x + i * SIZE].children.length === 0) vBingo = false;
        if (children[i + y * SIZE].children.length === 0) hBingo = false;
        if (children[i + i * SIZE].children.length === 0) leftToRight = false;
        if (children[i + (SIZE - 1 - i) * SIZE].children.length === 0) rightToLeft = false;
    }

    if (action === ACTIONS.ADD) {
        if (vBingo) addLine(x, 0, x, SIZE - 1, DIRECTIONS.VERTICAL)
        if (hBingo) addLine(0, y, SIZE - 1, y, DIRECTIONS.HORIZONTAL)
        if (leftToRight) addLine(0, 0, SIZE - 1, SIZE - 1, DIRECTIONS.DIAGONAL_LEFT_TO_RIGHT)
        if (rightToLeft) addLine(0, SIZE - 1, SIZE - 1, 0, DIRECTIONS.DIAGONAL_RIGHT_TO_LEFT)
    } else if (action === ACTIONS.REMOVE) {
        if (!vBingo) removeLine(x, 0, x, SIZE - 1, DIRECTIONS.VERTICAL)
        if (!hBingo) removeLine(0, y, SIZE - 1, y, DIRECTIONS.HORIZONTAL)
        if (!leftToRight) removeLine(0, 0, SIZE - 1, SIZE - 1, DIRECTIONS.DIAGONAL_LEFT_TO_RIGHT)
        if (!rightToLeft) removeLine(0, SIZE - 1, SIZE - 1, 0, DIRECTIONS.DIAGONAL_RIGHT_TO_LEFT)
    }
}

function addLine(fromX, fromY, toX, toY, direction) {
    const start = board.children[fromX + fromY * SIZE]
    const startRect = start.getBoundingClientRect()
    const endRect = board.children[toX + toY * SIZE].getBoundingClientRect()
    const line = document.createElement("div")
    line.className = "line"
    line.setAttribute("path", `${fromX}, ${fromY}, ${toX}, ${toY}`)
    lineContainer.appendChild(line)
    
    const lineRect = line.getBoundingClientRect()
    const rotateOffset = lineRect.height * Math.SQRT1_2
    const offset = 2

    switch (direction) {
        case DIRECTIONS.HORIZONTAL:
            line.style.left = `${startRect.x}px`
            line.style.top = `${startRect.y + (startRect.height - parseInt(getComputedStyle(line).height)) / 2}px`
            line.style.width = `${endRect.x - startRect.x + endRect.width}px`
            break;
        case DIRECTIONS.VERTICAL:
            line.style.top = `${startRect.y}px`
            line.style.height = `${endRect.y - startRect.y + endRect.height}px`
            line.style.left = `${startRect.x + (startRect.width - parseInt(getComputedStyle(line).width)) / 2}px`
            break;
        case DIRECTIONS.DIAGONAL_LEFT_TO_RIGHT:
            line.style.top = `${startRect.y - offset}px`
            line.style.left = `${startRect.x + rotateOffset - offset}px`
            line.style.width = `${(endRect.x - startRect.x + endRect.width) * Math.SQRT2 - rotateOffset + offset}px`
           
            line.style.transformOrigin = "top left"
            line.style.transform = "rotate(45deg)"
            break;
        case DIRECTIONS.DIAGONAL_RIGHT_TO_LEFT:
            line.style.left = `${startRect.x + rotateOffset - offset}px`
            line.style.top = `${startRect.y + startRect.height - (getExtraHeight(start) / 2 + offset)}px`
            line.style.width = `${(endRect.x - startRect.x + endRect.width) * Math.SQRT2 - rotateOffset + offset}px`
            
            line.style.transformOrigin = "bottom left"
            line.style.transform = "rotate(-45deg)"
            break;
        default: return
    }

    for (let i = 0; i < SIZE; i++) {
        let x = 0, y = 0

        if (direction === DIRECTIONS.HORIZONTAL) { x = i; y = fromY; }
        else if (direction === DIRECTIONS.VERTICAL) { x = fromX; y = i; }
        else if (direction === DIRECTIONS.DIAGONAL_LEFT_TO_RIGHT) { x = i; y = i; }
        else if (direction === DIRECTIONS.DIAGONAL_RIGHT_TO_LEFT) { x = i; y = SIZE - 1 - x; }

        const element = board.children[x + y * SIZE].lastChild
        if (element instanceof Image) element.style.opacity = "65%"
    }   

    line.style.borderRadius = `${lineRect.width}px`
}



