javascript// image-nft.js - Complete example of image NFT minting
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

/**
 * Example: Mint a simple image NFT with custom metadata
 * 
 * This example demonstrates:
 * - Basic image upload to Arweave via Irys
 * - Metadata creation with custom attributes
 * - NFT minting on Solana using Metaplex Core
 */

// Configuration
const CONFIG = {
  // Switch between networks
  network: 'devnet', // or 'mainnet'
  
  // File paths (customize these)
  imagePath: './assets/images/sample.jpg',
  
  // NFT metadata
  nftName: 'My First NFT',
  description: `This is my first NFT created with Metaplex Core.

🎨 A digital artwork stored permanently on Arweave
🔗 Minted on Solana blockchain
💎 Powered by Metaplex Core standard`,
  
  // Custom attributes
  attributes: [
    { trait_type: 'Artist', value: 'Digital Creator' },
    { trait_type: 'Style', value: 'Digital Art' },
    { trait_type: 'Rarity', value: 'Unique' },
    { trait_type: 'Year', value: '2025' }
  ]
}

// Network endpoints
const NETWORKS = {
  mainnet: {
    solana: 'https://api.mainnet-beta.solana.com',
    irys: 'https://uploader.irys.xyz',
    explorer: 'https://explorer.solana.com'
  },
  devnet: {
    solana: 'https://api.devnet.solana.com', 
    irys: 'https://devnet.irys.xyz',
    explorer: 'https://explorer.solana.com'
  }
}

async function initializeUmi() {
  try {
    const secret = JSON.parse(fs.readFileSync('./solana-keypair.json', 'utf8'))
    const network = NETWORKS[CONFIG.network]
    
    const umi = createUmi(network.solana)
    const signer = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret))
    
    umi
      .use(irysUploader({ address: network.irys }))
      .use(mplCore())
      .use(keypairIdentity(signer))
    
    console.log(`🔗 Connected to ${CONFIG.network}`)
    console.log(`🔑 Wallet: ${umi.identity.publicKey.toString()}`)
    
    return umi
  } catch (error) {
    console.error('❌ Failed to initialize:', error.message)
    console.log('💡 Run "npm run setup" to generate a wallet first')
    process.exit(1)
  }
}

async function uploadImage(umi, imagePath) {
  console.log('📤 Uploading image to Arweave...')
  
  try {
    const imageFile = fs.readFileSync(imagePath)
    const fileName = path.basename(imagePath)
    
    const umiFile = createGenericFile(imageFile, fileName, {
      tags: [{ name: 'Content-Type', value: 'image/jpeg' }],
    })
    
    const [uri] = await umi.uploader.upload([umiFile])
    
    console.log(`✅ Image uploaded successfully`)
    console.log(`🌐 Arweave URI: ${uri}`)
    
    return uri
  } catch (error) {
    console.error('❌ Image upload failed:', error.message)
    throw error
  }
}

async function createMetadata(umi, imageUri) {
  console.log('📝 Creating NFT metadata...')
  
  const metadata = {
    name: CONFIG.nftName,
    description: CONFIG.description,
    image: imageUri,
    external_url: '', // Optional: link to website
    attributes: CONFIG.attributes,
    properties: {
      files: [
        {
          uri: imageUri,
          type: 'image/jpeg'
        }
      ],
      category: 'image',
      creators: [
        {
          address: umi.identity.publicKey.toString(),
          verified: true,
          share: 100
        }
      ]
    }
  }
  
  try {
    const metadataUri = await umi.uploader.uploadJson(metadata)
    console.log(`✅ Metadata uploaded`)
    console.log(`📄 Metadata URI: ${metadataUri}`)
    
    return metadataUri
  } catch (error) {
    console.error('❌ Metadata upload failed:', error.message)
    throw error
  }
}

async function mintNFT(umi, metadataUri) {
  console.log('⚡ Minting NFT on Solana...')
  
  try {
    const asset = generateSigner(umi)
    
    const transaction = create(umi, {
      asset,
      name: CONFIG.nftName,
      uri: metadataUri,
    })
    
    const result = await transaction.sendAndConfirm(umi, {
      confirm: { commitment: 'confirmed' }
    })
    
    const signature = base58.deserialize(result.signature)[0]
    const network = NETWORKS[CONFIG.network]
    
    console.log('🎉 NFT minted successfully!')
    console.log(`📦 NFT Address: ${asset.publicKey.toString()}`)
    console.log(`🔗 Transaction: ${network.explorer}/tx/${signature}${CONFIG.network === 'devnet' ? '?cluster=devnet' : ''}`)
    console.log(`👁️  View on Metaplex: https://core.metaplex.com/explorer/${asset.publicKey.toString()}${CONFIG.network === 'devnet' ? '?env=devnet' : ''}`)
    
    return {
      nftAddress: asset.publicKey.toString(),
      transactionSignature: signature
    }
  } catch (error) {
    console.error('❌ Minting failed:', error.message)
    throw error
  }
}

async function main() {
  console.log('🚀 Starting Image NFT Minting Example')
  console.log('=====================================')
  
  // Validate file exists
  if (!fs.existsSync(CONFIG.imagePath)) {
    console.error(`❌ Image file not found: ${CONFIG.imagePath}`)
    console.log('💡 Add your image to the assets/images/ folder')
    console.log('💡 Or update CONFIG.imagePath to point to your image')
    return
  }
  
  try {
    // Initialize
    const umi = await initializeUmi()
    
    // Upload image
    const imageUri = await uploadImage(umi, CONFIG.imagePath)
    
    // Create and upload metadata
    const metadataUri = await createMetadata(umi, imageUri)
    
    // Mint NFT
    const result = await mintNFT(umi, metadataUri)
    
    console.log('\n✨ Minting completed successfully!')
    console.log(`🎯 Your NFT is now live on the ${CONFIG.network}`)
    
  } catch (error) {
    console.error('\n💥 Minting failed:', error.message)
    console.log('\n🔧 Troubleshooting tips:')
    console.log('- Ensure you have sufficient SOL balance')
    console.log('- Check your internet connection')
    console.log('- Try switching to devnet for testing')
    console.log('- See docs/TROUBLESHOOTING.md for more help')
  }
}

// Run example
main().catch(console.error)
