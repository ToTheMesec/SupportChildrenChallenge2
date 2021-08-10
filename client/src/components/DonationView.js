import React, { Component} from 'react';
import '../App.css';
import Web3 from 'web3';
import SupportChildren from "../abis/SupportChildren.json";
import IERC20 from '../abis/IERC20.json';
import NFT from '../abis/NFT.json';


class App extends Component{

    constructor(props){
        super(props)
        this.state = {
          contract: null,
          account: '',
          campaign: '',
          campaignBC: '',
          amount: '',
          email: '',
          currency: 'eth',
          path: '',
          dai: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
          enj: '0xd7cf37924617bce1569fe6b33414f6b2514aabd0',
          receipt: ''
        }
      }
    
      async componentWillMount() {
        await this.getCampaign();
        await this.loadWeb3();
        await this.loadBlockchainData();
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
    
            const camp = await contractWeb3.methods.campaigns(parseInt(this.state.campaign.camp_id)-1).call()

            this.setState({
              contract: contractWeb3,
              campaignBC: camp
            })
    
        } else {
            window.alert('Smart contract not deployed to detected network')
        }
      }

      async getCampaign () {
        try {
            const lastItem = window.location.pathname.split("/").pop()
            const response = await fetch("http://localhost:5000/campaigns/" + lastItem)
            const jsonData = await response.json()

            this.setState({
                campaign: jsonData,
                path: '/campaign-donation/' + jsonData.camp_id
            })

        } catch (err) {
            console.log(err.message);
        }
    }

    donate = (evt) => {
        console.log("Evo me")
        if(this.state.currency == "eth"){
            this.donateETH(evt)
        }else{
            this.donateERC(evt)
        }
    }

    donateERC = async (evt) =>{
        evt.preventDefault()
        const web3 = window.web3

        if(parseFloat(this.state.campaign.camp_raised) + parseFloat(this.state.amount) > parseFloat(this.state.campaign.camp_goal)){
            alert(`The campaign limit is ${this.state.campaign.camp_goal}`)
            return;
        }
        var _token = '';
        switch (this.state.currency) {
            case 'dai':
                _token = this.state.dai;
                break;
            case 'enj':
                _token = this.state.enj;
                break;
        }

        const abi = IERC20.abi

        const tokenContract = new web3.eth.Contract(abi, _token)

        await tokenContract.methods.approve("0x27ac2c35b9a33b486259395f3180c65486dfa723", String(this.state.amount*(10**18))).send({from: this.state.account})
        .then(() =>{
                //uint _campaignId, address _token, uint _amount, string memory _mail
            this.state.contract.methods.donateERC(parseInt(this.state.campaign.camp_id)-1, _token, String((this.state.amount)*(10**18)),this.state.email)
            .send({from: this.state.account}).once('receipt', (receipt) => {
                this.setState({
                  receipt: receipt
                })
            })
            .then(async () =>{
                try {
                    const body = {raised : (this.state.campaign.camp_raised + parseFloat(this.state.amount))};
                    const response = await fetch(`http://localhost:5000/campaigns/${this.state.campaign.camp_id}`, {
                        method: "PUT",
                        headers: {"Content-Type" : "application/json"},
                        body: JSON.stringify(body)
                    });
                    const lastItem = window.location.pathname.split("/").pop()
                    // window.location = "/campaign/" + this.state.campaign.camp_id;
                } catch (err) {
                    console.log(err.message);
                }
            }).then(async () => {
            if(parseFloat(this.state.campaign.camp_raised) + parseFloat(this.state.amount) == parseFloat(this.state.campaign.camp_goal)){
                try {
                const body = {isFinished: Boolean(true)}
                const response = await fetch(`http://localhost:5000/campaigns/${this.state.campaign.camp_id}/finish`, {
                    method: "PUT",
                    headers: {"Content-Type" : "application/json"},
                    body: JSON.stringify(body)
                });
                } catch (err) {
                console.log(err.message)
                }
            }
            
            })
        }).then(async() =>{
            const networkId = await web3.eth.net.getId();
            const networkData = NFT.networks[networkId];
            if(networkData){
                const abi = NFT.abi;
                const address = networkData.address
                const nft = new web3.eth.Contract(abi, address)

                nft.methods.mint(this.state.receipt, this.state.account).send({from: "0x2B44f59c4674dbad478e65961a586Dd98c439BD4"
            })
            }
        })
        
    }

    donateETH = (evt) =>{
        evt.preventDefault();

        console.log(this.state.campaign.camp_raised + this.state.amountETH)

        if(parseFloat(this.state.campaign.camp_raised) + parseFloat(this.state.amount) > parseFloat(this.state.campaign.camp_goal)){
          alert(`The campaign limit is ${this.state.campaign.camp_goal}`)
          return;
        }
        const web3 = window.web3

        this.state.contract.methods.donateETH(parseInt(this.state.campaign.camp_id)-1, this.state.email)
        .send({from: this.state.account, value: parseFloat(this.state.amount)*(10**18)})
        .then(async () =>{
            try {
                const body = {raised : (this.state.campaign.camp_raised + parseFloat(this.state.amountETH))};
                const response = await fetch(`http://localhost:5000/campaigns/${this.state.campaign.camp_id}`, {
                    method: "PUT",
                    headers: {"Content-Type" : "application/json"},
                    body: JSON.stringify(body)
                });
                const lastItem = window.location.pathname.split("/").pop()
                // window.location = "/campaign/" + this.state.campaign.camp_id;
            } catch (err) {
                console.log(err.message);
            }
        }).then(async () => {
          console.log("usao sam")
          if(parseFloat(this.state.campaign.camp_raised) + parseFloat(this.state.amount) == parseFloat(this.state.campaign.camp_goal)){
            try {
              const body = {isFinished: Boolean(true)}
              const response = await fetch(`http://localhost:5000/campaigns/${this.state.campaign.camp_id}/finish`, {
                method: "PUT",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify(body)
              });
            } catch (err) {
              console.log(err.message)
            }
          }
          
        }).then(async() =>{
            const networkId = await web3.eth.net.getId();
            const networkData = NFT.networks[networkId];
            if(networkData){
                const abi = NFT.abi;
                const address = networkData.address
                const nft = new web3.eth.Contract(abi, address)

                nft.methods.mint(this.state.receipt, this.state.account).send({from: "0x2B44f59c4674dbad478e65961a586Dd98c439BD4"
            })
            }
        })
    }

    render(){
    return (
        <div>
            <div className="alloncenter">
            <div>
            <div className="fundinfotext">
                <a>FUNDRAISING INFORMATION</a>
            </div>
            <div className="image15">
                <img src = {this.state.campaign.camp_url}></img>
                <div className="thankyou" >
                <p>THANK YOU FOR DONATING:</p>
                <a>{this.state.campaign.camp_title}</a>
                </div>
            </div>
            </div>
            <div>
            <div className="enterText">
            <a>ENTER AMOUNT</a>
            </div>
            <div style={{fontSize:'14px'}}>
            <a>Enter the amount you wnat to donate</a>
            </div>
            <div className="cryptolist">
            <form>
                <input className="inputform" placeholder="ENTER AMOUNT" type="number" step = "0.00000001" onChange = {evt => this.setState({amount: evt.target.value})}></input>
                <input placeholder= "ENTER EMAIL" className = "inputform" style = {{width: '200px', marginLeft: '15px'}} type = "text" onChange = {evt => this.setState({email: evt.target.value})}></input>
            </form>
            <div className="listofitems" style={{float:'right'}}>
                <select style={{borderStyle: 'none', fontSize:'30px',fontFamily: 'Bebas Neue', width: '80px', marginRight: '50px', marginTop: '-50px'}} onChange = {evt => this.setState({currency: evt.target.value})}>
                <option value="eth">ETH</option>
                <option value="dai">DAI</option>
                <option value="enj">ENJ</option>
                <option value="sand">SAND</option>
                <option value="ant">ANT</option>
                </select>
            </div>
            </div>
            <div>
                <button className="buttonFundCamp" type="button" onClick={evt => this.donate(evt)}>Donate Now</button>
            </div>
            </div>
            <div className="claimnft" >
            <b><center>DONATE AND CLAIM YOUR UNIQE NFT!</center></b>
            </div>
            <div>
            <div>
            </div>
            </div>
            </div>
        </div>
    );
}
}

export default App;