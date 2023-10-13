#!/usr/bin/env node

const { program } = require('commander');
const main = require('./main.js');
const os = require('os');
const path = require("path");
const fs = require("fs");
const readline = require("readline-sync");

let userInfo = os.userInfo();

let iconPath = path.join(__dirname, "icons");
let iconPaths = [];

fs.readdirSync(iconPath).forEach(
    (ele, index) => {
        let info = fs.statSync(path.join(iconPath, ele));
        if (info.isFile()) {
            iconPaths.push(path.join(iconPath, ele));
        }
    }
)

// 参数设置
program
    .name("url2app")
    .description("A tool to convert a url into a desktop application.")
    .version("v0.0.1")
    .requiredOption("-u, --url <url>", "target url to convert")
    .requiredOption("-n, --name <name>", "the name of this application")
    .option("-i, --icon-path <icon_path...>", "the icon paths for the application (please use absolute path)", iconPaths)
    .option("-d, --description <description>", "a short description for this application", "A desktop application for the website")
    .option("-a, --author <author>", "the author of this application", userInfo.username)
    .option("-w, --width <width>", "the default width of the window", "800")
    .option("-h, --height <height>", "the default height of the window", "600")
    .option("-f, --fullscreen", "if the window will be fullscreen when open", false)
    .option("-r, --resize", "if the window can be resized", true)
    .option("-o, --output-dir <output_path>", "the dir that will store the file created", __dirname)
    .option("-id, --identifier <identifier>", "the identifier for this application");

// 解析参数
program.parse();
const options = program.opts();
if (!options.identifier) {
    options.identifier = options.name.split(' ').join('-');
}
console.log(options)
let v = readline.question("Confirm the Profile? [Y/n] ").trim().toLowerCase();
if (v === 'y' || v === '') {
    main.run(options);
} else {
    console.log("Quit");
    process.exit();
}
