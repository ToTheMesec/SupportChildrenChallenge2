import React, {Fragment, Component} from 'react';
import logo from '../logo.svg';
import Web3 from 'web3';
import SupportChildren from "../abis/SupportChildren.json";
import '../App.css';
import {NavLink} from 'react-router-dom';

class CampaignView extends Component {

    constructor(props){
        super(props)
        this.state = {
          contract: null,
          account: '',
          campaign: '',
          campaignBC: '',
          amountETH: '',
          amountERC: '',
          email: '',
          path: ''
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
  

      render(){
          return(
            <Fragment>
                <div className="dist1">
                  <div className="middle">
                    <div className="title">
                      <a>{this.state.campaign.camp_title}</a>
                    </div>
                    <div className="mainsell">
                      {/* <img className="img" src={image15} alt="" /> */}
                      <img className = "campSlika" src = {this.state.campaign.camp_url}></img>
                    </div>
                    <div className="buttonsfraime">
                  <ol>
                      <div className="timeleft">
                        <div className="timetext">Time left</div>
                        <div className="timeclock">
                          <a>50 days 20 hours 38 minutes</a>
                        </div>
                      </div>
                      <div className="buttonPos">
                        <NavLink to = {this.state.path}><button className="buttonCamp" type="button" onclick="#">Donate Now</button></NavLink>
                      </div>
                      <div>
                        <progress id="file" value={this.state.campaign.camp_raised} max={this.state.campaign.camp_goal}></progress>
                      </div>
                      <div>
                        <label>{this.state.campaign.camp_raised}</label><a> out of </a><label>{this.state.campaign.camp_goal}</label>
                      </div>
                      <div style = {{fontFamily: 'Bebas Neue'}}>
                        <div className="lasttopdon" style={{fontSize:'22px'}}>Top donators</div>
                        <div className='listofdon'>
                          <a>Metamask</a>
                          <a style={{float:'right'}}>Amount</a>
                        </div>
                        <div className='listofdon'>
                          <a>Metamask</a>
                          <a style={{float:'right'}}>Amount</a>
                        </div>
                        <div className='listofdon'>
                          <a>Metamask</a>
                          <a style={{float:'right'}}>Amount</a>
                        </div>
                        <div className="dono">
                          <button className="seealldonators" type="button"  onclick="#" data-toggle="modal" data-target="#exampleModal">See all donators</button>
                        </div>
                      </div>
                  
                    </ol>
                  
                </div>
                <div className="desc">		 
                  <div className="categoryCampView">
                    <strong className = "addressCampView">CRAETED BY: {this.state.campaignBC.beneficiary}  </strong>
                    <strong><a>{String(this.state.campaign.camp_category).toLocaleUpperCase()}</a></strong>
                  </div>
                  <div className="description">
                    <p>{this.state.campaign.camp_description}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  {

                  }
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                  <button type="button" class="btn btn-primary">Save changes</button>
                </div>
              </div>
            </div>
          </div>
          </Fragment>
          )
      }

}
export default CampaignView;