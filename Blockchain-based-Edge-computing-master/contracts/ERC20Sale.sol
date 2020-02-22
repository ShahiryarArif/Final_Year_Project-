pragma solidity >=0.4.21 <0.6.0;
import "./ERC20.sol";

contract ERC20Sale{

    address admin;
    uint256 public tokenPrice;
    ERC20 public tokenContract;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(ERC20  _tokenContract, uint256 _tokenPrice) public{
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    function buyTokens(uint256 _numberOfTokens) public payable{
        require(msg.value == multiply(_numberOfTokens,tokenPrice),'value must be equal to token time price');
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens,'cannot purchase more tokens than available');
        require(tokenContract.transfer(msg.sender,_numberOfTokens),'actual transfer');
        
        tokensSold += _numberOfTokens;
        
        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public{
        require(msg.sender == admin,'only admin can end ico');

        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));

        selfdestruct(address(uint160(admin)));
    }
}