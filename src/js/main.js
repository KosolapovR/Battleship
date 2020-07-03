$(document).ready(function () {

    const BATTLESHIP = 'ship/battleship';
    const CRUISER = 'ship/cruiser';
    const DESTROYER = 'ship/destroyer';
    const BOAT = 'ship/boat';
    const LEFT = 'direction/LEFT';
    const RIGHT = 'direction/RIGHT';
    const UP = 'direction/UP';
    const DOWN = 'direction/DOWN';
    const DAMAGED = 'hitStatus/DAMAGED';
    const DESTROYED = 'hitStatus/DESTROYED';

    function Game(speed = 1) {
        this.ships = [
            {name: BATTLESHIP, size: 4, count: 1},
            {name: CRUISER, size: 3, count: 2},
            {name: DESTROYER, size: 2, count: 3},
            {name: BOAT, size: 1, count: 4},
        ];

        this.gameSpeed = (speed >= 0 && speed <= 3) ? speed * 1000 : 1000;

        this.round = 0;

        this.directions = [LEFT, RIGHT, UP, DOWN];

        this.isPlayerTurn = true;

        this.shipDirection = RIGHT;

        this.addPlayer = function (player) {
            this.player = player;
            return this;
        };

        this.addEnemy = function (enemy) {
            this.enemy = enemy;
            return this;
        };

        this.reload = function () {

            $('.field--col').css('background', '#FFF');

            this.round++;

            this.enemy
                .setAvailableCells()
                .resetCheckedCells();

            this.player
                .setAvailableCells()
                .resetCheckedCells();

            this.enemy.ships = this._shipArrangement(this.enemy);
            this.player.ships = this._shipArrangement(this.player);

            this._showPlayerShips(this.player.ships);
        };

        this.getGameSpeed = function () {
            return this.gameSpeed;
        };

        this.changeTurn = function () {
            this.isPlayerTurn = !this.isPlayerTurn;
        };

        this.heroShoot = function (coords) {
            let index = this.player.notCheckedCells.indexOf(coords);
            this.player.notCheckedCells.splice(index, 1);

            if (this._hitCheck(coords, this.enemy) === DAMAGED) {
                this._markDamage(coords);
            } else if (this._hitCheck(coords, this.enemy) === DESTROYED) {
                this._markDestroy(coords);
            } else {
                this._markMiss(coords);
            }
        };

        this.enemyShoot = function (coords) {
            let index = this.enemy.notCheckedCells.indexOf(coords);
            this.enemy.notCheckedCells.splice(index, 1);

            if (this._hitCheck(coords, this.player) === DAMAGED) {
                this._markDamage(coords, true);
            } else if (this._hitCheck(coords, this.player) === DESTROYED) {
                this._markDestroy(coords, true);
            } else {
                this._markMiss(coords, true);
            }
        };

        this._hitCheck = function (target, player) {
            let hit = false;

            player.ships.forEach(s => {
                if (hit) return;
                s.forEach(coords => {
                    coords.forEach(c => {
                        let cell = c.row * 10 + c.col;
                        if (target === cell) {
                            c.status = DAMAGED;
                            hit = this._checkDestroy(coords) ? DESTROYED : DAMAGED;
                        }

                    });
                })
            });

            return hit;
        };

        this._checkDestroy = function (coords) {
            return coords.every(c => c.status === DAMAGED);
        }

        this._shipArrangement = function (player) {
            const ships = [];

            this.ships.forEach(s => {
                let coords = [];
                for (let i = 0; i < s.count; i++) {
                    let currentCoords = this._generateCoords(s.size, ships, player);
                    this._updateAvailableCells(player, currentCoords);
                    coords.push(currentCoords);
                }
                ships.push(coords);
            });

            return ships;
        };

        this._updateAvailableCells = function (player, coords) {
            let cells = player.getAvailableCells();

            switch (this.shipDirection) {
                case RIGHT: {

                    for (let row = coords[0].row - 1; row <= coords[0].row + 1; row++) {
                        if (row < 0 || row > 10) continue;

                        for (let col = coords[0].col - 1; col <= coords[coords.length - 1].col + 1; col++) {
                            if (col < 0 || col > 10) continue;
                            if (cells.indexOf(row * 10 + col) > -1)
                                cells.splice(cells.indexOf(row * 10 + col), 1);
                        }
                    }
                    break;
                }
                case LEFT: {


                    for (let row = coords[0].row - 1; row <= coords[0].row + 1; row++) {
                        if (row < 0 || row > 10) continue;

                        for (let col = coords[coords.length - 1].col - 1; col <= coords[0].col + 1; col++) {
                            if (col < 0 || col > 10) continue;

                            if (cells.indexOf(row * 10 + col) > -1)
                                cells.splice(cells.indexOf(row * 10 + col), 1);

                        }
                    }
                    break;
                }
                case UP: {

                    for (let col = coords[0].col - 1; col <= coords[0].col + 1; col++) {
                        if (col < 0 || col > 10) continue;

                        for (let row = coords[coords.length - 1].row - 1; row <= coords[0].row + 1; row++) {
                            if (row < 0 || row > 10) continue;

                            if (cells.indexOf(row * 10 + col) > -1)
                                cells.splice(cells.indexOf(row * 10 + col), 1);
                        }
                    }
                    break;
                }
                case DOWN: {
                    for (let col = coords[0].col - 1; col <= coords[0].col + 1; col++) {
                        if (col < 0 || col > 10) continue;

                        for (let row = coords[0].row - 1; row <= coords[coords.length - 1].row + 1; row++) {
                            if (row < 0 || row > 10) continue;

                            if (cells.indexOf(row * 10 + col) > -1)
                                cells.splice(cells.indexOf(row * 10 + col), 1);
                        }
                    }
                    break;
                }
            }
        };

        this._generateCoords = function (shipLength, ships, player) {
            const head = [];

            let availableCells = player.getAvailableCells();

            let startCell = availableCells[Math.floor(Math.random() * availableCells.length)];
            let startCol = startCell % 10;
            let startRow = Math.floor(startCell / 10);


            if (this._collisionDetected(startCell, availableCells)) {
                this._changeShipDirection();
                return this._generateCoords(shipLength, ships, player);
            }

            head.push({col: startCol, row: startRow});

            const body = [];

            for (let i = 1; i < shipLength; i++) {
                let row;
                let col;
                let cell;

                if (this.shipDirection === RIGHT && startCol + shipLength < 10) {
                    row = startRow;
                    col = startCol + i;
                    cell = parseInt('' + row + col);

                    if (this._collisionDetected(cell, availableCells)) {
                        this._changeShipDirection();
                        return this._generateCoords(shipLength, ships, player);
                    }
                } else if (this.shipDirection === LEFT && startCol - shipLength >= 0) {
                    row = startRow;
                    col = startCol - i;
                    cell = parseInt('' + row + col);

                    if (this._collisionDetected(cell, availableCells)) {
                        this._changeShipDirection();
                        return this._generateCoords(shipLength, ships, player);
                    }
                } else if (this.shipDirection === UP && startRow - shipLength >= 0) {
                    row = startRow - i;
                    col = startCol;
                    cell = parseInt('' + row + col);

                    if (this._collisionDetected(cell, availableCells)) {
                        this._changeShipDirection();
                        return this._generateCoords(shipLength, ships, player);
                    }
                } else if (this.shipDirection === DOWN && startCol + shipLength < 10) {
                    row = startRow + i;
                    col = startCol;
                    cell = parseInt('' + row + col);

                    if (this._collisionDetected(cell, availableCells)) {
                        this._changeShipDirection();
                        return this._generateCoords(shipLength, ships, player);
                    }
                } else {
                    this._changeShipDirection();
                    let generatedCoords = this._generateCoords(shipLength, ships, player);
                    return generatedCoords;
                }

                body.push({col, row, direction: this.shipDirection})

            }

            return [...head, ...body];
        };

        this._collisionDetected = function (cell, availableCells) {
            let checkedCellIndex = availableCells.indexOf(cell);
            if (checkedCellIndex === -1) {
                return true
            }

            [...availableCells].splice(checkedCellIndex, 1);

            return false;
        };

        this._changeShipDirection = function () {
            let index = this.directions.indexOf(this.shipDirection);
            if (index >= 3) {
                this.shipDirection = this.directions[0]
            } else {
                this.shipDirection = this.directions[++index];
            }
        };

        this._showPlayerShips = function (ships) {

            ships.forEach(s => {
                s.forEach(coords => {
                    coords.forEach(c => {
                        let $cell = $('#player-field .field--col[data-row=' + c.row + '][data-col=' + c.col + ']');
                        $cell.css('background', 'yellow');
                    });
                })
            });
        };

        this._markDamage = function (coords, isHeroTable = false) {
            let row = Math.floor(coords / 10);
            let col = coords % 10;
            let $cell = isHeroTable ?
                $('#player-field .field--col[data-row=' + row + '][data-col=' + col + ']') :
                $('#enemy-field .field--col[data-row=' + row + '][data-col=' + col + ']');

            $cell.css('background', 'pink');
        };

        this._markDestroy = function (target, isHeroTable = false) {

            let ships = isHeroTable ? this.player.ships : this.enemy.ships;

            for (let type = 0; type < ships.length; type++) {
                for (let i = 0; i < ships[type].length; i++) {
                    if (ships[type][i].some(c => c.row * 10 + c.col === target)) {
                        for (let c = 0; c < ships[type][i].length; c++) {

                            let $cell = isHeroTable ?
                                $('#player-field .field--col[data-row=' + ships[type][i][c].row + '][data-col=' + ships[type][i][c].col + ']') :
                                $('#enemy-field .field--col[data-row=' + ships[type][i][c].row + '][data-col=' + ships[type][i][c].col + ']');

                            $cell.css('background', 'red');
                        }

                        this._markSiblings(ships[type][i], isHeroTable);


                        ships[type].splice(i, 1);
                        if (ships[type].length < 1) {
                            ships.splice(type, 1);
                        }

                        if (this._gameOver()) {
                            setTimeout(function () {
                                game.reload()
                            }, 500);
                        }
                        break;

                    }
                }
            }

        };

        this._markSiblings = function (coords, isHeroTable) {

            let dir = coords[coords.length - 1].direction ? coords[coords.length - 1].direction : RIGHT;
            switch (dir) {
                case RIGHT: {
                    for (let row = coords[0].row - 1; row <= coords[coords.length - 1].row + 1; row++) {
                        for (let col = coords[0].col - 1; col <= coords[coords.length - 1].col + 1; col++) {

                            if (coords[0].row !== row ||
                                (col === coords[0].col - 1 || coords[coords.length - 1].col + 1 === col)) {
                                if (col >= 0 && col < 10 && row >= 0 && row < 10) {

                                    if (isHeroTable) {
                                        $('#player-field .field--col[data-row=' + row + '][data-col=' + col + ']').css('background', 'blue');
                                        let index = this.enemy.notCheckedCells.indexOf(row * 10 + col);
                                        debugger;
                                        if (index > -1)
                                            this.enemy.notCheckedCells.splice(index, 1);
                                    } else {
                                        $('#enemy-field .field--col[data-row=' + row + '][data-col=' + col + ']').css('background', 'blue');
                                        let index = this.player.notCheckedCells.indexOf(row * 10 + col);
                                        debugger;
                                        if (index > -1)
                                            this.player.notCheckedCells.splice(index, 1);
                                    }
                                }
                            }
                        }
                    }
                    break;
                }
                case LEFT: {
                    for (let row = coords[0].row - 1; row <= coords[coords.length - 1].row + 1; row++) {
                        for (let col = coords[coords.length - 1].col - 1; col <= coords[0].col + 1; col++) {

                            if (coords[0].row !== row ||
                                (col === coords[0].col + 1 || coords[coords.length - 1].col - 1 === col)) {

                                if (col >= 0 && col < 10 && row >= 0 && row < 10) {

                                    if (isHeroTable) {
                                        $('#player-field .field--col[data-row=' + row + '][data-col=' + col + ']').css('background', 'blue');
                                        let index = this.enemy.notCheckedCells.indexOf(row * 10 + col);

                                        if (index > -1)
                                            this.enemy.notCheckedCells.splice(index, 1);
                                    } else {
                                        $('#enemy-field .field--col[data-row=' + row + '][data-col=' + col + ']').css('background', 'blue');
                                        let index = this.player.notCheckedCells.indexOf(row * 10 + col);

                                        if (index > -1)
                                            this.player.notCheckedCells.splice(index, 1);
                                    }
                                }
                            }
                        }
                    }
                    break;
                }
                case DOWN: {
                    for (let col = coords[0].col - 1; col <= coords[coords.length - 1].col + 1; col++) {
                        for (let row = coords[0].row - 1; row <= coords[coords.length - 1].row + 1; row++) {

                            if (coords[0].col !== col ||
                                (row === coords[0].row - 1 || coords[coords.length - 1].row + 1 === row)) {

                                if (col >= 0 && col < 10 && row >= 0 && row < 10) {
                                    if (isHeroTable) {
                                        $('#player-field .field--col[data-row=' + row + '][data-col=' + col + ']').css('background', 'blue');
                                        let index = this.enemy.notCheckedCells.indexOf(row * 10 + col);
                                        if (index > -1)
                                            this.enemy.notCheckedCells.splice(index, 1);
                                    } else {
                                        $('#enemy-field .field--col[data-row=' + row + '][data-col=' + col + ']').css('background', 'blue');
                                        let index = this.player.notCheckedCells.indexOf(row * 10 + col);
                                        if (index > -1)
                                            this.player.notCheckedCells.splice(index, 1);
                                    }
                                }
                            }
                        }
                    }
                    break;
                }
                case UP: {
                    for (let col = coords[0].col - 1; col <= coords[0].col + 1; col++) {
                        for (let row = coords[coords.length - 1].row - 1; row <= coords[0].row + 1; row++) {
                            if ((coords[0].col !== col && col >= 0 && col < 10) ||
                                (row === coords[0].row + 1 || coords[coords.length - 1].row - 1 === row)) {
                                if (isHeroTable) {
                                    $('#player-field .field--col[data-row=' + row + '][data-col=' + col + ']').css('background', 'blue');
                                    let index = this.enemy.notCheckedCells.indexOf(row * 10 + col);
                                    if (index > -1)
                                        this.enemy.notCheckedCells.splice(index, 1);
                                } else {
                                    $('#enemy-field .field--col[data-row=' + row + '][data-col=' + col + ']').css('background', 'blue');
                                    let index = this.player.notCheckedCells.indexOf(row * 10 + col);
                                    if (index > -1)
                                        this.player.notCheckedCells.splice(index, 1);
                                }
                            }
                        }
                    }
                    break;
                }
            }

        }

        this._markMiss = function (coords, isHeroTable = false) {
            let row = Math.floor(coords / 10);
            let col = coords % 10;
            let $cell = isHeroTable ?
                $('#player-field .field--col[data-row=' + row + '][data-col=' + col + ']') :
                $('#enemy-field .field--col[data-row=' + row + '][data-col=' + col + ']');

            $cell.css('background', 'blue');
        }

        this._gameOver = function () {
            return !this.enemy.ships.length || !this.player.ships.length;
        }
    }

    function Player(name) {
        this.availableCells = [];

        this.notCheckedCells = [],

            this.resetCheckedCells = function () {
                for (let row = 0; row < 10; row++)
                    for (let col = 0; col < 10; col++)
                        this.notCheckedCells.push(row * 10 + col);
                return this;
            },

            this.getNotCheckedCells = function () {
                return this.notCheckedCells;
            },

            this.getAvailableCells = function () {
                return this.availableCells;
            },

            this.setAvailableCells = function () {
                for (let row = 0; row < 10; row++)
                    for (let col = 0; col < 10; col++)
                        this.availableCells.push(parseInt('' + row + col));
                return this;
            }
    };

    const hero = new Player();
    const enemy = new Player();

    const game = new Game(0);

    game
        .addPlayer(hero)
        .addEnemy(enemy)
        .reload();

    //обработик на клик по полю

    $('#enemy-field').on('click', function (e) {

        const target = parseInt(e.target.dataset.row) * 10 + parseInt(e.target.dataset.col);

        console.log('target = ', target);
        console.log('содержит = ', hero.notCheckedCells.includes(target));

        if (game.isPlayerTurn && hero.notCheckedCells.includes(target)) {
            game.changeTurn();
            game.heroShoot(target);

            setTimeout(function () {
                game.changeTurn();

                let notCheckedCells = enemy.notCheckedCells;
                game.enemyShoot(notCheckedCells[Math.floor(Math.random() * notCheckedCells.length)]);

            }, game.getGameSpeed());
        }
    })
});