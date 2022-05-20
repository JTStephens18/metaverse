// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Land is ERC721 {
    // Cost of 1 plot of land
    uint256 public cost = 1 ether;
    // Max supply of plots of land
    uint256 public maxSupply = 5;
    // Total supply of land we have
    uint256 public totalSupply = 0;

    struct Building {
        string name;
        address owner;
        // Position of building in our map
        int256 posX;
        int256 posY;
        int256 posZ;
        // Size of the buidling in our map
        uint256 sizeX;
        uint256 sizeY;
        uint256 sizeZ;
    }
    // Array of type Building to store the buildings
    Building[] public buildings;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _cost
    ) ERC721(_name, _symbol) {
        cost = _cost;
        buildings.push(
            Building("City Hall", address(0x0), 0, 0, 0, 10, 10, 10)
        );
        buildings.push(
            Building("University", address(0x0), 0, 10, 0, 10, 5, 3)
        );
        buildings.push(Building("Stadium", address(0x0), 0, -10, 0, 10, 5, 3));
        buildings.push(
            Building("Shopping Plaza 1", address(0x0), 10, 0, 0, 5, 25, 5)
        );
        buildings.push(
            Building("Shopping Plaza 2", address(0x0), -10, 0, 0, 5, 25, 5)
        );
    }

    function mint(uint256 _id) public payable {
        // Ensure there is land left to buy
        uint256 supply = totalSupply;
        require(supply <= maxSupply);
        // Ensure the plot of land is not already bought (owner == 0x0)
        require(buildings[_id - 1].owner == address(0x0));
        // Ensure that the money being sent covers the cost
        require(msg.value >= 1 ether);

        buildings[_id - 1].owner = msg.sender;
        totalSupply = totalSupply + 1;
        _safeMint(msg.sender, _id);
    }

    // Transfer from is already implemented in ERC721, use override to override it and use ours
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        // Require the msgSender owns or approved the token
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );

        // Update building ownership
        buildings[tokenId - 1].owner = to;
        _transfer(from, to, tokenId);
    }

    // Safe transfer function with an additional argument
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public override {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner or approved "
        );

        // Update building ownership
        buildings[tokenId - 1].owner = to;
        _safeTransfer(from, to, tokenId, _data);
    }

    // Returns all the buildings in the array
    function getBuildings() public view returns (Building[] memory) {
        return buildings;
    }

    // Returns a specific building
    function getBuilding(uint256 _id) public view returns (Building memory) {
        return buildings[_id - 1];
    }
}
