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

    if ((workspace.numScreens - 1) < primaryScreen) {
        primaryScreen = 0;
        return;
    }

    return;
}

function clearDesktopBinding(window) {
    var window = window || this;

    if (
        window.desktopWindow ||
        window.dock ||
        (!window.normalWindow && window.skipTaskbar)
    ) {
        return;
    }
    window.desktop = workspace.currentDesktop;
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

    // NOTE:
    // re-calculate primaryScreen when every dock window appear.
    // (kwin-script activates before dock window, which prevents
    // primaryScreen detection.)
    if (window.dock) {
        updatePrimaryScreen();
    }

    update(window);

    window.screenChanged.connect(window, update);
    window.desktopChanged.connect(window, update);
    print("Window " + window.windowId + " has been bound");
}

function main() {
    // clear previous binding
    workspace.clientList().forEach(clearDesktopBinding);

    updatePrimaryScreen();

    workspace.clientList().forEach(bind);
    workspace.clientAdded.connect(bind);

    // TODO: what if primary screen changes? <2024-03-07>
}

main();
