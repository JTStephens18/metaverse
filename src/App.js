
import './App.css';
import Web3 from 'web3';
import { Suspense, useEffect, useState } from 'react';
import {Canvas} from "@react-three/fiber";
import {Sky, MapControls} from "@react-three/drei";
import {Physics} from "@react-three/cannon";

// Import components 
import Navbar from './components/Navbar';
import Plane from './components/Plane';
import Plot from './components/Plot';
import Building from './components/Building';

// Import ABI
import Land from './abis/Land.json';

function App() {

const [web3, setWeb3] = useState(null)
const [account, setAccount] = useState(null)
const testAcc1 = '0xBf2F063EC0A0EdfC0c925e2a18BB97F59B855c2E';
const testAcc2 = '0xeA165A0Bd6F52822dC981dfD19A1Ad1359CE21A0';

// Contract and Contract States
const [landContract, setLandContract] = useState(null)

const [cost, setCost] = useState(0)
const [buildings, setBuildings] = useState(null)
const [landId, setLandId] = useState(null)
const [landName, setLandName] = useState(null)
const [landOwner, setLandOwner] = useState(null)
const [hasOwner, setHasOwner] = useState(false)

// Triggered only when account is changed
useEffect( () => {
  loadBlockchainData()
}, [account])

const loadBlockchainData = async () => {
  // Before we load data, ensure user has installed metamask
  // Check if window.ethereum object exists
  if(typeof window.ethereum !== 'undefined') {
    // Load web3 object
    const web3 = new Web3(window.ethereum)
    // Set our state with the object
    setWeb3(web3)

    // Get accounts and store them in variable
    const accounts = await web3.eth.getAccounts()

    // If user has more than one account, set the first one
    if(account.length > 0) {
      setAccount(accounts[0])
    }

    const networkId = await web3.eth.net.getId()

    // Make an instance of the contract that we have deployed
    // Pass in the abi and the contract address into the Contract function
    const land = new web3.eth.Contract(Land.abi, Land.networks[networkId].address)
    setLandContract(land)

    const cost = await land.methods.cost().call()
    // Convert cost to string then to ether from wei
    setCost(web3.utils.fromWei(cost.toString(), 'ether'))

    const buildings = await land.methods.getBuildings().call()
    setBuildings(buildings)

    // Event listener for whenever an account is changed to set the first account
    window.ethereum.on('accountsChanged', function (accounts) {
      setAccount(accounts[0])
    })

    // Another event listener that reloads the website when you switch blockchains
    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    })
  }
}

const web3Handler = async () => {
  if(web3) {
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
    setAccount(accounts[0])
  }
}

useEffect(() => {
  loadBlockchainData()
}, [account])

const buyHandler = async (_id) => {
  try {
    await landContract.methods.mint(_id).send({ from: account, value: '1000000000000000000'})
    const buildings = await landContract.methods.getBuildings().call()
    setBuildings(buildings)
  
    setLandName(buildings[_id - 1].name)
    setLandOwner(buildings[_id - 1].owner)
    setHasOwner(true)
  } catch (error) {
    window.alert('Error occurred when buying')
  }
}

const approveHandle = async (_id) => {
  try {
    await landContract.methods.approve(testAcc2, _id)
    console.log('approve')
    transferHandle(_id)
  } catch (error) {
    window.alert("Error");
  }
}

const transferHandle = async (_id) => {
  await landContract.methods.transferFrom(testAcc1, testAcc2, _id)
  console.log('transferd');
  setLandOwner(testAcc2)
}

  return (
    <div>
        <Navbar web3Handler={web3Handler} account={account}/>
        <Canvas camera={{ position: [0,0,30], up: [0,0,1], far: 10000}}>
          {/* Suspense prevents a component from rendering until a condition is met */}
          <Suspense fallback={null}>
            <Sky distance={450000} sunPosition={[1,10,0]} inclination={0} azimuth={0.25} />
            <ambientLight intensity={0.5} />
            <Physics>
              { buildings && buildings.map((building, index) => {
                if(building.owner === '0x0000000000000000000000000000000000000000') {
                  return (
                    <Plot
                      key={index}
                      position={[building.posX, building.posY, 0.1]}
                      size={[building.sizeX, building.sizeY]}
                      landId={index + 1}
                      landInfo={building}
                      setLandName={setLandName}
                      setLandOwner={setLandOwner}
                      setHasOwner={setHasOwner}
                      setLandId={setLandId}
                    />
                  )
                } else  {
                  return (
                    <Building
                      key={index}
                      position={[building.posX, building.posY, 0.1]}
                      size={[building.sizeX, building.sizeY, building.sizeZ]}
                      landId={index + 1}
                      landInfo={building}
                      setLandName={setLandName}
                      setLandOwner={setLandOwner}
                      setHasOwner={setHasOwner}
                      setLandId={setLandId}
                    />
                  )
                }
              })}
            </Physics>
            <Plane />
          </Suspense>
          {/* Allows us to zoom in and out */}
          <MapControls />
        </Canvas>

        {landId && (
          <div className="info">
            <h1 className="flex">{landName}</h1>

            <div className="flex-left">
              <div className="info-id">
                <h2>ID</h2>
                <p>{landId}</p>
              </div>
              <div className="info--owner">
                <h2>Owner</h2>
                <p>{landOwner}</p>
              </div>
              {!hasOwner && (
                <div className='info--owner'>
                  <h2>Cost</h2>
                  <p>{`${cost} ETH`}</p>
                </div>
              )}ga
            </div>
            {!hasOwner && (
              <button onClick={() => buyHandler(landId)} className="button info-buy">Buy Property</button>
            )}
            <button onClick={() => approveHandle(landId)} className="button info-buy">Transfer</button>
            {/* <button onClick={() => setTestAcc([])}>Clear</button> */}
          </div>
        )}

    </div>
  );
}

export default App;
