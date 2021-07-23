import React, { Component } from 'react';
import Web3 from 'web3';
import SaveChildren from '../abis/SaveChildren.json'
import '../components/App.css';
import App from '../components/App';
import Campaign from './Campaign';
import ReactDOM from "react-dom";
import Home from "./Home"

class Discover extends Component{

    constructor(props){
        super(props)
        this.state = {
            contract: null,
            account: '',
            campaigns: []
        }
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
            this.setState({ contract: contract})

            const campaigns = await contract.methods.getCampaigns().call()
            this.setState({ campaigns: [...this.state.campaigns, campaigns]})
            console.log("Kampanje: ")
            console.log(this.state.campaigns)

            //printing all campaigns
            const totalSupply = await contract.methods.getCampaignsLength().call()
            const mainDiv = document.getElementById("myID")
            for(var i = 0;i<totalSupply;i++){
                const campaign = await contract.methods.campaigns(i).call()
                //console.log(campaign)

                const _div = document.createElement('div')
                _div.id = i.toString();
                _div.className = 'card'
                _div.onclick = function () {
                    ReactDOM.render(<Campaign id={_div.id}/>, document.getElementById('root'))//Ovde NE setuje vrednost iz for petlje
                }                                                                                //jer se ne poziva odmah vec tek po kliku

                const cardBody = document.createElement('div')
                cardBody.className = "card-body"

                const title = document.createElement('h4')
                title.className = "card-title"
                title.innerHTML = campaign.name

                const description = document.createElement('p')
                description.className = "card-text"
                description.innerHTML = campaign.description

                const image = document.createElement('img')
                image.src = campaign.imageUrl
                image.className = "card-img-top"
                console.log(image.src)

                const progressInstance = document.createElement('progress')
                progressInstance.value = campaign.raised;
                progressInstance.max = campaign.goal;

                cardBody.appendChild(title)
                cardBody.appendChild(description)
                cardBody.append(progressInstance)

                _div.appendChild(image)
                _div.appendChild(cardBody)

                mainDiv.appendChild(_div)
            }



        } else {
            window.alert('Smart contract not deployed to detected network')
        }
    }

    moveToCreate = () => {
        ReactDOM.render(<App />, document.getElementById('root'))
    }

    moveToDiscover = () => {
        ReactDOM.render(<Discover />, document.getElementById('root'))
    }

    moveToHome = () => {
        ReactDOM.render(<Home />, document.getElementById('root'))
    }

    render() {
        return (
            <div>
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
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
                <div className="container-fluid mt-5">
                    <div className="row">
                        <main role="main" className="col-lg-12 d-flex text-center">

                        </main>
                    </div>
                    <div className = "row text-center" style = {{backgroundImage: this.state.urlSlike, backgroundRepeat: 'no-repeat'}}>
                        <div id = "myID" className = "col-mb-3 mb-3"></div>
                    </div>

                </div>
            </div>
        );
    }

}

export default Discover;