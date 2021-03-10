const scale = 20;

class CanvasDisplay {
    constructor(parent, level) {
        this.canvas = document.createElement("canvas");
        this.canvas.width = Math.min(600, level.width * scale);
        this.canvas.height = Math.min(450, level.height * scale);
        parent.appendChild(this.canvas);
        this.cx = this.canvas.getContext("2d");

        this.flipPlayer = false;

        this.viewport = {
            left: 0,
            top: 0,
            width: this.canvas.width / scale,
            height: this.canvas.height / scale
        };
    }

    clear() {
        this.canvas.remove();
    }
}

CanvasDisplay.prototype.syncState = function(state) {
    this.updateViewport(state);
    this.clearDisplay(state.status);
    this.drawBackground(state.level);
    this.drawActors(state.actors);
};

CanvasDisplay.prototype.updateViewport = function(state) {
    let view = this.viewport;
    let margin = view.width / 3;
    let player = state.player;
    let center = player.pos.plus(player.size.times(0.5));

    if (center.x < view.left + margin) {
        view.left = Math.max(center.x - margin, 0);
    } else if (center.x > view.left + view.width - margin) {
        view.left = Math.min(center.x + margin - view.width,
            state.level.width - view.width);
    }

    if (center.y < view.top + margin) {
        view.top = Math.max(center.y - margin, 0);
    } else if (center.y > view.top + view.height - margin) {
        view.top = Math.min(center.y + margin - view.height,
            state.level.height - view.height);
    }
};

CanvasDisplay.prototype.clearDisplay = function(status) {
    if (status == "won") {
        this.cx.fillStyle = "rgb(68, 191, 255)";
    } else if (status == "lost") {
        this.cx.fillStyle = "rgb(44, 136, 214)";
    } else {
        this.cx.fillStyle = "rgb(52, 166, 251)";
    }
    this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

let ground = document.createElement("img");
ground.src = "assets/ground.png";
let ground2 = document.createElement("img");
ground2.src = "assets/ground2.png";
let lava = document.createElement("img");
lava.src = "assets/lava.png";

CanvasDisplay.prototype.drawBackground = function(level) {
    let { left, top, width, height } = this.viewport;
    let xStart = Math.floor(left);
    let xEnd = Math.ceil(left + width);
    let yStart = Math.floor(top);
    let yEnd = Math.ceil(top + height);

    for (let y = yStart; y < yEnd; y++) {
        for (let x = xStart; x < xEnd; x++) {
            let tile = level.rows[y][x];
            if (tile == "empty") continue;
            let screenX = (x - left) * scale;
            let screenY = (y - top) * scale;
            let tileAbove = y > 0 ? level.rows[y - 1][x] : null;
            let tileSprite = tile == "lava" ? lava :
                tileAbove == "empty" ? ground : ground2;
            this.cx.drawImage(tileSprite,
                0, 0, scale, scale,
                screenX, screenY, scale, scale);
        }
    }
};

function flipHorizontally(context, around) {
    context.translate(around, 0);
    context.scale(-1, 1);
    context.translate(-around, 0);
}

let playerSprites = document.createElement("img");
playerSprites.src = "assets/player.png";
const playerXOverlap = 8;

CanvasDisplay.prototype.drawPlayer = function(player, x, y, width, height) {
    width += playerXOverlap * 2;
    x -= playerXOverlap;
    if (player.speed.x != 0) {
        this.flipPlayer = player.speed.x < 0;
    }

    let tile = 7;
    if (player.speed.y != 0) {
        tile = 1;
    } else if (player.speed.x != 0) {
        tile = Math.floor(Date.now() / 60) % 7;
    }

    this.cx.save();
    if (this.flipPlayer) {
        flipHorizontally(this.cx, x + width / 2);
    }
    let tileX = tile * width;
    this.cx.drawImage(playerSprites, tileX, 0, width, height,
        x, y, width, height);
    this.cx.restore();
}

let coinSprites = document.createElement("img");
coinSprites.src = "assets/coin.png";

CanvasDisplay.prototype.drawCoin = function(x, y, width, height) {
    let tile = Math.floor(Date.now() / 60) % 7;

    let tileX = tile * width;
    this.cx.drawImage(coinSprites, tileX, 0, width, height,
        x, y, width, height);
}

CanvasDisplay.prototype.drawActors = function(actors) {
    for (let actor of actors) {
        let width = actor.size.x * scale;
        let height = actor.size.y * scale;
        let x = (actor.pos.x - this.viewport.left) * scale;
        let y = (actor.pos.y - this.viewport.top) * scale;
        if (actor.type == "player") {
            this.drawPlayer(actor, x, y, width, height);
        } else if (actor.type == "coin") {
            this.drawCoin(x, y, width, height);
        } else {
            this.cx.drawImage(lava, 0, 0, width, height,
                x, y, width, height);
        }
    }
};

export default CanvasDisplay;