/**
 * 自动同步机制
 */
(function() {
	window.syncData = function() {
		var localDataStr = '';

		// 返回本地需要同步到后台的数据
		function getNeedLocalData(callback) {
			var localDataUpdateTime = window.localStorage.getItem('_local_data_update_time');
			if (!localDataUpdateTime) { //第一次更新数据
				queryAllCollect(function(d) {
					callback(d);
				});
			} else { //非第一次，仅仅查询本地数据大于更新时间后的数据
				queryNeedCollect(localDataUpdateTime, function(d) {
					callback(d);
				});
			}
		}

		// ajax请求保存数据 和 ajax请求拉数据
		function saveLocalToRemote(localDataStr, callback) {
			var idCard = window.localStorage.getItem('phone');
			var localDataUpdateTime = window.localStorage.getItem('_local_data_update_time');
			mui.ajax(Routes.urls.sync.saveAndLoad, {
				data: {
					idCard: idCard, //登录用户的id
					updateTimeStr: localDataUpdateTime ? localDataUpdateTime : '', //当前app获取到的时间
					dataStr: localDataStr //本app的收藏本和错题本中需要同步到后台的数据
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					if (data) {
						callback(data.date, data.data);
					}
				},
				error: function() {
					mui.toast('系统繁忙或没有连接网络');
				}
			});
		}

		// 立刻发送请求
		var idCard = window.localStorage.getItem('phone');
		if (!idCard) return; // 如果没有登录过，则不执行

		getNeedLocalData(function(ret) {
			var localDataStr = JSON.stringify(ret);
			saveLocalToRemote(localDataStr, function(serverUpdateTime, data) {
				// 请求都结束后，保存数据到本地
				//				getLastCollectTime(function(updateTime){
				window.localStorage.setItem('_local_data_update_time', serverUpdateTime); //更新本地时间
				//				});
				saveCollectFromRemote(data);
			});
		});
	}

//	window.syncData(); // 立即同步数据

	//当前app进程转为后台进程后，立刻同步数据。
//	document.addEventListener("pause", window.syncData);

})(window);