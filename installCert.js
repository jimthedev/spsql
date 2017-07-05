const getDevelopmentCertificate = require('devcert-san').default;

function installCert() {
  console.log('If you experience errors, please ensure you\'ve installed the prequisites:');
  console.log('  - Mac: brew install nss');
  console.log('  - Linux: apt install libnss3-tools');
  console.log('  - Windows: N/A');
  console.log('');
  console.log('NOTE: You may be prompted for your password during initial install.');

  getDevelopmentCertificate('my-micro-service', { installCertutil: true }).then(() =>{
    console.log('\nSSL cert was installed successfully or already existed.');
  }).catch(e => {
    console.error('\nError installing cert', e);
  });
}

installCert();
