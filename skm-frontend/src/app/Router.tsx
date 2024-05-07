import { Route, Routes } from "react-router-dom";
import { Layout } from "./Layout";
import { HomePage } from "src/pages/HomePage";

export const Router = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
      </Route>
    </Routes>
  );
};
