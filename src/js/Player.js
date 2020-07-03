export function Player() {
    this.availableCells = [];

    this.notCheckedCells = [],

        this.resetCheckedCells = function () {
            this.notCheckedCells = [];
            for (let row = 0; row < 10; row++)
                for (let col = 0; col < 10; col++)
                    this.notCheckedCells.push(row * 10 + col);
            return this;
        },

        this.getAvailableCells = function () {
            return this.availableCells;
        },

        this.resetAvailableCells = function () {
            this.availableCells = [];
            for (let row = 0; row < 10; row++)
                for (let col = 0; col < 10; col++)
                    this.availableCells.push(parseInt('' + row + col));
            return this;
        }
};