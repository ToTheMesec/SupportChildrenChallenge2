import React, { Component } from 'react';
import Web3 from 'web3';
import SaveChildren from '../abis/SaveChildren.json'
import '../components/App.css';
import Discover from './Discover';
import ReactDOM from "react-dom";
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
            date: ''
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

            const lastItem = window.location.pathname.split("/").pop()
            const campaign = await contract.methods.campaigns(parseInt(lastItem)).call()

            // const unixTime = campaign.timeCreated;
            // const date = new Date(unixTime*1000);
            // console.log(date.toLocaleDateString("en-GB"));

            console.log(campaign)

            this.setState({ 
                contract: contract, 
                campaign: campaign,
                date: campaign.timeCreated
            })

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
            const li = document.createElement('li')

            const image = document.createElement('img')
            image.src = "https://cdn.discordapp.com/attachments/837326649074516048/867532401155899421/ethlogo.png"

            const p = document.createElement('p')
            p.innerHTML = donation.amount/(10**18) + " ETH"

            const h = document.createElement('h3')
            h.innerHTML = donation.from

            li.appendChild(image)
            li.appendChild(p)
            li.appendChild(h)
            mainDiv.appendChild(li)
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

        // emailjs.sendForm('service_7ksffb7', 'template_4nal1hg', e.target, 'user_2AtKMM5Ljcoy0GZ33Dhia')
        //   .then((result) => {
        //       console.log(result.text);
        //   }, (error) => {
        //       console.log(error.text);
        //   });
    }

    donate = () => {
        this.state.contract.methods.donate(parseInt(this.state.campaign.id), this.state.email)
        .send({from: this.state.account, value: parseFloat(this.state.amount)*(10**18)})
        .then(() => {
            var templateParams = {
                user_email: this.state.email,
                donation_amount: this.state.amount,
                campaign_name: this.state.campaign.name,
            };
        emailjs.send('service_7ksffb7', 'template_4nal1hg', templateParams, 'user_2AtKMM5Ljcoy0GZ33Dhia')
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
            }, function(error) {
                console.log('FAILED...', error);
            });
            var amount1 = parseFloat(this.state.amount) * (10**18)
            console.log("this.state.campaign.raised: " + this.state.campaign.raised)
            console.log("this.state.campaign.goal: " + this.state.campaign.goal)

            console.log("FFFFFF1: " + (this.state.campaign.raised - (parseFloat(this.state.amount) *(10**18))))
            console.log("FFFFFF2: " + parseInt(parseInt(this.state.campaign.raised) + amount1))
            if((parseInt(this.state.campaign.raised)-amount1) < parseInt(this.state.campaign.goal) && (parseInt(this.state.campaign.raised) + amount1) >= parseInt(this.state.campaign.goal)){
                console.log("Usao u IF")
                this.alertEveryone()
            }

        })
        
        
        
    }

    async alertEveryone(){
        const mails = await this.state.contract.methods.getMailsById(this.state.campaign.id).call()
        const mailsSet = [...new Set(mails)]
        const len = mails.length
        for(var i =0;i<len;i++){
            var templateParams = {
                user_email: mailsSet[i],
                campaign_name: this.state.campaign.name
            };
            emailjs.send('service_51ifv2q', 'template_3ai231s', templateParams, 'user_AzzxvRUXgtcUIpvSjfoOA')
            .then(function(response){
                console.log("SUCCESS!", response.status, response.text);
            }, function(error){
                console.log('FAILED...', error);
            });

        }
    }


    render(){

        return(
            <div>
                <section className = "campaign-details">
                    <div className = "container">
                        <div className= "row">
                            <div className = "col-lg-8 col-md-12">
                                <div className = "campaign-content">
                                    <h3>{this.state.campaign.name}</h3>
                                    <div className = "campaign-content-top">
                                        <div className = "campaign-image">
                                            <img alt="" src = {this.state.campaign.imageUrl}/>
                                        </div>
                                        <div className = "campaign-progress">
                                            <div className = "campaign-progress-top">
                                                <progress value = {this.state.campaign.raised} max ={this.state.campaign.goal}>ETH</progress>
                                            </div>
                                            <div className = "campaign-progress-bottom">
                                                <p><strong>Raised: </strong>{this.state.campaign.raised / (10**18)} ETH</p>
                                                <p><strong>Goal: </strong>{this.state.campaign.goal / (10**18)} ETH</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p>{this.state.campaign.description}</p>
                                </div>
                            </div>
                            <div className = "col-lg-4 col-md-12">
                                <div className = "campaign-side">
                                    <div className = "campaign-owner">
                                        <img alt="" src = "https://cdn.discordapp.com/attachments/837326649074516048/867532401155899421/ethlogo.png"></img>
                                        <p>Created {(new Date(this.state.date*1000)).toLocaleDateString("en-GB")}</p>
                                        <p> -</p>
                                        <p>Ends {(new Date(this.state.campaign.blockDeadline *1000)).toLocaleDateString("en-GB")}</p>
                                        <h5>Organizer:</h5>
                                        <h3><strong>{this.state.campaign.owner}</strong> </h3>
                                    </div>
                                    <form className = "campaign-donate" onSubmit ={this.sendEmail}>
                                            <p>Enter your email: </p>
                                            <input style = {{width: '80%'}} placeholder = " youremail@mail.com" name = "user_mail" onChange = {evt => this.updateEmail(evt)}></input>
                                            <p>The amount you would like to donate</p>
                                            <input placeholder = " 10 ETH" type = "number" step="0.0000001" name = "donation_amount" onChange = {evt =>  this.upadateAmount(evt)}></input>
                                            <button className = "btn btn-primary" type = "submit" onClick = {this.donate} >Donate</button>
                                    </form>
                                    <div className = "campaign-donations">
                                        <h4 className = "campaign-donations-title">Donations</h4>
                                        <ul className = "campaign-donations-list" id = "donors"></ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <footer className="py-5 bg-dark">
                    <div className="container"><p className="m-0 text-center text-white">Copyright © ToTheMoon Team 2021</p></div>
                </footer>
            </div>
        );
    }
}

export default Campaign;