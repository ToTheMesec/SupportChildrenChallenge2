import React, { Component } from 'react';
import axios from 'axios';
import Web3 from 'web3';
import SaveChildren from '../abis/SaveChildren.json'
import './App.css';
import Discover from '../pages/Discover';
import ReactDOM from "react-dom";
import ProgressBar from 'react-bootstrap/ProgressBar'

class App extends Component {

  fileSelectedHandler = event => {
    console.log(event.target.files[0]);
    this.setState({
      selectedFile: event.target.files[0]
    })
  }

  fileUploadHandler = () => {
    const formData = new FormData();
    formData.append("file", this.state.selectedFile)
    formData.append("upload_preset", "nftauction")
    axios.post("https://api.cloudinary.com/v1_1/tothemoon/image/upload", formData, {
      onUploadProgress: progressEvent => {
        console.log("Upload progress " + Math.round(progressEvent.loaded/progressEvent.total * 100) + "%")
        this.setState({
          prog : progressEvent.loaded/progressEvent.total * 100
        })
      }
    })
        .then(res => {
          console.log(res.data.secure_url);
          this.setState({
            img: res.data.secure_url,
          })
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
      this.setState({ contract: contract})

      console.log(this.state.date)

    } else {
      window.alert('Smart contract not deployed to detected network')
    }

  }

  constructor(props){
    super(props)
    this.state = {
      name: '',
      desc: '',
      goal: '',
      date: '',
      email: '',
      img: '',
      prog:0,
      contract: null,
      account: ''

    }
  }

  createCampaign = () => {
    var timestamp = Date.parse(this.state.date)
    timestamp/=1000
    this.state.contract.methods.createCampaign(this.state.name, this.state.desc, this.state.account, timestamp, (parseFloat(this.state.goal)*(10**18)).toString(), this.state.email, this.state.img).send({from: this.state.account})
  }

  updateNameValue(evt) {
    console.log("Stavljamo vrednost imena: " + evt.target.value)
    this.setState({
      name: evt.target.value,
    });
  }

  updateDescValue(evt) {
    this.setState({
      desc: evt.target.value
    });
  }

  updateCampaignGoal(evt) {
    this.setState({
      goal: evt.target.value
    });
  }

  updateDate(evt) {
    this.setState({
      date: evt.target.value
    })
  }

  updateEmail(evt) {
    this.setState({
      email: evt.target.value
    })
  }

  moveToDiscover = () => {
    ReactDOM.render(<Discover />, document.getElementById('root'))
  }


  render() {
    return (
        <div style = {{backgroundColor: '#EC4646'}}>
          <header id="header" className="d-flex align-items-center">
            <div className="container d-flex align-items-center justify-content-between">

              <h1 className="logo"><a href="index.html">TTM</a></h1>

              <nav id="navbar" className="navbar">
                <ul>
                  <li><a className="nav-link text-white">Home</a></li>
                  <li><a className="nav-link text-white" onClick = {this.moveToDiscover}>Discover</a></li>
                  <li className="active"><a className="nav-link text-white">Create a campaign<i className="bi bi-chevron-down"></i></a></li>
                  <li className = "nav-item text-nowrap d-none d-sm-none d-sm-block">
                    <small className = "text-white"><span id = "account">{this.state.account}</span></small>
                  </li>
                </ul>
                <i className="bi bi-list mobile-nav-toggle"></i>
              </nav>

            </div>
          </header>
          <div className="container-fluid mt-5">
            <div className="row">
              <main role="main" className="col-lg-12 d-flex text-center">
                <div className="content mr-auto ml-auto">
                  <div className="forme">
                    <p className="nftext">Campaign title:</p>
                    <input type="text" name="name" onChange = {evt => this.updateNameValue(evt)}/>
                    <p className="nftext" id="dva">Campaign description:</p>
                    <div className="textarea">
                      <input type="text" onChange ={evt => this.updateDescValue(evt)}></input>
                    </div>
                    <p className="nftext" id="dva">Campaign goal</p>
                    <div className="numberarea">
                      <input type="number" onChange = {evt => this.updateCampaignGoal(evt)}></input>
                    </div>
                    <p className="nftext" id="dva">Campaign deadline</p>
                    <div>
                      <input type="date" onChange = {evt => this.updateDate(evt)}></input>
                    </div>
                    <p className="nftext" id="dva">Enter your email if you want to get notified</p>
                    <div>
                      <input type="text" placeholder="This field is optional" onChange = {evt => this.updateEmail(evt)}></input>
                    </div>
                  </div>
                </div>
                <div><button onClick = {this.createCampaign}>Create a campaign</button></div>
              </main>
            </div>
          </div>
          <div id = "myID"  ></div>
          <input id="fileUpload" type = "file" onChange={this.fileSelectedHandler} hidden/>
          <label htmlFor="fileUpload">Choose File</label>
          <button onClick = {this.fileUploadHandler}>Upload</button>
          <ProgressBar now = {this.state.prog} />
        </div>
    );
  }
}

export default App;