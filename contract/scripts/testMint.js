const hre = require("hardhat");

async function main() {
  const tuMemContract = await hre.ethers.getContractFactory("TubeMemories");
  const deployed = await tuMemContract.deploy();

  await deployed.deployed();

  console.log("Tube Memories contract deployed to:", deployed.address);

  let tx = await deployed.mint(
    "Paddington",
    "Brixton",
    "Route to O2 Brixton to see Foals on 09/05/22",
    {
      value: ethers.utils.parseEther("0.05")
    }
  );

  tx = await deployed.tokenURI(1);
  console.log("Newly minted token URI", tx);
  tx = await deployed.journeys(1);
  console.log("Token 1 journey:", tx);

  tx = await deployed.updateDescr("This is my updated description", 1);
  tx = await deployed.journeys(1);
  console.log("Token 1 updated description:", tx);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
