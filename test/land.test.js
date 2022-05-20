const Land = artifacts.require("./Land")

require('chai')
    .use(require('chai-as-promised'))
    .should()

const EVM_REVERT = "VM Exception while processing transaction: revert"

    // Pass in first two accounts from ganache
    contract("Land", ([owner1, owner2]) => {
    const NAME = "South Alabama Buildings"
    const SYMBOL = "SAB"
    const COST = web3.utils.toWei('1', 'ether')

    // Set variable for our land contract and result 
    let land, result

    // Before each test we should deploy our contract
    beforeEach(async () => {
       land = await Land.new(NAME, SYMBOL, COST)
    })

    // Describe block describes multiple test
    describe("Deployment", () => {
        // Each test is represented by it()
        it("returns contract name", async () => {
            result = await land.name()
            // If result does not equal NAME then the test will fail (return false)
            result.should.equal(NAME)
        })

        it("returns the symbol", async () => {
            result = await land.symbol()
            // If result does not equal NAME then the test will fail (return false)
            result.should.equal(SYMBOL)
        })

        it("returns the cost to mint", async () => {
            result = await land.cost()
            // If result does not equal NAME then the test will fail (return false)
            result.toString().should.equal(COST)
        })

        it("returns the max supply", async () => {
            result = await land.maxSupply()
            // If result does not equal NAME then the test will fail (return false)
            result.toString().should.equal('5')
        })

        it("returns the number of buildings available", async () => {
            result = await land.getBuildings()
            // If result does not equal NAME then the test will fail (return false)
            result.length.should.equal(5)
        })
    })

    // Test minting process
    describe("Minting", () => {
        describe("Success", () => {
            beforeEach(async () => {
                result = await land.mint(1, {from: owner1, value: COST})
            })

            it("Updates the owner address", async () => {
                result = await land.ownerOf(1)
                result.should.equal(owner1)
            })
    
            it("Updates building details", async () => {
                result = await land.getBuilding(1)
                result.owner.should.equal(owner1)
            })
        })

        describe("Failure", () => {
            it("prevents mint with 0 value", async () => {
                await land.mint(1, {from: owner1, value: 0}).should.be.rejectedWith(EVM_REVERT)
            })

            it("Prevents mint with invalid ID", async () => {
                await land.mint(100, {from: owner1, value: COST}).should.be.rejectedWith(EVM_REVERT)
            })

            it("Prevents minting if already owned", async () => {
                await land.mint(1, {from: owner1, value: COST})
                await land.mint(1, {from: owner2, value: COST}).should.be.rejectedWith(EVM_REVERT)
            })
        })
    })

    describe("Transfers", () => {
        describe("success", () => {
            beforeEach( async () => {
                await land.mint(1, {from: owner1, value: COST})
                // Approve owner2 to have plot with id 1
                await land.approve(owner2, 1, {from: owner1})
                await land.transferFrom(owner1, owner2, 1, {from: owner2})
            })

            it("Updates the owner address", async () => {
                result = await land.ownerOf(1)
                result.should.equal(owner2)
            })

            it("Updates building details", async () => {
                result = await land.getBuilding(1)
                result.owner.should.equal(owner2)
            })
        })

        describe("failure", () => {
            it("Prevents transfer without ownership", async() => {
                await land.transferFrom(owner1, owner2, 1, {from: owner2}).should.be.rejectedWith(EVM_REVERT)
            })

            it("prevents transfers without approval", async () => {
                await land.mint(1, {from: owner1, value: COST})
                await land.transferFrom(owner1, owner2, 1, {from: owner2}).should.be.rejectedWith(EVM_REVERT)
            })
        })
    })
})