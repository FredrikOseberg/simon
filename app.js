'use strict';

import './css/style.css';

// DOM nodes
var tiles = document.querySelectorAll('.tiles');
var stepDisplay = document.querySelector('.count');
var startBtn = document.querySelector('.start');
var strictBtn = document.querySelector('.strict');
var resetBtn = document.querySelector('.reset');
var countDisplay = document.querySelector('.count-input');


var handlerCtrl = {
	handleTileClick: function(e) {
		if (gameCtrl.playerTurn) {
			const domNode = e.target;
			const tileName = e.target.dataset.target;
			UICtrl.flashTile(domNode, tileName);
			gameCtrl.playerSequence.push(tileName);
			gameCtrl.matchSequence();
		}
	},
	handleStartBtnClick: function() {
		if (gameCtrl.gameRunning) { return; }
		gameCtrl.startGame();
	},
	handleStrictBtnClick: function() {
		gameCtrl.toggleStrict();
	},
	handleResetBtnClick: function() {
		gameCtrl.reset();
	}
};

var UICtrl = {
	renderSteps: function(count) {
		countDisplay.textContent = count;
	},
	renderWin: function() {
		countDisplay.textContent = 'Win';
		countDisplay.style.color = 'green';
		setTimeout(() => {
			countDisplay.textContent = '';
			countDisplay.style.color = 'red';
		}, 1000);
	},
	renderLoss: function() {
		countDisplay.textContent = 'Loss';
		setTimeout(() => {
			countDisplay.textContent = '';
		}, 1000);
	},
	flashTile: function(domNode, tileName) {
		const tile = domNode;
		const sound = document.querySelector(`.${tileName} audio`);
		const activeClass = `${tileName}-active`;
		domNode.classList.add(activeClass);
		sound.play();
		setTimeout(function removeActiveClass() {
			domNode.classList.remove(activeClass);
		}, 500);
	},
	toggleStrict: function(strictMode) {
		const strictLight = document.querySelector('.strict-active');
		if (strictMode) {
			strictLight.classList.add('strict-active-light');
		} else {
			strictLight.classList.remove('strict-active-light');
		}
	},
	displayError: function() {
		countDisplay.textContent = "E"
		setTimeout(function resetToCount() {
			UICtrl.renderSteps(gameCtrl.count);
		}, 1500);
	}
};

var gameCtrl = {
	sequenceOptions: ['yellow', 'blue', 'red', 'green'],
	sequence: [],
	playerSequence: [],
	winningScore: 20,
	playerTurn: false,
	gameRunning: false,
	count: 0,
	strict: false,
	gameOver: false,
	startGame: function() {
		this.gameRunning = true;
		const countEqualTo20 = this.count === this.winningScore;
		if (countEqualTo20) { return; }

		this.createSequence();
		setTimeout(() => {
			this.updateCount();
		}, 1000);
		this.runSequence();
	},
	updateCount: function() {
		this.count += 1;
		UICtrl.renderSteps(this.count);
	},
	toggleStrict: function() {
		const gameIsNotRunning = this.gameRunning === false;
		if (gameIsNotRunning) {
			this.strict = !this.strict;
			UICtrl.toggleStrict(this.strict);
		}
	},
	createSequence: function() {
		const tile = this.pickRandomTile();
		this.sequence.push(tile);
	},
	pickRandomTile: function() {
		var index = Math.floor(Math.random() * 4);
		var tileName = this.sequenceOptions[index];
		return tileName;
	},
	runSequence: function() {
		if (this.gameOver === true) { return; }
		let index = 0;
		const interval = setInterval(() => {
			const indexIsLessThanSequence = index <= this.sequence.length - 1;
			if (indexIsLessThanSequence) {
				const tile = this.sequence[index];
				const domNode = document.querySelector(`.${tile}`);
				UICtrl.flashTile(domNode, tile);
				index += 1;
			} else {
				this.playerTurn = true;
				clearInterval(interval);
			}
		}, 1000);
	},
	matchSequence: function() {
		const equal = this.playerSequence.every(function match(tile, index) {
			return tile === this.sequence[index];
		}.bind(this));

		const sequencesMatchLength = this.sequence.length === this.playerSequence.length;
		const countIsWinningScore = this.count === this.winningScore;
		if (equal && sequencesMatchLength && countIsWinningScore) {
			this.gameOver = true;
			setTimeout(() => {
				UICtrl.renderWin();
			}, 1000);
			setTimeout(() => {
				this.restartGame(this.strict);
			}, 2000);
		} else if (equal && sequencesMatchLength) {
			this.playerTurn = false;
			this.playerSequence = [];
			setTimeout(function startComputerTurn() {
				this.startGame();
			}.bind(this), 1000);
		} else if (!equal) {
			if (this.strict) {
				UICtrl.displayError();
				setTimeout(() => {
					UICtrl.renderLoss();
				}, 1500);
				setTimeout(() => {
					this.restartGame(this.strict);
				}, 2500);
			} else {
				this.handleError();
			}
		}
	},
	handleError: function() {
		this.playerTurn = false;
		UICtrl.displayError();
		this.playerSequence = [];

		setTimeout(function delayRun() {
			this.runSequence();
		}.bind(this), 2000);
	},
	gameOver: function() {
		this.reset();
		UICtrl.renderLoss();
	},
	reset: function(strictMode) {
		this.gameOver = false;
		this.sequence = [];
		this.playerSequence = [];
		this.playerTurn = false;
		this.count = 0;
		this.gameRunning = false;
		if (strictMode) {
			this.strict = true;
		} else {
			this.strict = false;
		}
		UICtrl.renderSteps("");
		UICtrl.toggleStrict(this.strict);
	},
	restartGame: function(strictMode = false) {
		this.reset(strictMode);
		this.startGame();
	},
};

tiles.forEach(function addEventListenerToTiles(tile) {
	tile.addEventListener('click', handlerCtrl.handleTileClick);
});

strictBtn.addEventListener('click', handlerCtrl.handleStrictBtnClick);
resetBtn.addEventListener('click', handlerCtrl.handleResetBtnClick);
startBtn.addEventListener('click', handlerCtrl.handleStartBtnClick);


