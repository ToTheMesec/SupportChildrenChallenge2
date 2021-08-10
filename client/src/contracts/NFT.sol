pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT is ERC721{

    string[] public receipts;

    mapping(string => bool) receiptExists;

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {}

    function mint(string memory _receipt, address recipiant) public{
        require(!receiptExists[_receipt], "NFT already exists");

        receipts.push(_receipt);
        //krece od 1
        uint _id = receipts.length;
        _mint(recipiant, _id);
        receiptExists[_receipt] = true;
    }

    function print() public view returns(string[] memory){
        return receipts;
    }
}

