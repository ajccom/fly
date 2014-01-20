var FB = {};

FB.preload = {
	path: 'img/',
	ok: false,
	p: 0,
	l: 0,
	imgArr: [],
	get: function () {
		this.jLoad = $('.loading');
		this.jNum = this.jLoad.find('span');
		this.l = this.imgArr.length;
	},
	setLoad: function (str) {
		var src = this.path + str,
			obj = new Image();
		obj.src = src;
		$(obj).on('load', function () {
			this.className = str.split('.')[0];
			$('.hide').append(this);//save img obj in DOM TREE that will be used when drawImage
			FB.preload.update();
		});
	},
	update: function (n) {
		var num = 0,
			c = ++this.p;
		num = (c / this.l) * 100;
		if (typeof n !== 'number') {}
		if (this.p === this.l || n == 100) {
			this.ok();
			return
		}
		n = n || num;
		this.jNum.html(n + '%');
	},
	ok: function () {
		this.jNum.html('100%');
		setTimeout(function () {
			FB.preload.jLoad.remove();
			FB.preload.ok = true;
			FB.preload.callback();
			$('body').addClass('ready');
		}, 500);
	},
	destroy: function () {
		delete FB.preload;
	},
	bind: function () {
		var arr = this.imgArr,
			l = this.l,
			i = 0;
		for (i; i < l; i++) {
			(function (str) {
				FB.preload.setLoad(str);
			})(arr[i]);
		}
		if (l === 0) {
			this.update(100);
		}
	},
	ini: function (arr, fn) {
		this.imgArr = arr || this.imgArr;
		this.callback = fn;
		this.get();
		this.bind();
	}
};

