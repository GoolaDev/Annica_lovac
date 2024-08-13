/*
Kad prodje pocetni tekst: pritisna A+B dugme.
Tasteri A i B setaju led u dnu lijevo, desno.
Cilj je da tvoj led bude u istoj koloni kao taj shto sheta. Taj sto se pali i gasi.
Ako ste u istoj kolinu tad isti zatreperi. Ako ga promasish onda ti zatreperish.
Ako ne pogodish protivnika poslije dovoljno 'vremena' izgubila si.
*/

const freePlay: boolean = false; // stavi na true i ne mozes da izgubish :)
const LETTER_A: boolean[] = [false, false, true, false, false, false, true, false, true, false, true, true, true, true, true, true, false, false, false, true];
const LETTER_N: boolean[] = [true, false, false, false, true, true, true, false, false, true, true, false, true, false, true, true, false, false, true, true];
let letter_A: boolean[] = [false, false, true, false, false, false, true, false, true, false, true, true, true, true, true, true, false, false, false, true];
let letter_N: boolean[] = [true, false, false, false, true, true, true, false, false, true, true, false, true, false, true, true, false, false, true, true];
let YoyoPosX: number;
let YoyoPosY: number;
let EnemyPosX: number;
let EnemyPosY: number;
let GameStart: boolean;
let Score: number;
// Timers are in milliseconds
let GameTimer: number;  // Energy/Time Left
let ScrollTime: number;
let hitBlinkTime: number;
let EnemyJumpTime: number; // koliko je Enemy Led pauziran
let MagicEnergyLevel: number;
let MagicEnergyIncrease: number;
let MagicEnergyDecrease: number;
let currentLetter: number;

// ---- main -----
GameInit();
IntroMsg();
basic.forever(GameLoop) // run main loop
// ---- main -----

// function implementations

function GameInit() {
    YoyoPosX = 2;
    YoyoPosY = 4;
    EnemyPosX = 0; // column
    EnemyPosY = 0; // row
    GameStart = false;
    GameTimer = 5;
    Score = 0;
    hitBlinkTime = 35;
    MagicEnergyDecrease = 0.25;
    MagicEnergyIncrease = 1;
    MagicEnergyLevel = 3;
    ScrollTime = 80;
    EnemyJumpTime = 250;
    currentLetter = 0; // 0-A,1-N,2-N,0,1,2,...
    initLetter_A(); initLetter_N();
    basic.clearScreen();
}

function IntroMsg() {
    basic.showString("SAMO ZA TEBE:)", ScrollTime);  // uncomment!!
    basic.clearScreen();
}

function GameLoop() {

    enemyDance();
    if (GameStart) CollisionDetection();

    if (GameTimer <= 0) // Time's up,Game Over
    {
        GameStart = false;
        basic.clearScreen();
        basic.showString("GAME OVER", ScrollTime);
        basic.showString("SCORE: " + Score.toString(), ScrollTime);
        GameInit();
    }
}

input.onButtonPressed(Button.AB, function () {
    if (!GameStart) {
        GameStart = true;
        led.plot(YoyoPosX, YoyoPosY);
        drawLetter(currentLetter);
    }
})

input.onButtonPressed(Button.A, function () {
    if (GameStart && ((YoyoPosX - 1) >= 0)) {
        led.unplot(YoyoPosX, YoyoPosY); // dimm old LED	
        YoyoPosX -= 1;
        led.plot(YoyoPosX, YoyoPosY); // light new LED
    }
})

input.onButtonPressed(Button.B, function () {
    if (GameStart && ((YoyoPosX + 1) <= 4)) {
        led.unplot(YoyoPosX, YoyoPosY); // dimm old LED 	
        YoyoPosX += 1;
        led.plot(YoyoPosX, YoyoPosY); // light new LED
    }
})

function ledBlink(column: number, row: number, times: number, haltTime: number) {
    for (let i = 0; i < times; i++) {
        basic.pause(haltTime);
        led.toggle(column, row);
        basic.pause(haltTime);
        led.toggle(column, row);
    }
    basic.pause(haltTime);
}

function enemyDance() {
    if (!getLetterHitStateAtXY(currentLetter)) led.unplot(EnemyPosX, EnemyPosY);
    let newXval: number = randint(0, 4);
    while (EnemyPosX == newXval) { newXval = randint(0, 4) };
    EnemyPosX = newXval;
    EnemyPosY = randint(0, 3);
    ledBlink(EnemyPosX, EnemyPosY, 1, EnemyJumpTime);
    if (GameStart) drawLetter(currentLetter);
}

