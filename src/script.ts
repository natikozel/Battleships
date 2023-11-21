interface Target {
    space: Array<HTMLLIElement | undefined>;
    name: string;
}

interface Attack {
    point: number;
    hit: boolean;
}

interface Ship {
    name: string;
    space: number;
    placed: boolean;
    defeated: boolean;
}

class Battleships {

    private startGameBtn: HTMLButtonElement = document.querySelector('.start')!;
    private pmoBtn: HTMLButtonElement = document.querySelector('.pmo')!;
    private randomBtn: HTMLButtonElement = document.querySelector('.random')!;
    private horizontalBtn: HTMLButtonElement = document.querySelector('.horizontal')!;
    private verticalBtn: HTMLButtonElement = document.querySelector('.vertical')!;
    private resetBtn: HTMLButtonElement = document.querySelector('.reset')!;
    private consoleText: HTMLSpanElement = document.querySelector('.text')!;
    private triggerAlgorithm: boolean = false;
    private enemyTargets: Array<Target> = [];
    private enemyAttacks: Array<Attack> = [];
    private allyTargets: Array<Target> = [];
    private ships: Array<Ship> = [
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
    private output = {
        welcome: " > Welcome to BattleShip.  Use the menu above to get started.",
        not: " > This option is not currently available.",
        player1: " > Would you like to place your own ships or have the computer randomly do it for you?",
        self: " > Use the mouse and the Horizontal and Vertical buttons to place your ships on the bottom grid.",
        overlap: " > You can not overlap ships.  Please try again.",
        start: " > Use the mouse to fire on the top grid.  Good Luck!",
        placed: (name: string) => " > Your " + name + " been placed.",
        hit: (name: string) => " > " + name + "'s ship was hit.",
        miss: (name: string) => " > " + name + " missed!",
        sunk: (user: string, type: string) => " > " + user + "'s " + type + " was sunk!",
        lost: (name: string) => " > " + name + " has lost his fleet!!  Game Over.",
    };
    private topBoard: HTMLDivElement = document.querySelector('.top')!;
    private bottomBoard: HTMLDivElement = document.querySelector('.bottom')!;
    private vertical: boolean = false;
    private horizontal: boolean = true;

    constructor() {
        this.consoleText.textContent = this.output.welcome;
        this.startGameBtn.addEventListener('click', this.startGame.bind(this));
        this.resetBtn.addEventListener('click', this.reset.bind(this));
        this.pmoBtn.addEventListener('click', this.placeOnMyOwn.bind(this));
        this.horizontalBtn.addEventListener('click', this.changeHorizontal.bind(this));
        this.verticalBtn.addEventListener('click', this.changeVertical.bind(this));
    }

    startGame(): void {
        this.startGameBtn.style.display = 'none';
        this.pmoBtn.style.display = 'flow';
        this.randomBtn.style.display = 'flow';
        this.resetBtn.style.display = 'flow';
        this.consoleText.textContent = this.output.player1;
    }


    handlePlacement = (e: Event) => {

        if ((e.target as HTMLLIElement).classList.contains('points')) {
            let point: HTMLLIElement = e.target as HTMLLIElement;
            const pointNum: string = [...point.classList].find((cl: string): boolean => isFinite(+cl))!;
            let nextShip: Ship = this.ships.find(ship => !ship.placed)!;
            let siblings: Array<HTMLLIElement | undefined> = [];
            const doesFit: boolean = this.horizontal ?
                (+pointNum % 10) - 1 + nextShip.space <= 10 && +pointNum % 10 !== 0
                : Math.trunc((+pointNum - 1) / 10) + nextShip.space <= 10;
            if (doesFit) {
                if (this.horizontal) {
                    siblings = [];
                    let sibling: HTMLLIElement | null = point;
                    for (let i = 0; i < nextShip.space; i++) {
                        siblings.push(sibling);
                        sibling = sibling!.nextElementSibling as HTMLLIElement;
                    }
                }
                if (this.vertical) {
                    siblings = [];
                    let sibling: HTMLLIElement | null = point;
                    for (let i = 0; i < nextShip.space; i++) {
                        siblings.push(sibling);
                        const siblingNum: string = [...point.classList].find((cl: string): boolean => isFinite(+cl))!;
                        sibling = document.getElementsByClassName(`${10 + +siblingNum}`)[0] as HTMLLIElement;
                    }
                }


                const onClick = (): void => {
                    if (siblings.every((s: HTMLLIElement | undefined) => {
                        const allClasses: Array<string> = [...s!.classList];
                        const lastClass: string = allClasses[allClasses.length - 1];
                        return this.ships.every((ship: Ship): boolean => ship.name !== lastClass);
                    })) {
                        siblings.forEach((node: HTMLLIElement | undefined): void => {
                            node!.classList.add(`${nextShip.name}`);
                            (node!.firstChild! as HTMLSpanElement).classList.remove('hole');
                        });
                        this.ships.find((ship: Ship): boolean => ship.name === nextShip.name)!.placed = true;
                        this.consoleText.textContent = this.output.placed(nextShip.name);
                        this.allyTargets.push({
                            space: [...siblings],
                            name: nextShip.name
                        });
                        nextShip = this.ships.find((ship: Ship): boolean => !ship.placed)!;
                        this.checkIfReady();
                    }
                };

                const onEnter = (): void => {
                    if (siblings.every((s: HTMLLIElement | undefined): boolean => [...s!.classList].length === 3)) {
                        siblings.forEach((node: HTMLLIElement | undefined): void => {
                            node!.classList.add('highlight');
                        });
                        point.addEventListener('click', onClick);
                    }
                };
                const onLeave = (): void => {
                    siblings.forEach((node: HTMLLIElement | undefined): void => {
                        node!.classList.remove('highlight');
                    });
                    point.removeEventListener('mouseenter', onEnter);
                    point.removeEventListener('click', onClick);
                };

                point.addEventListener('mouseenter', onEnter);
                point.addEventListener('mouseleave', onLeave);
            }
        }

    };

    checkIfReady(): void {
        if (this.ships.every((ship: Ship): boolean => ship.placed)) {
            this.consoleText.textContent = this.output.start;
            this.horizontalBtn.style.display = 'none';
            this.verticalBtn.style.display = 'none';
            this.topBoard.removeEventListener('mouseover', this.handlePlacement);
            this.ships.forEach((ship: Ship): boolean => ship.placed = false);
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

    checkIfShipDown = (Target: Target, enemy: string): void => {
        if (Target.space.every((ship: HTMLLIElement | undefined): boolean => [...(ship!.childNodes[0] as HTMLSpanElement).classList].includes('hit'))) {
            this.consoleText.textContent = this.output.sunk(enemy, Target.name);
            if (enemy === 'Player 1')
                this.triggerAlgorithm = false;

        }
    };

    handleAllyTurn = (e: Event): void => {

        const classes: DOMTokenList = (e.target as HTMLLIElement | HTMLSpanElement).classList;
        if (classes.contains('points') || classes.contains('hole')) {
            const point: HTMLLIElement = classes.contains('points') ? e.target! as HTMLLIElement : (e.target! as HTMLSpanElement).parentNode! as HTMLLIElement;

            const onEnter = (): void => {
                if (!point.classList.contains('used')) {
                    point.classList.add('target');
                    point.addEventListener('click', hitTarget);
                }
            };

            const onLeave = (): void => {
                point.classList.remove('target');
                if (!point.classList.contains('used')) {
                    point.removeEventListener('mouseenter', onEnter);
                    point.removeEventListener('mouseleave', onLeave);
                    point.removeEventListener('click', hitTarget);
                }
            };


            const hitTarget = (e: Event): void => {
                const target: HTMLLIElement = [...(e.target! as HTMLLIElement | HTMLSpanElement).classList].includes('points') ? e.target as HTMLLIElement : (e.target! as HTMLSpanElement).parentNode as HTMLLIElement;
                console.log(target);
                const pointHit: Target = this.enemyTargets.find((ships: Target): boolean => ships.space.includes(target))!;
                if (pointHit) {
                    (target.childNodes[0] as HTMLSpanElement).classList.add('hit');
                    this.consoleText.textContent = this.output.hit('Player 2');
                    this.checkIfShipDown(pointHit, 'Player 2');
                    if (this.checkIfGameOver(this.enemyTargets, 'Player 2'))
                        return;
                } else {
                    (target.childNodes[0] as HTMLSpanElement).classList.add('miss');
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

    CPUAlgo(): number | undefined {
        const lastHit: Attack = this.enemyAttacks.findLast((attack: Attack): boolean => attack.hit)!;
        let nextNum: number | undefined;


        const moveRight = (): boolean => {
            let i: number = 1;
            let reds: number = 0;
            for (let j: number = 0; j < 5; j++) {
                if ((lastHit.point + i) % 10 !== 1 && this.enemyAttacks.find((attack: Attack): boolean => attack.point === lastHit.point + i && attack.hit)) {
                    i++;
                    reds++;
                }

                if ((lastHit.point + i) % 10 === 1 || this.enemyAttacks.find((attack: Attack): boolean => attack.point === lastHit.point + i && !attack.hit))
                    return false;
            }

            nextNum = lastHit.point + i;
            return true;

        };

        const moveLeft = (): boolean => {
            let i: number = 1;
            let reds: number = 0;
            for (let j: number = 0; j < 5; j++) {
                if ((lastHit.point - i) % 10 !== 0 && this.enemyAttacks.find((attack: Attack): boolean => attack.point === lastHit.point - i && attack.hit)) {
                    i++;
                    reds++;
                }

                if ((lastHit.point - i) % 10 === 0 || this.enemyAttacks.find((attack: Attack): boolean => attack.point === lastHit.point - i && !attack.hit) || reds === 5)
                    return false;
            }

            nextNum = lastHit.point - i;
            return true;

        };
        const moveUp = (): boolean => {
            let i: number = 10;
            let reds: number = 0;
            for (let j: number = 0; j < 5; j++) {
                if ((lastHit.point - i) > 0 && this.enemyAttacks.find((attack: Attack): boolean => attack.point === lastHit.point - i && attack.hit)) {
                    i += 10;
                    reds++;
                }

                if ((lastHit.point - i) <= 0 || this.enemyAttacks.find((attack: Attack): boolean => attack.point === lastHit.point - i && !attack.hit))
                    return false;
            }

            nextNum = lastHit.point - i;
            return true;

        };

        const moveDown = (): boolean => {
            let i: number = 10;
            let reds: number = 0;
            for (let j: number = 0; j < 5; j++) {
                if ((lastHit.point + i) <= 100 && this.enemyAttacks.find((attack: Attack): boolean => attack.point === lastHit.point + i && attack.hit)) {
                    i += 10;
                    reds++;
                }

                if ((lastHit.point + i) > 100 || this.enemyAttacks.find((attack: Attack): boolean => attack.point === lastHit.point + i && !attack.hit))
                    return false;
            }

            nextNum = lastHit.point + i;
            return true;
        };


        if (moveRight() || moveLeft() || moveUp() || moveDown())
            return nextNum;


    }

    handleEnemyTurn(): void {

        const allPoints: Array<ChildNode> = [...document.querySelector('.top')!.querySelector('.grid')!.childNodes];
        let point: HTMLLIElement | undefined;
        let pointNum: number;
        while (!point || point.classList.contains('used')) {
            if (!this.triggerAlgorithm)
                pointNum = Math.trunc(Math.random() * 100) + 1;
            else
                pointNum = this.CPUAlgo()!;
            for (let i = 0; i < allPoints.length; i++) {
                let classNames: DOMTokenList = (allPoints[i] as HTMLLIElement).classList;
                if (classNames && classNames.contains(`${pointNum}`)) {
                    point = allPoints[i] as HTMLLIElement;
                    break;
                }
            }
        }
        point.classList.add('used');
        const pointHit: Target | undefined = this.allyTargets.find((ships: Target): boolean => ships.space.includes(point));
        if (pointHit) {
            (point.childNodes[0] as HTMLSpanElement).classList.add('hit');
            this.consoleText.textContent = this.output.hit('Player 1');
            if (!this.triggerAlgorithm)
                this.triggerAlgorithm = true;
            this.checkIfShipDown(pointHit, 'Player 1');
            if (this.checkIfGameOver(this.allyTargets, 'Player 1'))
                return;
            this.enemyAttacks.push({point: pointNum!, hit: true});
        } else {
            (point.childNodes[0] as HTMLSpanElement).classList.add('miss');
            this.consoleText.textContent = this.output.miss('CPU');
            this.enemyAttacks.push({point: pointNum!, hit: false});
        }

        this.bottomBoard.addEventListener('mouseover', this.handleAllyTurn);
    }

    launchGame(): void {
        console.log(this.enemyTargets);
        this.bottomBoard.addEventListener('mouseover', this.handleAllyTurn);
    }

    checkIfGameOver(ships: Array<Target>, player: string): boolean {
        if (ships.every((ship: Target): boolean => ship.space.every((point: HTMLLIElement | undefined): boolean => [...(point!.childNodes[0] as HTMLSpanElement).classList].includes('hit')))) {
            this.bottomBoard.removeEventListener('mouseover', this.handleAllyTurn);
            this.consoleText.textContent = this.output.lost(player);
            return true;
        }
        return false;
    }

    placeOnMyOwn(): void {
        this.consoleText.textContent = this.output.self;
        this.pmoBtn.style.display = 'none';
        this.randomBtn.style.display = 'none';
        this.horizontalBtn.style.display = 'flow';
        this.verticalBtn.style.display = 'flow';
        this.topBoard.addEventListener('mouseover', this.handlePlacement);

    }

    randomizeEnemyShips(): void {

        while (this.ships.some((ship: Ship): boolean => !ship.placed)) {
            let pointNum: number = Math.trunc(Math.random() * 100) + 1;
            Math.trunc(Math.random() * 2) + 1 === 1 ? this.changeHorizontal() : this.changeVertical();
            let nextShip: Ship = this.ships.find((ship: Ship): boolean => !ship.placed)!;
            const doesFit: boolean = this.horizontal ?
                (pointNum % 10) - 1 + nextShip.space <= 10 && pointNum % 10 !== 0
                : Math.trunc((pointNum - 1) / 10) + nextShip.space <= 10;
            const allPoints: Array<ChildNode> = [...document.querySelector('.bottom')!.querySelector('.grid')!.childNodes];
            let point;
            for (let i: number = 0; i < allPoints.length; i++) {
                let classNames: DOMTokenList = (allPoints[i] as HTMLLIElement).classList;
                if (classNames && classNames.contains(`${pointNum}`)) {
                    point = allPoints[i] as HTMLLIElement;
                    break;
                }
            }

            const siblings: Array<HTMLLIElement | undefined> = [];
            if (doesFit) {
                if (this.horizontal) {
                    let sibling: HTMLLIElement | undefined = point;
                    for (let i = 0; i < nextShip.space; i++) {
                        siblings.push(sibling);
                        sibling = sibling!.nextElementSibling as HTMLLIElement;
                    }
                }
                if (this.vertical) {
                    let sibling: HTMLLIElement | undefined = point;
                    for (let i = 0; i < nextShip.space; i++) {
                        siblings.push(sibling);
                        const siblingNum: string = [...(sibling as HTMLLIElement).classList].find((cl: string): boolean => isFinite(+cl))!;
                        sibling = document.querySelector('.bottom')!.getElementsByClassName(`${10 + +siblingNum}`)[0] as HTMLLIElement;
                    }
                }
                // if (siblings.every((s: HTMLLIElement | undefined): boolean => !this.enemyTargets.includes(s))) {
                if (siblings.every((s: HTMLLIElement | undefined): boolean => !this.enemyTargets.some((target: Target): boolean => target.space.includes(s)))) {
                    this.ships.find((ship: Ship): boolean => ship.name === nextShip.name)!.placed = true;
                    this.enemyTargets.push({
                        space: [...siblings],
                        name: nextShip.name
                    });
                    nextShip = this.ships.find((ship: Ship): boolean => !ship.placed)!;
                }
            }
        }
    }

    reset(): void {
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

const game: Battleships = new Battleships();
