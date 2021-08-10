import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Header from './components/Header'
import InputCampaign from './components/InputCampaign';
import ListCampaign from './components/ListCampaign';
import CampaignView from './components/CampaignView';
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import UserDashBoard from './components/UserDashboard';
import DonationView from './components/DonationView';

const Routing = () => {
  return(
      <Router>
          <Header/>
          <Switch>
              <Route exact path="/" component={App} />
              <Route exact path="/Discover" component={ListCampaign}/>
              <Route path="/discover" component={ListCampaign} />
              <Route path="/create-campaign" component={InputCampaign} />
              <Route path="/campaign/:id" component={CampaignView} />
              <Route path="/user-dashboard" component={UserDashBoard} />
              <Route path="/campaign-donation/:id" component={DonationView} />
          </Switch>
      </Router>
  )
}

ReactDOM.render(<Routing />, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
