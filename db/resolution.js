function createTableResolution(tx) {

	console.log("add resolution data!");
	tx.executeSql('DROP TABLE IF EXISTS resolution', []);
	tx.executeSql('create table if not exists resolution(id INTEGER PRIMARY KEY AUTOINCREMENT,questionId INTEGER,name text)', []); //解析表

	tx.executeSql('select * from resolution', [], function(tx, rs) {
		console.log('resolution:' + rs.rows.length)
	}, onError);
}