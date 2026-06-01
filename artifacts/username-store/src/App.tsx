import { Router as WouterRouter, Route, Switch } from "wouter";
import HomePage from "@/pages/Home";

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Switch>
        <Route path="/" component={HomePage} />
      </Switch>
    </WouterRouter>
  );
}

export default App;
