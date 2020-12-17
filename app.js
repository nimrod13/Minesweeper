document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid');
  const flagsLeft = document.querySelector('.flags-left');
  const result = document.querySelector('.result');
  const width = 10;
  const bombAmount = 20;
  let flags = 0;
  let squares = [];
  let isGameOver = false;
  let timer;

  //create Board
  function createBoard() {
    flagsLeft.innerHTML = bombAmount;

    //get shuffled game array with random bombs
    const bombsArray = Array(bombAmount).fill('bomb');
    const emptyArray = Array(width * width - bombAmount).fill('valid');
    const gameArray = emptyArray.concat(bombsArray);
    shuffleArray(gameArray);

    for (let i = 0; i < width * width; i++) {
      const square = document.createElement('div');
      square.setAttribute('id', i);
      square.classList.add(gameArray[i]);
      grid.appendChild(square);
      squares.push(square);

      square.addEventListener('click', (e) => {
        click(square);
      });

      square.oncontextmenu = (e) => {
        e.preventDefault();
        addFlag(square);
      };
    }

    //add numbers
    for (let i = 0; i < squares.length; i++) {
      const isLeftEdge = (i % width === 0);
      const isRightEdge = (i % width === width - 1);

      if (squares[i].classList.contains('valid')) {
        let total = calculateTotal(i, isLeftEdge, isRightEdge);
        squares[i].setAttribute('data', total);
      }
    }
  }


  function calculateTotal(i, isLeftEdge, isRightEdge) {
    let total = 0;
    !isLeftEdge && squares[i - 1].classList.contains('bomb') && total++;
    i >= 10 && !isRightEdge && squares[i + 1 - width].classList.contains('bomb') && total++;
    i >= 10 && squares[i - width].classList.contains('bomb') && total++;
    i >= 11 && !isLeftEdge && squares[i - 1 - width].classList.contains('bomb') && total++;
    !isRightEdge && squares[i + 1].classList.contains('bomb') && total++;
    i <= 89 && !isLeftEdge && squares[i - 1 + width].classList.contains('bomb') && total++;
    i <= 88 && !isRightEdge && squares[i + 1 + width].classList.contains('bomb') && total++;
    i <= 89 && squares[i + width].classList.contains('bomb') && total++;
    return total;
  }

  //Durstenfeld  shuffle - https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  createBoard();

  //add Flag with right click
  function addFlag(square) {
    if (isGameOver) {
      return;
    }

    if (!square.classList.contains('checked')) {
      if (!square.classList.contains('flag') && (flags < bombAmount)) {
        square.classList.add('flag');
        square.innerHTML = ' 🚩';
        flags++;
        flagsLeft.innerHTML = bombAmount - flags;
        checkForWin();
        return;
      }

      square.classList.remove('flag');
      square.innerHTML = '';
      flags--;
      flagsLeft.innerHTML = bombAmount - flags;
    }
  }

  // Click on square actions
  function click(square) {
    if (isGameOver || square.classList.contains('checked') || square.classList.contains('flag')) {
      return;
    }

    let currentId = square.id;

    if (square.classList.contains('bomb')) {
      gameOver(square);
    } else {
      let total = square.getAttribute('data');
      if (total != 0) {
        square.classList.add('checked');
        square.classList.add(`n${total}`);
        square.innerHTML = total;
      } else {
        checkSquare(currentId);
      }
    }

    square.classList.add('checked');
  }

  //check neighboring squares once square is clicked
  function checkSquare(currentId) {
    const isLeftEdge = (currentId % width === 0);
    const isRightEdge = (currentId % width === width - 1);
    let newId;

    setTimeout(() => {
      if (!isLeftEdge) {
        newId = parseInt(currentId) - 1;
        clickNewSquare(newId);
      }
      if (currentId >= 10 && !isRightEdge) {
        newId = parseInt(currentId) + 1 - width;
        clickNewSquare(newId);
      }
      if (currentId >= 10) {
        newId = parseInt(currentId) - width;
        clickNewSquare(newId);
      }
      if (currentId >= 11 && !isLeftEdge) {
        newId = parseInt(currentId) - 1 - width;
        clickNewSquare(newId);
      }
      if (currentId <= 98 && !isRightEdge) {
        newId = parseInt(currentId) + 1;
        clickNewSquare(newId);
      }
      if (currentId <= 89 && !isLeftEdge) {
        newId = parseInt(currentId) - 1 + width;
        clickNewSquare(newId);
      }
      if (currentId <= 88 && !isRightEdge) {
        newId = parseInt(currentId) + 1 + width;
        clickNewSquare(newId);
      }
      if (currentId <= 89) {
        newId = parseInt(currentId) + width;
        clickNewSquare(newId);
      }

    }, 10);
  }

  function clickNewSquare(newId) {
    let newSquare = document.getElementById(newId);
    click(newSquare);
  }

  //game over
  function gameOver() {
    result.innerHTML = 'BOOM! Game Over!';
    isGameOver = true;
    stopCount();

    //show ALL the bombs
    squares.forEach(square => {
      if (square.classList.contains('bomb')) {
        square.innerHTML = '💣';
        square.classList.remove('bomb');
        square.classList.add('checked');
      }
    });
  }

  //check for win
  function checkForWin() {
    ///simplified win argument
    let matches = 0;

    for (let i = 0; i < squares.length; i++) {
      if (squares[i].classList.contains('flag') && squares[i].classList.contains('bomb')) {
        matches++;
      }
      if (matches === bombAmount) {
        result.innerHTML = 'YOU WIN!';
        isGameOver = true;
        stopCount();
      }
    }
  }

  document.querySelector(".start-button").addEventListener("click", () => {
    result.innerHTML = '';
    isGameOver = false;
    grid.innerHTML = '';
    squares = [];
    flags = 0;
    stopCount(true);
    startCount();
    createBoard();
  });

  let hour, minute, second = 0;
  let timer_is_on = 0;
  let counter = 0;

  function timedCount() {
    counter++;

    minute = counter >= 60 ? Math.floor(counter / 60) : minute;
    hour = minute >= 60 ? Math.floor(minute / 60) : hour;
    second = counter % 60;

    document.querySelector(".timer").innerHTML = `${ hour > 0 ? hour + ":" : ""}${minute}:${second}`;
    timer = setTimeout(timedCount, 1000);
  }

  function startCount() {
    if (!timer_is_on) {
      timer_is_on = 1;
      counter = 0;
      timedCount();
    }
  }

  function stopCount(isNewGame) {
    if (isNewGame) {
      document.querySelector(".timer").innerHTML = '';
    }

    clearTimeout(timer);
    hour = 0;
    minute = 0;
    second = 0;
    timer_is_on = 0;
  }
});