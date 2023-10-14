const fs = require('fs');
const path = require("path");
const readline = require('readline-sync');
const cp = require('child_process');
const colors = require('colors-console');
const template = require('./template');


let parentDir = __dirname;

function _create_file(path, content) {
    console.log(colors('green', 'Creating File'), path);
    fs.writeFileSync(path, content.toString().trim());
}

function _create_dir(path) {
    console.log(colors('green', 'Creating Dir'), path);
    fs.mkdirSync(path);
}

function _output_message(msg) {
    console.log(colors('bright', `\n${msg}`));
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

    _output_message("Creating Application Dir");

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

function _run_command(command, cwd) {
    cp.execSync(command, {
        cwd: cwd,
        stdio: "inherit"
    });
}

function _build_application(app_name) {
    let dir_path = path.join(parentDir, app_name);
    _output_message("Installing Dependence");
    _run_command("npm install", dir_path);

    _output_message("Building Application");
    _run_command("npm run build", dir_path);
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
        console.log(`Finish Creating Your Application \`${option.name}\``);
        let result_path = path.join(parentDir, option.name, "src-tauri", "target", "release", "bundle");
        console.log(`Your application is stored in \`${result_path}\`. You can open it by yourself. `)
    });
}

module.exports = {
    run
};
