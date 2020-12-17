document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid');
  const startButton = document.querySelector('.start-button');
  const flagsLeft = document.querySelector('.flags-left');
  const result = document.querySelector('.result');
  const width = 10;
  const bombCount = 20;
  let flagsCount = 0;
  let squares = [];
  let isGameOver = false;
  let timer;
  let gridMap = new Map();

  createBoard(true);

  //create Board
  function createBoard(initialLoad) {
    flagsLeft.innerHTML = bombCount;

    //get shuffled game array with random bombs
    const bombsArray = Array(bombCount).fill('unchecked');
    const emptyArray = Array(width * width - bombCount).fill('valid');
    const gameArray = emptyArray.concat(bombsArray);
    shuffleArray(gameArray);

    gameArray.map((item, index) => gridMap.set(index, item === 'unchecked' ? true : false));

    for (let i = 0; i < width * width; i++) {
      const square = document.createElement('div');
      square.setAttribute('id', i);
      grid.appendChild(square);
      squares.push(square);

      square.addEventListener('click', (e) => {
        initialLoad && startCount();
        click(square);
      });

      square.oncontextmenu = (e) => {
        e.preventDefault();
        handleFlag(square);
      };
    }

    //add numbers
    for (let i = 0; i < squares.length; i++) {
      if (gridMap.get(i) === false) {
        squares[i].setAttribute('data', calculateTotal(i));
      }
    }
  }

  //calculate the number of surrounding bombs
  function calculateTotal(i) {
    const isLeftEdge = (i % width === 0);
    const isRightEdge = (i % width === width - 1);

    let total = 0;
    !isLeftEdge && gridMap.get(i - 1) && total++;
    i >= 10 && !isRightEdge && gridMap.get(i + 1 - width) && total++;
    i >= 10 && gridMap.get(i - width) && total++;
    i >= 11 && !isLeftEdge && gridMap.get(i - 1 - width) && total++;
    !isRightEdge && gridMap.get(i + 1) && total++;
    i <= 89 && !isLeftEdge && gridMap.get(i - 1 + width) && total++;
    i <= 88 && !isRightEdge && gridMap.get(i + 1 + width) && total++;
    i <= 89 && gridMap.get(i + width) && total++;

    return total;
  }

  //Durstenfeld  shuffle - https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  //add or remove flag with right click
  function handleFlag(square) {
    if (isGameOver) {
      return;
    }

    if (!square.classList.contains('checked')) {
      if (square.classList.contains('flag')) {
        square.classList.remove('flag');
        square.innerHTML = '';
        flagsCount--;
        flagsLeft.innerHTML = bombCount - flagsCount;
        return;
      }

      if (flagsCount < bombCount) {
        square.classList.add('flag');
        square.innerHTML = ' 🚩';
        flagsCount++;
        flagsLeft.innerHTML = bombCount - flagsCount;
        checkForWin();
      }
    }
  }

  // Click on square actions
  function click(square) {
    if (isGameOver || square.classList.contains('checked') || square.classList.contains('flag')) {
      return;
    }

    let currentId = parseInt(square.id);

    if (gridMap.get(currentId) === true) {
      square.style.backgroundColor = 'red';
      gameOver(square);
    } else {
      let total = square.getAttribute('data');
      if (total != 0) {
        square.classList.add('checked');
        square.innerHTML = total;
      } else {
        checkSquare(currentId); //if there are no surrounding bombs, we continue to check the neighbours
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

    }, 0);
  }

  function clickNewSquare(newId) {
    let newSquare = document.getElementById(newId);
    click(newSquare);
  }

  //game over
  function gameOver() {
    result.innerHTML = 'BOOM! Game Over!';
    startButton.innerHTML = '&#128577';
    isGameOver = true;
    stopCount();

    //show ALL the bombs
    squares.forEach(square => {
      if (gridMap.get(parseInt(square.id)) === true) {
        square.innerHTML = '💣';
        square.classList.add('checked');
      }

      if (square.classList.contains('flag') && gridMap.get(parseInt(square.id)) === true) {
        square.classList.add('crossed');
      }
    });
  }

  //check for win
  function checkForWin() {
    let matches = squares.filter((item, index) => item.classList.contains('flag') && gridMap.get(index) === true);

    if (matches.length === bombCount) {
      result.innerHTML = 'YOU WIN!';
      isGameOver = true;
      stopCount();
    }
  }

  startButton.addEventListener("click", () => {
    resetGame();
    createBoard();
  });

  function resetGame() {
    result.innerHTML = '';
    isGameOver = false;
    startButton.innerHTML = '&#128578';
    grid.innerHTML = '';
    squares = [];
    flagsCount = 0;
    stopCount(true);
    startCount();
  }

  let hour, minute, second = 0;
  let timer_is_on = 0;
  let counter = 0;

  function timedCount() {
    counter++;

    minute = counter >= 60 ? Math.floor(counter / 60) : minute;

    if (minute > 60) {
      hour = Math.floor(minute / 60);
      minute = minute % 60;
    }

    second = counter % 60;

    document.querySelector(".timer").innerHTML = `${ hour > 0 ? formatTime(hour) + ":" : ""}${formatTime(minute)}:${formatTime(second)}`;
    timer = setTimeout(timedCount, 1000);
  }

  function formatTime(value) {
    return value < 10 ? `0${value}` : `${value}`;
  }

  function startCount() {
    if (!timer_is_on) {
      timer_is_on = 1;
      resetTime();
      timedCount();
    }
  }

  function stopCount(isNewGame) {
    if (isNewGame) {
      document.querySelector(".timer").innerHTML = '';
    }

    clearTimeout(timer);
    resetTime();
    timer_is_on = 0;
  }

  function resetTime() {
    hour = 0;
    minute = 0;
    second = 0;
    counter = 0;
  }
});