# Security Updates  

Critical security updates will be listed here (ordered newest to oldest). If you had previously installed Nightfall prior to one of these security updates, please pull the latest code, and follow every set of re-installation steps.

---

**date**: 2019-06-07  
**description**: Prevent duplicate nullifier - ft-transfer  
**tag \#**:  v1.0.2  
**PR \#**: [#29](https://github.com/EYBlockchain/nightfall/pull/29)  
**issue \#**: n/a  
**re-installation**:  
`docker-compose build zkp`  

---

**date**: 2019-06-06  
**description**: Burn payTo bug  
**tag \#**:  v1.0.1  
**PR \#**: [#26](https://github.com/EYBlockchain/nightfall/pull/26)  
**issue \#**: [#19](https://github.com/EYBlockchain/nightfall/issues/19)  
**re-installation**:  
`cd zkp-utils`  
`npm ci`  
`cd ../zkp`  
`npm ci`  
`npm run setup -- -i gm17/nft-burn/`  
`npm run setup -- -i gm17/ft-burn/`  
`cd ..`  
`docker-compose build zkp`  

---

**date**: 2019-06-06  
**description**: Updated G2 library  
**tag \#**: n/a  
**PR \#**: [#23](https://github.com/EYBlockchain/nightfall/pull/23)  
**issue \#**: [#14](https://github.com/EYBlockchain/nightfall/issues/14)  
**re-installation**:  
`docker-compose build zkp`  

---
