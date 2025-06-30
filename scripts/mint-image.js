// mint-image.js - Mint image NFT on Solana
import { create, mplCore } from '@metaplex-foundation/mpl-core'
import {
  createGenericFile,
  generateSigner,
  keypairIdentity,
} from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys'
import { base58 } from '@metaplex-foundation/umi/serializers'
import fs from 'fs'
import path from 'path'

// ✅ Load Solana private key from JSON file
const secret = JSON.parse(fs.readFileSync('./solana-keypair.json', 'utf8'))
const umi = createUmi('https://api.mainnet-beta.solana.com')
const signer = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret))
umi
    .use(irysUploader({ address: 'https://uploader.irys.xyz' }))
    .use(mplCore())
    .use(keypairIdentity(signer))

const uploadFile = async (umi, filePath, name, mime) => {
  const file = fs.readFileSync(path.join(filePath))
  const umiFile = createGenericFile(file, name, {
    tags: [{ name: 'Content-Type', value: mime }],
  })
  const uris = await umi.uploader.upload([umiFile])

  const trd = `${uris[0].split('/').pop()}`
  console.log(`📦 Uploaded ${name} to Arweave: ${trd}`)

  return uris[0]
}

const mintNft = async (umi, fileUri, name, description, type = 'image/jpeg') => {
  console.log('Creating NFT metadata...')
  const metadata = {
    name,
    description,
    image: fileUri,
    external_url: '',
    attributes: [],
    properties: {
      files: [{ uri: fileUri, type }],
      category: type.startsWith('audio') ? 'audio' : 'image',
    },
  }

  const metadataUri = await umi.uploader.uploadJson(metadata)
  const asset = generateSigner(umi)

  console.log('Minting NFT...')
  const { signature } = await create(umi, {
    asset,
    name,
    uri: metadataUri,
  }).sendAndConfirm(umi)

  console.log('🔑 Wallet:', umi.identity.publicKey.toString())
  console.log('📦 NFT Address:', asset.publicKey.toString())
  console.log('🎉 NFT Created!')
  console.log(`🔗 Transaction: https://explorer.solana.com/tx/${base58.deserialize(signature)[0]}`)
}

const run = async () => {
  try {
    console.log('✅ Starting Image NFT Minting...')
    
    // Change this to your image file path
    const imagePath = './assets/images/sample.jpg'
    const imageName = 'My Image NFT'
    const description = 'A beautiful image NFT created with Metaplex Core'
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      console.error(`❌ File not found: ${imagePath}`)
      console.log('Please add your image file to assets/images/ folder')
      return
    }
    
    const imageUri = await uploadFile(umi, imagePath, imageName, 'image/jpeg')
    await mintNft(umi, imageUri, imageName, description, 'image/jpeg')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

run()
