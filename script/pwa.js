// Manually install app
const addBtn = document.querySelector('#download-app');

// Check if the app is already installed
async function getInstalledApps() {
    if ('getInstalledRelatedApps' in navigator) {
        let installedApps = await navigator.getInstalledRelatedApps();
        if (installedApps.length > 0) {
            addBtn.style.display = 'none';
        }
    }
}

getInstalledApps();

let deferredPrompt;
window.addEventListener('beforeinstallprompt', function(event) {
    event.preventDefault();
    deferredPrompt = event;
    addBtn.addEventListener('click', (e) => {
        addBtn.style.display = 'none';
        setTimeout(function(){
            addBtn.style.display = 'block';
        }, 5000); // 5s

        // Show the prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the add to home screen prompt');
            } else {
                console.log('User dismissed the add to home screen prompt');
            }
            setTimeout(() => {
                getInstalledApps();
                deferredPrompt = null;
            }, 10000); // 10s
        });
    });
});

// Function to add the app to the home screen
function addToHomeScreen() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function (choiceResult) {
            if (choiceResult.outcome === 'dismissed') {
                console.log('User cancelled installation');
            } else {
                console.log('User added to home screen');
            }
        });
        deferredPrompt = null;
    }
}

// Register the service worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {

        // When the user asks to refresh the UI, we'll need to reload the window
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (!event.data) {
                return;
            }
            switch (event.data) {
                case 'reload-window':
                    window.location.reload();
                    break;
                default:
                    break;
            }
        });

        navigator.serviceWorker
            .register("/serviceworker.js", { scope: "/" }) // Updated path if needed
            .then(res => console.log("Service worker registered", res))
            .catch(err => console.log("Service worker not registered", err));
    });
}
