const hre = require("hardhat");

async function main() {
  const tuMemContract = await hre.ethers.getContractFactory("TubeMemories");
  const deployed = await tuMemContract.deploy();

  await deployed.deployed();

  console.log("Tube Memories contract deployed to:", deployed.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
