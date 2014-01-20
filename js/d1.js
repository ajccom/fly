/*global D1, UI, $, $, escape, unescape */
/*jslint devel: true, browser: true, undef: true, sloppy: true, regexp: true, plusplus: true,
vars: true, nomen: true, white: true, maxlen: 160, indent: 4 */
////////////////////  D1 JavaScript Library  ////////////////////
//Global Variable
//$.noConflict();//del $ from $, now prototype is using it
var D1 = D1 || {};

//temp
D1.temp = D1.temp || {};

//config
D1.config = {debug: false};
D1.config.get = function (key) {
	return D1.str.isString(key) ? sessionStorage.getItem(key) || localStorage.getItem(key) : false;  //to be improved
};
D1.config.set = function (key, value, bSession) {
	if (D1.str.isString(key)) {
		(bSession ? sessionStorage : localStorage).setItem(key, '' + value);
	} else {
		return false;
	}
};
D1.config.del = function (key) {
	if (D1.str.isString(key) && key) {
		sessionStorage.removeItem(key);
		localStorage.removeItem(key);
	} else {
		return false;
	}
};

//user
D1.user = D1.user || {};

//console
D1.log = function (input) {
	if (!D1.config && !D1.config.debug && D1.url.query.indexOf('d1debug') <= -1) {return false; }
	if (window.console && !D1.mobileCheck) {
		console.log(input);
	} else {
		D1.debug.console((typeof input === 'string' ? input : Object.prototype.toString.call(input)), 'D1 LOG', '-');
	}
};

//string
D1.str = D1.str || {};
D1.str.cny = D1.str.rmb = '\xA5';  //'\xA5' means CNY (RMB) symbol.
D1.str.priceToNumber = function (s) {  //formats '[cny] 12,345.60' to 12345.6
	return s ? parseFloat(s.replace('\uffe5', '').replace(D1.str.cny, '').replace(/\,/g, '').replace(/\-\s+/, '-')) : 0;
	//'\uffe5' means [cny] in full-width chinese char
};
D1.str.numberToFullPrice = function (n) {  //formats 12345.6789 to '[cny] 12,345.68', -1234.567 to '- [cny] 1,234.57'
	return (n < 0 ? '- ' : '') + D1.str.cny + ' ' + Math.abs(n).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	//this regexp formats '1234.56' to '1,234.56', decimal point is necessary in source string
};
D1.str.numberToFullPriceHTML = function (n) {  //formats 12345.6789 to '[cny] 12,345.68'
	return [
		(n < 0 ? '- ' : ''),
		'<samp>',
			D1.str.cny,
		'<\/samp> ',
		'<span>',
			Math.abs(n).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'),
		'<\/span>'
	].join('');
	//the regexp formats '1234.56' to '1,234.56', decimal point is necessary in source string
};
D1.str.isString = function(s) {return Object.prototype.toString.call(s) === '[object String]'; };
D1.str.ifHas = function(sA, sB) {return (sA.indexOf(sB) > -1); };
D1.str.ifStartsWith = function(sA, sB) {return (sA.indexOf(sB) === 0); };
D1.str.isHash = function(s) {return D1.str.ifStartsWith(s, '#'); };
D1.str.replaceVar = function (sTemplate, sVar, s) {
	if (sTemplate && sVar && s && D1.str.ifHas(sTemplate, sVar)) {
		var a = sTemplate.split(sVar);
		var aOutput = [a[0], s, a[1]];
		return aOutput.join('');
	}
	return false;
};
D1.str.trimInner = function (s) {return s.replace(/\s{2,}/g, ' '); };
D1.str.capitalize = function (s) {return s.slice(0,1).toUpperCase() + s.slice(1).toLowerCase(); };

D1.str.reEmail = /^(?:[a-z\d]+[_\-\+\.]?)*[a-z\d]+@(?:([a-z\d]+\-?)*[a-z\d]+\.)+([a-z]{2,})+$/i;
D1.str.reMobile = /^1[358]\d{9}$/;
D1.str.rePostCode = /^\d{6}$/;
D1.str.escapeHTML = function (text) {
	var htmlLabel = {
		'<': '&lt;',
		'>': '&gt;'
	};
	return text.replace(/[<>]/g, function (match) {
		return htmlLabel[match];
	});
};

//url
D1.url = D1.url || {};
D1.url.isInFrame = window.self !== window.top;
D1.url.str = location.href;
D1.url.host = location.hostname.toLowerCase();  //without port number
if (D1.url.host === 'happybox.com' || D1.url.host === 'happybox.com') {
	D1.url.env = 'production';
} else if (D1.url.host === 'happybox.com') {
	D1.url.env = 'testing';
} else {
	D1.url.env = 'development';
}

D1.url.path = location.pathname;

D1.url.query = location.search.slice(1).replace(/&+$/, '');
D1.url.param = null;

D1.url.parseQuery = function(sQuery) {
	var data = {};
	if (sQuery) {
		var aQ = sQuery.split('&'), aP, sN, sV;
		$.each(aQ, function(i, n) {
			aP = n.split('=');
			sN = aP[0];
			sV = aP[1] || '';
			if (sN /** && sV **/) {  //add this comment to keep empty key
				data[decodeURIComponent(sN).toLowerCase()] = decodeURIComponent(sV);
			}
		});
	}
	return data;
};
D1.url.getParam = function (s) {  //API: var sCode = D1.url.getParam('prdcode');
	if (!D1.url.param) {
		D1.url.param = D1.url.parseQuery(D1.url.query);
	}
	return (s && typeof s === 'string') ? D1.url.param[s.toLowerCase()] : false;
};
D1.url.open = function (s) {
	if (s && typeof s === 'string') {
		window.open(s);
	} else {
		return false;
	}
};
D1.url.go = function (s) {
	if (s && typeof s === 'string') {
		window.location.href = s;
	} else {
		return false;
	}
};


