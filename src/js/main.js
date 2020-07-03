import {Game} from "./Game.js";
import {Player} from "./Player.js";

const hero = new Player();
const enemy = new Player();

const game = new Game(1);

game
    .addPlayer(hero)
    .addEnemy(enemy)
    .reload();

//обработик на клик по полю
$('#enemy-field').on('click', function (e) {

    const target = parseInt(e.target.dataset.row) * 10 + parseInt(e.target.dataset.col);

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

$('.modal__btn').on('click', function () {
    $.modal.close();
    game.reload();
})
