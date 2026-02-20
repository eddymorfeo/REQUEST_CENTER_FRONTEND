import Swal from "sweetalert2";

export const alerts = {
  success(title: string, text?: string) {
    return Swal.fire({
      icon: "success",
      title,
      text,
      confirmButtonText: "OK",
    });
  },

  error(title: string, text?: string) {
    return Swal.fire({
      icon: "error",
      title,
      text,
      confirmButtonText: "Entendido",
    });
  },

  toastSuccess(title: string, text?: string) {
    return Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title,
      text,
      showConfirmButton: false,
      timer: 2800,
      timerProgressBar: true,
      showClass: { popup: "swal2-show" },
      hideClass: { popup: "swal2-hide" },

      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });
  },

  toastError(title: string, text?: string) {
    return Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title,
      text,
      showConfirmButton: false,
      timer: 3200,
      timerProgressBar: true,
      showClass: { popup: "swal2-show" },
      hideClass: { popup: "swal2-hide" },
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });
  },

  confirm(title: string, text?: string) {
  return Swal.fire({
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
  }).then((r) => r.isConfirmed);
},

  wait(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  },
};
