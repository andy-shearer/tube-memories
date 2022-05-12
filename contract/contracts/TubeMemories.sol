//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract TubeMemories is ERC721, Ownable {
    string private baseURI;
    uint256 private tokenCount;
    bool private paused = false;
    uint256 price = 5 * 10**15; // Each mint will cost 0.05 ETH
    mapping (uint256 => Journey) public journeys;

    struct Journey {
        string fromStation;
        string toStation;
    }

    modifier onlyWhenNotPaused {
        require(!paused, "Contract is currently paused");
        _;
    }

    constructor(string memory _base) ERC721("Tube Memories", "TuMem") {
        baseURI = _base;
        tokenCount = 0;
    }

    function pause(bool _state) public onlyOwner {
        paused = _state;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function mint(string memory _from, string memory _to) public payable onlyWhenNotPaused returns (uint256) {
        require(msg.value >= price, "Not enough ether sent!");
        require(bytes(_from).length > 0, "Must specify a 'from' station");
        require(bytes(_to).length > 0, "Must specify a 'to' station");

        tokenCount++;
        console.log("Minting new TuMem with tokenId ", tokenCount);
        _safeMint(msg.sender, tokenCount);

        Journey storage thisJourney = journeys[tokenCount];
        thisJourney.fromStation = _from;
        thisJourney.toStation = _to;

        return tokenCount;
    }

    // Set up default functions for the contract
    receive() external payable {}
    fallback() external payable {}
}
