var FB = {};

FB.preload = {
	imgPath: 'img/',
	audioPath: 'audio/',
	ok: false,
	p: 0,
	l: 0,
	loadArr: [],
	get: function () {
		this.jLoad = $('.loading');
		this.jNum = this.jLoad.find('span');
		this.l = this.loadArr.length;
	},
	setLoad: function (str) {
		var isImage = /\.gif$|\.png$|\.jpg$|\.bmp$/.test(str),
			path = isImage ? this.imgPath : this.audioPath,
			src = path + str,
			obj = isImage ? new Image() : new Audio();
		obj.src = src;
		$(obj).on(isImage ? 'load' : 'canplaythrough', function () {
			this.className = str.split('.')[0];
			$('.hide').append(this);//save img obj in DOM TREE that will be used when drawImage
			FB.preload.update();
			$(this).off('canplaythrough');
		});
	},
	update: function (n) {
		var num = 0,
			c = ++this.p;
		num = parseInt((c / this.l) * 100);
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
		var arr = this.loadArr,
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
		this.loadArr = arr || this.loadArr;
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
			this.speed = 50;//50px pre second
			this.img = $('.bg')[0];
			this.frameArr = [[0, 0], [77, 0]];
			this.frameSpeed = 60;//60fps
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
			this.speed = 150;
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
				FB.unit.audio.audios['death'][0].play();
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
			this.speed = 80;
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
			FB.unit.audio.audios['break'][0].play();
			this.remove();
		};
	},
	_setBullet: function () {
		this.bullet = function (x, y) {
			this.name = 'bullet';
			this.x = x;
			this.y = y;
			this.arr = FB.stage.bulletArr;
			this.speed = 300;
			this.rotate = 0;
			this.img = $('.bullet')[0];
			this.frameArr = [[0, 0], [22, 0], [44, 0], [66, 0], [88, 0], [110, 0], [132, 0], [154, 0]];
			this.frameSpeed = 5;
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
			
			FB.unit.audio.audios['shot'][0].play();
			
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
			this.speed = 10;
			this.img = $('.boom1')[0];
			this.frameArr = [[0, 0], [60, 0], [120, 0], [180, 0], [240, 0]];
			this.frameSpeed = 5;
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
	_setGift: function () {
		this.gift = function (x, y) {
			this.name = 'gift';
			this.x = x;
			this.y = y;
			this.arr = FB.stage.giftArr;
			this.speed = 110;
			this.img = $('.gift')[0];
			this.frameArr = [[0, 0], [40, 0]];
			this.frameSpeed = 60;
			this.id = FB.stage.nextId;
			this.rad = Math.PI/2;
			this.score = 2000;
			FB.stage.nextId++;
			if (FB.unit.canvasMap['gift']) {
				this.ctx = FB.unit.canvasMap['gift'];
			} else {
				var canvas = document.createElement('canvas');  
				canvas.width = FB.stage.canvas.width;
				canvas.height = FB.stage.canvas.height;
				FB.unit.canvasMap['gift'] = this.ctx = canvas.getContext('2d');
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
			
			this.handle = function () {
				FB.stage.updateScore(this.score);
				if (FB.stage.currentPlayer) {
					var n = FB.stage.currentPlayer.maxBulletNum + 1;
					FB.stage.currentPlayer.maxBulletNum = n >= 3 ? 3 : n;
				}
				FB.unit.audio.audios['spawn'][0].play();
			}
		};
		this.gift.prototype = new this.spirit(0, 0, 40, 31);
	},
	_setAudio: function () {
		this.audio = {
			audios: {}
		};
		var arr = $('audio'),
			i = 0,
			l = arr.length,
			temp = null;
		for (i; i < l; i++) {
			temp = arr.eq(i);
			temp[0].volume = 0.05;
			this.audio.audios[temp.attr('class')] = temp;
		}
		
		this.audio.setBgm = function (obj) {
			this.$bgm = obj || this.audios.bgm;
			this.$bgm.on('ended', function () {
				this.currentTime = 0;
				this.play();
			})[0].play();
		};
		
	},
	ini: function () {
		this._setSpirit();
		this._setBg();
		this._setPlayer();
		this._setEnemy();
		this._setBullet();
		this._setEffect();
		this._setGift();
		this._setAudio();
	}
};

FB.stage = {
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
	drawBg: function (t) {
		var arr = this.bgArr,
			i = 0,
			l = arr.length,
			temp = null,
			bgCtx = FB.unit.canvasMap['bg'],
			ctx = this.ctx;
		bgCtx.clearRect(0, 0, bgCtx.canvas.width, bgCtx.canvas.height);
		for (i; i < l; i++) {
			temp = arr[i];
			var y = temp.y + temp.speed * t / 1000;
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
	drawBullet: function (t) {
		var arr = this.bulletArr,
			i = 0,
			l = arr.length,
			temp = null,
			bulletCtx = FB.unit.canvasMap['bullet'],
			ctx = this.ctx;
		bulletCtx.clearRect(0, 0, bulletCtx.canvas.width, bulletCtx.canvas.height);
		for (i; i < l; i++) {
			temp = arr[i];
			var y = temp.y - temp.speed * t / 1000;;
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
	drawEnemy: function (t) {
		var arr = this.enemyArr,
			i = 0,
			l = arr.length,
			temp = null,
			enemyCtx = FB.unit.canvasMap['enemy'],
			ctx = this.ctx;
		enemyCtx.clearRect(0, 0, enemyCtx.canvas.width, enemyCtx.canvas.height);
		for (i; i < l; i++) {
			temp = arr[i];
			var y = temp.y + temp.speed * t / 1000;
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
	drawPlayer: function (t) {
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
		x = x + a * t / 1000;
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
	drawEffect: function (t) {
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
			var y = temp.y + temp.speed * t / 1000;
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
	drawGift: function (t) {
		var arr = this.giftArr,
			i = 0,
			l = arr.length,
			temp = null,
			giftCtx = FB.unit.canvasMap['gift'],
			ctx = this.ctx;
		if (!giftCtx) {return}
		giftCtx.clearRect(0, 0, giftCtx.canvas.width, giftCtx.canvas.height);
		for (i; i < l; i++) {
			temp = arr[i];
			var y = temp.y + temp.speed * t / 1000,
				rad = temp.rad + Math.PI/60;
			if (y <= 450) {
				temp.update({
					y: y,
					rad: rad,
					x: temp.x + + temp.speed * t / 1000 * Math.cos(rad)
				});
				temp.draw();
			} else {
				temp.remove();
				i--;
				l--;
			}
		}
		ctx.drawImage(giftCtx.canvas, 0, 0);
	},
	checkCollide: function () {
		var p = this.currentPlayer,
			px = p.x + 10,
			py = p.y + 10,
			pw = p.w,
			ph = p.h,
			enemys = this.enemyArr,
			bullets = this.bulletArr,
			gifts = this.giftArr,
			px2 = px + pw - 20,
			py2 = py + ph - 20;
		
		//check if enemys are collide with player or bullets
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
					j--;
					bl--;
					i--;
					el--;
				}
			}
		}
		
		//check if gifts are collide with player
		var i = 0,
			gl = gifts.length,
			temp = null;
		for (i; i < gl; i++) {
			temp = gifts[i];
			if (this.collide(px, py, px2, py2, temp.x, temp.y, temp.x + temp.w, temp.y + temp.h)) {
				temp.handle();
				temp.remove();
				i--;
				gl--;
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
		
		if (this.score % 10000 === 0) {
			new FB.unit.gift(150, -50);
		}
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
			var temp = this.entities[this.nextId] = new FB.unit.enemy(0, -200);
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
	draw: function (t) {
		this.ctx.clearRect(0, 0, canvas.width, canvas.height);
		this.appendBg();
		this.appendEnemy();
		this.drawBg(t);
		this.drawEnemy(t);
		this.drawPlayer(t);
		this.drawBullet(t);
		this.drawBoss(t);
		this.drawEffect(t);
		this.drawGift(t);
		this.checkCollide();
		
	},
	run: function () {
		this.gameTimer = this.requestAFrame(function () {
			var t = FB.stage.ftpHandler.deltaTime || 0;
			FB.stage.ftpHandler.calculate();
			FB.stage.draw(t);
			FB.stage.run();
		});
	},
	pause: function () {
		this.cancelAFrame(this.gameTimer);
		FB.unit.audio.$bgm[0].pause();
	},
	requestAFrame: function (fn) {
        return (window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		setTimeout)(fn);
    },
	cancelAFrame: function (id) {
		return (window.cancelAnimationFrame ||
		window.webkitCancelAnimationFrame ||
		window.mozCancelAnimationFrame ||
		window.oCancelAnimationFrame ||
		clearTimeout)(id);
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
				FB.unit.audio.$bgm[0].play();
				s.removeClass('stop');
			} else {
				FB.stage.pause();
				s.addClass('stop');
			}
		});
	},	
	ftpHandler: {
		fps: 45,
		calculate: function (updateTime) {
			var t = +new Date(),
				fps = 0;
			updateTime = updateTime || 1000;
			if (!this.lastTime) {
				this.lastTime = t;
				this.deltaTime = 0;
			}
			if (!this.lastUpdateTime) {
				this.lastUpdateTime = t;
				return
			}
			this.deltaTime = t - this.lastTime;
			fps = 1000 / (this.deltaTime);
			this.lastTime = t;
			
			if (t - this.lastUpdateTime >= 1000) {
				//console.log(Math.ceil(fps));
				this.lastUpdateTime = t;
			}
		}
	},
	ini: function () {
		this._ini();
		FB.unit.audio.setBgm();
		this.run();
		this.bind();
		FB.unit.audio.$bgm[0].play();
	}
};

FB.ini = function () {
	FB.preload.ini(['player.png', 'bg.png', 'enemy.png', 'bullet.png', 'boom1.png', 'gift.png', 'break.mp3', 'death.mp3', 'shot.mp3', 'spawn.mp3', 'bgm.mp3'], function () {
		FB.unit.ini();
		FB.stage.ini();
		FB.preload.destroy();
	});
};

$(function () {
	FB.ini();
});

