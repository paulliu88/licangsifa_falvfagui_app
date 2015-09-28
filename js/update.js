var server = "http://lcsf.ccstudy.cn:8090/appInstall/LicangPufa/update.json"; //获取升级描述文件服务器地址

/**
 * 自动验证，并更新app
 */
function update() {
	var osname = plus.os.name;
	var appid = plus.runtime.appid;
	/**
	 * 更新方法
	 * @param {Object} respDataStr
	 */

	function updateHandler(respDataStr) {
			var respData = eval('(' + respDataStr + ')');
			//	if (appid != respData.appid) return; // 版本无更新，则直接返回
			var data = respData[osname];
			var newVersion = parseInt(data.version.split('.').join(''));
			var version = parseInt(plus.runtime.version.split('.').join(''));
			if (newVersion <= version) {
				return;
			}
			plus.ui.confirm(data.note, function(i) {
				if (0 == i) { // 点击了: 立即更新
					plus.runtime.openURL(data.url);
				}
			}, data.title, ["立即更新", "取　　消"]);
		}
		//获取服务器的最新版本信息
	mui.ajax(server, {
		dataType: 'text', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		success: updateHandler,
		error: function(xhr, type, errorThrown) {
			//			console.log(errorThrown)
			//			console.log(JSON.stringify(xhr.responseText))
		}
	});

}


mui.plusReady(update);