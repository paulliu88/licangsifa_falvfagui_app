(function($) {
	//全局配置(通常所有页面引用该配置，特殊页面使用mui.init({})来覆盖全局配置)
	$.initGlobal({
		swipeBack: true
	});
	var oldBack = $.back;
	$.back = function() {
		var current = plus.webview.currentWebview();
		if (current.mType === 'main') { //模板主页面
			current.hide('auto');
			//			var cc = current.children()[0];
			//			plus.webview.close(current);
			setTimeout(function() {
				document.getElementById("title").className = 'mui-title mui-fadeout';
				current.children()[0].hide("none");
				//				plus.webview.close(cc)
			}, 200);
		} else if (current.mType === 'sub') {
			if ($.targets._popover) {
				$($.targets._popover).popover('hide');
			} else {
				current.parent().evalJS('sub : mui.back();');
			}
		} else {
			oldBack();
		}
	}
})(mui);

/**
 * toggle
 */
window.addEventListener('toggle', function(event) {
	if (event.target.id === 'M_Toggle') {
		var isActive = event.detail.isActive;
		var table = document.querySelector('.mui-table-view');
		var card = document.querySelector('.mui-card');
		if (isActive) {
			card.appendChild(table);
			card.style.display = '';
		} else {
			var content = document.querySelector('.mui-content');
			content.insertBefore(table, card);
			card.style.display = 'none';
		}
	}
});

mui.init({
	swipeBack: false,
	keyEventBind: {
		backbutton: true
	}
});

/**
 * 生成js模板
 * @param {Object} templateStr
 * @param {Object} data
 */
function render(templateStr, data) {
	return templateStr.replace(/\{([\w\.]*)\}/g, function(str, key) {
		var keys = key.split("."),
			v = data[keys.shift()];
		for (var i = 0, l = keys.length; i < l; i++)
			v = v[keys[i]];
		return (typeof v !== "undefined" && v !== null) ? v : "";
	});
}

/**
 * 判断用户是否登录，已经登录执行succeFunc，未登录执行 failedFunc
 * @param {Object} successFunc
 * @param {Object} failedFunc
 */
function alreadyLogin(successFunc, failedFunc) {
	var isAlreadyLogin = window.localStorage.getItem('isAlreadyLogin');
	if (isAlreadyLogin == "true") {
		successFunc();
	} else {
		failedFunc();
	}
}

function getAvaliableTime() {
	//可用总时长（分钟）
	var avaliableTime = window.localStorage.getItem('availableTime');
	avaliableTime = avaliableTime == 'undefined' ? 0 + "" : avaliableTime;
	return avaliableTime;
}

function getRemainTime() {
	//已用总时长（秒）
	var remainTime = window.localStorage.getItem('remainTime');
	if (!remainTime) {
		remainTime = 0;
	} else {
		remainTime = Math.round(parseInt(remainTime) / 60);
	}
	return remainTime;
}

/**
 * 更新用户的所有信息到本地，主要是可以使用 的时长信息
 */
