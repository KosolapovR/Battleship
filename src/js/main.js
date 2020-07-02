$(document).ready(function () {

    const LEFT = 'direction/LEFT';
    const RIGHT = 'direction/RIGHT';
    const UP = 'direction/UP';
    const DOWN = 'direction/DOWN';

    function Game(speed = 1) {

        this.ships = {
            battleship: {size: 5, count: 1},
            carrier: {size: 4, count: 2},
            cruiser: {size: 3, count: 3},
            destroyer: {size: 2, count: 4},
            boat: {size: 1, count: 5}
        };

        this.speed = (speed >= 0 && speed <= 3) ? speed * 1000 : 1000;

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
            this.round++;

            this.player.setAvailableCells();

            this.player.ships = this._shipArrangement();
            this.enemy.ships = this._shipArrangement();

            this._showPlayerShips(this.player.ships);
        };

        this.getSpeed = function () {
            return this.speed;
        };

        this.changeTurn = function () {
            this.isPlayerTurn = !this.isPlayerTurn;
        };

        this._shipArrangement = function () {
            const ships = [];

            let coords = this._generateCoords(5, ships);
            debugger;
            ships.push({
                name: 'battleship',
                items: [
                    {coords: coords}
                ]
            });
            return ships;
        };

        this._generateCoords = function (shipLength, ships) {
            const head = [];

            let startRow = Math.floor(Math.random() * 9) + 1;
            let startCol = Math.floor(Math.random() * 9) + 1;
            let startCell = parseInt('' + startRow + startCol);

            let availableCells = this.player.getAvailableCells();

            if (this._collisionDetected(startCell, availableCells)) {
                this._changeShipDirection();
                return this._generateCoords(shipLength, ships);
            }

            head.push({col: startCol, row: startRow});

            const body = [];

            for (let i = 1; i < shipLength; i++){
                let row;
                let col;
                let cell;

                if(this.shipDirection === RIGHT && startCol + shipLength < 10){
                    row = startRow;
                    col = startCol + i;
                    cell = parseInt('' + row + col);
                    if(this._collisionDetected(cell, availableCells)){
                        this._changeShipDirection();
                        return this._generateCoords(shipLength, ships);
                    }
                }else if(this.shipDirection === LEFT && startCol - shipLength >= 0){
                    row = startRow;
                    col = startCol - i;
                    cell = parseInt('' + row + col);
                    if(this._collisionDetected(cell, availableCells)){
                        this._changeShipDirection();
                        return this._generateCoords(shipLength, ships);
                    }
                }else if(this.shipDirection === UP && startRow - shipLength >= 0){
                    row = startRow - i;
                    col = startCol;
                    cell = parseInt('' + row + col);
                    if(this._collisionDetected(cell, availableCells)){
                        this._changeShipDirection();
                        return this._generateCoords(shipLength, ships);
                    }
                }else if(this.shipDirection === DOWN && startCol + shipLength < 10){
                    row = startRow + i;
                    col = startCol;
                    cell = parseInt('' + row + col);
                    if(this._collisionDetected(cell, availableCells)){
                        this._changeShipDirection();
                        return this._generateCoords(shipLength, ships);
                    }
                }else{
                    this._changeShipDirection();
                    return this._generateCoords(shipLength, ships);
                }

                body.push({col, row})
            }
            return [...head, ...body];
        };

        this._collisionDetected = function (cell, availableCells) {
            let index = availableCells.indexOf(cell);
            if(index === -1){
                return true
            }

            availableCells.splice(index, 1);
            return false;
        };

        this._changeShipDirection = function () {
            let index = this.directions.indexOf(this.shipDirection);
            if(index >= 3){
                this.shipDirection = this.directions[0]
            }else{
                this.shipDirection = this.directions[++index];
            }
        };

        this._showPlayerShips = function (ships) {
            ships.forEach(s => {
                s.items.forEach(item => {
                    item.coords.forEach(coords => {
                        debugger;

                        let $cell = $('#player-field .field--col[data-row=' + coords.row + '][data-col=' + coords.col + ']');
                        $cell.css('background', 'yellow');
                    })
                })
            });
        }
    }

    function Player(name) {
        this.availableCells = [];
    };

    Player.prototype = {
        shoot: function (target) {
            console.log('высстрелил ', target);
        },

        getAvailableCells: function () {
            return this.availableCells;
        },

        setAvailableCells: function () {
            for (let row = 0; row < 10; row++)
                for (let col = 0; col < 10; col++)
                    this.availableCells.push(parseInt('' + row + col));
        }
    };


    const game = new Game();

    const hero = new Player();
    const enemy = new Player();


    game
        .addPlayer(hero)
        .addEnemy(enemy)
        .reload();

    //обработик на клик по полю

    $('#enemy-field').on('click', function (e) {

        if (game.isPlayerTurn) {

            game.changeTurn();
            hero.shoot({col: parseInt(e.target.dataset.col), row: parseInt(e.target.dataset.row)});

            setTimeout(function () {
                game.changeTurn();
                enemy.shoot({col: 1, row: 1});
            }, game.getSpeed());

        }
    })
});