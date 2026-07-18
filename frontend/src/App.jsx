import { BrowserRouter, Routes, Route } from "react-router-dom";
import HMS from "./HMS";
import RegistrationForm from "./pages/RegistrationForm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/registration" element={<RegistrationForm />} />
        <Route path="*" element={<HMS />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
