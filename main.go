package main

import (
	"embed"
	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
	"log"
	"os"
	"path/filepath"
	"workbench/internal/platform"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	root, err := os.UserConfigDir()
	if err != nil {
		log.Fatal(err)
	}
	root = filepath.Join(root, "desktop-workbench")
	host, err := platform.NewHost(root)
	if err != nil {
		log.Fatal(err)
	}
	app := application.New(application.Options{Name: "Workbench", Services: []application.Service{application.NewService(host)}, Assets: application.AssetOptions{Handler: application.BundledAssetFileServer(assets)}, OnShutdown: host.Shutdown, Mac: application.MacOptions{ApplicationShouldTerminateAfterLastWindowClosed: true}, SingleInstance: &application.SingleInstanceOptions{UniqueID: "org.workbench.boilerplate", OnSecondInstanceLaunch: func(data application.SecondInstanceData) { log.Printf("Open-file entry point: %v", data.Args) }}})
	windowState := platform.LoadWindow(root)
	window := app.Window.NewWithOptions(application.WebviewWindowOptions{Title: "Workbench", Name: "main", Width: windowState.Width, Height: windowState.Height, MinWidth: 680, MinHeight: 480, URL: "/", Frameless: false, UseApplicationMenu: true, DevToolsEnabled: os.Getenv("WORKBENCH_DEV") == "1"})
	menu := app.NewMenu()
	view := menu.AddSubmenu("Workbench")
	for _, item := range []struct{ title, id string }{{"Open demo document", "document.open"}, {"Command Palette", "command.palette"}, {"Reset Layout", "layout.reset"}} {
		id := item.id
		view.Add(item.title).OnClick(func(*application.Context) { app.Event.Emit("workbench.command", id) })
	}
	app.Menu.Set(menu)
	shell := platform.NewShell(app, window, root)
	app.RegisterService(application.NewService(shell))
	window.RegisterHook(events.Common.WindowClosing, func(e *application.WindowEvent) {
		if !shell.RequestClose() {
			e.Cancel()
		}
	})

	if err = app.Run(); err != nil {
		log.Fatal(err)
	}
}