function CollisionDetection() {

    if (YoyoPosX == EnemyPosX) {
        if (GameTimer < MagicEnergyLevel) GameTimer = GameTimer + MagicEnergyIncrease;
        Score = Score + 1;
        ledBlink(EnemyPosX, EnemyPosY, 6, hitBlinkTime);
    }
    else {
        hitLetter(currentLetter);
        if (checkIfLetterErased(currentLetter)) {
            incCurrentLetter();
            initLetter_A();
            initLetter_N();
            basic.pause(400);
        }
        drawLetter(currentLetter);
        if (!freePlay) GameTimer = GameTimer - MagicEnergyDecrease;
        ledBlink(YoyoPosX, YoyoPosY, 4, hitBlinkTime);
        blankLine(4);
        led.plot(YoyoPosX, YoyoPosY);
    }
}
function blankLine(row: number) {
    for (let i: number = 0; i < 4; ++i) led.unplot(i, 4);
}

function copyList(listDst: any[], listSrc: any[]): boolean {
    if (listSrc.length != listDst.length) return false;
    for (let i = 0; i < listSrc.length; ++i) listDst[i] = listSrc[i];
    return true;
}
function initLetter_A(): boolean {
    return copyList(letter_A, LETTER_A);
}
function initLetter_N(): boolean {
    return copyList(letter_N, LETTER_N);
}

function array2Dto1D(column: number, row: number): number  // column /* X */, number row /* Y */
{
    const ArrayDim = 5;
    return row * ArrayDim + column;
}

function array1Dto2D(cellNo: number): number[] {
    const ArrayDim = 5;
    const row: number = Math.floor(cellNo / ArrayDim);
    const column: number = cellNo % ArrayDim;
    return [column, row];  // x , y
}

function drawLetter(letterNo: number) {
    let letterPattern: boolean[] = [];
    let letterPATERN: boolean[] = [];
    switch (letterNo) {
        case 0:
        case 2:
            letterPattern = letter_A;
            letterPATERN = LETTER_A;
            break;

        case 1:
            letterPattern = letter_N;
            letterPATERN = LETTER_N;
            break;
        default:
            letterPattern = letter_A;
            letterPATERN = LETTER_A;
            break;
    }


    for (let i = 0; i < letterPattern.length; ++i) {
        const cordinates: number[] = array1Dto2D(i);
        const column: number = cordinates[0];
        const row: number = cordinates[1];
        if ((letterPATERN[i] == true) && (letterPattern[i] == true)) { led.plot(column, row); } //else { led.unplot(column, row); }
        if ((letterPATERN[i] == true) && (letterPattern[i] == false)) { led.unplot(column, row); }
    }
}

function getLetterHitStateAtXY(letterNo: number): boolean {
    let letterPattern: boolean[] = [];

    switch (letterNo) {
        case 0:
        case 2:
            letterPattern = letter_A;

            break;

        case 1:
            letterPattern = letter_N;

            break;
        default:
            letterPattern = letter_A;
            break;
    }

    const hitPosition: number = array2Dto1D(EnemyPosX, EnemyPosY);
    return letterPattern[hitPosition];
}
function hitLetter(letterNo: number) {
    let letterPattern: boolean[] = [];

    switch (letterNo) {
        case 0:
        case 2:
            letterPattern = letter_A;
            break;

        case 1:
            letterPattern = letter_N;
            break;

        default:
            letterPattern = letter_A;
            break;
    }

    const hitPosition: number = array2Dto1D(EnemyPosX, EnemyPosY);
    letterPattern[hitPosition] = false;
}
function checkIfLetterErased(letterNo: number): boolean {
    let letterPattern: boolean[] = [];
    let letterPATERN: boolean[] = [];
    switch (letterNo) {
        case 0:
        case 2:
            letterPattern = letter_A;
            letterPATERN = LETTER_A;
            break;

        case 1:
            letterPattern = letter_N;
            letterPATERN = LETTER_N;
            break;
        default:
            letterPattern = letter_A;
            letterPATERN = LETTER_A;
            break;
    }

    for (let i = 0; i < letterPattern.length; ++i) {
        if ((letterPATERN[i] == true) && (letterPattern[i] == true)) return false;
    }
    return true;
}

function incCurrentLetter() {
    if ((currentLetter + 1) == 3) //another round
    {
        letter_A = LETTER_A;
        letter_N = LETTER_N;
    }
    currentLetter = currentLetter % 3 + 1;
}