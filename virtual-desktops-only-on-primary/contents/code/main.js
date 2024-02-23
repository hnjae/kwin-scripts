var PrimaryScreen = 0;

function bind(window) {
    window.previousScreen = window.screen;
    window.screenChanged.connect(window, update);
    window.desktopChanged.connect(window, update);
    print("Window " + window.windowId + " has been bound");
}

function update(window) {
    var window = window || this;

    if (
        window.desktopWindow ||
        window.dock ||
        (!window.normalWindow && window.skipTaskbar)
    ) {
        return;
    }

    var currentScreen = window.screen;
    var previousScreen = window.previousScreen;
    window.previousScreen = currentScreen;

    if (currentScreen != PrimaryScreen) {
        window.desktop = -1;
        print("Window " + window.windowId + " has been pinned");
    } else if (previousScreen != PrimaryScreen) {
        window.desktop = workspace.currentDesktop;
        print("Window " + window.windowId + " has been unpinned");
    }
}

function bindUpdate(window) {
    bind(window);
    update(window);
}

function main() {
    PrimaryScreen = workspace.activeScreen;
    workspace.clientList().forEach(bind);
    workspace.clientList().forEach(update);
    workspace.clientAdded.connect(bindUpdate);
}

main();
