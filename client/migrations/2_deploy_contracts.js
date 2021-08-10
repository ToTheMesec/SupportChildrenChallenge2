const SupportChildren = artifacts.require("SupportChildren");
const NFT = artifacts.require("NFT");

module.exports = function(deployer){
    deployer.deploy(SupportChildren);
    deployer.deploy(NFT, "NonFungibleToken", "NFT");
}