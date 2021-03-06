// 修改package.json中的版本号信息
var fs = require('fs');

fs.readFile('./src/assets/web.version.json', 'utf8', (err, result) => {
    if (err) console.error(err);
    const packageJSON = JSON.parse(result);
    const nowDate = new Date();
    packageJSON.description = `${nowDate.getFullYear()}-${nowDate.getMonth() + 1
        }-${nowDate.getDate()} ${nowDate.getHours()}:${nowDate.getMinutes()}:${nowDate.getSeconds()}`;
    // 获取小版本号
    const versionArr = packageJSON.version.split('.');
    const patch = Number(versionArr.pop());
    versionArr[versionArr.length] = patch + 1;
    packageJSON.version = versionArr.join('.');
    fs.writeFile(
        './src/assets/web.version.json',
        JSON.stringify(packageJSON, null, 4),
        'utf8',
        err => {
            if (err) console.error(err);
        }
    );
});
