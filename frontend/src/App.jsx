import { Route, Switch } from "wouter";
import HMS from "./HMS";
import RegistrationForm from "./pages/RegistrationForm";

function App() {
  return (
    <Switch>
      <Route path="/registration">
        <RegistrationForm />
      </Route>
      <Route>
        <HMS />
      </Route>
    </Switch>
  );
}

export default App;
