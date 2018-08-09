import {Raphael} from "raphael"

export function resizePath(path, finalPathWidth, finalPathHeight, normalizeX, normalizeY) {
    let pathBBox = Raphael.pathBBox(path);

    let ratiow = finalPathWidth / (pathBBox.width + (normalizeX ? 0 : pathBBox.x * 2));
    let ratioh = finalPathHeight / (pathBBox.height + (normalizeY ? 0 : pathBBox.y * 2));

    let ratio = pathBBox.height === 0
            ? ratiow
            : pathBBox.width === 0
            ? ratioh
            : Math.min(ratiow, ratioh);

    let parsedPath = parse(path);

    if (normalizeX) {
        parsedPath = moveX(parsedPath, -pathBBox.x);
    }
    if (normalizeY) {
        parsedPath = moveY(parsedPath, -pathBBox.y);
    }

    let scaledPath = parsedPath.map(pathArray => {
        if (pathArray[0] !== "A" && pathArray[0] !== "a") {
            return pathArray.map(
                (d, i) => (i === 0 ? d : Math.round(d * ratio * 1000) / 1000)
            );
        } else {
            return pathArray.map(
                (d, i) =>
                    i === 0 || i === 3 || i === 4 || i === 5
                        ? d
                        : Math.round(d * ratio * 1000) / 1000
            );
        }
    });

    scaledPath = moveX(
        scaledPath,
        (finalPathWidth - pathBBox.width * ratio) / 2 -
        (normalizeX ? 0 : pathBBox.x * ratio)
    );
    scaledPath = moveY(
        scaledPath,
        (finalPathHeight - pathBBox.height * ratio) / 2 -
        (normalizeY ? 0 : pathBBox.y * ratio)
    );

    let t = scaledPath.map(d => d.join(" "));

    return t.join(" ");
}

function parse(path) {
    /**
     * expected argument lengths
     * @type {Object}
     */

    let length = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0};

    /**
     * segment pattern
     * @type {RegExp}
     */

    let segment = /([astvzqmhlc])([^astvzqmhlc]*)/gi;

    /**
     * parse an svg path data string. Generates an Array
     * of commands where each command is an Array of the
     * form `[command, arg1, arg2, ...]`
     *
     * @param {String} path
     * @return {Array}
     */

    let data = [];
    path.replace(segment, function (_, command, args) {
        let type = command.toLowerCase();
        args = parseValues(args);

        // overloaded moveTo
        if (type == "m" && args.length > 2) {
            data.push([command].concat(args.splice(0, 2)));
            type = "l";
            command = command == "m" ? "l" : "L";
        }

        while (true) {
            if (args.length == length[type]) {
                args.unshift(command);
                return data.push(args);
            }
            if (args.length < length[type]) throw new Error("malformed path data");
            data.push([command].concat(args.splice(0, length[type])));
        }
    });
    return data;
}

let number = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/gi;

function parseValues(args) {
    let numbers = args.match(number);
    return numbers ? numbers.map(Number) : [];
}

function moveX(pl, dx) {
    return pl.map(function (p) {
        return p_move_x(p, dx);
    });
}

function p_move_x(p, dx) {
    let op = p[0];
    if (
        op === "M" || op === "L" || op === "C" || op === "S" || op === "Q" || op === "T"
    ) {
        p = p.map(function (v, i) {
            if (i % 2 === 1) {
                return parseFloat(v) + parseFloat(dx);
            }
            return v;
        });
    } else if (op === "A") {
        p = p.map(function (v, i) {
            if (i === 6) {
                return parseFloat(v) + parseFloat(dx);
            }
            return v;
        });
    } else if (op === "H") {
        p = p.map(function (v, i) {
            if (i === 1) {
                return parseFloat(v) + parseFloat(dx);
            }
            return v;
        });
    } else if (op.match(/[mlcZzsqahVvt]/)) {
    } else {
        console.log("Unknown operator " + p[0]);
    }
    return p;
}

function moveY(pl, dy) {
    return pl.map(function (p) {
        return p_move_y(p, dy);
    });
}

function p_move_y(p, dy) {
    let op = p[0];

    if (op === "M" || op === "L" || op === "C" || op === "S" || op === "Q" || op === "T") {
        p = p.map(function (v, i) {
            if (i % 2 === 0 && i > 0) {
                return parseFloat(v) + parseFloat(dy);
            }
            return v;
        });
    } else if (op === "A") {
        p = p.map(function (v, i) {
            if (i === 7) {
                return parseFloat(v) + parseFloat(dy);
            }
            return v;
        });
    } else if (op === "V") {
        p = p.map(function (v, i) {
            if (i === 1) {
                return parseFloat(v) + parseFloat(dy);
            }
            return v;
        });
    } else if (op.match(/[mlcZzsqaHhvt]/)) {
    } else {
        console.log("Unknown operator " + p[0]);
    }
    return p;
}