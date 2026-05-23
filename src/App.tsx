import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/form/register";
import Login from "./pages/form/login";
import PrivateRoute from "./lib/PrivateRoute";
import { Home } from "./pages/Home";
import UserRoute from "./lib/UserRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <UserRoute>
            <Login />
          </UserRoute>
        } />
        <Route path="/register" element={<UserRoute><Register /></UserRoute>} />
        <Route path="/*" element={<PrivateRoute><Home /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
