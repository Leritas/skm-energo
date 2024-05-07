import { NavLink } from "react-router-dom";

export const Header = () => {
  return (
    <header className=" h-24 w-full flex items-center border-fuchsia-900 border-2 bg-white sticky">
      <img
        src="./images/logo.jpg"
        className=" h-20 ml-4"
        alt="SkmEnergoservice"
      />
      <nav className=" flex gap-4 ml-auto mr-8">
        <NavLink to="/catalog">catalog</NavLink>
        <NavLink to="/contacts">contacts</NavLink>
      </nav>
    </header>
  );
};
