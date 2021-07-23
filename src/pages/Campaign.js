import React, { Component } from 'react';
import {Image} from 'cloudinary-react'
import Web3 from 'web3';
import SaveChildren from '../abis/SaveChildren.json'
import '../components/App.css';
import Discover from './Discover';
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
        await this.printDonors()
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

    async printDonors(){
        const mainDiv = document.getElementById('donors')
        const len = await this.state.contract.methods.getDonorsLength(this.state.campaign.id).call()
        const donors = await this.state.contract.methods.getDonors(this.state.campaign.id).call()
        for(var i =0;i<Math.min(3, len);i++){
            const donation = donors[i]
            const div = document.createElement('div')
            div.style = "border-bottom: 1px solid black; padding: 10px;"

            const span = document.createElement('span')

            const image = document.createElement('img')
            image.src = "https://cdn.discordapp.com/attachments/837326649074516048/867532401155899421/ethlogo.png"
            image.style = "margin-bottom: 35px; padding-right: 7px;"

            const leviSpan = document.createElement('span')
            leviSpan.style = "display: inline-block;"

            const adresa = document.createElement('p')
            adresa.innerHTML = donation.from
            adresa.style = "font-weight: bold; font-size: 16px;"

            const amount = document.createElement('p')
            amount.innerHTML = donation.amount/(10**18) + " eth"
            amount.style = "font-size: 20px;"

            leviSpan.appendChild(adresa)
            leviSpan.appendChild(amount)

            span.appendChild(image)
            span.appendChild(leviSpan)

            div.appendChild(span)
            mainDiv.appendChild(div)
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
    sendEmail(e) {
        e.preventDefault();
    
        emailjs.sendForm('service_7zotz9y', 'template_2uirx3l', e.target, 'user_4u7WjbA2GZUJYYM6i8nrV')
          .then((result) => {
              console.log(result.text);
          }, (error) => {
              console.log(error.text);
          });
    }

    donate = () => {
        this.state.contract.methods.donate(parseInt(this.state.campaign.id), this.state.email)
        .send({from: this.state.account, value: parseFloat(this.state.amount)*(10**18)})

        .then(() => {
            var templateParams = {
            user_email: this.state.campaign.email
        };
        emailjs.send('service_7zotz9y', 'template_2uirx3l', templateParams, 'user_4u7WjbA2GZUJYYM6i8nrV')
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
            }, function(error) {
                console.log('FAILED...', error);
            });
        })
        
    }


    render(){

        return(
            <div>
                <nav className="navbar navbar-expand-lg ">
                    <div className="container px-4 px-lg-5">
                        <a className="navbar-brand" href="#!">Support Children</a>
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"><span className="navbar-toggler-icon" /></button>
                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
                                <li className="nav-item"><a className="nav-link active" aria-current="page" href="#!" onClick={this.moveToHome}>Home</a></li>
                                <li className="nav-item"><a className="nav-link active" href="#!" onClick={this.moveToDiscover}>Discover</a></li>
                                <li className="nav-item"><a className="nav-link active" href="#!" onClick={this.moveToCreate}>Create a Campaign</a></li>
                            </ul>
                        </div>
                    </div>
                </nav>
                {/* SLIKA I NASLOV */}
                <div className="container">
                    <div className="row">
                        <div className="col" >
                            <div id = "TitleAndImage" className = "titleAndImage">
                                <h1>{this.state.campaign.name}</h1>
                                <Image cloudName="nftauction" publicId={this.state.campaign.imageUrl} className = "kita"/>
                            </div>
                            <div style = {{marginTop: "15px", borderBottom: "4px solid blueviolet", paddingBottom: '10px'}}> <span> <img src = "https://cdn.discordapp.com/attachments/837326649074516048/867532401155899421/ethlogo.png"/> <strong>{this.state.campaign.owner} </strong>created this campaign </span> </div>
                            {/* DESKRIPCIJA */}
                            <div style={{marginTop: "15px", fontSize: "20px"}}>
                                <p>{this.state.campaign.description}</p>
                            </div>
                            {/* DONIRANJE I PRIKAZ DONATORA */}
                        </div>

                        <div className = "box1 col">
                            <div className = "box-top" style = {{paddingTop: '10px'}}>
                                <strong><span style={{fontSize: "24px"}}>{parseInt(this.state.campaign.raised)/(10**18)}ETH   </span></strong>
                                <span>raised of {parseInt(this.state.campaign.goal)/(10**18)}ETH goal</span>
                                <ProgressBar className="bar1" max={parseInt(this.state.campaign.goal)/(10**18)} now = {parseInt(this.state.campaign.raised)/(10**18)} style ={{margin :'10px 10px 10px 10px'}}/>
                            </div>
                            <form className = "donationForm" onSubmit ={this.sendEmail}>
                                <div className = "donationTop">
                                    <input name = "user_email" className = "donationMail" placeholder="Enter your email" onChange = {evt => this.updateEmail(evt)}></input>
                                </div>
                                <div className = "donationBottom">
                                    <input onChange = {evt =>  this.upadateAmount(evt)} name = "donation_amount" placeholder = "Enter the amount you want to donate"></input>
                                    <button className = 'btn btn-primary' style = {{marginLeft: '10px', backgroundColor: 'blueviolet'}} onClick = {this.donate} type = "submit">Donate</button>
                                </div>
                            </form>
                            <div id = "donors"><h3 style = {{borderBottom: '1px solid black', paddingBottom: '8px'}}>Recent donation: </h3></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Campaign;