import React, { Component } from 'react';
import Web3 from 'web3';
import SaveChildren from '../abis/SaveChildren.json'
import '../components/App.css';


class Home extends Component{

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
        await this.printCampaigns()
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

        } else {
            window.alert('Smart contract not deployed to detected network')
        }
    }

    async printCampaigns(){
        const totalSupply = await this.state.contract.methods.getCampaignsLength().call()
        const mainDiv = document.getElementById("myID")
            for(var i = 0;i<totalSupply;i++){
                const campaign = await this.state.contract.methods.campaigns(i).call()
                if(campaign.isFinished === true){//TODO Ovo vremenski kad istekne pa da ide continue;
                    continue;
                }
                
                const _div = document.createElement('div')
                _div.id = i.toString();
                _div.className = 'col-md-4 mb-5 card'
                _div.style = "background-color: #F4F9F9"

                _div.setAttribute("id", i);
                _div.onclick = function () {
                    window.location.href="/campaign/"+ _div.id;
                }

                const cardBody = document.createElement('div')
                cardBody.className = "card-body"

                const title = document.createElement('h4')
                title.className = "card-title"
                title.style="font-weight: bold"
                title.innerHTML = campaign.name

                const date = document.createElement('p')
                const unixTime = campaign.blockDeadline;
                const date1 = new Date(unixTime*1000);
                //console.log(date1.toLocaleDateString("en-GB"));
                date.style="font-weight: 550"
                date.innerHTML = "End date: " + date1.toLocaleDateString("en-GB")


                const image = document.createElement('img')
                image.src = campaign.imageUrl
                image.className = "card-img-top"

                const prog = document.createElement('div')
                prog.style = "display: block;"

                const progressInstance = document.createElement('progress')
                progressInstance.value = campaign.raised
                progressInstance.max = campaign.goal
                progressInstance.className = "progress"
                progressInstance.style = 'margin-top: 10px; margin-bottom: 10px;'

                const progGoals = document.createElement('div')
                progGoals.style = "display: flex; font: 15px Jost bold"

                const parGoal = document.createElement('p')
                parGoal.innerHTML = "Raised: " + campaign.raised/(10**18) + " ETH"
                parGoal.style = "padding-right: 160px;"

                const parRaised = document.createElement('p')
                parRaised.innerHTML = "Goal: " + campaign.goal/(10**18) + " ETH"

                const button = document.createElement('button')
                button.className = "btn btn-primary"
                button.innerHTML = "Donate now"
                button.style = "margin-top: 15px;"

                progGoals.appendChild(parGoal)
                progGoals.appendChild(parRaised)

                prog.appendChild(progressInstance)
                prog.appendChild(progGoals)


                cardBody.appendChild(prog)
                cardBody.appendChild(title)
                cardBody.appendChild(date)
                cardBody.appendChild(button)

                _div.appendChild(image)
                _div.appendChild(cardBody)

                mainDiv.appendChild(_div)
            }
    }

    render() {
        return (
            <div >
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
                <meta name="description" content="true" />
                <meta name="author" content="true" />
                <title>Shop Homepage - Start Bootstrap Template</title>
                {/* Favicon*/}
                <link rel="icon" type="image/x-icon" href="../startbootstrap-shop-homepage-gh-pages/assets/favicon.ico" />
                {/* Bootstrap icons*/}
                <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css" rel="stylesheet" />
                {/* Core theme CSS (includes Bootstrap)*/}
                <link href="../startbootstrap-shop-homepage-gh-pages/css/styles.css" rel="stylesheet" />
                {/* Navigation*/}
                
                {/* Header*/}
                <div className="slika py-5">
                    <div className="container px-4 px-lg-5 my-5">
                        <div className="text-center">
                            <h1 className="display-4 fw-bolder" style = {{textShadow:"-1px -1px 0 #808080 , 1px -1px 0 #808080 , -1px 1px 0 #808080 , 1px 1px 0 #808080", textDecoration: 'none', color: "#000", fontFamily: "Verdana", fontWeight: "bold", fontSize: "60px"}}>Support Children</h1>
                            <p className="lead fw-normal mb-0" style={{color: "#000", fontFamily: "Verdana", fontWeight: "200", fontSize: "20px"}}>Donate in the most secure way, in the DeFi way!</p>
                        </div>
                    </div>
                </div>
                {/* Section*/}
                <div className = "container">

                    <div id = "myID" className = "row" style = {{paddingLeft: '40px'}}></div>

                </div>

                <footer className="py-5 bg-dark">
                    <div className="container"><p className="m-0 text-center text-white">Copyright © ToTheMoon Team 2021</p></div>
                </footer>
            </div>
        );
    }



}

export default Home;