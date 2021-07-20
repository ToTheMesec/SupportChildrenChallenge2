import React, { Component } from 'react';
import {Image} from 'cloudinary-react'
import Web3 from 'web3';
import SaveChildren from '../abis/SaveChildren.json'
import '../components/App.css';
import Discover from './Discover';
import App from '../components/App';
import ReactDOM from "react-dom";
import ProgressBar from 'react-bootstrap/ProgressBar';
import emailjs from 'emailjs-com';

class Campaign extends Component{

    constructor(props){
        super(props)
        this.state = {
            contract: null,
            account: '',
            campaign: '',
            amount: '',
            email: '',
        }
    }

    updateEmail(evt) {
        this.setState({
            email: evt.target.value
        })

    }

    async componentWillMount() {
        await this.loadWeb3()
        await this.loadBlockchainData()
    }


    async loadWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
        }
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
        }
        else {
            window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    }


    async loadBlockchainData() {
        const web3 = window.web3
        // Load account
        const accounts = await web3.eth.getAccounts()
        this.setState({account: accounts[0]})

        const networkId = await web3.eth.net.getId()
        const networkData = SaveChildren.networks[networkId]
        if(networkData) {
            const abi = SaveChildren.abi
            const address = networkData.address
            const contract = new web3.eth.Contract(abi, address)
            console.log("ID div-a na koji si kliknuo: " + this.props.id)
            const campaign = await contract.methods.campaigns(parseInt(this.props.id)).call()
            console.log(campaign)

            this.setState({ contract: contract, campaign: campaign})

            console.log(this.state.date)

        } else {
            window.alert('Smart contract not deployed to detected network')
        }

    }

    moveToDiscover = () => {
        ReactDOM.render(<Discover />, document.getElementById('root'))
    }

    upadateAmount(evt) {
        this.setState({
          amount: evt.target.value
        });
      }

    donate = () => {
        this.state.contract.methods.donate(parseInt(this.state.campaign.id), this.state.email)
        .send({from: this.state.account, value: parseFloat(this.state.amount)*(10**18)})


        var templateParams = {
            user_email: this.state.campaign.email,
        };
        emailjs.send('service_7zotz9y', 'template_2uirx3l', templateParams, 'user_4u7WjbA2GZUJYYM6i8nrV')
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
            }, function(error) {
                console.log('FAILED...', error);
            });
    }

    sendEmail(e) {
        e.preventDefault();
    
        emailjs.sendForm('service_7zotz9y', 'template_2uirx3l', e.target, 'user_4u7WjbA2GZUJYYM6i8nrV')
          .then((result) => {
              console.log(result.text);
          }, (error) => {
              console.log(error.text);
          });
    }

    moveToDiscover = () => {
        ReactDOM.render(<Discover />, document.getElementById('root'))
    }
    
    moveToCreate = () => {
        ReactDOM.render(<App />, document.getElementById('root'))
    }

    render(){

        return(
            <div>
                <header id="header" className="d-flex align-items-center">
                    <div className="container d-flex align-items-center justify-content-between">

                        <h1 className="logo"><a href="index.html">TTM</a></h1>

                        <nav id="navbar" className="navbar">
                            <ul>
                                <li><a className="nav-link scrollto" href="../public/home.html">Home</a></li>
                                <li><a className="nav-link text-white" onClick = {this.moveToDiscover}>Discover</a></li>
                                <li><a onClick = {this.moveToCreate} className = "nav-link text-white"><span>Create a campaign</span> <i className="bi bi-chevron-down"></i></a></li>
                                <li className = "nav-item text-nowrap d-none d-sm-none d-sm-block">
                                    <small className = "text-white"><span id = "account">{this.state.account}</span></small>
                                </li>
                            </ul>
                            <i className="bi bi-list mobile-nav-toggle"></i>
                        </nav>

                    </div>
                </header>
                {/* SLIKA I NASLOV */}
                <div id = "TitleAndImage">
                    <h1>{this.state.campaign.name}</h1>
                    <Image  style={{width: "300px", height: "300px"}}cloudName="nftauction" publicId={this.state.campaign.imageUrl} className = "slika"/>
                </div>
                {/* DESKRIPCIJA */}
                <div>
                    <p>{this.state.campaign.description}</p>
                </div>
                {/* DONIRANJE I PRIKAZ DONATORA */}
                <div className = "box">
                    <div className = "box-top">
                        <h3>{parseInt(this.state.campaign.raised)/(10**18)} RAISED</h3>
                        <ProgressBar max={parseInt(this.state.campaign.goal)/(10**18)} now = {parseInt(this.state.campaign.raised)/(10**18)} style ={{margin :'10px 10px 10px 10px'}}/>
                    </div>
                    <form style = {{borderBottom: '1px solid black'}} onSubmit ={this.sendEmail}>
                        <input name = "user_email" type="text" placeholder="Enter your email" onChange = {evt => this.updateEmail(evt)}></input>
                        <input onChange = {evt =>  this.upadateAmount(evt)} style = {{border: '1px solid black'}} name = "donation_amount"></input>
                        <button className = 'btn btn-primary' onClick = {this.donate} type = "submit">Donate</button>
                    </form>
                </div>
            </div>
        );
    }
}

export default Campaign;