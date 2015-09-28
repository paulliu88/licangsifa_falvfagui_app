/**
 *
 */

(function(win) {
	
	// off on ,开关
	var switchFlag = 'off';

	function appendToHead(initialScale, maximumScala) {
		if(switchFlag == 'off')return;
		var meta = document.createElement('meta');
		meta.setAttribute('name', 'viewport');
		meta.setAttribute('content', 'width=device-width,initial-scale=' + initialScale + ', maximum-scale=' + maximumScala + ', user-scalable=no');
		document.head.appendChild(meta);
	}

	var Scale = {
		_key: '__WOSHICHENJIE',
		maxScale: 5,
		minScale: 0.5,
		step: 0.2,
		getOrElse: function() {
			var scale = win.localStorage.getItem(this._key);
			if (!scale) {
				window.localStorage.setItem(this._key, 1);
			}
			return scale == null ? 1 :parseInt(scale);
		},
		saveOrElse: function(scale) {
			var scale = win.localStorage.getItem(this._key);
			if (!scale) {
				win.localStorage.setItem(this._key, 1);
			}
			win.localStorage.setItem(this._key, scale);
			return scale;
		},
		init: function() {
			var scale = this.getOrElse();
			if (scale > this.maxScale) scale = this.maxScale;
			if (scale < this.minScale) sclae = this.minScale;
			appendToHead(scale, this.maxScale);
		},
		zoom: function(scale) {
			win.localStorage.setItem(this.this._key, scale);
			this.init();
		},
		zoomIn: function() {
			var scale = this.getOrElse();
			scale = parseInt(scale) - this.step;
			this.saveOrElse();
			this.init();
		},
		zoomOut: function() {
			var scale = this.getOrElse();
			scale = parseInt(scale) + this.step;
			this.saveOrElse();
			this.init();
		},
		saveScale: function(scale) {
			win.localStorage.setItem(this._key, scale);
		}
	};

	win.Scale = Scale;

	Scale.init();

})(window);