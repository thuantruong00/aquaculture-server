
const toastQueue = [];
let isShowingToast = false;

function showToast(message, type = "basic", duration = 1000) {
    toastQueue.push({ message, duration, type });
    processToastQueue();
}

function processToastQueue() {
    if (isShowingToast || toastQueue.length === 0) return;

    const { message, duration, type } = toastQueue.shift();
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.innerText = message;
    switch (type) {
        case "failure":
            toast.className = "toast toast-failure";
            break;
        case "success":
            toast.className = "toast toast-success";
            break;
        case "basic":
        default:
            toast.className = "toast toast-basic";
            break;
    }
    container.appendChild(toast);

    // Hiển thị toast
    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    isShowingToast = true;

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
            container.removeChild(toast);
            isShowingToast = false;
            processToastQueue(); // gọi cái tiếp theo
        }, 200);
    }, duration);
}

