"use strict";
class Battleships {
    constructor() {
        this.startGameBtn = document.querySelector('.start');
        this.pmoBtn = document.querySelector('.pmo');
        this.randomBtn = document.querySelector('.random');
        this.horizontalBtn = document.querySelector('.horizontal');
        this.verticalBtn = document.querySelector('.vertical');
        this.resetBtn = document.querySelector('.reset');
        this.consoleText = document.querySelector('.text');
        this.triggerAlgorithm = false;
        this.enemyTargets = [];
        this.enemyAttacks = [];
        this.allyTargets = [];
        this.ships = [
            {
                name: "carrier",
                space: 5,
                placed: false,
                defeated: false,
            },
            {
                name: "battleship",
                space: 4,
                placed: false,
                defeated: false,
            },
            {
                name: "cruiser",
                space: 3,
                placed: false,
                defeated: false,
            },
            {
                name: "destroyer",
                space: 3,
                placed: false,
                defeated: false,
            },
            {
                name: "frigate",
                space: 2,
                placed: false,
                defeated: false,
            },
        ];
        this.output = {
            welcome: " > Welcome to BattleShip.  Use the menu above to get started.",
            not: " > This option is not currently available.",
            player1: " > Would you like to place your own ships or have the computer randomly do it for you?",
            self: " > Use the mouse and the Horizontal and Vertical buttons to place your ships on the bottom grid.",
            overlap: " > You can not overlap ships.  Please try again.",
            start: " > Use the mouse to fire on the top grid.  Good Luck!",
            placed: (name) => " > Your " + name + " been placed.",
            hit: (name) => " > " + name + "'s ship was hit.",
            miss: (name) => " > " + name + " missed!",
            sunk: (user, type) => " > " + user + "'s " + type + " was sunk!",
            lost: (name) => " > " + name + " has lost his fleet!!  Game Over.",
        };
        this.topBoard = document.querySelector('.top');
        this.bottomBoard = document.querySelector('.bottom');
        this.vertical = false;
        this.horizontal = true;
        this.handlePlacement = (e) => {
            if (e.target.classList.contains('points')) {
                let point = e.target;
                const pointNum = [...point.classList].find((cl) => isFinite(+cl));
                let nextShip = this.ships.find(ship => !ship.placed);
                let siblings = [];
                const doesFit = this.horizontal ?
                    (+pointNum % 10) - 1 + nextShip.space <= 10 && +pointNum % 10 !== 0
                    : Math.trunc((+pointNum - 1) / 10) + nextShip.space <= 10;
                if (doesFit) {
                    if (this.horizontal) {
                        siblings = [];
                        let sibling = point;
                        for (let i = 0; i < nextShip.space; i++) {
                            siblings.push(sibling);
                            sibling = sibling.nextElementSibling;
                        }
                    }
                    if (this.vertical) {
                        siblings = [];
                        let sibling = point;
                        for (let i = 0; i < nextShip.space; i++) {
                            siblings.push(sibling);
                            const siblingNum = [...point.classList].find((cl) => isFinite(+cl));
                            sibling = document.getElementsByClassName(`${10 + +siblingNum}`)[0];
                        }
                    }
                    const onClick = () => {
                        if (siblings.every((s) => {
                            const allClasses = [...s.classList];
                            const lastClass = allClasses[allClasses.length - 1];
                            return this.ships.every((ship) => ship.name !== lastClass);
                        })) {
                            siblings.forEach((node) => {
                                node.classList.add(`${nextShip.name}`);
                                node.firstChild.classList.remove('hole');
                            });
                            this.ships.find((ship) => ship.name === nextShip.name).placed = true;
                            this.consoleText.textContent = this.output.placed(nextShip.name);
                            this.allyTargets.push({
                                space: [...siblings],
                                name: nextShip.name
                            });
                            nextShip = this.ships.find((ship) => !ship.placed);
                            this.checkIfReady();
                        }
                    };
                    const onEnter = () => {
                        if (siblings.every((s) => [...s.classList].length === 3)) {
                            siblings.forEach((node) => {
                                node.classList.add('highlight');
                            });
                            point.addEventListener('click', onClick);
                        }
                    };
                    const onLeave = () => {
                        siblings.forEach((node) => {
                            node.classList.remove('highlight');
                        });
                        point.removeEventListener('mouseenter', onEnter);
                        point.removeEventListener('click', onClick);
                    };
                    point.addEventListener('mouseenter', onEnter);
                    point.addEventListener('mouseleave', onLeave);
                }
            }
        };
        this.checkIfShipDown = (Target, enemy) => {
            if (Target.space.every((ship) => [...ship.childNodes[0].classList].includes('hit'))) {
                this.consoleText.textContent = this.output.sunk(enemy, Target.name);
                if (enemy === 'Player 1')
                    this.triggerAlgorithm = false;
            }
        };
        this.handleAllyTurn = (e) => {
            const classes = e.target.classList;
            if (classes.contains('points') || classes.contains('hole')) {
                const point = classes.contains('points') ? e.target : e.target.parentNode;
                const onEnter = () => {
                    if (!point.classList.contains('used')) {
                        point.classList.add('target');
                        point.addEventListener('click', hitTarget);
                    }
                };
                const onLeave = () => {
                    point.classList.remove('target');
                    if (!point.classList.contains('used')) {
                        point.removeEventListener('mouseenter', onEnter);
                        point.removeEventListener('mouseleave', onLeave);
                        point.removeEventListener('click', hitTarget);
                    }
                };
                const hitTarget = (e) => {
                    const target = [...e.target.classList].includes('points') ? e.target : e.target.parentNode;
                    console.log(target);
                    const pointHit = this.enemyTargets.find((ships) => ships.space.includes(target));
                    if (pointHit) {
                        target.childNodes[0].classList.add('hit');
                        this.consoleText.textContent = this.output.hit('Player 2');
                        this.checkIfShipDown(pointHit, 'Player 2');
                        if (this.checkIfGameOver(this.enemyTargets, 'Player 2'))
                            return;
                    }
                    else {
                        target.childNodes[0].classList.add('miss');
                        this.consoleText.textContent = this.output.miss('You');
                    }
                    target.classList.add('used');
                    point.removeEventListener('mouseenter', onEnter);
                    point.removeEventListener('mouseleave', onLeave);
                    point.removeEventListener('click', hitTarget);
                    point.classList.remove('target');
                    this.bottomBoard.removeEventListener('mouseover', this.handleAllyTurn);
                    setTimeout(this.handleEnemyTurn.bind(this), 500);
                };
                point.addEventListener('mouseenter', onEnter);
                point.addEventListener('mouseleave', onLeave);
            }
        };
        this.consoleText.textContent = this.output.welcome;
        this.startGameBtn.addEventListener('click', this.startGame.bind(this));
        this.resetBtn.addEventListener('click', this.reset.bind(this));
        this.pmoBtn.addEventListener('click', this.placeOnMyOwn.bind(this));
        this.horizontalBtn.addEventListener('click', this.changeHorizontal.bind(this));
        this.verticalBtn.addEventListener('click', this.changeVertical.bind(this));
    }
    startGame() {
        this.startGameBtn.style.display = 'none';
        this.pmoBtn.style.display = 'flow';
        this.randomBtn.style.display = 'flow';
        this.resetBtn.style.display = 'flow';
        this.consoleText.textContent = this.output.player1;
    }
    checkIfReady() {
        if (this.ships.every((ship) => ship.placed)) {
            this.consoleText.textContent = this.output.start;
            this.horizontalBtn.style.display = 'none';
            this.verticalBtn.style.display = 'none';
            this.topBoard.removeEventListener('mouseover', this.handlePlacement);
            this.ships.forEach((ship) => ship.placed = false);
            this.randomizeEnemyShips();
            this.launchGame();
        }
    }
    changeHorizontal() {
        this.horizontal = true;
        this.vertical = false;
    }
    changeVertical() {
        this.vertical = true;
        this.horizontal = false;
    }
    CPUAlgo() {
        const lastHit = this.enemyAttacks.findLast((attack) => attack.hit);
        let nextNum;
        const moveRight = () => {
            let i = 1;
            let reds = 0;
            for (let j = 0; j < 5; j++) {
                if ((lastHit.point + i) % 10 !== 1 && this.enemyAttacks.find((attack) => attack.point === lastHit.point + i && attack.hit)) {
                    i++;
                    reds++;
                }
                if ((lastHit.point + i) % 10 === 1 || this.enemyAttacks.find((attack) => attack.point === lastHit.point + i && !attack.hit))
                    return false;
            }
            nextNum = lastHit.point + i;
            return true;
        };
        const moveLeft = () => {
            let i = 1;
            let reds = 0;
            for (let j = 0; j < 5; j++) {
                if ((lastHit.point - i) % 10 !== 0 && this.enemyAttacks.find((attack) => attack.point === lastHit.point - i && attack.hit)) {
                    i++;
                    reds++;
                }
                if ((lastHit.point - i) % 10 === 0 || this.enemyAttacks.find((attack) => attack.point === lastHit.point - i && !attack.hit) || reds === 5)
                    return false;
            }
            nextNum = lastHit.point - i;
            return true;
        };
        const moveUp = () => {
            let i = 10;
            let reds = 0;
            for (let j = 0; j < 5; j++) {
                if ((lastHit.point - i) > 0 && this.enemyAttacks.find((attack) => attack.point === lastHit.point - i && attack.hit)) {
                    i += 10;
                    reds++;
                }
                if ((lastHit.point - i) <= 0 || this.enemyAttacks.find((attack) => attack.point === lastHit.point - i && !attack.hit))
                    return false;
            }
            nextNum = lastHit.point - i;
            return true;
        };
        const moveDown = () => {
            let i = 10;
            let reds = 0;
            for (let j = 0; j < 5; j++) {
                if ((lastHit.point + i) <= 100 && this.enemyAttacks.find((attack) => attack.point === lastHit.point + i && attack.hit)) {
                    i += 10;
                    reds++;
                }
                if ((lastHit.point + i) > 100 || this.enemyAttacks.find((attack) => attack.point === lastHit.point + i && !attack.hit))
                    return false;
            }
            nextNum = lastHit.point + i;
            return true;
        };
        if (moveRight() || moveLeft() || moveUp() || moveDown())
            return nextNum;
    }
    handleEnemyTurn() {
        const allPoints = [...document.querySelector('.top').querySelector('.grid').childNodes];
        let point;
        let pointNum;
        while (!point || point.classList.contains('used')) {
            if (!this.triggerAlgorithm)
                pointNum = Math.trunc(Math.random() * 100) + 1;
            else
                pointNum = this.CPUAlgo();
            for (let i = 0; i < allPoints.length; i++) {
                let classNames = allPoints[i].classList;
                if (classNames && classNames.contains(`${pointNum}`)) {
                    point = allPoints[i];
                    break;
                }
            }
        }
        point.classList.add('used');
        const pointHit = this.allyTargets.find((ships) => ships.space.includes(point));
        if (pointHit) {
            point.childNodes[0].classList.add('hit');
            this.consoleText.textContent = this.output.hit('Player 1');
            if (!this.triggerAlgorithm)
                this.triggerAlgorithm = true;
            this.checkIfShipDown(pointHit, 'Player 1');
            if (this.checkIfGameOver(this.allyTargets, 'Player 1'))
                return;
            this.enemyAttacks.push({ point: pointNum, hit: true });
        }
        else {
            point.childNodes[0].classList.add('miss');
            this.consoleText.textContent = this.output.miss('CPU');
            this.enemyAttacks.push({ point: pointNum, hit: false });
        }
        this.bottomBoard.addEventListener('mouseover', this.handleAllyTurn);
    }
    launchGame() {
        console.log(this.enemyTargets);
        this.bottomBoard.addEventListener('mouseover', this.handleAllyTurn);
    }
    checkIfGameOver(ships, player) {
        if (ships.every((ship) => ship.space.every((point) => [...point.childNodes[0].classList].includes('hit')))) {
            this.bottomBoard.removeEventListener('mouseover', this.handleAllyTurn);
            this.consoleText.textContent = this.output.lost(player);
            return true;
        }
        return false;
    }
    placeOnMyOwn() {
        this.consoleText.textContent = this.output.self;
        this.pmoBtn.style.display = 'none';
        this.randomBtn.style.display = 'none';
        this.horizontalBtn.style.display = 'flow';
        this.verticalBtn.style.display = 'flow';
        this.topBoard.addEventListener('mouseover', this.handlePlacement);
    }
    randomizeEnemyShips() {
        while (this.ships.some((ship) => !ship.placed)) {
            let pointNum = Math.trunc(Math.random() * 100) + 1;
            Math.trunc(Math.random() * 2) + 1 === 1 ? this.changeHorizontal() : this.changeVertical();
            let nextShip = this.ships.find((ship) => !ship.placed);
            const doesFit = this.horizontal ?
                (pointNum % 10) - 1 + nextShip.space <= 10 && pointNum % 10 !== 0
                : Math.trunc((pointNum - 1) / 10) + nextShip.space <= 10;
            const allPoints = [...document.querySelector('.bottom').querySelector('.grid').childNodes];
            let point;
            for (let i = 0; i < allPoints.length; i++) {
                let classNames = allPoints[i].classList;
                if (classNames && classNames.contains(`${pointNum}`)) {
                    point = allPoints[i];
                    break;
                }
            }
            const siblings = [];
            if (doesFit) {
                if (this.horizontal) {
                    let sibling = point;
                    for (let i = 0; i < nextShip.space; i++) {
                        siblings.push(sibling);
                        sibling = sibling.nextElementSibling;
                    }
                }
                if (this.vertical) {
                    let sibling = point;
                    for (let i = 0; i < nextShip.space; i++) {
                        siblings.push(sibling);
                        const siblingNum = [...sibling.classList].find((cl) => isFinite(+cl));
                        sibling = document.querySelector('.bottom').getElementsByClassName(`${10 + +siblingNum}`)[0];
                    }
                }
                // if (siblings.every((s: HTMLLIElement | undefined): boolean => !this.enemyTargets.includes(s))) {
                if (siblings.every((s) => !this.enemyTargets.some((target) => target.space.includes(s)))) {
                    this.ships.find((ship) => ship.name === nextShip.name).placed = true;
                    this.enemyTargets.push({
                        space: [...siblings],
                        name: nextShip.name
                    });
                    nextShip = this.ships.find((ship) => !ship.placed);
                }
            }
        }
    }
    reset() {
        this.bottomBoard.removeEventListener('mouseover', this.handleAllyTurn);
        this.startGameBtn.style.display = 'flow';
        this.pmoBtn.style.display = 'none';
        this.randomBtn.style.display = 'none';
        this.horizontalBtn.style.display = 'none';
        this.verticalBtn.style.display = 'none';
        this.resetBtn.style.display = 'none';
        this.ships.forEach(ship => ship.placed = false);
        this.consoleText.textContent = this.output.welcome;
        this.enemyTargets = [];
        this.allyTargets = [];
        this.enemyAttacks = [];
        this.triggerAlgorithm = false;
        this.topBoard.innerHTML = '';
        this.bottomBoard.innerHTML = '';
        const HTMLelement = `
            <span class="aTops hidezero">0</span>
                <span class="aTops">1</span>
                <span class="aTops">2</span>
                <span class="aTops">3</span>
                <span class="aTops">4</span>
                <span class="aTops">5</span>
                <span class="aTops">6</span>
                <span class="aTops">7</span>
                <span class="aTops">8</span>
                <span class="aTops">9</span>
                <span class="aTops">10</span>

                <ul class="grid">
                    <li class="points offset1 1"><span class="hole"></span></li>
                    <li class="points offset1 2"><span class="hole"></span></li>
                    <li class="points offset1 3"><span class="hole"></span></li>
                    <li class="points offset1 4"><span class="hole"></span></li>
                    <li class="points offset1 5"><span class="hole"></span></li>
                    <li class="points offset1 6"><span class="hole"></span></li>
                    <li class="points offset1 7"><span class="hole"></span></li>
                    <li class="points offset1 8"><span class="hole"></span></li>
                    <li class="points offset1 9"><span class="hole"></span></li>
                    <li class="points offset1 10"><span class="hole"></span></li>
                    <li class="points offset2 11"><span class="hole"></span></li>
                    <li class="points offset2 12"><span class="hole"></span></li>
                    <li class="points offset2 13"><span class="hole"></span></li>
                    <li class="points offset2 14"><span class="hole"></span></li>
                    <li class="points offset2 15"><span class="hole"></span></li>
                    <li class="points offset2 16"><span class="hole"></span></li>
                    <li class="points offset2 17"><span class="hole"></span></li>
                    <li class="points offset2 18"><span class="hole"></span></li>
                    <li class="points offset2 19"><span class="hole"></span></li>
                    <li class="points offset2 20"><span class="hole"></span></li>
                    <li class="points offset2 21"><span class="hole"></span></li>
                    <li class="points offset2 22"><span class="hole"></span></li>
                    <li class="points offset2 23"><span class="hole"></span></li>
                    <li class="points offset2 24"><span class="hole"></span></li>
                    <li class="points offset2 25"><span class="hole"></span></li>
                    <li class="points offset2 26"><span class="hole"></span></li>
                    <li class="points offset2 27"><span class="hole"></span></li>
                    <li class="points offset2 28"><span class="hole"></span></li>
                    <li class="points offset2 29"><span class="hole"></span></li>
                    <li class="points offset2 30"><span class="hole"></span></li>
                    <li class="points offset2 31"><span class="hole"></span></li>
                    <li class="points offset2 32"><span class="hole"></span></li>
                    <li class="points offset2 33"><span class="hole"></span></li>
                    <li class="points offset2 34"><span class="hole"></span></li>
                    <li class="points offset2 35"><span class="hole"></span></li>
                    <li class="points offset2 36"><span class="hole"></span></li>
                    <li class="points offset2 37"><span class="hole"></span></li>
                    <li class="points offset2 38"><span class="hole"></span></li>
                    <li class="points offset2 39"><span class="hole"></span></li>
                    <li class="points offset2 40"><span class="hole"></span></li>
                    <li class="points offset2 41"><span class="hole"></span></li>
                    <li class="points offset2 42"><span class="hole"></span></li>
                    <li class="points offset2 43"><span class="hole"></span></li>
                    <li class="points offset2 44"><span class="hole"></span></li>
                    <li class="points offset2 45"><span class="hole"></span></li>
                    <li class="points offset2 46"><span class="hole"></span></li>
                    <li class="points offset2 47"><span class="hole"></span></li>
                    <li class="points offset2 48"><span class="hole"></span></li>
                    <li class="points offset2 49"><span class="hole"></span></li>
                    <li class="points offset2 50"><span class="hole"></span></li>
                    <li class="points offset2 51"><span class="hole"></span></li>
                    <li class="points offset2 52"><span class="hole"></span></li>
                    <li class="points offset2 53"><span class="hole"></span></li>
                    <li class="points offset2 54"><span class="hole"></span></li>
                    <li class="points offset2 55"><span class="hole"></span></li>
                    <li class="points offset2 56"><span class="hole"></span></li>
                    <li class="points offset2 57"><span class="hole"></span></li>
                    <li class="points offset2 58"><span class="hole"></span></li>
                    <li class="points offset2 59"><span class="hole"></span></li>
                    <li class="points offset2 60"><span class="hole"></span></li>
                    <li class="points offset2 61"><span class="hole"></span></li>
                    <li class="points offset2 62"><span class="hole"></span></li>
                    <li class="points offset2 63"><span class="hole"></span></li>
                    <li class="points offset2 64"><span class="hole"></span></li>
                    <li class="points offset2 65"><span class="hole"></span></li>
                    <li class="points offset2 66"><span class="hole"></span></li>
                    <li class="points offset2 67"><span class="hole"></span></li>
                    <li class="points offset2 68"><span class="hole"></span></li>
                    <li class="points offset2 69"><span class="hole"></span></li>
                    <li class="points offset2 70"><span class="hole"></span></li>
                    <li class="points offset2 71"><span class="hole"></span></li>
                    <li class="points offset2 72"><span class="hole"></span></li>
                    <li class="points offset2 73"><span class="hole"></span></li>
                    <li class="points offset2 74"><span class="hole"></span></li>
                    <li class="points offset2 75"><span class="hole"></span></li>
                    <li class="points offset2 76"><span class="hole"></span></li>
                    <li class="points offset2 77"><span class="hole"></span></li>
                    <li class="points offset2 78"><span class="hole"></span></li>
                    <li class="points offset2 79"><span class="hole"></span></li>
                    <li class="points offset2 80"><span class="hole"></span></li>
                    <li class="points offset2 81"><span class="hole"></span></li>
                    <li class="points offset2 82"><span class="hole"></span></li>
                    <li class="points offset2 83"><span class="hole"></span></li>
                    <li class="points offset2 84"><span class="hole"></span></li>
                    <li class="points offset2 85"><span class="hole"></span></li>
                    <li class="points offset2 86"><span class="hole"></span></li>
                    <li class="points offset2 87"><span class="hole"></span></li>
                    <li class="points offset2 88"><span class="hole"></span></li>
                    <li class="points offset2 89"><span class="hole"></span></li>
                    <li class="points offset2 90"><span class="hole"></span></li>
                    <li class="points offset2 91"><span class="hole"></span></li>
                    <li class="points offset2 92"><span class="hole"></span></li>
                    <li class="points offset2 93"><span class="hole"></span></li>
                    <li class="points offset2 94"><span class="hole"></span></li>
                    <li class="points offset2 95"><span class="hole"></span></li>
                    <li class="points offset2 96"><span class="hole"></span></li>
                    <li class="points offset2 97"><span class="hole"></span></li>
                    <li class="points offset2 98"><span class="hole"></span></li>
                    <li class="points offset2 99"><span class="hole"></span></li>
                    <li class="points offset2 100"><span class="hole"></span></li>
                </ul>
                <span class="aLeft">A</span>
                <span class="aLeft">B</span>
                <span class="aLeft">C</span>
                <span class="aLeft">D</span>
                <span class="aLeft">E</span>
                <span class="aLeft">F</span>
                <span class="aLeft">G</span>
                <span class="aLeft">H</span>
                <span class="aLeft">I</span>
                <span class="aLeft">J</span>`;
        this.topBoard.insertAdjacentHTML('afterbegin', HTMLelement);
        this.bottomBoard.insertAdjacentHTML('afterbegin', HTMLelement);
    }
}
const game = new Battleships();
