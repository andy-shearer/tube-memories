//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "hardhat/console.sol";

contract TubeMemories is ERC721URIStorage, Ownable {
    string private baseURI;
    uint256 private tokenCount;
    bool private paused = false;
    uint256 price = 5 * 10**15; // Each mint will cost 0.05 ETH
    mapping (uint256 => Journey) public journeys;

    struct Journey {
        string fromStation;
        string toStation;
        string description;
        string via; // TODO allow user to specify a specific route for this journey
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

    function mint(string memory _from, string memory _to, string memory _descr) public payable onlyWhenNotPaused returns (uint256 tokenId) {
        console.log(msg.value, price);
        require(msg.value >= price, "Not enough ether sent!");
        require(bytes(_from).length > 0, "Must specify a 'from' station");
        require(bytes(_to).length > 0, "Must specify a 'to' station");

        tokenCount++;
        console.log("Minting new TuMem with tokenId ", tokenCount);
        _safeMint(msg.sender, tokenCount);

        string memory json = getMeta(_from, _to, _descr);
        _setTokenURI(tokenCount, json);
        Journey storage thisJourney = journeys[tokenCount];
        thisJourney.fromStation = _from;
        thisJourney.toStation = _to;
        thisJourney.description = _descr;

        return tokenCount;
    }

    function updateDescr(string memory _descr, uint256 _tokenId) external {
        require(ownerOf(_tokenId) == msg.sender, "You do not own this token");
        Journey storage currentJourney = journeys[_tokenId];
        currentJourney.description = _descr;
        string memory json = getMeta(
            currentJourney.fromStation,
            currentJourney.toStation,
            currentJourney.description
        );
        _setTokenURI(_tokenId, json);
    }

    function getMeta(string memory _from, string memory _to, string memory _descr)
        public
        pure
        returns (string memory)
    {
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        _from," -> ",_to,
                        '", "description": "A route on the London Underground. Special because "',_descr,' , "image": "data:image/svg+xml;base64,',
                        'https://raw.githubusercontent.com/andy-shearer/tube-memories/master/res/subway.png"}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));

    }

    // Set up default functions for the contract
    receive() external payable {}
    fallback() external payable {}
}
