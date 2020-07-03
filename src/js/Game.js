import types from './types.js';

export function Game(speed = 0) {
    this.ships = [
        {name: types.BATTLESHIP, size: 4, count: 1},
        {name: types.CRUISER, size: 3, count: 2},
        {name: types.DESTROYER, size: 2, count: 3},
        {name: types.BOAT, size: 1, count: 4},
    ];

    this.gameSpeed = (speed >= 0 && speed <= 3) ? speed * 1000 : 1000;

    this.round = 0;

    this.directions = [types.LEFT, types.RIGHT, types.UP, types.DOWN];

    this.isPlayerTurn = true;

    this.shipDirection = types.RIGHT;

    this.stats = {
        hero: {
            hits: 0,
            killings: 0,
            wins: 0,
            defeats: 0
        },
        enemy: {
            hits: 0,
            killings: 0,
            wins: 0,
            defeats: 0
        },
    }

    this.addPlayer = function (player) {
        this.player = player;
        return this;
    };

    this.addEnemy = function (enemy) {
        this.enemy = enemy;
        return this;
    };

    this.reload = function () {


        //перезагрузка стилей, статистики
        $('.field__col').css('background', '#FFF');

        this.ships.forEach((s, i) => {
            $(`.enemy-ships .ship:nth-child(${i + 1}) .ship__count`).text(s.count);
            $(`.player-ships .ship:nth-child(${i + 1}) .ship__count`).text(s.count);
        });

        $('.ship__img').css('opacity', 1);

        this.stats.hero.hits = 0;
        this.stats.hero.killings = 0;
        this.stats.enemy.hits = 0;
        this.stats.enemy.killings = 0;
        this.shipDirection = types.RIGHT;
        this.isPlayerTurn = true;

        this.round++;

        //подготовка игроков
        this.enemy
            .resetAvailableCells()
            .resetCheckedCells();

        this.player
            .resetAvailableCells()
            .resetCheckedCells();

        //расстановка кораблей
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

        if (this._hitCheck(coords, this.enemy) === types.DAMAGED) {
            this.stats.hero.hits++;
            this._markDamage(coords);
        } else if (this._hitCheck(coords, this.enemy) === types.DESTROYED) {
            this.stats.hero.hits++;
            this.stats.hero.killings++;
            this._markDestroy(coords);
        } else {
            this._markMiss(coords);
        }
    };

    this.enemyShoot = function (coords) {
        let index = this.enemy.notCheckedCells.indexOf(coords);
        this.enemy.notCheckedCells.splice(index, 1);

        if (this._hitCheck(coords, this.player) === types.DAMAGED) {
            this.stats.enemy.hits++;
            this._markDamage(coords, true);
        } else if (this._hitCheck(coords, this.player) === types.DESTROYED) {
            this.stats.enemy.hits++;
            this.stats.enemy.killings++;
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
                        c.status = types.DAMAGED;
                        hit = this._checkDestroy(coords) ? types.DESTROYED : types.DAMAGED;
                    }

                });
            })
        });

        return hit;
    };

    this._checkDestroy = function (coords) {
        return coords.every(c => c.status === types.DAMAGED);
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
            case types.RIGHT: {

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
            case types.LEFT: {


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
            case types.UP: {

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
            case types.DOWN: {
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

            if (this.shipDirection === types.RIGHT && startCol + shipLength < 10) {
                row = startRow;
                col = startCol + i;
                cell = parseInt('' + row + col);

                if (this._collisionDetected(cell, availableCells)) {
                    this._changeShipDirection();
                    return this._generateCoords(shipLength, ships, player);
                }
            } else if (this.shipDirection === types.LEFT && startCol - shipLength >= 0) {
                row = startRow;
                col = startCol - i;
                cell = parseInt('' + row + col);

                if (this._collisionDetected(cell, availableCells)) {
                    this._changeShipDirection();
                    return this._generateCoords(shipLength, ships, player);
                }
            } else if (this.shipDirection === types.UP && startRow - shipLength >= 0) {
                row = startRow - i;
                col = startCol;
                cell = parseInt('' + row + col);

                if (this._collisionDetected(cell, availableCells)) {
                    this._changeShipDirection();
                    return this._generateCoords(shipLength, ships, player);
                }
            } else if (this.shipDirection === types.DOWN && startCol + shipLength < 10) {
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
                    let $cell = $('#player-field .field__col[data-row=' + c.row + '][data-col=' + c.col + ']');
                    $cell.css('background', 'url(src/images/hero.png)');
                });
            })
        });
    };

    this._showEnemyShips = function (ships) {

        ships.forEach(s => {
            s.forEach(coords => {
                coords.forEach(c => {
                    let $cell = $('#enemy-field .field__col[data-row=' + c.row + '][data-col=' + c.col + ']');
                    $cell.css('background', 'url(src/images/enemy.png)');
                });
            })
        });
    };

    this._markDamage = function (coords, isHeroTable = false) {
        let row = Math.floor(coords / 10);
        let col = coords % 10;
        let $cell = isHeroTable ?
            $('#player-field .field__col[data-row=' + row + '][data-col=' + col + ']') :
            $('#enemy-field .field__col[data-row=' + row + '][data-col=' + col + ']');

        $cell.css('background', 'url(src/images/hit.png)');
    };

    this._markDestroy = function (target, isHeroTable = false) {

        let ships = isHeroTable ? this.player.ships : this.enemy.ships;

        for (let type = 0; type < ships.length; type++) {
            for (let i = 0; i < ships[type].length; i++) {
                if (ships[type][i].some(c => c.row * 10 + c.col === target)) {

                    this._updateStatusBar(ships[type][i].length, isHeroTable);

                    for (let c = 0; c < ships[type][i].length; c++) {

                        let $cell = isHeroTable ?
                            $('#player-field .field__col[data-row=' + ships[type][i][c].row + '][data-col=' + ships[type][i][c].col + ']') :
                            $('#enemy-field .field__col[data-row=' + ships[type][i][c].row + '][data-col=' + ships[type][i][c].col + ']');

                        $cell.css('background', 'url(src/images/enemy.png)');
                    }

                    this._markSiblings(ships[type][i], isHeroTable);


                    ships[type].splice(i, 1);
                    if (ships[type].length < 1) {
                        ships.splice(type, 1);
                    }

                    if (this._gameOver()) {

                        let modalTitle;
                        if (this.player.ships.length) {
                            this.stats.hero.wins++;
                            this.stats.enemy.defeats++;
                            modalTitle = 'Вы победили!';
                            $('.modal').addClass('modal--win');
                        } else {
                            this.stats.enemy.wins++;
                            this.stats.hero.defeats++;
                            modalTitle = 'Противник выиграл...';
                            $('.modal').removeClass('modal--win');
                        }

                        $('.modal__stat .hits .player').text(this.stats.hero.hits);
                        $('.modal__stat .hits .enemy').text(this.stats.enemy.hits);
                        $('.modal__stat .killings .player').text(this.stats.hero.killings);
                        $('.modal__stat .killings .enemy').text(this.stats.enemy.killings);
                        $('.modal__title .winner').text(modalTitle);
                        $('.stat__item--player').text(this.stats.hero.wins);
                        $('.stat__item--enemy').text(this.stats.enemy.wins);

                        $('.modal').modal();
                        setTimeout(function () {
                            $.modal.close();
                            game.reload()
                        }, 10000);
                    }
                    break;
                }
            }
        }
    };

    this._markSiblings = function (coords, isHeroTable) {

        let dir = coords[coords.length - 1].direction ? coords[coords.length - 1].direction : types.RIGHT;
        switch (dir) {
            case types.RIGHT: {
                for (let row = coords[0].row - 1; row <= coords[coords.length - 1].row + 1; row++) {
                    for (let col = coords[0].col - 1; col <= coords[coords.length - 1].col + 1; col++) {

                        if (coords[0].row !== row ||
                            (col === coords[0].col - 1 || coords[coords.length - 1].col + 1 === col)) {
                            if (col >= 0 && col < 10 && row >= 0 && row < 10) {

                                if (isHeroTable) {
                                    $('#player-field .field__col[data-row=' + row + '][data-col=' + col + ']').css('background', 'url(src/images/miss.png)');
                                    let index = this.enemy.notCheckedCells.indexOf(row * 10 + col);

                                    if (index > -1)
                                        this.enemy.notCheckedCells.splice(index, 1);
                                } else {
                                    $('#enemy-field .field__col[data-row=' + row + '][data-col=' + col + ']').css('background', 'url(src/images/miss.png)');
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
            case types.LEFT: {
                for (let row = coords[0].row - 1; row <= coords[coords.length - 1].row + 1; row++) {
                    for (let col = coords[coords.length - 1].col - 1; col <= coords[0].col + 1; col++) {

                        if (coords[0].row !== row ||
                            (col === coords[0].col + 1 || coords[coords.length - 1].col - 1 === col)) {

                            if (col >= 0 && col < 10 && row >= 0 && row < 10) {

                                if (isHeroTable) {
                                    $('#player-field .field__col[data-row=' + row + '][data-col=' + col + ']').css('background', 'url(src/images/miss.png)');
                                    let index = this.enemy.notCheckedCells.indexOf(row * 10 + col);

                                    if (index > -1)
                                        this.enemy.notCheckedCells.splice(index, 1);
                                } else {
                                    $('#enemy-field .field__col[data-row=' + row + '][data-col=' + col + ']').css('background', 'url(src/images/miss.png)');
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
            case types.DOWN: {
                for (let col = coords[0].col - 1; col <= coords[coords.length - 1].col + 1; col++) {
                    for (let row = coords[0].row - 1; row <= coords[coords.length - 1].row + 1; row++) {

                        if (coords[0].col !== col ||
                            (row === coords[0].row - 1 || coords[coords.length - 1].row + 1 === row)) {

                            if (col >= 0 && col < 10 && row >= 0 && row < 10) {
                                if (isHeroTable) {
                                    $('#player-field .field__col[data-row=' + row + '][data-col=' + col + ']').css('background', 'url(src/images/miss.png)');
                                    let index = this.enemy.notCheckedCells.indexOf(row * 10 + col);
                                    if (index > -1)
                                        this.enemy.notCheckedCells.splice(index, 1);
                                } else {
                                    $('#enemy-field .field__col[data-row=' + row + '][data-col=' + col + ']').css('background', 'url(src/images/miss.png)');
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
            case types.UP: {
                for (let col = coords[0].col - 1; col <= coords[coords.length - 1].col + 1; col++) {
                    for (let row = coords[coords.length - 1].row - 1; row <= coords[0].row + 1; row++) {
                        if (coords[0].col !== col ||
                            (row === coords[0].row + 1 || coords[coords.length - 1].row - 1 === row)) {

                            if (col >= 0 && col < 10 && row >= 0 && row < 10) {
                                if (isHeroTable) {
                                    $('#player-field .field__col[data-row=' + row + '][data-col=' + col + ']').css('background', 'url(src/images/miss.png)');
                                    let index = this.enemy.notCheckedCells.indexOf(row * 10 + col);
                                    if (index > -1)
                                        this.enemy.notCheckedCells.splice(index, 1);
                                } else {
                                    $('#enemy-field .field__col[data-row=' + row + '][data-col=' + col + ']').css('background', 'url(src/images/miss.png)');
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
        }

    }

    this._markMiss = function (coords, isHeroTable = false) {
        let row = Math.floor(coords / 10);
        let col = coords % 10;
        let $cell = isHeroTable ?
            $('#player-field .field__col[data-row=' + row + '][data-col=' + col + ']') :
            $('#enemy-field .field__col[data-row=' + row + '][data-col=' + col + ']');

        $cell.css('background', 'url(src/images/miss.png)');
    }

    this._updateStatusBar = function (shipSize, isHeroTable) {

        let elem;

        switch (shipSize) {
            case 4: {
                elem = isHeroTable ?
                    $('.player-ships .battleship .ship__count') :
                    $('.enemy-ships .battleship .ship__count');
                break;
            }
            case 3: {
                elem = isHeroTable ?
                    $('.player-ships .cruiser .ship__count') :
                    $('.enemy-ships .cruiser .ship__count');
                break;
            }
            case 2: {
                elem = isHeroTable ?
                    $('.player-ships .destroyer .ship__count') :
                    $('.enemy-ships .destroyer .ship__count');
                break;
            }
            case 1: {
                elem = isHeroTable ?
                    $('.player-ships .boat .ship__count') :
                    $('.enemy-ships .boat .ship__count');
                break;
            }
        }

        let newVal = parseInt(elem.text()) - 1;

        if (newVal === 0) {
            elem.siblings().css('opacity', '0.4');
        }

        elem.text(newVal);
    };

    this._gameOver = function () {
        return !this.enemy.ships.length || !this.player.ships.length;
    }
}

