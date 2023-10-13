# Url 2 App
`url2app` is a tool to convert a url into a desktop application.
It is based on `tauri` which is a rust crate.

## Installation
1. Install `node.js` and `rust`
2. Install this tool: `npm install url2app@latest`
3. Use `url2app` command in your console!

## Usage
```shell
url2app [options]
```

### Options
| Option | Description | Default Value |
| ------ | ----------- | ------------- |
| `-V, --version` | output the version number | |
| **`-u, --url <url>`** | target url to convert | |
| **`-n, --name <name>`** | the name of this application | |
| `-i, --icon-path <icon_path...>` | the icon paths for the application | ![](./icons/icon.png) |
| `-d, --description <description>` | a short description for this application | A desktop application for the website. |
| `-a, --author <author>` | the author of this application | your user name on the computer |
| `-w, --width <width>` | the default width of the window | 800 |
| `-h, --height <height>` | the default height of the window | 600 |
| `-f, --fullscreen` | if the window will be fullscreen when open | false |
| `-r, --resize` | if the window can be resized | true |
| `-o, --output-dir <output_path>` | the dir that will store the file created | the path of this module |
| `-id, --identifier <identifier>` | the bundle identifier for this application |
| `--help` | display help for command |