function updateUserInfoToLocal() {
	mui.ajax(Routes.urls.user.getUserInfo, {
		data: {
			phone: window.localStorage.getItem("phone"),
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'post', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		success: function(data) {
			if (data) {
				window.localStorage.setItem('userId', data.id);
				window.localStorage.setItem('idcard', data.idcard)
				window.localStorage.setItem('username', data.username);
				window.localStorage.setItem('availableTime', data.availableTime);

				//				try {
				window.localStorage.setItem('new_update_date', data.updatetimeInt);
				var oldUpdateDate = window.localStorage.getItem('old_update_date');
				oldUpdateDate = oldUpdateDate ? oldUpdateDate : 0;
				if (oldUpdateDate < data.updatetimeInt) {
					var msg = {
						title: '课时授权提醒',
						content: '您的收费内容可用课时是' + getAvaliableTime() + '分钟<br/>已用总时长是' + getRemainTime() + '分钟。'
					};
					//					saveMessage(msg);
					var message = '您的授权课时已更新';
					//					mui.toast(message);
					//						mui.openWindow({
					//							id: "msg-center-win",
					//							url: "app/msg-center.html",
					//							waiting: {
					//								autoShow: true
					//							}
					//						});
					window.localStorage.setItem('old_update_date', data.updatetimeInt);
				}
				//				} catch (e) {
				//					console.error(JSON.stringify(e))
				//				}

				if (data.availableTime > data.remainTime) {
					window.localStorage.removeItem("__cant_see");
					window.localStorage.setItem('remainTime', data.remainTime * 60);
				}

				// 每格一秒进行记录一次
				window._mySecondInter = window.setInterval(function() {
					if (window.__pauseOrResume) return;
					//					if(window.___cant_use ==1 )return;
					var remainTime = window.localStorage.getItem('remainTime');
					if (remainTime == null) {
						window.localStorage.setItem('remainTime', "0");
						remainTime = window.localStorage.getItem('remainTime');
					}
					var intRemainTime = parseInt(remainTime);
					intRemainTime += 1;
					window.localStorage.setItem('remainTime', intRemainTime);

					var availableTime = window.localStorage.getItem('availableTime');
					var intAvailableTime = (parseInt(availableTime) * 60);
					if (intAvailableTime - intRemainTime < 0) {
						//						console.log('使用时间(' + intRemainTime + ')已超出购买的时间（' + availableTime + '），请先续费')
						window.___cant_use = 1;
						window.localStorage.setItem("__cant_see", 1);
						//						window.clearInterval(window._mySecondInter);
					} else {
						//						console.log('可以继续使用此app了');
						window.___cant_use = 0;
						window.localStorage.removeItem("__cant_see");
					}
				}, 1000);

				// 每隔一分钟同步一次使用时间到服务器
				window._myMinutesInter = window.setInterval(function() {
					if (window.__pauseOrResume) return;
					var remainTime = window.localStorage.getItem('remainTime');
					var intRemainTime = parseInt(remainTime);

					var availableTime = window.localStorage.getItem('availableTime');
					var intAvailableTime = (parseInt(availableTime) * 60);

					if (intRemainTime - intAvailableTime >= 0) {
						//						console.log('使用时间(' + intRemainTime + ')已超出购买的时间（' + intAvailableTime + '），请先续费')
						window.___cant_use = 1;
						window.localStorage.setItem("__cant_see", 1);
						window.clearInterval(window._myMinutesInter);
						if (window.___cant_use) {
							mui.openWindow({
								id: "cant-user-win",
								url: "app/cant-user.html",
								waiting: {
									autoShow: true
								}
							});
						}
						return;
					}

					mui.ajax(Routes.urls.user.updateUserRemainTime, {
						data: {
							phone: window.localStorage.getItem("phone"),
							userTime: Math.round(intRemainTime / 60)
						},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 10000, //超时时间设置为10秒；
						success: function(data) {
							//							if(data){
							//								window.localStorage.setItem('availableTime', data.availableTime);
							//								if (data.availableTime > data.remainTime) {
							//									window.localStorage.removeItem("__cant_see");
							//									window.localStorage.setItem('remainTime', data.remainTime * 60);
							//								}
							//							}
							//							console.log('------------------------------------------->更新服务器累计使用的时间成功！' + intRemainTime);
						},
						error: function() {
							//							console.log('------------------------------------------->网络异常，下次联网后再同步时间到服务器！' + intRemainTime);
						}
					});
				}, 60000);
			}
		},
		error: function() {
			//			alert('')
		}
	});
}

/**
 * 此app被切入后台运行事件的监听
 */
document.addEventListener("pause", function() {
	//	window.clearInterval(window._mySecondInter);
	//	window.clearInterval(window._myMinutesInter);
	window.__pauseOrResume = true;
	//	console.log('已终止使用时间的记录');
}, true);

document.addEventListener("resume", function() {
	window.__pauseOrResume = false;
	//	console.log('已继续使用时间的记录');
}, true);

/**
 * 检查当前网络连接状态
 * 当前设备网络连接状态未知、未连接网络，提示网络异常，请检查，同时返回false
 */
function toastNetworkInfo(msg) {
	var b = true;
	var network = plus.networkinfo.getCurrentType();
	if (network == 1 || network == 0) {
		if (msg) {
			mui.toast(msg);
		}
		b = false;
	}
	return b;
}
