const fs = require('fs');
const path = require("path");
const readline = require('readline-sync');
const cp = require('child_process');
const template = require('./template');
const child_process = require("child_process");


let parentDir = __dirname

function _create_file(path, content) {
    console.log(`Creating File: ${path}`);
    fs.writeFileSync(path, content.toString().trim());
}

function _create_dir(path) {
    console.log(`Creating Dir: ${path}`);
    fs.mkdirSync(path);
}

async function _create_application(option) {
    // 创建应用所需文件
    /*
    目录结构
    app_name
    | package.json
    | src
    | | index.html
    | | main.js
    | src-tauri
    | | build.rs
    | | Cargo.toml
    | | tauri.conf.json
    | | src
    | | | main.rs
     */

    console.log("Creating Application Dir");

    let app_name = option.name;
    let dir_path = path.join(parentDir, app_name);

    // 判断目标路径是否存在
    if (fs.existsSync(dir_path)) {
        let v = readline.question(`Dir \`${app_name}\` already exists. Do you want to overwrite it? [Y/n] `).trim().toLowerCase();
        if (v === 'y' || v === '') {
            fs.rmSync(dir_path,
                {
                    recursive: true,
                    force: true,
                }
            );
            // 重新运行
            await _create_application(option);
        } else {
            console.log("Stop Creating!");
            process.exit();
        }
    } else {
        // 创建文件夹
        _create_dir(dir_path);
        // package.json
        _create_file(path.join(dir_path, "package.json"), template.package_json(app_name));
        // src
        _create_dir(path.join(dir_path, "src"));
        _create_file(path.join(dir_path, "src", "index.html"), template.index_html(app_name));
        _create_file(path.join(dir_path, "src", "main.js"), template.main_js());
        // src-tauri
        _create_dir(path.join(dir_path, "src-tauri"));
        _create_file(path.join(dir_path, "src-tauri", "build.rs"), template.build_rs());
        _create_file(path.join(dir_path, "src-tauri", "Cargo.toml"), template.cargo_toml(app_name, option.description));
        _create_file(
            path.join(dir_path, "src-tauri", "tauri.conf.json"),
            template.tauri_conf_json(
                app_name,
                option.author,
                option.iconPath,
                option.description,
                option.url,
                option.width,
                option.height,
                option.fullscreen,
                option.resize,
                option.identifier,
            )
        );
        // src-tauri / src
        _create_dir(path.join(dir_path, "src-tauri", "src"));
        _create_file(path.join(dir_path, "src-tauri", "src", "main.rs"), template.main_rs());
    }
}

function _build_application(app_name) {
    let dir_path = path.join(parentDir, app_name);
    console.log("Installing Dependence");
    cp.execSync("npm install", {
        cwd: dir_path,
        stdio: "inherit",
    });
    console.log("Building Application")
    cp.execSync("npm run build", {
        cwd: dir_path,
        stdio: "inherit",
    });
}

function run(option) {
    // 设置输出路径
    if (!fs.existsSync(option.outputDir)) {
        console.log(`Output dir \`${option.outputDir}\` does not exist. \nPlease try again.`);
        process.exit();
    }
    parentDir = option.outputDir;
    // 创建应用
    _create_application(option).then(() => {
        _build_application(option.name);
    });
}

module.exports = {
    run
};
