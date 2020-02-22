pragma solidity >=0.4.21 <0.6.0;
import "./ERC20.sol";

contract IOTPool{

    struct Origin{
        uint256 block_number;
        bytes32 hash_code;
        uint256 timestamps;
    }

    mapping(address => mapping(uint256 => Origin[])) public Pool;
    
    address admin;
    uint256 public tokenPrice;
    ERC20 public tokenContract;
    
    event Access_Granted(address _device);
    event Token_Transfer(address _from,address _to, uint256 _amount);

    constructor(ERC20  _tokenContract, uint256 _tokenPrice) public{
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function initiate_session()public{
      
        Pool[msg.sender][1].push(Origin(uint(block.number),bytes32(blockhash(block.number)),uint(block.timestamp)));

        emit Access_Granted(msg.sender);
    }

    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x,'error in multiplication');
    }

    function terminate_session(uint256 incentive) public{
        Pool[msg.sender][2].push(Origin(uint(block.number),bytes32(blockhash(block.number)),uint(block.timestamp)));

        require(tokenContract.transfer(msg.sender, multiply(5,incentive)),'token transfer');

        emit Token_Transfer(address(tokenContract),msg.sender,multiply(5,incentive));
    }
}