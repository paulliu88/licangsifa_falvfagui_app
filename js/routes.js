/**
 * 全局路由配置对象
 */
(function(w) {
//	var domain = 'http://lcsf.oltop.cn/phone/'; //production
	//	var domain = 'http://192.168.1.160:8080/phone/'; // yinbin
		var domain = 'http://192.168.1.145:8080/phone/'; //刘金云
	//	var domain = 'http://lcsf.ccstudy.cn/phone/';//test
	//	var feedback = 'http://192.168.0.111:8000/';
	var feedback = 'http://oltop.cn:8000/'; //反馈服务器
	w.Routes = {
		domain: domain,
		feedback: feedback,
		urls: {
			feedback: {
				//反馈
				submitfeedback: feedback + 'api/feedback',
				//检查服务是否已经启动
				check: feedback + 'api/checkFeedback'
			},

			// 用户相关
			user: {

				// 普法登录	
				loginForPufa: domain + 'SysUserCtrl.loginForPufa.do'

			},

			// 同步方法 已作废
			sync: {

				//保存本地数据到服务器, 加载服务器数据到本地
				saveAndLoad: domain + 'LpSyncCtrl.saveAndLoad.do'
			},

			// 书签
			bookmark: {
				save: domain + 'LpSyncCtrl.saveCollection.do',
				delete: domain + 'LpSyncCtrl.deleteCollection.do'
			},

			// 错题
			collect: {
				save: domain + 'LpSyncCtrl.saveCollection.do',
				delete: domain + 'LpSyncCtrl.deleteCollection.do'
			},

			//  有关于用户的收藏本或者错题本
			collection: {
				
				// 查询 错有的错题或者收藏
				load: domain + 'LpSyncCtrl.loadCollection.do',
				// 清空错题题库、收藏题库
				clearBank: domain + 'LpSyncCtrl.clearCollectionApp.do',
				// 清空用户错题库或者收藏库中指定类型的题
				clearBankForSection: domain + 'LpSyncCtrl.clearCollectionAppForSection.do'
			},

			/**
			 * 统计用户的对每题的操作 情况，比如：做题次数、错误次数、收藏和错题中的学习次数。
			 * @param questionId 题目id
			 * @param idCard 用户身份证号
			 */
			times: {

				/**
				 * 用户在做题过程中做题的次数累加
				 */
				addAnswerTimes: domain + 'LpSyncCtrl.addAnswerTimes.do',

				/**
				 * 用户在做题过程中浏览的次数累加
				 */
				addStudyTimes: domain + 'LpSyncCtrl.addStudyTimes.do',

				/**
				 * 累加用户做错题的次数
				 */
				addCollectTimes: domain + 'LpSyncCtrl.addCollectTimes.do',

				/**
				 * 累加收藏夹中学习的次数
				 */
				addTimesForBookmark: domain + 'LpSyncCtrl.addTimesForBookmark.do',

				/**
				 * 累加错题库中学习的次数
				 */
				addTimesForError: domain + 'LpSyncCtrl.addTimesForError.do'
			}

		}
	};
})(window);

/**
 *	发送验证码
 * @param {Object} username 手机号
 * @param {Object} sendBtn 点击发送的按钮
 */

function sendCode(username, sendBtn, successFun) {
	if (username.length == 0) {
		mui.toast('请输入手机号码 ');
		return;
	}
	if (username.length != 11) {
		mui.toast('请输入有效的手机号码 ');
		return;
	}
	if (!myreg.test(username)) {
		mui.toast('请输入有效的手机号码 ');
		return;
	}
	var code = username + 'liu';
	username = strEnc(username, 'q', 'w', 'e');
	code = strEnc(code, '2', '3', '4');

	mui.ajax(Routes.urls.user.sendVerifyCode, {
		data: {
			username: username,
			code: code
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'post', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		success: function(data) {
			mui.toast('验证码已发送 ');
			sendBtn.setAttribute('issend', 1);
			if (data && data.success) {
				var result = data.message;
				var _verifycode = result.substr(0, 6);
				successFun(_verifycode);
			} else {
				mui.toast(data.message);
			}
		},
		error: function() {
			mui.toast('网络异常');
			window.localStorage.setItem('isAlreadyLogin', false);

		}
	});
	//		successFun('111111');
}
var myreg = /^(13|14|15|18)\d{9}$/;

/**
 * 网络异常统一回调函数
 * @param {Object} xhr
 * @param {Object} type
 * @param {Object} errorThrown
 */
function networkErrorHandler(xhr, type, errorThrown) {
	var b = toastNetworkInfo();
	if (!b) {
		mui.toast("请先打开网络");
	} else {
		mui.toast("网络异常，请先设置网络");
	}
}