import Swal from "sweetalert2";
import { getErrorMessage } from "@/lib/errors/get-error-message";

export async function showErrorAlert(
  title: string,
  error: unknown
): Promise<void> {
  await Swal.fire({
    icon: "error",
    title,
    text: getErrorMessage(error),
    confirmButtonText: "Entendido",
  });
}