const hre = require("hardhat");

async function main() {
  const tuMemContract = await hre.ethers.getContractFactory("TubeMemories");
  const deployed = await tuMemContract.deploy("https://devbears.herokuapp.com/api/");

  await deployed.deployed();

  console.log("Tube Memories contract deployed to:", deployed.address);

  let tx = await deployed.mint(
    "Paddington",
    "Brixton",
    {
      value: ethers.utils.parseEther("0.05"),
    }
  );

  tx = await deployed.tokenURI(1);
  console.log("Newly minted token URI", tx);
  tx = await deployed.journeys(1);
  console.log("Token 1 journey:", tx);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
