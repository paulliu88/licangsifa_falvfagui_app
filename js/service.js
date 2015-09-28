var sDb = openDatabase('ganbuDb', '', 'ganbu Db', 5 * 1000 * 1000);

var pageSize = 100;



/**
 * ajax更新操作次数到后台
 * @param method 要执行的后台方法名称
 * @param questionId 要更新的题目id
 */
function ajaxAddTimes(url, questionId, callback) {
	var idCard = window.localStorage.getItem('phone');
	mui.ajax(url, {
		data: {
			questionId: questionId,
			idCard: idCard
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'post', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		success: function(data) {
			if (callback) callback(data);
			console.info(data.success + '=' + url)
		},
		error: function() {}
	});
}

/** 
 * 测试函数
 */
function myTest() {
	sDb.transaction(function(tx) {
		var sql = "select * from collect where type = 2";
		tx.executeSql(sql, [], function(tx, rs) {
			if (rs.rows.length > 0) {
				for (var i = 0; i < rs.rows.length; i++) {
					var row = rs.rows.item(i);
				}
			}
		}, onError);
	});
}

/**
 * 保存每题的答题次数
 * @param {Object} questionId
 */

function saveQuestionDoTimes(questionId) {
	//	return;
	function getQuestion(questionId, callback) {
		sDb.transaction(function(tx) {
			var sql = "select * from question where id = ?";
			tx.executeSql(sql, [questionId], function(tx, rs) {
				if (rs.rows.length > 0) {
					var myRows = [];
					for (var i = 0; i < rs.rows.length; i++) {
						var row = rs.rows.item(i);
						myRows.push({
							id: row.id,
							answerTime: row.answer_time,
							collectTime: row.collect_time
						});
					}
				}
				callback(myRows);
			}, onError);
		});
	}
	getQuestion(questionId, function(data) {
		sDb.transaction(function(tx) {
			var sql = "update question set answer_time = ? where id = ?";
			tx.executeSql(sql, [(data[0].answerTime + 1), questionId], function(tx, rs) {
				ajaxAddTimes(Routes.urls.times.addAnswerTimes, questionId);
			}, onError);
		});
	})
}

/**
 * 保存每题答错的次数
 * @param {Object} questionId
 */
function saveQuestionWrongTimes(questionId) {
		//	return;
		function getQuestion(questionId, callback) {
			sDb.transaction(function(tx) {
				var sql = "select * from question where id = ?";
				tx.executeSql(sql, [questionId], function(tx, rs) {
					if (rs.rows.length > 0) {
						var myRows = [];
						for (var i = 0; i < rs.rows.length; i++) {
							var row = rs.rows.item(i);
							myRows.push({
								id: row.id,
								answerTime: row.answer_time,
								collectTime: row.collect_time
							});
						}
					}
					callback(myRows);
				}, onError);
			});
		}
		getQuestion(questionId, function(data) {
			sDb.transaction(function(tx) {
				var sql = "update question set collect_time = ? where id = ?";
				tx.executeSql(sql, [(data[0].collectTime + 1), questionId], function(tx, rs) {
					ajaxAddTimes(Routes.urls.times.addCollectTimes, questionId);
				}, onError);
			});
		})
	}
	/**
	 * 推送消息 保存方法
	 * @param {Object} record
	 * {title:'', content:''}
	 */

function saveMessage(msg) {
	var d = new Date();
	var year = d.getFullYear();
	var month = d.getMonth() + 1;
	var date = d.getDate();
	var hours = d.getHours();
	var minutes = d.getMinutes();
	var seconds = d.getSeconds();
	var record = {
		title: msg.title,
		content: msg.content,
		datetime: (year + '-' + month + '-' + date + '  ' + hours + ':' + minutes + ':' + seconds),
		status: 1
	};
	var sql = 'INSERT INTO message (title,content,datetime,status) values(?,?,?,?)';
	sDb.transaction(function(tx) {
		tx.executeSql(sql, [record.title, record.content, record.datetime, record.status], function() {}, onError);
	});
}

/**
 * 会计app 的推送消息查询
 * @param {Object} callback
 */
function queryAllMessage(callback) {
	sDb.transaction(function(tx) {
		var sql = 'select * from message order by datetime desc';
		tx.executeSql(sql, [], function(tx, rs) {
			var myRows = [];
			if (rs.rows.length > 0) {
				for (var i = 0; i < rs.rows.length; i++) {
					var row = rs.rows.item(i);
					myRows.push({
						id: row.id,
						title: row.title,
						content: row.content,
						datetime: row.datetime,
						status: row.status,
						readStyle: (function() {
							return row.status == 2 ? 'background-color: ghostwhite;' : '';
						})()
					});
				}
			}
			callback(myRows);
		}, onError);
	});
}

/**
 * 获取所有课程 courseCode课程,sReuslt为回调方法名
 */
function queryAllCourse(callback) {
	sDb.transaction(function(tx) {
		var sql = "select id,code,name,status,progress from category where length(code)=4";
		tx.executeSql(sql, [], function(tx, rs) {
			var myRows = [];
			if (rs.rows.length > 0) {
				for (var i = 0; i < rs.rows.length; i++) {
					var row = rs.rows.item(i);
					myRows.push({
						code: row.code,
						name: row.name,
						status: row.status
					});
				}
			}
			callback(myRows);
		}, onError);
	});
}

/**
 * 根据编码获取课程下的章节列表,
 * 如果code为4位，则查询结果为章列表；如果code为8位，则查询结果为节列表;如果code不为4位或8位则返回为空
 * sReuslt为回调方法
 */
function queryCategory(code, callback) {
	var sql = "select id,code,name,status,progress from category  ";
	if (code.length == 4) {
		sql += "where length(code)=8 ";
	}
	if (code.length == 8) {
		sql += "where length(code)=12 ";
	}
	if (code.length == 4 || code.length == 8) {
		sql += " and substr(code,1," + code.length + ")='" + code + "'";
	} else {
		sql += " where 1!=1";
	}
	sDb.transaction(function(tx) {
		tx.executeSql(sql, [], function(tx, rs) {
			var myRows = [];
			if (rs.rows.length > 0) {
				for (var i = 0; i < rs.rows.length; i++) {
					var row = rs.rows.item(i);
					myRows.push({
						code: row.code,
						name: row.name,
						status: row.status,
						progress: row.progress == null ? "0" : row.progress
					});
				}
			}
			callback(myRows);
		}, onError);
	});
}


function minix(sourceObj) {
	var pageSize = sourceObj.pageSize || window.pageSize;
	var targetObj = {
		pageSize: 0,
		currentTime: 0,
		questionList: (function() {
			if (!sourceObj.questionList) {
				return [];
			} else {
				return sourceObj.questionList
			}
		})(),

		getQuestion: function(id) {
			function inner(questionList) {
				for (var i = 0; i < questionList.length; i++) {
					var questionTemp = questionList[i];
					if (questionTemp.question.id == id) {
						return questionTemp;
					}
				}
			}
			var value = inner(this.questionList);
			if (!value) {
				alert('meiyou question by id' + id)
			}
			return value;
		},

		grade: function(userResultList) {
			//做过的题的list
			var list = [];
			//FIXME 解决submit页面通关文本显示错误的问题
			this.userCorrectAnswerCount = 0;

			for (var k = 0; k < userResultList.length; k++) {
				var userResult = userResultList[k];

				var questionId = userResult.questionId;
				var labelList = userResult.userAnswerList;
				labelStr = labelList.join('');
				//找到目标question对象
				var questionAll = this.getQuestion(questionId);

				function setOptionSelected(question, labelStr) {
						var options = question.options;
						for (var i = 0; i < options.length; i++) {
							var option = options[i];
							if (labelStr.indexOf(option.label) != -1) {
								option.isSelected = true;
							} else {
								option.isSelected = false;
							}
						}
					}
					//options对象设置isSelect值
				setOptionSelected(questionAll, labelStr);
				//question对象设置用户选择值
				questionAll.question.userAnswer = labelStr;
				//question对象计算本题正确答案
				function getQuestionAnswer(question) {
					var ret = [];
					var options = question.options;
					for (var i = 0; i < options.length; i++) {
						var option = options[i];
						if (option.key == 1) {
							ret.push(option.label);
						}
					}
					return ret.join('');
				}

				questionAll.question.questionAnswer = getQuestionAnswer(questionAll);
				//question对象设置isOk值
				function getOK(question) {
					return question.userAnswer == question.questionAnswer;
				}
				questionAll.question.isOk = getOK(questionAll.question);

				if (questionAll.question.isOk) {
					this.userCorrectAnswerCount++;
				}
				list.push(questionAll)
			}
			//只保存做过的错题
			this.saveCollect(list);
		},


		gradeOne: function(userResult) {
			//做过的题的list
			//			var list = [];
			//FIXME 解决submit页面通关文本显示错误的问题
			this.userCorrectAnswerCount = 0;

			var questionId = userResult.questionId;
			var labelList = userResult.userAnswerList;
			labelStr = labelList.join('');
			//找到目标question对象
			var questionAll = this.getQuestion(questionId);

			function setOptionSelected(question, labelStr) {
					var options = question.options;
					for (var i = 0; i < options.length; i++) {
						var option = options[i];
						if (labelStr.indexOf(option.label) != -1) {
							option.isSelected = true;
						} else {
							option.isSelected = false;
						}
					}
				}
				//options对象设置isSelect值
			setOptionSelected(questionAll, labelStr);
			//question对象设置用户选择值
			questionAll.question.userAnswer = labelStr;
			//question对象计算本题正确答案
			function getQuestionAnswer(question) {
				var ret = [];
				var options = question.options;
				for (var i = 0; i < options.length; i++) {
					var option = options[i];
					if (option.key == 1) {
						ret.push(option.label);
					}
				}
				return ret.join('');
			}

			questionAll.question.questionAnswer = getQuestionAnswer(questionAll);
			//question对象设置isOk值
			function getOK(question) {
				return question.userAnswer == question.questionAnswer;
			}
			questionAll.question.isOk = getOK(questionAll.question);

			if (questionAll.question.isOk) {
				this.userCorrectAnswerCount++;
			}
			//			list.push(questionAll)

			// 同步后台 用户的行为分析
			//			this.ajaxSaveTimes(questionAll.question);

			//只保存做过的错题
			this.saveCollectOne(questionAll.question);
		},

		/**
		 * @deprecated
		 * 记录用户次数
		 */
		ajaxSaveTimes: function(question) {
			var idCard = window.localStorage.getItem('phone');
			var url = '';
			//			if (question.userAnswer) {
			if (question.isOk) { // 记录用户回答的次数
				url = Routes.urls.times.addAnswerTimes;
			} else { //记录用户做错的次数
				url = Routes.urls.times.addCollectTimes;
			}
			//			} else { // 记录用户浏览的次数
			//				url = Routes.urls.times.addStudyTimes;
			//			}
			if (!url) return; //check url
			mui.ajax(url, {
				data: {
					questionId: question.id,
					idCard: idCard
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					alert(data.success + '=' + url)
				},
				error: function() {}
			});
		},
		//gradeForTestLight

		gradeForTestLight: function(userResultList) {
			//FIXME 解决submit页面通关文本显示错误的问题
			this.userCorrectAnswerCount = 0;
			this.userFenShu = 0;

			for (var k = 0; k < userResultList.length; k++) {
				var userResult = userResultList[k];

				var questionId = userResult.questionId;
				var labelList = userResult.userAnswerList;
				labelStr = labelList.join('');
				//找到目标question对象
				var questionAll = this.getQuestion(questionId);

				function setOptionSelected(question, labelStr) {
						var options = question.options;
						for (var i = 0; i < options.length; i++) {
							var option = options[i];
							if (labelStr.indexOf(option.label) != -1) {
								option.isSelected = true;
							} else {
								option.isSelected = false;
							}
						}
					}
					//options对象设置isSelect值
				setOptionSelected(questionAll, labelStr);
				//question对象设置用户选择值
				questionAll.question.userAnswer = labelStr;
				//question对象计算本题正确答案
				function getQuestionAnswer(question) {
					var ret = [];
					var options = question.options;
					for (var i = 0; i < options.length; i++) {
						var option = options[i];
						if (option.key == 1) {
							ret.push(option.label);
						}
					}
					return ret.join('');
				}

				questionAll.question.questionAnswer = getQuestionAnswer(questionAll);
				//question对象设置isOk值
				function getOK(question) {
					return question.userAnswer == question.questionAnswer;
				}
				questionAll.question.isOk = getOK(questionAll.question);

				if (questionAll.question.isOk) {
					this.userCorrectAnswerCount++;
					if (questionAll.question.type == '单选题') {
						this.userFenShu += 1;
					} else if (questionAll.question.type == '多选题') {
						this.userFenShu += 2;
					} else if (questionAll.question.type == '判断题') {
						this.userFenShu += 1;
					}
				}
			}
		},

		gradeForTest: function(userResultList) {
			//FIXME 解决submit页面通关文本显示错误的问题
			this.userCorrectAnswerCount = 0;
			this.userFenShu = 0;

			for (var k = 0; k < userResultList.length; k++) {
				var userResult = userResultList[k];

				var questionId = userResult.questionId;
				var labelList = userResult.userAnswerList;
				labelStr = labelList.join('');
				//找到目标question对象
				var questionAll = this.getQuestion(questionId);

				function setOptionSelected(question, labelStr) {
						var options = question.options;
						for (var i = 0; i < options.length; i++) {
							var option = options[i];
							if (labelStr.indexOf(option.label) != -1) {
								option.isSelected = true;
							} else {
								option.isSelected = false;
							}
						}
					}
					//options对象设置isSelect值
				setOptionSelected(questionAll, labelStr);
				//question对象设置用户选择值
				questionAll.question.userAnswer = labelStr;
				//question对象计算本题正确答案
				function getQuestionAnswer(question) {
					var ret = [];
					var options = question.options;
					for (var i = 0; i < options.length; i++) {
						var option = options[i];
						if (option.key == 1) {
							ret.push(option.label);
						}
					}
					return ret.join('');
				}

				questionAll.question.questionAnswer = getQuestionAnswer(questionAll);
				//question对象设置isOk值
				function getOK(question) {
					return question.userAnswer == question.questionAnswer;
				}
				questionAll.question.isOk = getOK(questionAll.question);

				if (questionAll.question.isOk) {
					this.userCorrectAnswerCount++;
					if (questionAll.question.type == '单选题') {
						this.userFenShu += 1;
					} else if (questionAll.question.type == '多选题') {
						this.userFenShu += 2;
					} else if (questionAll.question.type == '判断题') {
						this.userFenShu += 1;
					}
				}
			}
		},

		userCorrectAnswerCount: 0,
		userFenShu: 0,

		/**
		 *
		 */
		getResultMsgForTest: function() {
			if (this.userCorrectAnswerCount >= (Math.round(0.6 * pageSize))) {
				var sectionId = this.questionList[0].question.categoryCode;
				openNextTollGate(sectionId);
				var chapterId = sectionId.substr(0, 8);
				updateProgress(chapterId)
				return "及格啦";
			} else {
				return "不及格";
			}
		},

		getFenShu: function() {
			return this.userFenShu;
		},

		/**
		 *
		 */
		getResultMsg: function() {
			if (this.userCorrectAnswerCount >= (Math.round(0.6 * pageSize))) {
				var sectionId = this.questionList[0].question.categoryCode;
				openNextTollGate(sectionId);
				var chapterId = sectionId.substr(0, 8);
				updateProgress(chapterId)
				return "及格";
			} else {
				return "不及格";
			}
		},



		saveCollectOne: function(question) {
			if (question.isOk) { // 回答成功
				delteCollectLocalDbAndServer(question.id, function() {});
			} else { // 回答失败，则删除后，再保存一个
				delteCollectLocalDbAndServer(question.id, function() {
					saveCollectLocalDbAndServer(question);
				});
			}
		},

		saveCollect: function(userResultList) {
			//FIXME 这里有bug！！
			for (var i = 0; i < userResultList.length; i++) {
				var question = userResultList[i].question;
				//不记录未做题为错题
				if (question.userAnswer.length < 1) continue;
				if (question.isOk) { // 回答成功
					delteCollectLocalDbAndServer(question.id, function() {});
				} else { // 回答失败，则删除后，再保存一个
					delteCollectLocalDbAndServer(question.id, function(question) {
						//						console.log('#######################'+JSON.stringify(question))
						saveCollectLocalDbAndServer(question);
					}, question);
				}
			}

		},

		updateBookMark: function(questionAll) {
			var hasCollect = questionAll.hasCollect;
			if (hasCollect) { //已经存在这个题目的收藏
				deleteBookmark(questionAll.question.id);
			} else { // 不存在这个题目的收藏
				saveBookmark(questionAll.question);
			}
			questionAll.hasCollect = !hasCollect;
		},

		isAllDo: function() {
			for (var i = 0; i < this.questionList.length; i++) {
				var questionAll = this.questionList[i];
				if (!questionAll.question.userAnswer) {
					return false;
				}
			}
			return true;
		},

		fireFinishCallbak: function(all) {
			this.questionList.push(all);
			this.currentTime += 1;
			if (this.currentTime == pageSize) { // 最后一题
				var sectionId = all.question.categoryCode;
				this.chapterId = sectionId.substr(0, 8);
				sourceObj.finishCallback(this);
			} //end if 最后一题
		},

		getSectionId: function() {
			var sectionId = this.questionList[0].question.categoryCode;
			return sectionId.substr(0, 12);
		},

		getChapterId: function() {
			var sectionId = this.questionList[0].question.categoryCode;
			return sectionId.substr(0, 8);
		},

		getCourseId: function() {
			var sectionId = this.questionList[0].question.categoryCode;
			return sectionId.substr(0, 4);
		},

		isAllReply: function() {
			for (var i = 0; i < this.questionList.length; i++) {
				var question = this.questionList[i].question;
				if (question.userAnswer == '') {
					return false;
				}
			}
			return true;
		}
	};

	for (var name in targetObj) {
		var value = sourceObj[name];
		if (value) {
			targetObj[name] = value;
		}
	}

	return targetObj;
}

/**
 * 查询试题
 * 用于展示列表
 * @param {Object} code
 * @param {Object} callback
 */
function queryQuestions(code, callback, isAll) {
	if (isAll) {
		var sql = "select id,seq,categoryCode,answer_time,collect_time from question ";
		sDb.transaction(function(tx) {
			tx.executeSql(sql, [], function(tx, rs) {
				var myRows = [];
				if (rs.rows.length > 0) {
					for (var i = 0; i < rs.rows.length; i++) {
						var row = rs.rows.item(i);
						myRows.push({
							id: row.id,
							seq: row.seq,
							categoryCode: row.categoryCode,
							answerTime: row.answer_time,
							collectTime: row.collect_time
						});
					}
				}
				callback(myRows);
			}, onError);
		});
	} else {
		var sql = "select id,seq,categoryCode,answer_time,collect_time from question where categoryCode = ?";
		sDb.transaction(function(tx) {
			tx.executeSql(sql, [code], function(tx, rs) {
				var myRows = [];
				if (rs.rows.length > 0) {
					for (var i = 0; i < rs.rows.length; i++) {
						var row = rs.rows.item(i);
						myRows.push({
							id: row.id,
							seq: row.seq,
							categoryCode: row.categoryCode,
							answerTime: row.answer_time,
							collectTime: row.collect_time
						});
					}
				}
				callback(myRows);
			}, onError);
		});
	}
}


/**
 * 核心业务查询方法，返回question有关的所有先关对象。
 * @param {Object} categoryCode 节id
 * @param {Object} rowCallback
 */
function queryQuestionOne(categoryCode, startId, rowCallback, finishCallback, noDataCallback) {
	//	var countSql = 'select count(1) as count from question q left join resolution r on q.id = r.questionId left join material m on  q.materialId = m.id left join (select * from collect where type =1) c on q.id = c.questionId where q.categoryCode = ?';
	//	var allSql = 'select q.id as question_id,q.seq as seq,q.categoryCode as question_category_code,q.type as question_type,q.name as question_name,q.knowledgePoint as question_knowledge_ponit,q.chapter as question_chapter,q.parser_video_id as question_parser_video_id,q.source as source,q.answer_time as answer_time,q.collect_time as collect_time,r.id as resolution_id,r.name as resolution_name,m.id as material_id,m.name as material_name,c.id as collect_id,c.type as collect_type,c.answer as collect_answer,c.costTime as collect_cost_time from question q left join resolution r on q.id = r.questionId left join material m on  q.materialId = m.id left join (select * from collect where type =1) c on q.id = c.questionId where q.categoryCode = ? limit ?,?';
	var allLabel = 'ABCDEFGHIJKLMN'.split('');
	var countSql = 'select count(1) as count from question q left join (select * from collect where type =1) c on q.id = c.questionId where q.id = ?';
	var allSql = 'select q.id as question_id,q.seq as seq,q.categoryCode as question_category_code,q.type as question_type,q.name as question_name,q.knowledgePoint as question_knowledge_ponit,q.chapter as question_chapter,q.parser_video_id as question_parser_video_id,q.source as source,q.answer_time as answer_time,q.collect_time as collect_time,c.id as collect_id,c.type as collect_type,c.answer as collect_answer,c.costTime as collect_cost_time from question q left join (select * from collect where type =1) c on q.id = c.questionId where q.id = ? limit ?,?';
	var subSql = "select id,name,key from option where questionId=?";

	var Finish = null;

	sDb.transaction(function(tx) {

		function optionAction(all) {
			tx.executeSql(subSql, [all.question.id], function(tx, rs) {
				var options = [];
				if (rs.rows.length > 0) {
					for (var i = 0; i < rs.rows.length; i++) {
						var _option = rs.rows.item(i);
						all.options.push({
							id: _option.id,
							label: allLabel[i],
							name: _option.name,
							key: _option.key,
							inputType: (function() {
								var t = all.question.type;
								if (t == '判断题' || t == '单选题') {
									return 'radio';
								} else if (t == '多选题') {
									return 'checkbox';
								}
							})(),
							inputName: ('name-' + all.question.id),
							isSelected: false
						});
					}
				}
				rowCallback(all);
				Finish.fireFinishCallbak(all);
			}, onError);
		}

		//		function questionAction(start, pageSize) {
		function questionAction(startId, pSize) {
			//			tx.executeSql(allSql, [categoryCode, start, pageSize], function(tx, rs) {
			tx.executeSql(allSql, [categoryCode, startId, pSize], function(tx, rs) {
				if (rs.rows.length > 0) {
					for (var i = 0; i < rs.rows.length; i++) {
						var r = rs.rows.item(i);
						var allResult = {
							question: {
								indexed: i + 1,
								id: r.question_id,
								seq: r.seq,
								categoryCode: r.question_category_code,
								type: r.question_type,
								name: r.question_name,
								knowledgePonit: r.question_knowledge_ponit,
								chapter: r.question_chapter,
								parserVideoId: r.question_parser_video_id,
								source: r.source,
								answerTime: r.answer_time,
								collectTime: r.collect_time,
								isOk: false,
								userAnswer: '',
								questionAnswer: '',
								pageSize: pageSize
							},
							//							resolution: {
							//								id: r.resolution_id,
							//								name: r.resolution_name
							//							},
							//							material: {
							//								id: r.material_id,
							//								name: r.material_name
							//							},
							collect: {
								id: r.collect_id,
								type: r.collect_type,
								answer: r.collect_answer,
								cost_time: r.collect_cost_time
							},
							options: [],
							hasCollect: (undefined != r.collect_id),
							hasMaterial: (undefined != r.material_id)
						};
						optionAction(allResult)
					}
				}
			}, onError);
		}

		function countAction(callback) {
			tx.executeSql(countSql, [categoryCode], function(tx, rs) {
				if (rs.rows.length == 1) {
					var row = rs.rows.item(0);
					callback(row.count);
				} else {
					noDataCallback();
				}
			});
		}

		countAction(function(count) {
			var start = 0;
			if (count <= window.pageSize) {
				window.pageSize = count;
			} else {
				start = Math.floor(Math.random() * (count - window.pageSize));
			}
			Finish = minix({
				finishCallback: finishCallback,
				pageSize: window.pageSize
			});
			questionAction(startId, 100);
		});

	});
}


/**
 * 核心业务查询方法，返回question有关的所有先关对象。
 * @param {Object} categoryCode 节id
 * @param {Object} rowCallback
 */
function queryQuestionAll(categoryCode, startId, rowCallback, finishCallback, noDataCallback) {
	//	var countSql = 'select count(1) as count from question q left join resolution r on q.id = r.questionId left join material m on  q.materialId = m.id left join (select * from collect where type =1) c on q.id = c.questionId where q.categoryCode = ?';
	//	var allSql = 'select q.id as question_id,q.seq as seq,q.categoryCode as question_category_code,q.type as question_type,q.name as question_name,q.knowledgePoint as question_knowledge_ponit,q.chapter as question_chapter,q.parser_video_id as question_parser_video_id,q.source as source,q.answer_time as answer_time,q.collect_time as collect_time,r.id as resolution_id,r.name as resolution_name,m.id as material_id,m.name as material_name,c.id as collect_id,c.type as collect_type,c.answer as collect_answer,c.costTime as collect_cost_time from question q left join resolution r on q.id = r.questionId left join material m on  q.materialId = m.id left join (select * from collect where type =1) c on q.id = c.questionId where q.categoryCode = ? limit ?,?';
	var allLabel = 'ABCDEFGHIJKLMN'.split('');
	var countSql = 'select count(1) as count from question q left join (select * from collect where type =1) c on q.id = c.questionId where q.categoryCode = ?';
	var allSql = 'select q.id as question_id,q.seq as seq,q.categoryCode as question_category_code,q.type as question_type,q.name as question_name,q.knowledgePoint as question_knowledge_ponit,q.chapter as question_chapter,q.parser_video_id as question_parser_video_id,q.source as source,q.answer_time as answer_time,q.collect_time as collect_time,c.id as collect_id,c.type as collect_type,c.answer as collect_answer,c.costTime as collect_cost_time from question q left join (select * from collect where type =1) c on q.id = c.questionId where q.categoryCode = ? limit ?,?';
	var subSql = "select id,name,key from option where questionId=?";

	var Finish = null;

	sDb.transaction(function(tx) {

		function optionAction(all) {
			tx.executeSql(subSql, [all.question.id], function(tx, rs) {
				var options = [];
				if (rs.rows.length > 0) {
					for (var i = 0; i < rs.rows.length; i++) {
						var _option = rs.rows.item(i);
						all.options.push({
							id: _option.id,
							label: allLabel[i],
							name: _option.name,
							key: _option.key,
							inputType: (function() {
								var t = all.question.type;
								if (t == '判断题' || t == '单选题') {
									return 'radio';
								} else if (t == '多选题') {
									return 'checkbox';
								}
							})(),
							inputName: ('name-' + all.question.id),
							isSelected: false
						});
					}
				}
				rowCallback(all);
				Finish.fireFinishCallbak(all);
			}, onError);
		}

		//		function questionAction(start, pageSize) {
		function questionAction(startId, pSize) {
			//			tx.executeSql(allSql, [categoryCode, start, pageSize], function(tx, rs) {
			tx.executeSql(allSql, [categoryCode, startId, pSize], function(tx, rs) {
				if (rs.rows.length > 0) {
					for (var i = 0; i < rs.rows.length; i++) {
						var r = rs.rows.item(i);
						var allResult = {
							question: {
								indexed: i + 1,
								id: r.question_id,
								seq: r.seq,
								categoryCode: r.question_category_code,
								type: r.question_type,
								name: r.question_name,
								knowledgePonit: r.question_knowledge_ponit,
								chapter: r.question_chapter,
								parserVideoId: r.question_parser_video_id,
								source: r.source,
								answerTime: r.answer_time,
								collectTime: r.collect_time,
								isOk: false,
								userAnswer: '',
								questionAnswer: '',
								pageSize: pageSize
							},
							//							resolution: {
							//								id: r.resolution_id,
							//								name: r.resolution_name
							//							},
							//							material: {
							//								id: r.material_id,
							//								name: r.material_name
							//							},
							collect: {
								id: r.collect_id,
								type: r.collect_type,
								answer: r.collect_answer,
								cost_time: r.collect_cost_time
							},
							options: [],
							hasCollect: (undefined != r.collect_id),
							hasMaterial: (undefined != r.material_id)
						};
						optionAction(allResult)
					}
				}
			}, onError);
		}

		function countAction(callback) {
			tx.executeSql(countSql, [categoryCode], function(tx, rs) {
				if (rs.rows.length == 1) {
					var row = rs.rows.item(0);
					callback(row.count);
				} else {
					noDataCallback();
				}
			});
		}

		countAction(function(count) {
			var start = 0;
			if (count <= window.pageSize) {
				window.pageSize = count;
			} else {
				start = Math.floor(Math.random() * (count - window.pageSize));
			}
			Finish = minix({
				finishCallback: finishCallback,
				pageSize: window.pageSize
			});
			questionAction(startId, 100);
		});

	});
}


/**
 * 核心业务查询方法，返回question有关的所有先关对象。
 * @param {Object} categoryCode 节id
 * @param {Object} rowCallback
 */
function queryQuestionAllForTest(param, rowCallback, finishCallback, noDataCallback) {
	var categoryCode = param.categoryCode;
	var type = param.type;
	var qIndex = param.qIndex;
	window.pageSize = param.pageSize;
	var allLabel = 'ABCDEFGHIJKLMN'.split('');
	var countSql = "select count(1) as count from question q left join resolution r on q.id = r.questionId left join material m on  q.materialId = m.id left join (select * from collect where type =1) c on q.id = c.questionId where q.type='" + type + "' and q.categoryCode  like '" + categoryCode + "%'";
	var allSql = "select q.id as question_id,q.categoryCode as question_category_code,q.type as question_type,q.name as question_name,q.knowledgePoint as question_knowledge_ponit,q.chapter as question_chapter,q.parser_video_id as question_parser_video_id,r.id as resolution_id,r.name as resolution_name,m.id as material_id,m.name as material_name,c.id as collect_id,c.type as collect_type,c.answer as collect_answer,c.costTime as collect_cost_time from question q left join resolution r on q.id = r.questionId left join material m on  q.materialId = m.id left join (select * from collect where type =1) c on q.id = c.questionId "
		//	+" where substr(q.categoryCode,1,4) = ? order by q.id desc limit ?,? ";
		+ " where q.type='" + type + "' and q.categoryCode like '" + categoryCode + "%' order by q.id desc limit ?,? ";
	var subSql = "select id,name,key from option where questionId=?";
	var Finish = null;

	sDb.transaction(function(tx) {

		function optionAction(all) {
			tx.executeSql(subSql, [all.question.id], function(tx, rs) {
				var options = [];
				if (rs.rows.length > 0) {
					for (var i = 0; i < rs.rows.length; i++) {
						var _option = rs.rows.item(i);
						all.options.push({
							id: _option.id,
							label: allLabel[i],
							name: _option.name,
							key: _option.key,
							inputType: (function() {
								var t = all.question.type;
								if (t == '判断题' || t == '单选题') {
									return 'radio';
								} else if (t == '多选题') {
									return 'checkbox';
								}
							})(),
							inputName: ('name-' + all.question.id),
							isSelected: false
						});
					}
				}
				rowCallback(all);
				Finish.fireFinishCallbak(all);
			}, onError);
		}

		function questionAction(start, pageSize) {
			tx.executeSql(allSql, [ /*categoryCode,*/ start, pageSize], function(tx, rs) {
				if (rs.rows.length > 0) {
					for (var i = 0; i < rs.rows.length; i++) {
						var r = rs.rows.item(i);
						var allResult = {
							question: {
								indexed: (i + qIndex + 1),
								id: r.question_id,
								categoryCode: r.question_category_code,
								type: r.question_type,
								name: r.question_name,
								knowledgePonit: r.question_knowledge_ponit,
								chapter: r.question_chapter,
								parserVideoId: r.question_parser_video_id,
								isOk: false,
								userAnswer: '',
								questionAnswer: '',
								pageSize: pageSize
							},
							resolution: {
								id: r.resolution_id,
								name: r.resolution_name
							},
							material: {
								id: r.material_id,
								name: r.material_name
							},
							collect: {
								id: r.collect_id,
								type: r.collect_type,
								answer: r.collect_answer,
								cost_time: r.collect_cost_time
							},
							options: [],
							hasCollect: (undefined != r.collect_id),
							hasMaterial: (undefined != r.material_id)
						};
						optionAction(allResult)
					}
				}
			}, onError);
		}

		function countAction(callback) {
			tx.executeSql(countSql, [ /*categoryCode*/ ], function(tx, rs) {
				if (rs.rows.length == 1) {
					var row = rs.rows.item(0);
					callback(row.count);
				} else {
					noDataCallback();
				}
			});
		}

		countAction(function(count) {
			var start = 0;
			if (count <= window.pageSize) {
				window.pageSize = count;
			} else {
				start = Math.floor(Math.random() * (count - window.pageSize));
			}
			Finish = minix({
				finishCallback: finishCallback,
				pageSize: window.pageSize
			});
			questionAction(start, window.pageSize);
		});

	});
}


/**
 * 核心业务查询方法，返回错题或者收藏记录
 * @param {Object} categoryCode  节 id
 * @param {Object} rowCallback
 */
function queryQuestionAllForReview(categoryCode, type, rowCallback, finishCallback, noDataCallback) {
	//	var allSql = 'select q.id as question_id,q.seq as seq,q.categoryCode as question_category_code,q.type as question_type,q.name as question_name,q.knowledgePoint as question_knowledge_ponit,q.chapter as question_chapter,q.parser_video_id as question_parser_video_id,q.source as source,q.answer_time as answer_time,q.collect_time as collect_time,r.id as resolution_id,r.name as resolution_name,m.id as material_id,m.name as material_name,c.id as collect_id,c.type as collect_type,c.answer as collect_answer,c.costTime as collect_cost_time ' +
	//		'from (select * from collect where type = ?) c left join question q on q.id = c.questionId left join resolution r on q.id = r.questionId left join material m on  q.materialId = m.id where q.categoryCode = ?';
	var allLabel = 'ABCDEFGHIJKLMN'.split('');
	var allSql = 'select q.id as question_id,q.seq as seq,q.categoryCode as question_category_code,q.type as question_type,q.name as question_name,q.knowledgePoint as question_knowledge_ponit,q.chapter as question_chapter,q.parser_video_id as question_parser_video_id,q.source as source,q.answer_time as answer_time,q.collect_time as collect_time,c.id as collect_id,c.type as collect_type,c.answer as collect_answer,c.costTime as collect_cost_time ' +
		'from (select * from collect where type = ?) c left join question q on q.id = c.questionId where q.categoryCode = ?';
	var subSql = "select id,name,key from option where questionId=?";

	var Finish = null;

	sDb.transaction(function(tx) {

		function optionAction(all) {
			tx.executeSql(subSql, [all.question.id], function(tx, rs) {
				var options = [];
				var questionAnswer = [];
				if (rs.rows.length > 0) {
					for (var i = 0; i < rs.rows.length; i++) {
						var _option = rs.rows.item(i);
						var userAnswer = all.question.userAnswer;
						var label = allLabel[i]
						var option = {
							id: _option.id,
							label: allLabel[i],
							name: _option.name,
							key: _option.key,
							inputType: (function() {
								var t = all.question.type;
								if (t == '判断题' || t == '单选题') {
									return 'radio';
								} else if (t == '多选题') {
									return 'checkbox';
								}
							})(),
							inputName: ('name-' + all.question.id),
							isSelected: (userAnswer.indexOf(label) != -1)
						};
						all.options.push(option);
						if (option.key == 1) {
							questionAnswer.push(option.label);
						}
					}
					all.question.questionAnswer = questionAnswer.join('');
					if (all.question.questionAnswer == all.question.userAnswer) {
						all.question.isOk = true;
					}
				}

				Finish.fireFinishCallbak(all);

				rowCallback(all);

			}, onError);
		}

		tx.executeSql(allSql, [type, categoryCode], function(tx, rs) {
			var pageSize = rs.rows.length;
			Finish = minix({
				finishCallback: finishCallback,
				pageSize: pageSize
			});

			if (pageSize > 0) {
				for (var i = 0; i < pageSize; i++) {
					var r = rs.rows.item(i);
					var allResult = {
						question: {
							indexed: i + 1,
							id: r.question_id,
							seq: r.seq,
							categoryCode: r.question_category_code,
							type: r.question_type,
							name: r.question_name,
							knowledgePonit: r.question_knowledge_ponit,
							chapter: r.question_chapter,
							parserVideoId: r.question_parser_video_id,
							source: r.source,
							answerTime: r.answer_time,
							collectTime: r.collect_time,
							isOk: false,
							userAnswer: r.collect_answer,
							questionAnswer: '',
							pageSize: pageSize
						},
						//						resolution: {
						//							id: r.resolution_id,
						//							name: r.resolution_name
						//						},
						//						material: {
						//							id: r.material_id,
						//							name: r.material_name
						//						},
						collect: {
							id: r.collect_id,
							type: r.collect_type,
							answer: r.collect_answer,
							cost_time: r.collect_cost_time
						},
						options: [],
						hasCollect: (undefined != r.collect_id),
						hasMaterial: (undefined != r.material_id)
					};
					optionAction(allResult)
				}
			}
		}, onError);


	});
}



/**
 * 如果通关则自动打开下一关卡
 * @param {Object} sectionId
 */
function openNextTollGate(sectionId) {
	var sql2 = 'update category  set progress = 100 where code = ?';
	sDb.transaction(function(tx) {
		tx.executeSql(sql2, [sectionId], function(tx, rs) {}, onError);
	});
	var sId = '000' + (parseInt(sectionId) + 1);
	var sql = 'update category  set status = 1 where code = ?';
	sDb.transaction(function(tx) {
		tx.executeSql(sql, [sId], function(tx, rs) {}, onError);
	});
}

/**
 * 更新章 的进度
 * @param {Object} chapterId
 */
function updateProgress(chapterId) {
	sDb.transaction(function(tx) {
		var selSql = "select (select count(1) from category where code like '" + chapterId + "%' and progress = 100) as okCount,(select count(1) from category where code like '" + chapterId + "%') as allCount ";
		tx.executeSql(selSql, [], function(tx, rs) {
			if (rs.rows.length == 1) {
				var selObj = rs.rows.item(0);
				var progress = Math.round((selObj.okCount) / (selObj.allCount - 1) * 100, 0);
				if (selObj.okCount == selObj.allCount) {
					progress = 100;
				}
				var sql = 'update category set progress = ? where code = ?';
				tx.executeSql(sql, [progress, chapterId], function(tx, rs) {}, onError);
			}
		}, onError);
	});
}

/**
 * 根据节编码获取节下的试题
 * categoryCode:编码
 * sReuslt为回调方法
 */

function queryQuestion(categoryCode, sResult) {
		var sql = "select id,categoryCode,materialId,type,name,knowledgePoint,chapter,parser_video_id from question where categoryCode=?";
		sDb.transaction(function(tx) {
			tx.executeSql(sql, [categoryCode], sResult, onError);
		});
	}
	/**
	 * 根据问题id获取问题解析,sReuslt为回调方法
	 */

function queryResolution(questionId, sResult) {
		var sql = "select id,name from resolution where questionId=?";
		sDb.transaction(function(tx) {
			tx.executeSql(sql, [questionId], sResult, onError);
		});
	}
	/**
	 * 根据问题id获取材料
	 */

function queryMaterial(materialId, sResult) {
		var sql = "select id,name from material where id=?";
		sDb.transaction(function(tx) {
			tx.executeSql(sql, [materialId], sResult, onError);
		});
	}
	/**
	 * 根据问题id获取选项列表
	 */

function queryOption(questionId, sResult) {
		var sql = "select id,name,key from option where questionId=?";
		sDb.transaction(function(tx) {
			tx.executeSql(sql, [questionId], sResult, onError);
		});
	}
	/**
	 * 获取课程下章的错题或收藏数
	 * courseCode： 课程编码
	 * type：1代表收藏 2代表错题
	 * 返回 章名、章编码、章下的题数
	 */

function queryCourseCount(courseCode, type, callback) {
		var sql = "SELECT c.name,c.code,b.count from (SELECT substr(q.categoryCode,1,8) as code ,count(q.id) count from collect q  where type=" + type + " and q.categoryCode like '" + courseCode + "%' GROUP BY substr(q.categoryCode,1,8))as b join category c on b.code = c.code ";
		sDb.transaction(function(tx) {
			tx.executeSql(sql, [], function(tx, rs) {
				var myRows = [];
				if (rs.rows.length > 0) {
					for (var i = 0; i < rs.rows.length; i++) {
						var row = rs.rows.item(i);
						myRows.push({
							name: row.name,
							code: row.code,
							count: row.count
						});
					}
				}
				callback(myRows);
			}, onError);
		});
	}
	/**
	 * 获取章下的节的错题数和收藏数
	 * chapterCode：章编码
	 * type:1为收藏，2为错题
	 *  返回 节名、节编码、节下的题数
	 */

function queryChapterCount(chapterCode, type, callback) {
	var sql = "SELECT c.name,c.code,b.count from (SELECT substr(q.categoryCode,1,12) as code ,count(q.id) count from collect q  where type=" + type + " and q.categoryCode like '" + chapterCode + "%' GROUP BY substr(q.categoryCode,1,12))as b join category c on b.code = c.code ";
	sDb.transaction(function(tx) {
		tx.executeSql(sql, [], function(tx, rs) {
			var myRows = [];
			if (rs.rows.length > 0) {
				for (var i = 0; i < rs.rows.length; i++) {
					var row = rs.rows.item(i);
					myRows.push({
						name: row.name,
						code: row.code,
						count: row.count
					});
				}
			}
			callback(myRows);
		}, onError);
	});
}

/**
 * 添加收藏
 * @param {Object} question
 */
function saveBookmark(question) {
	var idCard = window.localStorage.getItem('phone');
	mui.ajax(Routes.urls.bookmark.save, {
		data: {
			questionId: question.id,
			type: 1,
			categoryCode: question.categoryCode,
			userAnswer: question.userAnswer,
			idCard: idCard,
			updateTimeInt: new Date().getTime()
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'post', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		success: function(data) {},
		error: function() {}
	});
	saveCollectAndBookmark(1, question.id, question.categoryCode, question.userAnswer, idCard, new Date().getTime(), function() {});
}

/**
 * 删除收藏
 * @param {Object} questionId
 */

function deleteBookmark(questionId) {
	var idCard = window.localStorage.getItem('phone');
	mui.ajax(Routes.urls.bookmark.delete, {
		data: {
			questionId: questionId,
			type: 1,
			idCard: idCard
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'post', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		success: function(data) {},
		error: function() {}
	});
	var sql = "delete from collect where type = 1 and questionId = ?";
	sDb.transaction(function(tx) {
		tx.executeSql(sql, [questionId], function() {}, onError);
	});
}

/**
 * 添加错题
 * @param {Object} question
 */

function saveCollectLocalDbAndServer(question) {
		var idCard = window.localStorage.getItem('phone');
		mui.ajax(Routes.urls.collect.save, {
			data: {
				questionId: question.id,
				type: 2,
				categoryCode: question.categoryCode,
				answer: question.userAnswer,
				idCard: idCard,
				updateTimeInt: new Date().getTime()
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data) {
				var obj = {
					questionId: question.id,
					type: 2,
					categoryCode: question.categoryCode,
					userAnswer: question.userAnswer,
					idCard: idCard,
					updateTimeInt: new Date().getTime()
				};
			},
			error: function() {}
		});
		saveCollectAndBookmark(2, question.id, question.categoryCode, question.userAnswer, idCard, new Date().getTime(), function() {});
	}
	/**
	 * 删除错题
	 * @param {Object} questionId
	 */

function delteCollectLocalDbAndServer(questionId, callback, question) {
	var idCard = window.localStorage.getItem('phone');
	mui.ajax(Routes.urls.collect.delete, {
		data: {
			questionId: questionId,
			type: 2,
			idCard: idCard
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'post', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		success: function(data) {
			//			var obj = {
			//				questionId: questionId,
			//				type: 2,
			//				idCard: idCard
			//			};
			if (callback) {
				if (question) {
					callback(question);
				} else {
					callback();
				}
			}
		},
		error: function() {}
	});
	var sql = "delete from collect where type = 2 and questionId = ?";
	sDb.transaction(function(tx) {
		tx.executeSql(sql, [questionId], function() {}, onError);
	})
}

/**
 * 删除错题或者收藏，根据question——id
 * @param {Object} questionId
 */
function delteSync(tx, questionId, callback) {
	var sql = "delete from collect where questionId = ?";
	tx.executeSql(sql, [questionId], callback, onError);
}

/**
 * 保存错题和收藏题
 * type:1为收藏，2为错题;如果是错题，则answer字段不能为空
 */
function saveCollectAndBookmark(type, questionId, categoryCode, answer, costTime, userId, updateTime, sResult) {
	var sql = "insert into collect(type,questionId,categoryCode,answer,costTime,userId,updateTime) values(?,?,?,?,?,?,?)";
	sDb.transaction(function(tx) {
		tx.executeSql(sql, [type, questionId, categoryCode, answer, costTime, userId, updateTime], sResult, onError);
	});
}

/**
 * 保存服务器端返回的更新数据到收藏和错题表
 * @param {Object} ret
 */
/*function saveCollectFromRemote(ret) {
	if (!(ret && ret.length)) return; // 方法守卫，参数验证
	var sql = "insert into collect(type,questionId,categoryCode,answer,costTime,userId,updateTime) values(?,?,?,?,?,?,?)";
	sDb.transaction(function(tx) {
		for (var i = 0; i < ret.length; i++) {
			var item = ret[i];
			delteSync(tx, item.questionId, function() {
				console.log([item.type, item.questionId, item.categoryCode, item.answer, item.costTime, item.userId, item.updateTimeInt]);
				tx.executeSql(sql, [item.type, item.questionId, item.categoryCode, item.answer, item.costTime, item.userId, item.updateTimeInt], function() {
				}, onError);
			});
		}
	});
}*/

/**
 * 保存服务器端返回的更新数据到收藏和错题表
 * @param {Object} ret
 * @param type:类型，1：收藏，2：错题
 * @param categoryCode:分类
 */
function saveCollectFromRemote(ret, type, categoryCode, finishCallback) {
	function clearCollectTable() {
		sDb.transaction(function(tx) {
			//			tx.executeSql('DROP TABLE IF EXISTS collect', []);
			//			tx.executeSql('create table if not exists collect(id INTEGER PRIMARY KEY AUTOINCREMENT,categoryCode text,type INTEGER,questionId INTEGER,answer TEXT,costTime INTEGER,userId INTEGER,updateTime INTEGER)', []); //收藏
			tx.executeSql("delete from collect where type = ? ", [type],function(){
			},function(){
			});
		});
	}
	if (!(ret && ret.length)) return; // 方法守卫，参数验证
	clearCollectTable();
	var sql = "insert into collect(type,questionId,categoryCode,answer,costTime,userId,updateTime) values(?,?,?,?,?,?,?)";
	var _time = 0;
	sDb.transaction(function(tx) {
		for (var i = 0; i < ret.length; i++) {
			var item = ret[i];
			tx.executeSql(sql, [item.type, item.questionId, item.categoryCode, item.answer, item.costTime, item.userId, item.updateTimeInt], function() {
				_time += 1;
			}, onError);
		}
	});
	var myIter = window.setInterval(function() {
		if (_time == ret.length) {
			window.clearInterval(myIter);
			finishCallback();
		}
	}, 500);
}


/**
 * 查询所有用户本地的错题记录 和收藏记录
 * @param {Object} callback
 */
/*function getLastCollectTime(callback) {
	var sql = "select max(updateTime) as updateTime from collect ";
	sDb.transaction(function(tx) {
		tx.executeSql(sql, [], function(tx, rs) {
			if (rs.rows.length == 1) {
				callback(rs.rows.item(0).updateTime);
			}
		}, onError);
	});
}*/

/**
 * 查询所有用户本地的错题记录 和收藏记录
 * @param {Object} callback
 */
function queryAllCollect(callback) {
	var sql = "select * from collect";
	sDb.transaction(function(tx) {
		tx.executeSql(sql, [], function(tx, rs) {
			var ret = [];
			if (rs.rows.length > 0) {
				for (var i = 0; i < rs.rows.length; i++) {
					var item = rs.rows.item(i);
					ret.push({
						type: item.type,
						questionId: item.questionId,
						categoryCode: item.categoryCode,
						answer: item.answer,
						costTime: item.costTime
					});
				}
			}
			callback(ret);
		}, onError);
	});
}

/**
 * 查询需要用户更新错题记录和收藏记录
 * @param {Object} callback
 */
function queryNeedCollect(date, callback) {
	var sql = "select type,questionId,categoryCode,answer,costTime,userId,updateTime from collect where updateTime > ?";
	sDb.transaction(function(tx) {
		tx.executeSql(sql, [date], function(tx, rs) {
			var ret = [];
			if (rs.rows.length > 0) {
				for (var i = 0; i < rs.rows.length; i++) {
					var item = rs.rows.item(i);
					ret.push({
						type: item.type,
						questionId: item.questionId,
						categoryCode: item.categoryCode,
						answer: item.answer,
						costTime: item.costTime
					});
				}
			}
			callback(ret);
		});
	});
}

/**
 * 设置节开锁状态
 *
 */
function openSection(sectionId, sResult) {
		var sql = "update category set status =1 where id = ?";
		sDb.transaction(function(tx) {
			tx.executeSql(sql, [sectionId], sResult, onError);
		});
	}
	/**
	 * 设置章进度,已完成
	 */

function setChapterProgress(categoryId, progress, sResult) {
	var sql = "update category set progress = " + progress + " where id = ?";
	sDb.transaction(function(tx) {
		tx.executeSql(sql, [categoryId], sResult, onError);
	});
}

function queryTest(questionId, callback) {
	var sql = 'select o.id,o.name,o.key,c.answer from option o join collect c on o.questionId = c.questionId where o.questionId = ?';
	sDb.transaction(function(tx) {
		tx.executeSql(sql, [questionId], function(tx, rs) {
			if (rs.rows.length > 0) {
				for (var i = 0; i < rs.rows.length; i++) {
					var row = rs.rows.item(i);
				}
			}
		}, onError);
	});
}

function test() {
	//获取所有课程
	//queryAllCourse(sResult);
	//根据编码获取章节
	//queryCategory("00010001", sResult);
	//测试查询材料题
	//queryMaterial(1,sResult);
	//查询解析题
	//queryResolution(2470,sResult);
	//读取试题表
	//queryQuestion('ssss',sResult);
	//读取材料表
	//queryMaterial(53,sResult)
	//测试option表
	//queryOption(1,sResult);
	//queryCourseCount('0001',1,sResult);
	//queryChapterCount('00010001',1,sResult);
	//测试保存进度
	//	setChapterProgress(40, 20, sResult);
	//	queryCategory("00020001", sResult);
	//保存错题库
	//saveCollectLocalDbAndServer('2','1','000100010001','1,2,3','10',sResult);
	queryTest('22');
}

//sql语句执行成功后执行的回调函数
function sResult(tx, rs) {}
	//sql语句执行失败后执行的回调函数

function onError(tx, error) {
	console.log("操作失败，失败信息：" + error.message);
}

//window.onload=function(){
//	test();
//}
//mui.plusReady(test);