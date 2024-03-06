const board = document.getElementById("bingo-board");
const WIDTH = 4;
const HEIGHT = 4;
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


function shuffle(values) {
    return values.map(e => { return {val: e, s: Math.random() }; }).sort((a, b) => a.s < b.s).map(e => e.val);
}

function createGrid() {
    const min = getComputedStyle(document.body).getPropertyValue('--minSize')
    let minFontSize = Infinity;
    const val = shuffle(VALUES)
    for (let i = 0; i < WIDTH * HEIGHT; i++) {
        const cell = document.createElement("div");
        cell.className = "bingo-cell";
        cell.textContent = val[i] || ""
        cell.style.maxWidth = `calc(${min} / ${WIDTH})`;
        cell.style.maxHeight = `calc(${min} / ${HEIGHT})`;
        board.appendChild(cell);
        cell.style.width = `calc(${cell.style.maxWidth} - ${getExtraWidth(cell)}px`
        cell.style.height = `calc(${cell.style.maxHeight} - ${getExtraHeight(cell)}px)`

        
        const minF = fitText(cell);
        if (minF < minFontSize) minFontSize = minF;
    }

    for (let child of board.children) child.style.fontSize = `${minFontSize}px`
}

function getExtraWidth(cell) {
    const style = getComputedStyle(cell);
    const padding = parseInt(style.paddingLeft) + parseInt(style.paddingRight);
    const border = parseInt(style.borderLeft) + parseInt(style.borderRight);
    return padding + border;
}

function getExtraHeight(cell) {
    const style = getComputedStyle(cell);
    const padding = parseInt(style.paddingTop) + parseInt(style.paddingBottom);
    const border = parseInt(style.borderTop) + parseInt(style.borderBottom);
    return padding + border;
}

window.onload = () => {
    board.style.gridTemplateColumns = `repeat(${WIDTH}, 1fr)`
    board.style.gridTemplateRows = `repeat(${HEIGHT}, 1fr)`


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