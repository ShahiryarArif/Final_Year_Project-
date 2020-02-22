pragma solidity >=0.4.21 <0.6.0;

contract ERC20{

    string public name = "ERC20";
    string public symbol = "ERC";
    string public standard = "ERC20 v1.0";
    uint256 public totalSupply;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(uint256 _initialSupply) public{
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;

    }


    function transfer(address _to, uint256 _value) public returns(bool success){
        
        //require(_value>=0, 'amount bieng send must be greater than or equal to zero');
        //require(balanceOf[msg.sender] >= _value,'balance of sender must be equal or greater than the amount bieng transfered');

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to,_value);

        return true;
    }


    function approve(address _spender, uint256 _value) public returns(bool success){

        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address  _from, address _to, uint256 _value) public returns (bool success){

        require(_value <= balanceOf[_from],'fromAdress must have balance <= transfer amount');
        require(_value <= allowance[_from][msg.sender],'must be allowed to use x amount');

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);

        return true;
    }

}