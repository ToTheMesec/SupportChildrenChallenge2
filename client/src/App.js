import React, {Fragment, Component} from 'react';
import logo from './logo.svg';
import Web3 from 'web3';
import SupportChildren from "./abis/SupportChildren.json";
import './App.css';
import Header from './components/Header';
import Moment from 'moment';

//REZERVISATI ZA HOME PAGE
class App extends Component{

  constructor(props){
    super(props)
    this.state = {
      contract: null,
      account: '',
      campaigns: []
    }
  }

  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
    await this.getCampaigns();
  } 
  async getCampaigns () {
    try {
      const response = await fetch("http://localhost:5000/campaigns")
      const jsonData = await response.json()

      this.setState({
        campaigns: jsonData.slice(0, 3)
      })

    } catch (err) {
      console.log(err.message);
    }
  }

  

  async loadWeb3(){
    if(window.ethereum){
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }else if(window.web3){
      window.web3 = new Web3(window.web3.currentProvider)
    }else{
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accountWeb3 = await web3.eth.getAccounts()
    this.setState({account: accountWeb3[0]})

    const addressField = document.getElementById("address")
    addressField.innerHTML = accountWeb3[0]

    const networkId = await web3.eth.net.getId()
    const networkData = await SupportChildren.networks[networkId]
    if(networkData) {
        const abi = SupportChildren.abi
        const address = networkData.address
        const contractWeb3 = new web3.eth.Contract(abi, address)

        this.setState({contract: contractWeb3})

    } else {
        window.alert('Smart contract not deployed to detected network')
    }
  }

  
  render() {
    return (
        <div >
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
            <meta name="description" content="true" />
            <meta name="author" content="true" />
            {/* Favicon*/}
            <link rel="icon" type="image/x-icon" href="../startbootstrap-shop-homepage-gh-pages/assets/favicon.ico" />
            {/* Bootstrap icons*/}
            <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css" rel="stylesheet" />
            {/* Core theme CSS (includes Bootstrap)*/}
            <link href="../startbootstrap-shop-homepage-gh-pages/css/styles.css" rel="stylesheet" />
            {/* Navigation*/}
            
            {/* Header*/}
            <div id="hero" className="slika py-5">
              <div className="container">
                <span className="clearfix">
                  <h1 id="glavniH1">Be part of the equal <br/>future you want to see</h1>
                </span>
                <span className="clearfix">
                  <h2 id="glavniH2">You can help anyone from anywhere in the world!<br/> Get started today.</h2>
                </span>
                <button id="donacija">Donate now</button>
                <div id="totalDonation" >
                  <p className="total">Total Donated</p>
                  <p className="numberTotal">32,323.2 ETH</p>   
                </div>
                </div>
            </div>
            <div id="everyone">
              <h4 className="together">Connected together with DeFi</h4>
              <h1 id="glavniH1">Everyone deserves to be happy</h1>
              <p className="tekstEveryone"> Let’s spread the word about your cause and raise funds for every<br/> cause that matters. We make it easy for you to raise money for your<br/> projects and ideas by bringing your project to people who care. </p>   
            </div>
            {/* Section*/}
            <div className = "container">
              <h1 id="change">Our change starts now</h1>

              <div id = "myID" className = "row gx-0 mb-5" style = {{paddingLeft: '40px'}}>
              {this.state.campaigns.map(campaign => (
                        <div className = "card" id = {campaign.camp_id} onClick = {function(){window.location.href = "/campaign/" + campaign.camp_id}} key = {campaign.camp_id}>
                            <div className = "card-img-top">
                            <img src = {campaign.camp_url}></img>
                            </div>
                            <div className = "card-body">
                              <p className = "card-title">{campaign.camp_title}</p>
                              <p className = "card-text">{campaign.camp_description}</p>
                              <p style={{color : "#959595", marginBottom: "1px"}}>Created {Moment(campaign.camp_deadline).format('L')}</p>
                              <progress value = {campaign.camp_raised} max = {campaign.camp_goal} className = "progress"></progress>

                              <p className = "card-text"><strong>Donated {campaign.camp_raised}</strong> of {campaign.camp_goal}</p>
                            </div>
                            
                        </div>
                    ))}
              </div>
            </div>

            <footer className="py-5 bg-dark">
              <div className="container"><p className="m-0 text-center text-white">Copyright © ToTheMoon Team 2021</p></div>
            </footer>
        </div>
    );
}
}

export default App;
