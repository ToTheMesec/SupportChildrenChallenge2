pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/ISupportChildren.sol";

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";

interface IUniswapRouter is ISwapRouter {
    function refundETH() external payable;
}

interface IUniswap {
    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline)
        external 
        returns (uint[] memory amounts);

        function WETH() external pure returns(address);
}


contract SupportChildren is Ownable, ISupportChildren {
    using SafeMath for uint;
    using SafeERC20 for IERC20;

    IUniswapRouter public constant uniswapRouter = IUniswapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    IQuoter public constant quoter = IQuoter(0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6);
    address private constant WETH9 = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    

    address private constant dai = 0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa;

    constructor() {
    }

    //--------------------UNISWAP FUNCTIONS------------------------

    function convertExactEthToToken(address token) internal {
        require(msg.value > 0, "Must pass non 0 ETH amount");

        uint256 deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
        address tokenIn = WETH9;
        address tokenOut = token;
        uint24 fee = 3000;
        address recipient = address(this);
        uint256 amountIn = msg.value;
        uint256 amountOutMinimum = 1;
        uint160 sqrtPriceLimitX96 = 0;
        
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams(
            tokenIn,
            tokenOut,
            fee,
            recipient,
            deadline,
            amountIn,
            amountOutMinimum,
            sqrtPriceLimitX96
        );
        
        uniswapRouter.exactInputSingle{ value: msg.value }(params);
        uniswapRouter.refundETH();
        
        // refund leftover ETH to user
        (bool success,) = msg.sender.call{ value: address(this).balance }("");
        require(success, "refund failed");
    }

    function convertTokenToExactEth(address token, uint amountOut, uint amountInMaximum) public returns (uint256) {
        uint256 allowance = IERC20(dai).allowance(msg.sender, address(this));
        require(allowance >= amountInMaximum, "Check the token allowance");
        IERC20(dai).transferFrom(msg.sender, address(this), amountInMaximum);
        uint256 deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
        address tokenIn = dai;
        address tokenOut = WETH9;
        uint24 fee = 3000;
        address recipient = address(this);
        uint160 sqrtPriceLimitX96 = 0;
        IERC20(dai).approve(address(uniswapRouter), amountInMaximum);
        
        ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter.ExactOutputSingleParams(
            tokenIn,
            tokenOut,
            fee,
            recipient,
            deadline,
            amountOut,
            amountInMaximum,
            sqrtPriceLimitX96
        );
        
        uint256 amountOfTokenUsed = uniswapRouter.exactOutputSingle(params);
        uint256 remainderOfTokens = amountInMaximum-amountOfTokenUsed;
        // refund leftover Tokens to user
        (bool success) = IERC20(dai).transfer(msg.sender, remainderOfTokens);
        require(success, "refund failed");
        
        return amountOfTokenUsed;
    }

    function convertTokenToExactToken(address tokenIn, address tokenOut, uint amountOut, uint amountInMaximum) internal returns (uint256) {
    uint256 allowance = IERC20(tokenIn).allowance(msg.sender, address(this));
    require(allowance >= amountInMaximum, "Check the token allowance");
    IERC20(tokenIn).transferFrom(msg.sender, address(this), amountInMaximum);
    uint256 deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
    uint24 fee = 3000;
    address recipient = address(this);
    uint160 sqrtPriceLimitX96 = 0;
    IERC20(tokenIn).approve(address(uniswapRouter), amountInMaximum);
    
    ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter.ExactOutputSingleParams(
        tokenIn,
        tokenOut,
        fee,
        recipient,
        deadline,
        amountOut,
        amountInMaximum,
        sqrtPriceLimitX96
    );
    
    uint256 amountOfTokenUsed = uniswapRouter.exactOutputSingle(params);
    uint256 remainderOfTokens = amountInMaximum-amountOfTokenUsed;
    
    // refund leftover Tokens to user
    (bool success) = IERC20(tokenIn).transfer(msg.sender, remainderOfTokens);
    require(success, "refund failed");
    
    return amountOfTokenUsed;
  }

    //--------------------------PROJECT STUFF-----------------------

    Campaign[] public campaigns;

    //map of mails
    mapping(uint => string[]) mails;

    //map of all donors of a certain campaign
    mapping(uint256 => DonationStruct[]) public donors;

    function isCampaignActive(uint _campaignId) override public view returns(bool) {
        return campaigns[_campaignId].endTimestamp > block.timestamp;
    }

    function getCampaign(uint _campaignId) override public view returns(Campaign memory) {
        return campaigns[_campaignId];
    }

    function getCampaigns() public view returns(Campaign[] memory){
        return campaigns;
    }

    fallback() external{
        revert();
    }

    function createCampaign(address payable _beneficiary, uint _endTimestamp) override external {
        require(_endTimestamp > block.timestamp, "SupportChildren::createCampaign: Campaign must end in the future");

        address payable beneficiary;
        if(_beneficiary != address(0)) {
            beneficiary = _beneficiary;
        } else {
            beneficiary = payable(msg.sender);
        }

        Campaign memory campaign = Campaign(_endTimestamp, beneficiary);
        uint campaignId = campaigns.length;

        campaigns.push(campaign);

        emit CampaignCreated(campaignId, campaign);
    }

    function donateERC(uint _campaignId, address _token, uint _amount, string memory _mail) override external {
        require(_campaignId < campaigns.length, "SupportChildren::donate: Non existent campaign id provided");
        require(isCampaignActive(_campaignId), "SupportChildren::donate: Campaign not active");

        address beneficiary = campaigns[_campaignId].beneficiary;

        DonationStruct memory newDon;
        newDon.from = payable(msg.sender);
        newDon.amount = _amount;

        donors[_campaignId].push(newDon);
        mails[_campaignId].push(_mail);
        IERC20(_token).transferFrom(msg.sender, beneficiary, _amount);
        emit Donation(_campaignId, _amount, _token);
    }

    function donateETH(uint _campaignId, string memory _mail) override external payable {
        require(_campaignId < campaigns.length, "SupportChildren::donateETH: Non existent campaign id provided");
        require(isCampaignActive(_campaignId), "SupportChildren::donateETH: Campaign not active");
        require(msg.value > 0, "SupportChildren::donateETH: You must send ether");

        Campaign memory campaign = campaigns[_campaignId];
        campaign.beneficiary.transfer(msg.value);

        DonationStruct memory newDon;
        newDon.from = payable(msg.sender);
        newDon.amount = msg.value;

        donors[_campaignId].push(newDon);
        mails[_campaignId].push(_mail);


        emit Donation(_campaignId, msg.value, address(0));
    }


    //--------------------------UNISWAP DONATIONS
    //token to eth
    function donateTokenToETHCamp(uint _campaignId, string memory _mail,address token, uint amountOut, uint amountInMax) public {
        (uint256 tokensSpent) = convertTokenToExactEth(token, amountOut, amountInMax);
        // donors[_campaignId].push(msg.sender);
        mails[_campaignId].push(_mail);
    }
    //token to token
    function donateTokenToTokenCamp(uint _campaignId, string memory _mail, address tokenIn, address tokenOut, uint amountOut, uint amountInMax) public {
        (uint256 tokensSpent) = convertTokenToExactToken(tokenIn, tokenOut, amountOut, amountInMax);
        // donors[_campaignId].push(msg.sender);
        mails[_campaignId].push(_mail);
    }


}