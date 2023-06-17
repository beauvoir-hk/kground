const kgra = artifacts.require('kground')

module.exports = function(deployer){
    deployer.deploy(kgra)
    .then(function(){
        console.log('Contract deploy')
    })
}