FB.unit = {
	canvasMap: {},
	_setSpirit: function () {
		this.spirit = function (x, y, w, h, img) {
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
			this.obj = null;//a object be used to delete itsself
			this.img = img;
			this.frameArr = [];
			this.currentFrame = 0;
			this.frameSpeed = 0;
			this.frameTimer = 0;
			this.update = function (arg) {
				var item;
				for (item in arg) {
					this[item] = arg[item];
				}
			};
			this.remove = function (arr) {
				arr = arr || this.arr;
				var i = 0,
					l = arr.length;
				for (i; i < l; i++) {
					if (arr[i] === this) {
						arr.splice(i, 1);
						FB.stage.entities[this.id] = null;
						delete FB.stage.entities[this.id];
						break;
					}
				}
			};
			this.draw = function (ctx) {
				ctx = ctx || this.ctx;
				ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
				if (this.img) {
					var xy = this.frameArr[this.currentFrame],
						l = this.frameArr.length;
					if (this.frameSpeed === 0 || this.frameTimer % this.frameSpeed === 0) {
						this.currentFrame = (this.currentFrame + 1) % l;
					}
					if (this.frameSpeed !== 0) {
						this.frameTimer++;
					}
					ctx.drawImage(this.img, xy[0], xy[1], this.w, this.h, this.x, this.y, this.w, this.h);
				} else {
					ctx.fillStyle = 'black';
					ctx.fillRect(this.x, this.y, this.w, this.h);
				}
			};
		};
	},
	_setBg: function () {
		this.bg = function (x, y) {
			this.name = 'bg';
			this.x = x;
			this.y = y;
			this.arr = FB.stage.bgArr;
			this.speed = 1;
			this.img = $('.bg')[0];
			this.frameArr = [[0, 0], [77, 0]];
			this.frameSpeed = 10;
			this.id = FB.stage.nextId;
			FB.stage.nextId++;
			if (FB.unit.canvasMap['bg']) {
				this.ctx = FB.unit.canvasMap['bg'];
			} else {
				var canvas = document.createElement('canvas');  
				canvas.width = FB.stage.canvas.width;
				canvas.height = FB.stage.canvas.height;
				FB.unit.canvasMap['bg'] = this.ctx = canvas.getContext('2d');
			}
			this.arr.push(this);
			
			this.draw = function (ctx) {
				ctx = ctx || this.ctx;
				if (this.img) {
					var xy = this.frameArr[this.currentFrame],
						l = this.frameArr.length;
					if (this.frameSpeed === 0 || this.frameTimer % this.frameSpeed === 0) {
						this.currentFrame = (this.currentFrame + 1) % l;
					}
					if (this.frameSpeed !== 0) {
						this.frameTimer++;
					}
					ctx.drawImage(this.img, xy[0], xy[1], this.w, this.h, this.x, this.y, this.w, this.h);
				} else {
					ctx.fillStyle = '#999999';
					ctx.fillRect(this.x, this.y, this.w, this.h);
				}
			};
		};
		this.bg.prototype = new this.spirit(0, 0, 77, 48);
	},
	_setPlayer: function () {
		this.player = function (x, y) {
			this.name = 'fly';
			this.x = x;
			this.y = y;
			this.arr = FB.stage.playerArr;
			this.speed = 8;
			this.img = $('.player')[0];
			this.frameArr = [[0, 0], [60, 0]];
			this.frameSpeed = 4;
			this.maxBulletNum = 1;
			this.bulletWaitTimer = 0;
			this.bulletDuring = 5;
			this.id = FB.stage.nextId;
			FB.stage.nextId++;
			if (FB.unit.canvasMap['player']) {
				this.ctx = FB.unit.canvasMap['player'];
			} else {
				var canvas = document.createElement('canvas');  
				canvas.width = FB.stage.canvas.width;
				canvas.height = FB.stage.canvas.height;
				FB.unit.canvasMap['player'] = this.ctx = canvas.getContext('2d');
			}
			this.arr.push(this);
			this.dead = function () {
				alert('dead');
				location.reload();
			};
		};
		this.player.prototype = new this.spirit(0, 0, 60, 60);
	},
	_setEnemy: function () {
		this.enemy = function (x, y) {
			this.name = 'enemy';
			this.x = x;
			this.y = y;
			this.arr = FB.stage.enemyArr;
			this.speed = 2;
			this.score = 1000;
			this.img = $('.enemy')[0];
			this.frameArr = [[0, 0]];
			this.frameSpeed = 0;
			this.id = FB.stage.nextId;
			FB.stage.nextId++;
			if (FB.unit.canvasMap['enemy']) {
				this.ctx = FB.unit.canvasMap['enemy'];
			} else {
				var canvas = document.createElement('canvas');  
				canvas.width = FB.stage.canvas.width;
				canvas.height = FB.stage.canvas.height;
				FB.unit.canvasMap['enemy'] = this.ctx = canvas.getContext('2d');
			}
			this.arr.push(this);
			
			this.draw = function (ctx) {
				ctx = ctx || this.ctx;
				if (this.img) {
					var xy = this.frameArr[this.currentFrame],
						l = this.frameArr.length;
					if (this.frameSpeed === 0 || this.frameTimer % this.frameSpeed === 0) {
						this.currentFrame = (this.currentFrame + 1) % l;
					}
					if (this.frameSpeed !== 0) {
						this.frameTimer++;
					}
					ctx.drawImage(this.img, xy[0], xy[1], this.w, this.h, this.x, this.y, this.w, this.h);
				} else {
					ctx.fillStyle = 'black';
					ctx.fillRect(this.x, this.y, this.w, this.h);
				}
			};
		};
		this.enemy.prototype = new this.spirit(0, 0, 40, 91);
		this.enemy.prototype.fired = function () {
			var s = this.score;
			FB.stage.updateScore(s);
			FB.stage.entities[FB.stage.nextId] = new FB.unit.effect(this.x + this.w / 2 - 30, this.y + this.h / 2 - 28);
			this.remove();
		};
	},
	_setBullet: function () {
		this.bullet = function (x, y) {
			this.name = 'bullet';
			this.x = x;
			this.y = y;
			this.arr = FB.stage.bulletArr;
			this.speed = 15;
			this.rotate = 0;
			this.img = $('.bullet')[0];
			this.frameArr = [[0, 0], [22, 0], [44, 0], [66, 0], [88, 0], [110, 0], [132, 0], [154, 0]];
			this.frameSpeed = 1;
			this.id = FB.stage.nextId;
			FB.stage.nextId++;
			if (FB.unit.canvasMap['bullet']) {
				this.ctx = FB.unit.canvasMap['bullet'];
			} else {
				var canvas = document.createElement('canvas');  
				canvas.width = FB.stage.canvas.width;
				canvas.height = FB.stage.canvas.height;
				FB.unit.canvasMap['bullet'] = this.ctx = canvas.getContext('2d');
			}
			this.arr.push(this);
			
			this.draw = function (ctx) {
				ctx = ctx || this.ctx;
				if (this.img) {
					var xy = this.frameArr[this.currentFrame],
						l = this.frameArr.length;
					if (this.frameSpeed === 0 || this.frameTimer % this.frameSpeed === 0) {
						this.currentFrame = (this.currentFrame + 1) % l;
					}
					if (this.frameSpeed !== 0) {
						this.frameTimer++;
					}
					ctx.drawImage(this.img, xy[0], xy[1], this.w, this.h, this.x, this.y, this.w, this.h);
				} else {
					ctx.fillStyle = 'black';
					ctx.fillRect(this.x, this.y, this.w, this.h);
				}
			};
		};
		this.bullet.prototype = new this.spirit(0, 0, 22, 24);
	},
	_setEffect: function () {
		this.effect = function (x, y) {
			this.name = 'effect';
			this.x = x;
			this.y = y;
			this.arr = FB.stage.effectArr;
			this.speed = 1;
			this.img = $('.boom1')[0];
			this.frameArr = [[0, 0], [60, 0], [120, 0], [180, 0], [240, 0]];
			this.frameSpeed = 2;
			this.id = FB.stage.nextId;
			FB.stage.nextId++;
			if (FB.unit.canvasMap['effect']) {
				this.ctx = FB.unit.canvasMap['effect'];
			} else {
				var canvas = document.createElement('canvas');  
				canvas.width = FB.stage.canvas.width;
				canvas.height = FB.stage.canvas.height;
				FB.unit.canvasMap['effect'] = this.ctx = canvas.getContext('2d');
			}
			this.arr.push(this);
			
			this.draw = function (ctx) {
				ctx = ctx || this.ctx;
				if (this.img) {
					var xy = this.frameArr[this.currentFrame],
						l = this.frameArr.length;
					if (this.frameSpeed === 0 || this.frameTimer % this.frameSpeed === 0) {
						this.currentFrame = (this.currentFrame + 1) % l;
					}
					if (this.frameSpeed !== 0) {
						this.frameTimer++;
					}
					ctx.drawImage(this.img, xy[0], xy[1], this.w, this.h, this.x, this.y, this.w, this.h);
				} else {
					return;
					ctx.fillStyle = 'black';
					ctx.fillRect(this.x, this.y, this.w, this.h);
				}
			};
		};
		this.effect.prototype = new this.spirit(0, 0, 60, 56);
	},
	ini: function () {
		this._setSpirit();
		this._setBg();
		this._setPlayer();
		this._setEnemy();
		this._setBullet();
		this._setEffect();
	}
};

