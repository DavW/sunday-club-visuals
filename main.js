function start() {
    const canvas = document.getElementById("mainCanvas");
    const buffer = document.getElementById("buffer");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    buffer.width = canvas.width;
    buffer.height = canvas.height;

    const tau = Math.PI * 2;

    const g = canvas.getContext("2d");
    const bg = buffer.getContext("2d");

    const w = canvas.width;
    const h = canvas.height;
    const ratio = w/h;
    const sf = Math.min(w, h)/2;

    const fps = 40;

    const keyPressActions = {};

    function bindKeyPress(key, action) {
        keyPressActions[key] = action;
    }

    function unbindKeyPress(key) {
        delete(keyPressActions[key]);
    }

    window.addEventListener("keypress", function(e) {
        if (keyPressActions[e.key] != null) {
            keyPressActions[e.key]();
        }
    });

    const whilePressedActions = {};

    function whilePressed(key, action) {
        whilePressedActions[key] = action;
    }

    window.addEventListener("keydown", function (e) {
        if (whilePressedActions[e.key] != null) {
            isPressed[e.key] = true;
        }
    });

    window.addEventListener("keyup", function (e) {
        if (whilePressedActions[e.key] != null) {
            isPressed[e.key] = false;
        }
    });

    function handleKeys() {
        for (let key in whilePressedActions) {
            if (isPressed[key]) {
                whilePressedActions[key]();
            }
        }
        boomParam = boomParam * 0.9;
        timestep -= (timestep - (1/fps)) / 200;
    }

    const isPressed = {};

    let param1 = 0;
    let param2 = 0;

    whilePressed("a", function() {
        param1 -= 0.01;
        while (param1 < -1) param1 += 2;
    });
    whilePressed("d", function() {
        param1 += 0.01;
        while (param1 > 1) param1 -= 2;
    });
    whilePressed("w", function() {
        param2 -= 0.01;
        while (param2 < -1) param2 += 2;
    });
    whilePressed("s", function() {
        param2 += 0.01;
        while (param2 > 1) param2 -= 2;
    });
    whilePressed("b", function() {
        boomParam = 1;
    });

    let boomParam = 0;

    let timestep = 1/fps;
    whilePressed("x", function() { timestep += 0.1 * 1/fps });
    whilePressed("z", function() { timestep -= 0.1 * 1/fps });

    function resetTransform() {
        g.setTransform(1,0,0,1,0,0);
        g.translate(w / 2, h / 2);
    }
    function resetTransformAbs() {
        g.setTransform(1,0,0,1,0,0);
    }
    resetTransform();


    function somewhereSomehow() {
        g.rotate(Math.random()*tau);
        let s = Math.random()*30;
        g.translate((Math.random()-0.5) * w, (Math.random()-0.5) * h);
        g.scale(s,s);
    }

    function cross() {
        g.beginPath();
        g.lineWidth = 0.1;

        g.moveTo(-1,-1);
        g.lineTo(1,1);

        g.moveTo(1,-1);
        g.lineTo(-1,1);

        g.stroke();
    }

    function nought() {
        g.beginPath();
        g.lineWidth = 0.1;
        g.arc(0,0,1,0,tau);
        g.stroke();
    }

    function why() {
        g.beginPath();
        g.lineWidth = 0.1;
        g.moveTo(-1,-1);
        g.lineTo(0,0);
        g.moveTo(1,-1);
        g.lineTo(0,0);
        g.lineTo(0,1);
        g.stroke();
    }

    function grid() {
        g.beginPath();
        g.lineWidth = 0.1;
        g.moveTo(-3,-1);
        g.lineTo(3,-1);
        g.moveTo(-3,1);
        g.lineTo(3,1);
        g.moveTo(-1,-3);
        g.lineTo(-1,3);
        g.moveTo(1,-3);
        g.lineTo(1,3);
        g.stroke();
    }

    let ca = [128,64,255];
    let cb = [64,192,255];

    function randByte() {
        return Math.floor(Math.random() * 255);
    }

    bindKeyPress("y", function() {
        ca = [randByte(), randByte(), randByte()];
        cb = [randByte(), randByte(), randByte()];
    });

    let colourCounter = 0;

    function pickAColourAnyColour() {
        const steps = 20;

        colourCounter++;
        let colourIndex = colourCounter % (steps+1);
        let aV = (colourIndex / steps);
        let bV = 1-aV;
        function f(x) { return x < 0 ? 0 : x > 255 ? 255 : Math.floor(x); }

        const blend = [f(ca[0] * aV + cb[0] * bV), f(ca[1] * aV + cb[1] * bV), f(ca[2] * aV + cb[2] * bV)]

        return "rgb(" + blend[0] + "," + blend[1] + "," + blend[2] + ")";
    }

    function fade(amount) {
        g.fillStyle = "rgba(0,0,0," + amount + ")";
        g.fillRect(-w/2,-h/2,w,h);
    }

    function divideAndConquer(rot, op) {
        bg.clearRect(0,0,w,h);
        bg.scale(0.5,0.5);
        for (let xx = 0; xx < 2; xx ++) {
            for (let yy = 0; yy < 2; yy++) {
                bg.drawImage(canvas, w * xx, h * yy);
                // bg.drawImage(canvas, 0, 0);
                // bg.drawImage(canvas, w, 0);
                // bg.drawImage(canvas, 0, h);
                // bg.drawImage(canvas, w, h);
            }
        }

        bg.setTransform(1,0,0,1,0,0);

        g.globalCompositeOperation = op != null ? op : "lighter";
        g.rotate(rot);
        //g.globalAlpha = 0.9;
        g.drawImage(buffer, -w/2, -h/2);

        resetTransform();
        g.globalCompositeOperation = "source-over";
    }

    function blurr(px) {
        //g.clearRect(0,0,w,h);
        g.filter = "blur(" + px + "px)";
        g.drawImage(canvas, -w/2,-h/2);
        g.filter = "none";
    }

    function rotoZoom(sf, rot, zoom, op) {
        bg.clearRect(0,0,w,h);
        bg.scale(sf, sf);

        bg.drawImage(canvas, w * (1-sf) * 0.5/ sf, h * (1-sf) * 0.5 / sf);
        bg.setTransform(1,0,0,1,0,0);
        g.globalCompositeOperation = op == null ? "difference" : op;
        g.rotate(rot);
        g.scale(zoom,zoom);
        for (let xx =-1; xx < 2; xx++) {
            for (let yy = -1; yy < 2; yy++) {
                g.drawImage(buffer, xx * w + -w/2, yy * h + -h/2);
            }
        }

        resetTransform();
        g.globalCompositeOperation = "source-over";
    }

    function atTheCursor() {
        g.translate(cursorX,cursorY);
        g.scale(100,100);
    }

    function inTheMiddle() {
        g.scale(150,150);
    }

    let counters = {};
    const wCells = 8;
    const hCells = Math.round(wCells / (w/h));

    function inAnOrderlyFashion(id) {
        if (counters[id] == null) {
            counters[id] = 0;
        }
        let counter = counters[id];
        counters[id] ++;
        let cellNo = counter % (wCells * hCells);
        let y = Math.floor(cellNo / wCells);
        let x = cellNo % wCells;
        let xCellSize = w / wCells;
        let yCellSize = h / hCells;

        g.translate(-w/2 + (x+0.5) * xCellSize, -h/2 + (y+0.5) * yCellSize);
        g.scale(xCellSize/4, yCellSize/4);

        counter++;
    }

    let textCounter = 0;
    const text = "Sunday Club ";

    function textInOrder() {
        let charIndex = textCounter % text.length;
        let char = text.charAt(charIndex);
        g.font = "2px monospace";
        g.fillStyle = pickAColourAnyColour();
        g.fillText(char, -0.5, 0.5);
        textCounter++;
    }


    function sundayClubXO(time,frame) {
        if (Math.random() < 0.1) {
           divideAndConquer(0);
           rotoZoom(1,param1 * tau,1, "source-over");
           //blurr(2);
        }
        if (Math.random() < 0.03) {
            fade(1);
        }
        fade(0.05);
        g.globalCompositeOperation = "lighter";

        if (frame % 10 == 0) {
            inAnOrderlyFashion("text");
            g.strokeStyle = pickAColourAnyColour();
            g.scale(1 + boomParam * 3, 1 + boomParam * 3);
            textInOrder();
            resetTransform();
        }

        while (Math.random() < 0.2) {
            g.strokeStyle = pickAColourAnyColour();
            inAnOrderlyFashion("xo");
            if (boomParam > 0.5) {
                grid()
            } else if (Math.random() < 0.7) {
                cross();
            } else if (Math.random() < 0.7) {
                nought();
            } else {
                cube(Math.random() * tau,math.random() * tau,Math.random() * tau,0.1);
            }
            resetTransform();
        }
        g.globalCompositeOperation = "source-over";
    }

    let cursorX = 0;
    let cursorY = 0;


    window.addEventListener("mousemove", function (e) {
        cursorX = e.clientX - (w / 2);
        cursorY = e.clientY - (h / 2);
    });



    function qq(time, frame) {
        g.strokeStyle = pickAColourAnyColour();

        for (let i = 0; i < 2 ; i ++) {
            let subframe = frame * 2 + i;
            const angle = (time + (i * 0.5/fps)) * 40 * tau / 3000;
            rotoZoom(1,  angle, 1 + param1/3);

            if (subframe % 2 == 0) {
                divideAndConquer(angle * 2);
            }

        }

        if (boomParam > 0.4) {
            fade(0.1);
            for (let x = 0; x < 10; x++) {
                somewhereSomehow()
                g.scale(4, 4);
                nought();
                resetTransform();
            }
        }

        if(boomParam > 2) {
            //somewhereSomehow();
            inTheMiddle();
            g.globalCompositeOperation = "lighter";
            nought();
            resetTransform();
            g.globalCompositeOperation = "source-over";
        }
        resetTransform();
    }

    function makeCube(n) {
        const factor = 1 / Math.cos(tau / 8);
        let edges = [];
        for (let i = 0; i < n; i++) {
            let x = factor * Math.cos((tau / 8) + i * tau / n);
            let y = factor * Math.sin((tau / 8) + i * tau / n);
            let x2 = factor * Math.cos((tau / 8) + (i+1) * tau / n);
            let y2 = factor * Math.sin((tau / 8) + (i+1) * tau / n);
            edges.push([[x,y,-1],[x,y,1]]);
            edges.push([[x,y,-1],[x2,y2,-1]]);
            edges.push([[x,y,1],[x2,y2,1]]);
        }
        return edges;
    }

    let theCube = makeCube(4);

    bindKeyPress("c", function() {
        theCube = makeCube(Math.floor(Math.random() * 6) + 2)
    });

    function project(xyz) {
        return [
            xyz[0] / xyz[2],
            xyz[1] / xyz[2],
            xyz[2]
        ]
    }

    function moveFromCamera(xyz, dist) {
        return [
            xyz[0], xyz[1], xyz[2] + dist
        ]
    }

    function translate3d(edges, xyz) {
        return edges.map(function(edge) {
            return edge.map(function(vertex) {
                return [vertex[0] + xyz[0], vertex[1] + xyz[1], vertex[2] + xyz[2]]
            });
        });
    }

    function rZ(p, a) {
        return [Math.cos(a) * p[0] - Math.sin(a) * p[1], Math.sin(a) * p[0] + Math.cos(a) * p[1], p[2]];
    }

    function rY(p, a) {
        return [Math.cos(a) * p[0] - Math.sin(a) * p[2], p[1], Math.sin(a) * p[0] + Math.cos(a) * p[2]];
    }

    function rX(p, a) {
        return [p[0], Math.cos(a) * p[1] - Math.sin(a) * p[2], Math.sin(a) * p[1] + Math.cos(a) * p[2]];
    }

    function draw3d(edges, xrot, yrot, zrot, linewidth, dist, shader) {
        if (shader == null) { shader = function(xyz) { return xyz; }; }

        function compute(p) {
            return project(
                moveFromCamera(
                    rZ(rY(rX(shader(p), xrot), yrot), zrot),
                    dist
                )
            )
        }
        g.beginPath();
        for (let i = 0; i < edges.length; i++) {
            let edge = edges[i];
            let a = compute(edge[0]);
            let b = compute(edge[1]);
            if (a[2] > 0.01 && b[2] > 0.01) {
                g.moveTo(a[0], a[1]);
                g.lineTo(b[0], b[1]);
            }
        }

        g.lineWidth = linewidth == null ? 0.01 : linewidth;
        g.stroke();
    }

    function cube(xrot,yrot,zrot, linewidth) {
        draw3d(theCube, xrot, yrot, zrot, linewidth, 3);
    }




    function lx(time, frame) {
        const tf = 0.8;
        fade(0.07);
        divideAndConquer(0, "lighten");
        g.translate(param1 * w / 2, param2 * h / 2);
        g.strokeStyle = pickAColourAnyColour();
        g.globalCompositeOperation = "lighter";
        g.scale(200 + boomParam * 300,200 + boomParam * 300);
        cube(tf * tau * time / 5, tf * tau * time / 6, tf * tau * time / 7);
        g.globalCompositeOperation = "source-over";
        resetTransform();
    }

    function makeShape(n) {
        let shape = [];
        let verts = [];
        let sx = 0;
        let sy = 0;
        let sz = 0;
        for (let i = 0 ; i < n; i++) {

            sx = sx + Math.random()* 0.2-0.1;
            sy = sy + Math.random()* 0.2-0.1;
            sz = sz + Math.random()* 0.2-0.1;
            verts.push([sx, sy, sz]);
            if (Math.abs(sx) > 1) sx *= 0.8;
            if (Math.abs(sy) > 1) sy *= 0.8;
            if (Math.abs(sz) > 1) sz *= 0.8;
        }
        for (let i = 0; i < n-1; i++) {
            shape.push([verts[i], verts[(i+1) % n]]);
        }
        return shape;
    }

    function makeShape2(n) {
        let shape = [];
        let verts = [];
        for (let i = 0 ; i < n; i++) {
            verts.push([Math.random()*2 -1, Math.random() * 2 -1, Math.random() *2 -1]);
        }
        for (let i = 0; i < n; i++) {
            shape.push([verts[i], verts[(i+1) % n]]);
        }
        return shape;
    }

    let currentShape = makeShape(100);

    function linez(time, frame) {
        if (boomParam > 0.7 || frame < 2) {
            currentShape = [];
            for (let z = 0; z < 1; z++) {
                currentShape = currentShape.concat(makeShape(100));
            }
        }
        g.globalCompositeOperation = "source-over";
        fade(0.3);
        divideAndConquer(tau/2,"lighten");
        g.lineWidth = 0.05;
        g.scale(sf *2, sf * 2);
        g.globalCompositeOperation = "lighter";
        const r = 3;
        for (let q = 0; q < r; q++) {
            g.strokeStyle = pickAColourAnyColour();
            draw3d(
                currentShape,
                (time / 200) * tau + param1 * tau,
                (time / 240) * tau + param2 * tau,
                (q * tau / r) + (time / 149) * tau + 0.01,
                0.001,
                Math.sin(time / 80 * tau) * 2 + 2.3
            );
        }
        resetTransform();
    }

    function spir(twist) {
        let edges = [];
        let verts = [];
        let verts2 = [];
        //const step = 0.002;
        const step = 0.032;
        for (let y = -1; y < 1 ; y += step) {
            let angle = y * twist;
            verts.push([Math.cos(angle) * Math.abs(y + 1) / 2, y,  Math.sin(angle) * Math.abs(y + 1) / 2]);
            verts2.push([Math.cos(-angle) * Math.abs(-y + 1) / 2, y,  Math.sin(-angle) * Math.abs(-y + 1) / 2]);
        }

        for (let q = 0; q < verts.length-1; q++) {
            edges.push([verts[q], verts[q+1]]);
            edges.push([verts2[q], verts2[q+1]]);
        }

        return edges;
    }

    function spiralz(time, frame) {
        g.globalCompositeOperation = "source-over";
        fade(0.2);
        // if (boomParam > 0.8) {
        //     rotoZoom(1, 0, 1 + param1 * 0.1, "lighten");
        // } else {
        //     rotoZoom(1, 0, 1 + param1 * 0.1, "difference");
        // }
        g.scale(sf *(1.5 + boomParam), sf * (1.5 + boomParam));
        g.strokeStyle = pickAColourAnyColour();
        g.globalCompositeOperation = "lighter";
        draw3d(spir(Math.sin(time/30) * 100), param2 * tau, 0, param1 * tau, 0.002, 2.5);
        resetTransform();
    }

    function tree(nBranch, maxDepth, sway) {
        let begin = [0,1,0];
        let unit = [0,-1,0];
        let edges = [];
        //const nBranch = 3;
        const spread = (Math.sin(sway) + 1.3)/2;
        function recurse(s, ry, rz, scale, depth) {
            let rotated = rZ(rX(unit, rz), ry);
            let end = [s[0]+rotated[0] * scale, s[1] + rotated[1] * scale, s[2] + rotated[2] * scale];
            edges.push([s, end]);
            if (depth > maxDepth) return;

            for (let y = 0; y < nBranch; y++) {
                recurse(
                    end,
                    Math.cos(y * tau / nBranch) * spread + ry,
                    Math.sin(y * tau / nBranch) * spread + rz,
                    scale * (0.66 + 0.05 * Math.sin(sway + y * tau / nBranch)),
                    depth + 1
                );
            }
        }

        recurse(begin, 0, 0, 0.5, 0);
        return edges;
    }

    function treez(time, frame) {
        g.globalCompositeOperation = "source-over";
        //divideAndConquer(tau/4, "source-over");
        fade(0.2);
        // if (boomParam > 0.8) {
        //     rotoZoom(1, 0, 1 + param1 * 0.1, "lighten");
        // } else {
        //     rotoZoom(1, 0, 1 + param1 * 0.1, "difference");
        // }
        g.scale(sf * (1.5 + boomParam), sf * (1.5 + boomParam));
        g.strokeStyle = pickAColourAnyColour();
        g.globalCompositeOperation = "lighter";
        draw3d(tree(6, 4, param1), 0, time / 10, 0, 0.0007, 1 + param2);
        resetTransform();
    }

    function circlez(time, frame) {
        g.globalCompositeOperation = "source-over";
        fade(0.9-boomParam);
        g.strokeStyle = pickAColourAnyColour();
        g.globalCompositeOperation = "difference";
        g.lineWidth = 2;
        for (let i = 0; i < 40; i++) {
            g.beginPath();
            g.arc(param1 * w / 2, param2 * h / 2, Math.abs(10 + i * 20 + 50 * Math.sin(time + (i/4))), 0, tau);
            g.stroke();
        }
        resetTransform();
    }

    function cubeGrid(n) {
        let edges = [];
        let no = (n-1)/2;
        for (let x = 0 ; x < n ; x ++) {
            for (let y = 0; y < n; y ++) {
                for (let z = 0; z < n; z++) {
                    edges.push(...translate3d(makeCube(4), [(x-no)*5,(y-no)*5,(z-no)*5]));
                }
            }
        }
        return edges;
    }

    let theCubeGrid = cubeGrid(7);
    let wobble = 0;
    function cubez(time, frame) {
        wobble = wobble + (boomParam - wobble) / 10;

        g.globalCompositeOperation = "source-over";
        fade(0.3);
        g.globalCompositeOperation = "lighter";

        g.strokeStyle = pickAColourAnyColour();
        g.scale(500,500);

        function shader(v) {
            // const d = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
            // const sf = Math.sin(time)+d;
            return [
                v[0] - wobble * Math.sin(v[1] + time * tau) / 4,
                v[1] - wobble * Math.sin(v[2] + time * tau) / 4,
                v[2] - wobble * Math.sin(v[0] + time * tau) / 4
            ];
        }
        draw3d(theCubeGrid, time / 8.2,param1 * tau, param2 + time / 27,0.002,param2 * 10 + 10, shader);
        resetTransform();
    }

    let N = 40;
    function spindlez(time, frame) {
        g.globalCompositeOperation = "source-over";
        fade(0.2);
        const shp = [
            [[1,0,0],[0,0,1]],
            [[0,0,1],[0,1,1]],
            [[0,1,1],[1,1,1]],
            [[1,1,1],[1,0,0]]
        ];

        function shader(v) {
            return [
                v[0]+ Math.sin(v[1] + time * tau * 4) * boomParam,
                v[1],
                v[2]
            ]
        }
        g.scale(h,h);
        g.globalCompositeOperation = "lighter";
        for (let i = 0; i < N; i++) {
            g.strokeStyle = pickAColourAnyColour();
            const f = i/N * tau;
            draw3d(shp, time / 10, param1 * tau, f + time / 30, 0.001, (param2 + 1.5) * 3, shader);
        }
        resetTransform();
    }




    function rainbowStyle(time, frame) {
        resetTransform();
        g.globalCompositeOperation = "source-over";
        g.lineWidth = 2;
        fade(1);
        g.globalCompositeOperation = "lighter";

        let x = Math.cos(0.2 * time * 3) * Math.sin(0.2 * time * 0.7) * w / 2;
        let y = Math.cos(0.2 * time * 4) * Math.sin(0.2 * time * 0.8) * h / 2;
        let x2 = Math.cos(0.2 * time * 5) * Math.sin(0.2 * time * 0.9) * w / 2;
        let y2 = Math.cos(0.2 * time * 6) * Math.sin(0.2 * time) * h / 2;

        let clearX = (Math.random() - 0.5) * w;
        let clearY = (Math.random() - 0.5) * h;

        const shards = 32;
        for (let i = 0; i < shards; i ++) {

            g.rotate(Math.cos(time) * tau / 256 + param1 * tau/32);

            let sat = Math.floor(100 * (1 - boomParam));

            let hue = Math.floor(i * 360 / shards);


            let col = "hsl(" + hue + ",90%,50%)";
            g.strokeStyle = col;
            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(x2, y2);
            g.stroke();
            g.fillStyle = col;

            let p2 = param2 + Math.cos(time) * 0.1;
            g.fillRect(x * p2,y * p2, Math.abs(p2 * 10),Math.abs(p2 * 10));
            g.fillRect(x2 * p2,y2 * p2,Math.abs(p2 * 10),Math.abs(p2 * 10));

            if (boomParam > 0.3) {
                g.beginPath();
                g.fillStyle = "hsl(" + hue + ",90%," + (boomParam * 10) + "%)";
                g.moveTo(0,0);
                g.lineTo(clearX, clearY);
                g.lineTo(-clearX, clearY);
                //g.closePath();
                g.fill();

                //g.stroke();
            }
        }
    }

    function ambiente(time, frame) {
        resetTransform();
        g.globalCompositeOperation = "source-over";
        g.lineWidth = 1;
        fade(0.6);
        g.globalCompositeOperation = "lighter";

        const lines = 40 + (boomParam * 100);
        const segments = 80;

        for (let i = 0; i < lines; i++) {
            g.beginPath();

            for (let s = 0; s < segments; s++) {
                let x0 = s/segments;
                let y0 = i/lines;

                let x = w * (x0 - 0.5) + Math.sin(time * 5 + y0 * 10) * 20;
                let y =
                    h * (y0 - 0.5)
                    + Math.sin(param1 * tau * y0 * 10) * 100
                    + Math.sin(20 * x0 + Math.sin(time/2) * 30 * (y0 - 0.5)) * 10 * param2 *  h/lines;
                if (s == 0) {
                    g.moveTo(x, y);
                }
                g.lineTo(x, y);
            }
            g.strokeStyle = pickAColourAnyColour();
            g.stroke();
        }
    }

    let factors = [];

    function startOfDreams(time, frame) {
        const tings = 20;
        if (frame == 1 || boomParam > 0.8) {
            factors = [];
            for (let i = 0; i < tings; i++) {
                factors.push([Math.random(), Math.random(), Math.random()]);
            }
        }
        resetTransform();
        g.globalCompositeOperation = "source-over";
        fade(0.03);
        rotoZoom(1,tau/5,1 + param2 * 0.1,"source-over");

        g.lineWidth = 1;
        g.globalCompositeOperation = "lighter";

        g.globalAlpha = 0.1;
        for (let j = 0 ; j < 50; j++) {
            g.beginPath();
            let xo = 200 * Math.pow(Math.random()-0.5, 3);
            let yo = 200 * Math.pow(Math.random()-0.5, 3);
            g.strokeStyle = pickAColourAnyColour();


            for (let i = 0; i < tings; i++) {
                let xf = xo + factors[i][2] * w * 0.5 * Math.sin(time * factors[i][0]);
                let yf = yo + factors[i][2] * h * 0.5 * Math.sin(time * factors[i][1]);

                if (i == 0) {
                    g.moveTo(xf, yf);
                } else {
                    g.lineTo(xf, yf);
                }
            }
            g.closePath();
            g.stroke();
        }
        g.globalAlpha = 1;
        g.resetTransform();
    }

    let frame = 0;

    let time = 0;

    const scenes = [lx, qq, linez, spiralz, treez, circlez, cubez, spindlez, rainbowStyle, ambiente, startOfDreams];
    let currentScene = 10;

    bindKeyPress("j", function() {
       currentScene = (currentScene + 1) % scenes.length;
    });

    let drawFrame = lx;
    function doFrame() {
        frame++;
        time += timestep;
        scenes[currentScene](time, frame);
        //drawFrame(time, frame);
        handleKeys();
        // for (var i=0; i < features.length; i++) {
        //     if (enabled[i]) features[i](time);
        // }
    }
    window.setInterval(doFrame, 1000/fps);

}
window.addEventListener("load", start);