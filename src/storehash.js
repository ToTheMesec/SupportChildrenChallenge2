import Web3 from 'web3';
//overrides metamask v0.2 for our v 1.0
const web3 = new Web3(window.web3.currentProvider);

//access our local copy to contract deployed on rinkeby testnet
//use your own contract address
const address = '0x8e5C31bcA09aD6EC27654a33e44Cf3D736723d06';
//use the ABI from your contract
const abi = [
    {
        "constant": true,
        "inputs": [],
        "name": "getHash",
        "outputs": [
            {
                "name": "x",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "x",
                "type": "string"
            }
        ],
        "name": "sendHash",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
]
export default new web3.eth.Contract(abi, address);