import { redirect } from "react-router";
import { getUser } from "../pages/Profile";

export async function authMiddleware({ context }) {
  const user = await getUser();

  if (!user) {
    throw redirect("/auth");
  }
}
