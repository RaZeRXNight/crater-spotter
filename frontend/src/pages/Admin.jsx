import { useOutletContext } from "react-router";

export function AdminDashboard() {
  const OutletConextData = useOutletContext();

  return (
    <>
      <section>
        <h1>Admin</h1>
      </section>
    </>
  );
}
