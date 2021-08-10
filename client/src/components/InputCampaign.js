import React, {Fragment, Component} from 'react';
import Web3 from 'web3';
import SupportChildren from "../abis/SupportChildren.json";
import axios from 'axios';
import ipfs from "../ipfs";


//@author Luka

class InputCampaign extends Component{

    constructor(props){
        super(props);
        this.state = {
            contract: null,
            account: '',
            title: '',
            description: '',
            email: '',
            deadline: '',
            goal: '',
            category: '',
            currency: '',
            selectedFile: '',
            img: '',
            prog: 0,
            ipfsHash: '',
            buffer: '',
            ethAddress: '',
            blockNumber: '',
            transactionHash: '',
            gasUsed: '',
            txReceipt: '',

        }
    }

    fileSelectedHandler = event => {
        console.log(event.target.files[0]);
        this.setState({
          selectedFile: event.target.files[0]
        })
        this.captureFile(event)
    }
    
    fileUploadHandler = (evt) => {
        evt.preventDefault();
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
        })
    }

    captureFile = (event) => {
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        let reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => this.convertToBuffer(reader)
    }

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
    };
    
    
    async componentWillMount() {
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
    
            this.setState({contract: contractWeb3})
    
        } else {
            window.alert('Smart contract not deployed to detected network')
        }
    }

    onSubmitForm = async (evt) => {
        evt.preventDefault();
        this.state.contract.methods.createCampaign(this.state.account, 1928010725).send({from: this.state.account})
        .then( async () => {
                try {
                const body = {
                    title: this.state.title,
                    description: this.state.description, 
                    email: this.state.email, 
                    deadline: this.state.deadline, 
                    goal: this.state.goal,
                    currency: this.state.currency,
                    category: this.state.category,
                    url: "https://ipfs.io/ipfs/" + this.state.ipfsHash
                };
                console.log(body);
                const response = await fetch("http://localhost:5000/create-campaign", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(body)
                });

                window.location = "/create-campaign";
            } catch (error) {
                console.log(error.message);
            }
        })
        
    }
    
  render() {
    return (
        <div className = "rootdiv">
          <div className="container-fluid">
          <div className="row">
         
            <main role="main">
            
              <div  className="content">
                <form>
                  <span className="clearfix">
                  <div><h1 className="formTitle">Fundraising information</h1></div>
                  </span>
                  <span className="clearfix">
                  <div><h2 className="formUnderTitle">Add the Fundraising information in the fields below.</h2></div>
                  </span>
                  <span className="clearfix">
                  <div id="visina100" className="fundraisingTitle"><p>Fundraising title</p><input placeholder="Enter Fundraising title"type="text" onChange = {evt => this.setState({title: evt.target.value})}/></div> 
                  </span>
                  <span className="clearfix">
                  <div id="visina150" className="fundraisingMainImage"><p className="paragraf">Fundrasing main image</p>
                 <p>This image will appear as the cover photo<br/> for your fundraising.</p>
                  <div>
                   <input id="upload" type="file" hidden onChange={this.fileSelectedHandler}/><label id="uploadLabel" for="upload"></label></div>
                  </div>
                  <button className = "uploadBtn btn btn-primary" onClick = {evt => this.fileUploadHandler(evt)}>Upload</button>
                  </span>
                  <span className="clearfix">
                    <div id="visina100" className="amountNeed">
                     <div id="amountNeedtekst"> <p className="paragraf">Amount need</p><p>Enter the amount you need for <br/>your fundraising.</p></div>
                    </div>
                    <div id="inputSelect">
                    <select id="kripto" onChange = {evt => this.setState({currency: evt.target.value})}>
                    <option value="eth">ETH</option>
                    <option value="btc">BTC</option>
                    <option value="ltc">LTC</option>
  
                    </select>
                    <input placeholder="Enter amount"id="amountNeedbroj" type="number" step="0.0000001" onChange = {evt => this.setState({goal:evt.target.value})}></input>
                    
  
                    </div>
                  </span>
                  <span className="clearfix">
                    <div id="visina150" className="amountNeed">
                     <div id="amountNeedtekst"> <p className="paragraf">Description</p><p>Explain your reasons why are you <br/>starting this fundraising.</p>
                     <div id="textarea"><textarea placeholder="Enter fundraising description" onChange = {evt => this.setState({description: evt.target.value})}></textarea></div>
                     </div>
                     
                    </div>
                    
                    </span>
                    <span className="clearfix">
                    <div id="visina100" className="amountNeed">
                     <div id="amountNeedtekst"> <p className="paragraf">Add category</p><p>These images will appear as additional photos, <br/>which will help donators your story.</p></div>
                    </div>
                    <div id="categorySelect">
                    <select  id="category" onChange = {evt => this.setState({category: evt.target.value})}>
                    <option value="" disabled selected>Pick a category</option>
                    <option value="health">Health</option>
                    <option value="education">Education</option>
                    <option value="Last wish">Last wish</option>
  
                    </select>
                    </div>
                    </span>
                    <span className="clearfix">
                    <div id="visina150" className="amountNeed">
                     <div id="amountNeedtekst"> <p className="paragraf">End of the fundraise</p><p>Let know other people when is the end date <br/>of your fundraise.</p>
                     
                     </div>
                     <div><input type="date" onChange = {evt => this.setState({deadline: evt.target.value})}></input></div>
                     
                    </div>
                    
                    </span>
                  <div className="dugmeCreate"><button id="create" onClick = {this.onSubmitForm}>Create</button></div>
                </form>
              </div>
            </main>
          </div>
        </div>
        </div>
    );
  }
};

export default InputCampaign;