pragma solidity ^0.8.0;
pragma abicoder v2;

interface ISupportChildren {
    struct Campaign {
        uint endTimestamp;
        address payable beneficiary;
    }

    struct DonationStruct{
        address payable from;
        uint256 amount;
    }

    event CampaignCreated(uint campaignId, Campaign campaign);
    event Donation(uint campaignId, uint amount, address tokenAddress);

    function isCampaignActive(uint _campaignId) external view returns(bool);
    function getCampaign(uint _campaignId) external view returns(Campaign memory);
    function createCampaign(address payable _beneficiary, uint _endTimestamp) external;
    function donateERC(uint _campaignId, address _token, uint _amount, string memory _mail) external;
    function donateETH(uint _campaignId, string memory _mail) external payable;
}