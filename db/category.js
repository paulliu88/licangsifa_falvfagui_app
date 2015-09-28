function createTableCategory(tx) {

	console.log("add category data");

	tx.executeSql('DROP TABLE IF EXISTS category', []);
	tx.executeSql('create table if not exists category(id INTEGER PRIMARY KEY AUTOINCREMENT,code text,name text,status INTEGER,progress float)', []); //科目，课、章、节，status1为正常，0为锁定

	tx.executeSql('INSERT INTO category values(?,?,?,?,?)', [1, '0001', '法律', 1, null]);
	tx.executeSql('INSERT INTO category values(?,?,?,?,?)', [2, '00010001', '判断题', 1, null]);
	tx.executeSql('INSERT INTO category values(?,?,?,?,?)', [3, '00010002', '单选题', 1, null]);
	tx.executeSql('INSERT INTO category values(?,?,?,?,?)', [4, '00010003', '多选题', 1, null]);

	tx.executeSql('select * from category', [], function(tx, rs){
		console.log('category:'+rs.rows.length)
	}, onError);
}