// src/App.jsx
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppWrapper from "./AppWrapper"; // move logic here

const App = () => (
  <Router>
    <AppWrapper />
  </Router>
);

export default App;
