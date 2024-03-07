const ORIGINAL_PARSE_INT = parseInt;
parseInt = function(_string, _default = 0) {
    return ORIGINAL_PARSE_INT(_string) || _default;
}

function shuffle(values) {
    return values.map(e => { return {val: e, s: Math.random() }; }).sort((a, b) => a.s - b.s).map(e => e.val);
};

function getExtraWidth(cell) {
    const style = getComputedStyle(cell);
    const padding = parseInt(style.paddingLeft) + parseInt(style.paddingRight);
    const border = parseInt(style.borderLeft) + parseInt(style.borderRight);
    return padding + border;
};

function getExtraHeight(cell) {
    const style = getComputedStyle(cell);
    const padding = parseInt(style.paddingTop) + parseInt(style.paddingBottom);
    const border = parseInt(style.borderTop) + parseInt(style.borderBottom);
    return padding + border;
};

function fitText(element, maxFontSize = 100) {
    let width = element.clientWidth;
    let contentWidth = element.scrollWidth;
    let height = element.clientHeight;
    let contentHeight = element.scrollHeight;
    let fontSize = Math.ceil(parseInt(window.getComputedStyle(element).getPropertyValue('font-size'), 10));

    if (contentWidth > width || contentHeight > height) {
        fontSize = Math.ceil(fontSize * Math.min(width / contentWidth, height / contentHeight));

        if (fontSize > maxFontSize) fontSize = maxFontSize
        else fontSize--;

        element.style.fontSize = `${fontSize}px`;
        return fontSize;
    }

    while (true) {
        fontSize = Math.min(fontSize + 1, maxFontSize)
        element.style.fontSize = `${fontSize}px`;

        if (element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight) {
            element.style.fontSize = `${fontSize - 1}px`;
            break;
        }

        if (fontSize >= maxFontSize) break;
    }

    return fontSize;
};

