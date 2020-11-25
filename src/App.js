import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import ChatRoom from "./components/ChatRoom";
import Home from './components/Home';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/:room_code/ChatRoom" component={ChatRoom} />
      </Switch>
    </Router>
  );
}

export default App;
