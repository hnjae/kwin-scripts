var primaryScreen = 0;

function updatePrimaryScreen() {
    var dockScreens = [];
    for (const window of workspace.clientList()) {
        if (window.dock) {
            dockScreens.push(window.screen);
        }
    }

    if (dockScreens.length === 1) {
        primaryScreen = dockScreens[0];
        return;
    }

    primaryScreen = 0;
    return;
}

function bind(window) {
    var update = function (window) {
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

        if (currentScreen != primaryScreen) {
            window.desktop = -1;
            print("Window " + window.windowId + " has been pinned");
        } else if (previousScreen != primaryScreen) {
            window.desktop = workspace.currentDesktop;
            print("Window " + window.windowId + " has been unpinned");
        }
    };

    window.previousScreen = window.screen;

    update(window);

    window.screenChanged.connect(window, update);
    window.desktopChanged.connect(window, update);
    print("Window " + window.windowId + " has been bound");
}

function main() {
    updatePrimaryScreen();

    workspace.clientList().forEach(bind);
    workspace.clientAdded.connect(bind);

    // TODO: what if primary screen changes? <2024-03-07>
}

main();
