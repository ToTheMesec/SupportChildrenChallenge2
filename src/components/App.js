import React, { Component } from 'react';
import axios from 'axios';
import Web3 from 'web3';
import SaveChildren from '../abis/SaveChildren.json'
import './App.css';
import Discover from '../pages/Discover';
import ReactDOM from "react-dom";
import ProgressBar from 'react-bootstrap/ProgressBar';
import ipfs from "../ipfs";
import emailjs from "emailjs-com";
import Home from "../pages/Home"

class App extends Component {

  fileSelectedHandler = event => {
    console.log(event.target.files[0]);
    this.setState({
      selectedFile: event.target.files[0]
    })
    this.captureFile(event)
  }

  fileUploadHandler = () => {
    const formData = new FormData();
    formData.append("file", this.state.selectedFile)
    formData.append("upload_preset", "nftauction")
    this.onSubmit()
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
      document.getElementById('fileChoose').style = "background-image: url('" + res.data.secure_url + "'); background-repeat: no-repeat; background-size: cover";
      document.getElementById('fileChoose').style.color = "rgba(0, 0, 0, 0)";
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
      account: '',

      ipfsHash: '',
      buffer: '',
      ethAddress: '',
      blockNumber: '',
      transactionHash: '',
      gasUsed: '',
      txReceipt: '',


    }
  }



  captureFile = (event) => {
      event.stopPropagation()
      event.preventDefault()
      const file = event.target.files[0]
      let reader = new window.FileReader()
      reader.readAsArrayBuffer(file)
      reader.onloadend = () => this.convertToBuffer(reader)
  };

  convertToBuffer = async (reader) => {
      //file is converted to a buffer for upload to IPFS
      const buffer = await Buffer.from(reader.result);
      //set this buffer -using es6 syntax
      this.setState({buffer});
  };

  onSubmit = async () => {
    await ipfs.add(this.state.buffer, (err, ipfsHash) => {
        console.log(err, ipfsHash);//TODO

        this.setState({ipfsHash: ipfsHash[0].hash});
    }) //await ipfs.add
  }; //onSubmit

  createCampaign = (evt) => {
    evt.preventDefault()
    evt.persist()
    var timestamp = Date.parse(this.state.date)
    timestamp/=1000
    this.state.contract.methods.createCampaign(this.state.name, this.state.desc, this.state.account, timestamp, (parseFloat(this.state.goal)*(10**18)).toString(), this.state.email, "https://ipfs.io/ipfs/" + this.state.ipfsHash)
    .send({from: this.state.account}).then(() => {
      evt.preventDefault();
      //console.log("FFFFFFFFFF: " + evt.target.owner_mail)
      emailjs.sendForm('service_7ksffb7', 'template_6x5plw4', evt.target, 'user_2AtKMM5Ljcoy0GZ33Dhia')
          .then((result) => {
            console.log(result.text);
            const element = document.getElementById("alert");
            const check = document.createElement('p');
            check.innerHTML = "You have successfully created a campaign, good luck!";
            check.style = "color: #00FF00; font-size: 22px;"
            element.appendChild(check);
          }, (error) => {
            console.log(error.text);
          });
      // this.sendEmail(evt)
    })
  }

  updateNameValue(evt) {
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

  // sendEmail(e) {
  //   e.preventDefault();
  //
  //   emailjs.sendForm('service_7zotz9y', 'template_xxy6n1q', e.target, 'user_4u7WjbA2GZUJYYM6i8nrV')
  //       .then((result) => {
  //         console.log(result.text);
  //         const element = document.getElementById("alert");
  //         const check = document.createElement('p');
  //         check.innerHTML = "You have successfully created a campaign, good luck!";
  //         check.style = "color: #00FF00; font-size: 20px;"
  //         element.appendChild(check);
  //       }, (error) => {
  //         console.log(error.text);
  //       });
  // }

  moveToDiscover = () => {
    ReactDOM.render(<Discover />, document.getElementById('root'))
  }

  moveToHome = () => {
    ReactDOM.render(<Home />, document.getElementById('root'))
  }

  render() {
    return (
        <div className = "rootdiv">
          <div className="container-fluid">
          <div className="row">
         
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="labelButton">
                <input id="fileUpload" type = "file" onChange={this.fileSelectedHandler} hidden/>
                <label id="fileChoose" className="fileChoose" htmlFor="fileUpload" >Choose Image</label>
                <ProgressBar className="bar" now={this.state.prog} />
                <button id="uploaderBtn" className="uploader" onClick = {this.fileUploadHandler}>Upload</button>
              </div>
              <div id= "celaForma" className="content">
                <form style = {{borderBottom: '1px solid black'}} onSubmit ={evt => {this.createCampaign(evt)}}>
                  <div className="box">
                    <p className="nftext" id="naslov">Create campaign</p>
                    <input  placeholder="Campaign title" type="text" onChange = {evt => this.updateNameValue(evt)} name = "campaign_name" required/>
                    <div className="textarea">
                      <textarea size="100" placeholder="Campaign description" type="text" onChange ={evt => this.updateDescValue(evt)} name = "campaign_description" required></textarea>
                    </div>
                    <div className="numberarea">
                      <input  placeholder="Campaign goal"type="number" step="0.01"  onChange = {evt => this.updateCampaignGoal(evt)} name = "campaign_goal" required></input>
                    </div>
                    <div>
                    <p className="deadline" id="dva">Campaign deadline</p>
                      <input  placeholder="Campaign deadline" type="date" onChange = {evt => this.updateDate(evt)} name = "campaign_deadline" required></input>
                    </div>
                    <div>
                      <input name="owner_mail" type="text" placeholder="Enter your email" onChange = {evt => this.updateEmail(evt)}></input>
                      <button className="buttonCampaign"  type = "submit" >Create campaign</button>
                    </div>
                    <div id = "alert"></div>
                  </div>
                </form>
              </div>
            </main>
          </div>
        </div>
        </div>
    );
  }
}

export default App;