//catch error 
(function () {
	D1.debug = {
		console: function (msg, url, line) {
			
			if (!this.box) {
				if (!document.body) {
					alert(msg + ' @:' + url + ' line:' + line);
				} else {
					this._create();
					this.console(msg, url, line);
				}
				return;
			}
			if (typeof msg !== 'undefined') {
				this.box.innerHTML += '<b>' + msg + '</b> @: ' + url + ' <em>line: ' + line + '</em><br />';
			}
		},
		_create: function () {
			var div = document.createElement('div');
			div.className = 'd1-debug';
			document.body.appendChild(div);
			this.box = div;
		},
		_console: function (msg, url, line) {
			D1.debug.console(msg, url, line);
		},
		_ini: function () {
			var that = this;
			window.onerror = this._console;
		},
		ini: function () {
			if (D1.config.debug || (D1.url.query.indexOf('d1debug') > -1)) {
				this._ini();
			}
		}
	};
}());
D1.debug.ini();

//ua
D1.ua = D1.ua || {};
D1.ua.str = navigator.userAgent;
D1.ua.isIE6 = !$.support.style && !D1.str.ifHas(D1.ua.str, 'MSIE 7');
D1.ua.isWebKit = D1.str.ifHas(D1.ua.str.toLowerCase(), 'webkit');

//cookie
D1.cookie = D1.cookie || {};
D1.cookie.set = function(sName, sValue, nLiveDays) {
	var sCookieDate = '';
	if (nLiveDays !== undefined) {
		var oDate = new Date();
		oDate.setDate(oDate.getDate() + nLiveDays);
		sCookieDate = ';expires=' + oDate.toGMTString();
	}
	document.cookie = sName + '=' + escape(sValue) + sCookieDate + ';path=/;domain=' + D1.url.rootDomain;
};
D1.cookie.get = function(sName) {
	var sCookie = document.cookie;
	var sValue = '';
	if (sCookie.length > 0) {
		var nStart = sCookie.indexOf(sName + '=');
		var nEnd;
		if (nStart > -1) {
			nStart = nStart + sName.length + 1;
			nEnd = sCookie.indexOf(';', nStart);
			if (nEnd < 0) {
				nEnd = sCookie.length;
			}
			sValue = unescape(sCookie.substring(nStart, nEnd));
		}
	}
	return sValue;
};
D1.cookie.del = function(sName) {
	var sV = D1.cookie.get(sName);
	if (sV) {
		D1.cookie.set(sName, 'null', -1);
	}
};


//tools
D1.tool = D1.tool || {};

(function(){
  var cache = {};
 
  D1.tool.tmpl = function tmpl(str, data){
   // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :
     
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
       
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
       
        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");
   
    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
}());

//dom
D1.dom = D1.dom || {};
D1.dom.jWin = $(window);
D1.dom.jDoc = $(document.documentElement);

//event
(function () {
	var ua = D1.ua.str;
	if (ua.match(/Android/i) || ua.match(/webOS/i) || ua.match(/iPhone/i) || ua.match(/iPad/i) || ua.match(/iPod/i) || ua.match(/BlackBerry/i) || ua.match(/Windows Phone/i)) {
		D1.mobileCheck = true;
	}
}());

D1.event = {
	touch: D1.mobileCheck ? 'touchstart' : 'mousedown',
	move: D1.mobileCheck ? 'touchmove' : 'mousemove',
	end: D1.mobileCheck ? 'touchend' : 'mouseup'
};


//errorReporter
D1.errorReporter = {
	show: function (arg, isSuccess) {
		isSuccess = isSuccess || 0;
		var obj = typeof arg === 'string' ? $('<p>' + arg + '</p>') : arg;
		if (isSuccess) {obj.addClass('success')}
		if (!this.box || !this.box[0]) {
			var div = document.createElement('div');
			div.setAttribute('class', 'd1-error-reporter');
			document.body.appendChild(div);
			this.box = $(div);
			if (!UI.isFixed) {
				new D1.jsFixed(this.box, 'top');
			}
		}
		
		this.box.removeClass('hide').append(obj).on(D1.event.touch, function () {
			var s = $(this);
			if (D1.errorReporter.timer) {clearTimeout(D1.errorReporter.timer);}
			if (!s.find('a')[0]) {
				D1.errorReporter.hide();
			}
		});
		
		if (this.timer) {clearTimeout(this.timer);}
		this.timer = setTimeout(function () {
			D1.errorReporter.hide();
		}, 5000);
	},
	hide: function (arg) {
		if (this.box && this.box[0]) {
			if (typeof arg === 'undefined') {
				this.box.addClass('hide').html('');
			} else {
				this.box.find(arg).remove();
				if (this.timer) {clearTimeout(this.timer);}
				this.timer = setTimeout(function () {
					D1.errorReporter.hide();
				}, 5000);
			}
		}
	}
};
