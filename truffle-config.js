require('babel-register');
require('babel-polyfill');

const HDWalletProvider = require('@truffle/hdwallet-provider')
//https://rinkeby.infura.io/v3/10792650c88f4b4b9636a1ec6054ad74

const fs = require('fs')
const mnemonic = "heavy credit group dove merge pen soccer jewel door gloom kit wet"

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/388bc06946784530b76b3c8e405da1e4");
      },
      network_id: 4,
      gas: 4500000,
      gasPrice: 10000000000,
    },
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: "^0.8.0",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}