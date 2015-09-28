/**
 * 更新试题选项
 * @param {Object} tx
 */

function updateTableOption(tx) {
	console.log("update option data");
	tx.executeSql('update option set name = ? where id = ?', ['11月13日', 1261]);
	tx.executeSql('update option set name = ? where id = ?', ['5月17日', 1262]);
	tx.executeSql('update option set name = ? where id = ?', ['8月15日', 1263]);
	tx.executeSql('update option set name = ? where id = ?', ['9月30日', 1264]);
	tx.executeSql('update option set name = ? where id = ?', ['9月3日', 1265]);
	tx.executeSql('update option set name = ? where id = ?', ['8月15日', 1266]);
	tx.executeSql('update option set name = ? where id = ?', ['12月1日', 1267]);
	tx.executeSql('update option set name = ? where id = ?', ['12月30日', 1268]);
	tx.executeSql('update option set name = ? where id = ?', ['4月12日', 1269]);
	tx.executeSql('update option set name = ? where id = ?', ['7月15日', 1270]);
	tx.executeSql('update option set name = ? where id = ?', ['12月13日', 1271]);
	tx.executeSql('update option set name = ? where id = ?', ['10月10日', 1272]);
	tx.executeSql('update option set name = ? where id = ?', ['3月5日', 2209]);
	tx.executeSql('update option set name = ? where id = ?', ['6月5日', 2210]);
	tx.executeSql('update option set name = ? where id = ?', ['7月5日', 2211]);
	tx.executeSql('update option set name = ? where id = ?', ['10月5日', 2212]);
	tx.executeSql('update option set name = ? where id = ?', ['将以王某名义所购买的房产租与他人，收取租金，用于王某平时的研究。', 3279]);
	tx.executeSql('update option set name = ? where id = ?', ['退还货款和服务费用', 6732]);
	tx.executeSql('select * from option', [], function(tx, rs) {
		console.log('option:' + rs.rows.length)
	}, onError);
}