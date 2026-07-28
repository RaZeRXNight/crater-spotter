import axios from "axios";
import { toast } from "react-toastify";

export default async function api({ url, method = "GET", headers = {}, body = null, silent = false }) {
  try {
    const response = await axios({ method, url, headers, data: body });
    if (response.data && response.data.error) {
      if (!silent) toast.error(response.data.message || "Request failed");
      return { err: response.data.message || "Request failed", data: null };
    }
    if (!silent && typeof response.data?.message === "string") {
      toast.success(response.data.message);
    }
    return { err: null, data: response.data };
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    if (!silent) toast.error(message);
    return { err: message, data: null };
  }
}
