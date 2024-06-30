function _json2String(data) {
    return JSON.stringify(data, null, 2);
}

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

    return _json2String(data);
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
#[allow(non_snake_case)]
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
tauri = { version = "1.5", features = [
    "fs-all",
    "window-all",
    "dialog-all",
    "shell-open",
] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

[features]
# this feature is used for production builds or when \`devPath\` points to the filesystem
# DO NOT REMOVE!!
custom-protocol = ["tauri/custom-protocol"]
`;
}

function tauri_conf_json(app_name, author, icon_paths, des, url, width, height, fullscreen, resize, id) {
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
                "all": true,
            },
            "bundle": {
                "active": true,
                "targets": "all",
                "identifier": id || `com.${author.toLowerCase()}.${app_name.toLowerCase()}`,
                "icon": icon_paths
            },
            "security": {
                "csp": null
            },
            "windows": [
                {
                    "fullscreen": fullscreen,
                    "resizable": resize,
                    "label": "main",
                    "title": `${app_name}`,
                    "url": `${url}`,
                    "width": w,
                    "height": h
                }
            ]
        }
    };

    return _json2String(data);
}

function main_rs(app_name) {
    return `
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#[allow(non_snake_case)]

use tauri::{AppHandle, CustomMenuItem, Manager, Menu, Submenu};

const INJECT_SCRIPT: &str = "
if (!window.__INJECT_SCRIPT_LOADED__) {
    window.onload = () => {
        document.querySelectorAll('a').forEach((ele) => {
            ele.addEventListener('click', (e) => {
                let targetEle = e.target.closest('a')
                if (targetEle && targetEle.href && targetEle.target === '_blank') {
                    window.location.href = targetEle.href
                }
            })
            console.log('Finish redefining element', ele)
        })
    }

    window.open = (url) => {
        window.location.href = url
    }

    console.log('Finish injecting scripts')
    window.__INJECT_SCRIPT_LOADED__ = true
}
";
const BACK_SCRIPT: &str = "window.history.back()";
const FORWARD_SCRIPT: &str = "window.history.forward()";
const RELOAD_SCRIPT: &str = "window.location.reload()";

fn main_loop(app_handle: &AppHandle, event: tauri::RunEvent) {
    let main_window = match app_handle.get_window("main") {
        Some(w) => w,
        None => return
    };
    main_window.eval(INJECT_SCRIPT).unwrap();

    match event {
        tauri::RunEvent::WindowEvent { label, event, .. } => match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                #[cfg(target_os = "macos")]
                tauri::AppHandle::hide(
                    &app_handle.get_window(label.as_str()).unwrap().app_handle(),
                ).unwrap();

                #[cfg(not(target_os = "macos"))]
                app_handle
                    .get_window(label.as_str())
                    .unwrap()
                    .hide()
                    .unwrap();

                api.prevent_close();
            },
            _ => {}
        },
        _ => {}
    }
}

fn get_menu() -> Menu {
    Menu::os_default("${app_name}")
        .add_submenu(
            Submenu::new(
            "Control",
            Menu::new()
                .add_item(CustomMenuItem::new("back", "Go Back").accelerator("Command+["))
                .add_item(CustomMenuItem::new("forward", "Go Forward").accelerator("Command+]"))
                .add_item(CustomMenuItem::new("reload", "Reload").accelerator("Command+R"))
            )
        )
}

fn main() {
    let menu = get_menu();

    let builder = tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| {
            match event.menu_item_id() {
                "back" => {
                    event.window().eval(BACK_SCRIPT).unwrap();
                },
                "forward" => {
                    event.window().eval(FORWARD_SCRIPT).unwrap();
                },
                "reload" => {
                    event.window().eval(RELOAD_SCRIPT).unwrap();
                },
                _ => {}
            }
        });

    let app = builder.build(tauri::generate_context!()).unwrap();

    app.run(main_loop);
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
