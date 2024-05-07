import { Outlet } from "react-router-dom";
import { Header } from "src/widgets/Header";
// import { Footer } from "src/widgets/Footer";

export function Layout() {
  return (
    <>
      <Header />
      <Outlet />
      {/* <Footer /> */}
    </>
  );
}