FB.stage = {
	fps: 20,
	score: 0,
	bgArr: [],
	bulletArr: [],
	enemyArr: [],
	playerArr: [],
	bossArr: [],
	effectArr: [],
	giftArr: [],
	bgTimer: 0,
	enemyTimer: 0,
	entities: {},
	nextId: 0,
	drawBg: function () {
		var arr = this.bgArr,
			i = 0,
			l = arr.length,
			temp = null,
			bgCtx = FB.unit.canvasMap['bg'],
			ctx = this.ctx;
		bgCtx.clearRect(0, 0, bgCtx.canvas.width, bgCtx.canvas.height);
		for (i; i < l; i++) {
			temp = arr[i];
			var y = temp.y + temp.speed;
			if (y <= 450) {
				temp.update({
					y: y
				});
				temp.draw();
			} else {
				temp.remove();
				i--;
				l--;
			}
		}
		ctx.drawImage(bgCtx.canvas, 0, 0);
	},
	drawBullet: function () {
		var arr = this.bulletArr,
			i = 0,
			l = arr.length,
			temp = null,
			bulletCtx = FB.unit.canvasMap['bullet'],
			ctx = this.ctx;
		bulletCtx.clearRect(0, 0, bulletCtx.canvas.width, bulletCtx.canvas.height);
		for (i; i < l; i++) {
			temp = arr[i];
			var y = temp.y - temp.speed;
			if (y > 0) {
				temp.update({
					y: y,
					rotate: (temp.rotate + 10) % 360
				});
				temp.draw();
			} else {
				temp.remove();
				i--;
				l--;
			}
		}
		ctx.drawImage(bulletCtx.canvas, 0, 0);
	},
	drawEnemy: function () {
		var arr = this.enemyArr,
			i = 0,
			l = arr.length,
			temp = null,
			enemyCtx = FB.unit.canvasMap['enemy'],
			ctx = this.ctx;
		enemyCtx.clearRect(0, 0, enemyCtx.canvas.width, enemyCtx.canvas.height);
		for (i; i < l; i++) {
			temp = arr[i];
			var y = temp.y + temp.speed;
			if (y <= 450) {
				temp.update({
					y: y
				});
				temp.draw();
			} else {
				temp.remove();
				i--;
				l--;
			}
		}
		ctx.drawImage(enemyCtx.canvas, 0, 0);
	},
	drawPlayer: function () {
		if (!this.currentPlayer) {this.currentPlayer = new FB.unit.player(this.canvas.width / 2 - 5, this.canvas.height - 60);}
		var x = this.currentPlayer.x,
			y = this.currentPlayer.y,
			w = this.currentPlayer.w,
			a = 0,
			speed = this.currentPlayer.speed,
			dir = this.playerDir,
			cw = this.canvas.width;
		if (dir) {
			a = dir === 'l' ? (-1 * speed) : speed;
		}
		x = x + a;
		x = x < 0 ? 0 : x;
		x = (x + w) > cw ? (cw - w) : x;
		this.currentPlayer.update({
			x: x
		});
		this.currentPlayer.draw();
		this.ctx.drawImage(FB.unit.canvasMap['player'].canvas, 0, 0);
		
		//player's bullet
		if (this.currentPlayer) {
			if (this.bulletArr.length < this.currentPlayer.maxBulletNum) {
				var p = this.currentPlayer;
				if (!p.bulletWaitTimer) {
					this.entities[this.nextId] = new FB.unit.bullet(p.x + p.w / 2 - 15, p.y - 20);//bullet height is 20
					p.bulletWaitTimer = p.bulletDuring;
				}
				p.bulletWaitTimer--;
			} else {
				this.currentPlayer.bulletWaitTimer = 0;
			}
		}
	},
	drawBoss: function () {
	
	},
	drawEffect: function () {
		var arr = this.effectArr,
			i = 0,
			l = arr.length,
			temp = null,
			effectCtx = FB.unit.canvasMap['effect'],
			ctx = this.ctx;
		if (!effectCtx) {return}
		effectCtx.clearRect(0, 0, effectCtx.canvas.width, effectCtx.canvas.height);
		for (i; i < l; i++) {
			temp = arr[i];
			var y = temp.y + temp.speed;
			temp.update({
				y: y
			});
			if (temp.currentFrame + 1 < temp.frameArr.length) {
				temp.draw();
			} else {
				temp.remove();
				i--;
				l--;
			}
		}
		ctx.drawImage(effectCtx.canvas, 0, 0);
	},
	drawGift: function () {
	
	},
	checkCollide: function () {
		var p = this.currentPlayer,
			px = p.x + 10,
			py = p.y + 10,
			pw = p.w,
			ph = p.h,
			enemys = this.enemyArr,
			bullets = this.bulletArr,
			px2 = px + pw - 20,
			py2 = py + ph - 20;
		
		//check if enemys are collide width player or bullets
		var i = 0,
			j = 0,
			el = enemys.length,
			bl = bullets.length,
			temp = null,
			tempBullet = null;
		for (i; i < el; i++) {
			temp = enemys[i];
			//player
			if (this.collide(px, py, px2, py2, temp.x, temp.y, temp.x + temp.w, temp.y + temp.h)) {
				p.dead();
				break;
			}
			//bullets
			for (j = 0; j < bl; j++) {
				tempBullet = bullets[j];
				if (this.collide(tempBullet.x, tempBullet.y, tempBullet.x + tempBullet.w, tempBullet.y + tempBullet.h, temp.x, temp.y, temp.x + temp.w, temp.y + temp.h)) {
					temp.fired();
					tempBullet.remove();
					j = j - 1;
					bl = bl - 1;
					i = i - 1;
					el = el - 1;
				}
			}
		}
	},
	collide: function (x1, y1, x2, y2, x3, y3, x4, y4) {
		if (x3 >= x2 || y3 >= y2 || x4 <= x1 || y4 <= y1) {
			return false;
		} else {
			return true;
		}
	},
	updateScore: function (s) {
		var o = this.score;
		this.score = o + s;
		this.jScore.html(this.score);
	},
	appendBg: function () {
		if (this.bgArr.length < 5 ) {
			if (this.bgTimer === 0) {
				var temp = this.entities[this.nextId] = new FB.unit.bg(0, -50);
				temp.update({
					x: Math.random() * (320 - temp.w)
				});
				this.bgTimer = parseInt(50 + Math.random() * 40);
			}
			this.bgTimer--;
			
		}
	},
	appendEnemy: function () {
		if (this.enemyTimer === 0) {
			var temp = this.entities[this.nextId] = new FB.unit.enemy(0, -50);
			temp.update({
				x: Math.random() * (320 - temp.w)
			});
			this.enemyTimer = parseInt(20 + Math.random() * 40);
		}
		this.enemyTimer--;
	},
	_ini: function () {
		var w = $('.body').width(),
			h = $('html').height();
		this.jScore = $('.score');
		this.canvas = document.getElementById('canvas');
		this.canvas.width = w;
		this.canvas.height = h > 480 ? 480 : h;
		this.ctx = this.canvas.getContext('2d');
	},
	draw: function () {
		this.ctx.clearRect(0, 0, canvas.width, canvas.height);
		this.appendBg();
		this.appendEnemy();
		this.drawBg();
		this.drawEnemy();
		this.drawPlayer();
		this.drawBullet();
		this.drawBoss();
		this.drawEffect();
		this.drawGift();
		this.checkCollide();
		this.gameTimer = setTimeout(function () {
			FB.stage.draw();
		}, 1000 / this.fps);
	},
	pause: function () {
		clearTimeout(this.gameTimer);
	},
	bind: function () {
		$('.left').on(D1.event.touch, function () {
			FB.stage.playerDir = 'l';
		});
		$('.right').on(D1.event.touch, function () {
			FB.stage.playerDir = 'r';
		});
		$('.left').on(D1.event.end, function () {
			FB.stage.playerDir = '';
		});
		$('.right').on(D1.event.end, function () {
			FB.stage.playerDir = '';
		});
		$('.pause').on(D1.event.end, function () {
			var s = $(this);
			if (s.hasClass('stop')) {
				FB.stage.draw();
				s.removeClass('stop');
			} else {
				FB.stage.pause();
				s.addClass('stop');
			}
		});
	},
	ini: function () {
		this._ini();
		this.draw();
		this.bind();
	}
};

FB.ini = function () {
	FB.preload.ini(['player.png', 'bg.png', 'enemy.png', 'bullet.png', 'boom1.png'], function () {
		FB.unit.ini();
		FB.stage.ini();
		FB.preload.destroy();
	});
};

$(function () {
	FB.ini();
});