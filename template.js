function package_json(app_name) {
    let data = {
        "name": `${app_name}`,
        "private": true,
        "version": "0.0.0",
        "type": "module",
        "scripts": {
            "tauri": "tauri",
            "dev": "tauri dev",
            "build": "tauri build"
        },
        "devDependencies": {
            "@tauri-apps/cli": "^1.5.0"
        }
    };

    return JSON.stringify(data);
}

function main_js() {
    return "const { invoke } = window.__TAURI__.tauri;";
}

function index_html(app_name) {
    return `
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script type="module" src="main.js" defer></script>
        <title>${app_name}</title>
        <style>
            .container {
                width: 100%;
                height: 100%;
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
                padding: 0;
                margin: 0;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                hyphens: auto;
            }
        </style>
    </head>
    <body style="width: 100%; height: 100%; left: 0; top: 0">
        <div class="container">
            <h1>Loading ${app_name}...</h1>
            <h1>Please Wait!</h1>
        </div>
    </body>
</html>
    `;
}

function build_rs() {
    return `
fn main() {
    tauri_build::build()
}
    `;
}

function cargo_toml(app_name, des) {
    let name = app_name.split(' ').join('_')
    return `
[package]
name = "${name}"
version = "0.0.0"
description = "${des}"
license = ""
repository = ""
edition = "2021"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[build-dependencies]
tauri-build = { version = "1.5", features = [] }

[dependencies]
tauri = { version = "1.5", features = ["shell-open"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

[features]
# this feature is used for production builds or when \`devPath\` points to the filesystem
# DO NOT REMOVE!!
custom-protocol = ["tauri/custom-protocol"]
`;
}

function tauri_conf_json(app_name, author, icon_paths, des, url, width, height, fullscreen, resize, id) {
    let label = des.trim().split(' ').join('_');
    let id_name = id;
    let w = parseInt(width);
    let h = parseInt(height);
    let data = {
        "build": {
            "beforeDevCommand": "",
            "beforeBuildCommand": "",
            "devPath": "../src",
            "distDir": "../src",
            "withGlobalTauri": true
        },
        "package": {
            "productName": `${app_name}`,
            "version": "0.0.0"
        },
        "tauri": {
            "allowlist": {
                "all": false,
                "shell": {
                    "all": false,
                    "open": true
                }
            },
            "bundle": {
                "active": true,
                "targets": "all",
                "identifier": `com.${id_name}.${author}`,
                "icon": icon_paths
            },
            "security": {
                "csp": null
            },
            "windows": [
                {
                    "fullscreen": fullscreen,
                    "resizable": resize,
                    "label": `${label}`,
                    "title": `${app_name}`,
                    "url": `${url}`,
                    "width": w,
                    "height": h
                }
            ]
        }
    };

    return JSON.stringify(data);
}

function main_rs() {
    return `
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .unwrap();
}
    `;
}

module.exports = {
    package_json,
    build_rs,
    cargo_toml,
    index_html,
    main_js,
    main_rs,
    tauri_conf_json
};
