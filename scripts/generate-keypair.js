// generate-keypair.js - Generate Solana wallet for NFT minting
import { Keypair } from '@solana/web3.js'
import fs from 'fs'

const keypair = Keypair.generate()
const secret = Array.from(keypair.secretKey)

fs.writeFileSync('solana-keypair.json', JSON.stringify(secret))

console.log('✅ 新钱包地址（Devnet）：', keypair.publicKey.toString())
console.log('🔐 私钥已保存到 solana-keypair.json')
console.log('⚠️  请妥善保管私钥文件，不要上传到公共仓库')
