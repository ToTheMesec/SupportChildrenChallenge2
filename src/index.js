import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css'
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import Home from './pages/Home'
import Campaign from "./pages/Campaign";
import Discover from "./pages/Discover";
import Header from "./pages/Header"

const Routing = () => {
    return(
        <Router>
            <Header/>
            <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/discover" component={Discover} />
                <Route path="/create-campaign" component={App} />
                <Route path="/campaign/:id" component={Campaign} />
            </Switch>
        </Router>
    )
}

ReactDOM.render(<Routing />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();