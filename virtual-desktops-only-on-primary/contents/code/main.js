var primaryScreen = 0;

function updatePrimaryScreen() {
    var dockScreens = [];
    for (const window of workspace.clientList()) {
        if (window.dock) {
            dockScreens.push(window.screen);
        }
    }

    if (dockScreens.length === 1 && dockScreens[0] !== primaryScreen) {
        primaryScreen = dockScreens[0];
        workspace.clientList().forEach(updateWindowDesktop);
        return;
    }

    if ((workspace.numScreens - 1) < primaryScreen) {
        primaryScreen = 0;
        workspace.clientList().forEach(updateWindowDesktop);
        return;
    }

    return;
}

function clearWindowDesktopPin(window) {
    var window = window || this;

    if (
        window.desktopWindow ||
        window.dock ||
        (!window.normalWindow && window.skipTaskbar)
    ) {
        return;
    }

    if (window.desktop === -1) {
        window.desktop = workspace.currentDesktop;
    }
}

function updateWindowDesktop(window) {
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

    if (currentScreen !== primaryScreen) {
        window.desktop = -1;
    } else if (previousScreen !== primaryScreen) {
        window.desktop = workspace.currentDesktop;
    }
}

function bind(window) {
    window.previousScreen = window.screen;

    // NOTE:
    // re-calculate primaryScreen when every dock window appear.
    // (kwin-script activates before dock window, which prevents
    // primaryScreen detection.)
    if (window.dock) {
        updatePrimaryScreen();
        return;
    }

    updateWindowDesktop(window);

    window.screenChanged.connect(window, updateWindowDesktop);
    window.desktopChanged.connect(window, updateWindowDesktop);
    print("Window " + window.windowId + " has been bound");
}

function main() {
    // clear previous binding
    workspace.clientList().forEach(clearWindowDesktopPin);

    updatePrimaryScreen();

    workspace.clientList().forEach(bind);
    workspace.clientAdded.connect(bind);

    // TODO: what if primary screen changes? <2024-03-07>
}

main();
