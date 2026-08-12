// Fire a toast from anywhere: toast("Sale logged"), toast("Something failed", "error")
export function toast(message, type = "success") {
  window.dispatchEvent(new CustomEvent("app-toast", { detail: { message, type } }));
}
