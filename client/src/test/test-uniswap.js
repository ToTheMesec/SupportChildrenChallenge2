const BN = require("bn.js");
// const { sendEther } = require("./util");
// const { DAI, WBTC, WBTC_WHALE } = require("./config");

const IERC20 = artifacts.require("IERC20");
const TestUniswap = artifacts.require("TestUniswap");

contract("TestUniswap", (accounts) => {
    const DAI_WHALE = "0x6b175474e89094c44da98b954eedeac495271d0f"
    const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f"
    const WBTC = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
    const WHALE = DAI_WHALE;
    const AMOUNT_IN = new BN(10).pow(new BN(18)).mul(new BN(1000000));
    const AMOUNT_OUT_MIN = 1;
    const TOKEN_IN = DAI;
    const TOKEN_OUT = WBTC;
    const TO = accounts[0];

    let testUniswap;
    let tokenIn;
    let tokenOut;
    // beforeEach(async () => {
    //     tokenIn = await IERC20.at(TOKEN_IN);
    //     tokenOut = await IERC20.at(TOKEN_OUT);
    //     testUniswap = await TestUniswap.new();
    //
    //     // make sure WHALE has enough ETH to send tx
    //     // await sendEther(web3, accounts[0], WHALE, 1);
    //     await tokenIn.approve(testUniswap.address, AMOUNT_IN, { from: WHALE });
    // });

    it("should swap", async () => {
        tokenIn = await IERC20.at(TOKEN_IN);
        tokenOut = await IERC20.at(TOKEN_OUT);
        testUniswap = await TestUniswap.new();
        await tokenIn.approve(testUniswap.address, AMOUNT_IN, { from: WHALE });

        await testUniswap.swap(
            tokenIn.address,
            tokenOut.address,
            AMOUNT_IN,
            AMOUNT_OUT_MIN,
            TO,
            {
                from: WHALE,
            }
        );
        console.log(`in ${AMOUNT_IN}`);
        console.log(`out ${await tokenOut.balanceOf(TO)}`);
    });
});