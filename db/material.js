function createTableMaterial(tx){
	
	console.log("add material data");
	
	tx.executeSql('DROP TABLE IF EXISTS material', []);
	tx.executeSql('create table if not exists material(id INTEGER PRIMARY KEY AUTOINCREMENT,name text)', []); //材料题表
	
	tx.executeSql('select * from material', [], onSuccess, onError);
}