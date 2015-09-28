var db = openDatabase('ganbuDb', '', 'ganbu Db', 5 * 1000 * 1000);

//添加数据（第一次安装本程序，初始化创建table
function createTable(onSuccess) {
	console.log("开始添加测试数据.....");
	db.transaction(function(tx) {
		//执行访问数据库的语句
		tx.executeSql('DROP TABLE IF EXISTS collect', []);
		tx.executeSql('create table if not exists collect(id INTEGER PRIMARY KEY AUTOINCREMENT,categoryCode text,type INTEGER,questionId INTEGER,answer TEXT,costTime INTEGER,userId INTEGER,updateTime INTEGER)', []); //收藏
		db.transaction(function(tx) {
			createTableMessage(tx); //消息表
		});
		db.transaction(function(tx) {
			createTableCategory(tx); //科目
		});
		db.transaction(function(tx) {
			createTableQuestion(tx); // 问题表
		});
		db.transaction(function(tx) {
			createTableOption(tx); //选项表
		});
		db.transaction(function(tx) {
			createTableResolution(tx); //解析表
		});
		db.transaction(function(tx) {
			createTableMaterial(tx); //材料表
		});
	});
}

//更新app，初始化table，更新需要更新的数据库
function updateTable(onSuccess){
//	db.transaction(function(tx) {
//		//执行访问数据库的语句
//		db.transaction(function(tx) {
//			updateTableQuestion(tx); // 问题表
//		});
//		db.transaction(function(tx) {
//			updateTableOption(tx); //选项表
//		});
//	});
}
//消息表
function createTableMessage(tx) {
	tx.executeSql('DROP TABLE IF EXISTS message', []);
	//主键，消息标题，消息内容，创建日期，是否 已经阅读1：阅读，2：未读
	tx.executeSql('create table if not exists message(id INTEGER PRIMARY KEY AUTOINCREMENT,title text,content text,datetime text,status INTEGER)', [], function(tx, rs) {
		console.log("add message data");
	});
}

//sql语句执行成功后执行的回调函数

function onSuccess(tx, rs) {
		console.log("onSuccess操作成功");
	}
	//sql语句执行失败后执行的回调函数

function onError(tx, error) {
	console.log("操作失败，失败信息：" + error.message);
}