import React, {Fragment, Component} from 'react';
import DonateCampaign from './DonateCampaign';
import Web3 from 'web3';
import SupportChildren from "../abis/SupportChildren.json";
import flage from '../images/Flageimage.png';
import clock from '../images/clockimage.png';
import background from '../images/Frame.png';
import '../App.css';
import Moment from 'moment';


class ListCampaign extends Component  {

    constructor(props){
        super(props);
        this.toggleSortDate = this.toggleSortDate.bind(this)
        this.state = {
            contract: null,
            account : '',
            searchTerm: '',
            isOldestFirst: true,
            campaigns: [],
            category: ''
        }
    }

    async componentWillMount() {
        await this.getCampaigns()
        await this.loadWeb3();
        await this.loadBlockchainData();
      } 

    async getCampaigns () {
        try {
            const response = await fetch("http://localhost:5000/campaigns")
            const jsonData = await response.json()

            this.setState({
                campaigns: jsonData
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

    sortByDate () {
        const {campaigns} = this.state
        let newPostList = campaigns
        if (this.state.isOldestFirst) {
          newPostList = campaigns.sort((a, b) => Date.parse(a.camp_datecreated) - Date.parse(b.camp_datecreated))
        } else {
          newPostList = campaigns.sort((a, b) =>  Date.parse(a.camp_datecreated) - Date.parse(b.camp_datecreated))
        }
        this.setState({
          isOldestFirst: !this.state.isOldestFirst,
          campaigns: newPostList
        })
    }
    
    toggleSortDate (event) {
        console.log("evo me")
        this.sortByDate()
    }



    render(){
        return(
            <Fragment>
                <div>
                    <div className="dist2">
                    <div className="toptext">
                        <p>Together, we can make a difference in our communities.</p>
                    </div>
                    <div className="toptext">
                    <div className="textontop">
                        <div  style={{backgroundImage: `url(${background})`,backgroundRepeat: 'no-repeat',backgroundPosition:'center', font: 'Jost sans-serif'}}>
                        <p>Let's do it</p>
                        </div>			 
                    </div>
                    </div>
                    <div className="almost">
                        <select className = "category form-select"  onChange = {e => this.setState({category:e.target.value})}>
                            <option value = "" selected>Category</option>
                            <option value = "health">Health</option>
                            <option value = "education">Education</option>
                            <option value = "last">Last wish</option>
                            <option value = "ideas">Ideas</option>
                        </select>
                        <div className="recent" onclick="">
                            <button>
                                <img src={flage} alt="" height="22px" width="22px" style={{float: 'left'}} />
                                <a>Almost finished</a>  
                            </button>
                        </div>
                        <div className="recent">
                            <button onClick={evt => this.toggleSortDate(evt)}>
                                <img src={clock} alt="" height="22px" width="22px" style={{float: 'left'}} />
                                <a>Recent</a> 
                            </button>
                        </div>
                        <input type = "text" placeholder = "Search..." onChange = {evt => this.setState({searchTerm: evt.target.value})} className = "search" />
                    </div>
                    <div classname = "container text-center d-flex" style = {{marginTop: "50px"}}>
                        {this.state.campaigns.filter((campaign) => {
                        if(!Boolean(campaign.camp_isfinished)){
                            console.log(campaign.camp_category)
                            if(this.state.searchTerm == "" && this.state.category == ""){
                                return campaign;
                            }else if(campaign.camp_title.toLowerCase().includes(this.state.searchTerm.toLowerCase()) && campaign.camp_category.toLowerCase().includes(this.state.category.toLocaleLowerCase())){
                                return campaign;
                            }
                        }
                        }).map(campaign => (
                            <div className = "card" id = {campaign.camp_id} onClick = {function(){window.location.href = "/campaign/" + campaign.camp_id}} key = {campaign.camp_id} style = {{marginLeft: "90px"}}>
                                <div className = "card-img-top" >
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
                </div>
            </Fragment>
        )
    }
}

export default ListCampaign;