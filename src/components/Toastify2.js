import { toast } from "react-toastify";

export const showToast = (type, message, time) => {
  toast[type](message, {
    position: "top-right",
    autoClose: time,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
  });
};
