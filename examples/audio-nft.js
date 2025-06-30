// audio-nft.js - Complete example of audio NFT with cover art
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
 * Example: Mint an audio NFT with cover art
 * 
 * This example demonstrates:
 * - Audio file upload to Arweave
 * - Cover art integration
 * - Music metadata standards
 * - Handling large file uploads
 */

const CONFIG = {
  network: 'devnet', // or 'mainnet'
  
  // File paths
  audioPath: './assets/audio/sample.mp3',
  coverPath: './assets/images/cover.jpg',
  
  // Music metadata
  trackName: 'My Music NFT',
  artist: 'Digital Musician',
  album: 'Blockchain Beats',
  genre: 'Electronic',
  year: '2025',
  duration: '3:45', // Optional
  
  description: `🎵 Original music track stored on the blockchain

This audio NFT combines:
🎧 High-quality MP3 audio
🎨 Custom cover artwork  
💿 Rich metadata including artist, album, and genre information

Perfect for collectors of digital music and supporters of independent artists.`,

  attributes: [
    { trait_type: 'Type', value: 'Audio NFT' },
    { trait_type: 'Format', value: 'MP3' },
    { trait_type: 'Genre', value: 'Electronic' },
    { trait_type: 'Duration', value: '3:45' },
    { trait_type: 'Quality', value: 'High' }
  ]
}

const NETWORKS = {
  mainnet: {
    solana: 'https://api.mainnet-beta.solana.com',
    irys: 'https://uploader.irys.xyz'
  },
  devnet: {
    solana: 'https://api.devnet.solana.com',
    irys: 'https://devnet.irys.xyz'
  }
}

async function initializeUmi() {
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
}

async function uploadFile(umi, filePath, fileName, mimeType) {
  console.log(`📤 Uploading ${fileName}...`)
  
  const file = fs.readFileSync(filePath)
  const umiFile = createGenericFile(file, fileName, {
    tags: [{ name: 'Content-Type', value: mimeType }],
  })
  
  const [uri] = await umi.uploader.upload([umiFile])
  console.log(`✅ ${fileName} uploaded to Arweave`)
  
  return uri
}

async function uploadAudioAndCover(umi) {
  console.log('🎵 Uploading audio and cover files...')
  
  // Upload cover art first (usually smaller)
  const coverUri = await uploadFile(
    umi, 
    CONFIG.coverPath, 
    'cover.jpg', 
    'image/jpeg'
  )
  
  // Upload audio file (larger, may take longer)
  const audioUri = await uploadFile(
    umi, 
    CONFIG.audioPath, 
    'audio.mp3', 
    'audio/mpeg'
  )
  
  return { audioUri, coverUri }
}

async function createAudioMetadata(umi, audioUri, coverUri) {
  console.log('🎼 Creating audio NFT metadata...')
  
  const metadata = {
    name: CONFIG.trackName,
    description: CONFIG.description,
    image: coverUri,              // Cover art as main image
    animation_url: audioUri,      // Audio file for playback
    external_url: audioUri,       // Direct link to audio
    
    attributes: [
      ...CONFIG.attributes,
      { trait_type: 'Artist', value: CONFIG.artist },
      { trait_type: 'Album', value: CONFIG.album },
      { trait_type: 'Year', value: CONFIG.year }
    ],
    
    properties: {
      files: [
        {
          uri: audioUri,
          type: 'audio/mpeg',
          cdn: false
        },
        {
          uri: coverUri,
          type: 'image/jpeg',
          cdn: false
        }
      ],
      category: 'audio',
      creators: [
        {
          address: umi.identity.publicKey.toString(),
          verified: true,
          share: 100
        }
      ]
    },
    
    // Music-specific metadata
    audio: {
      artist: CONFIG.artist,
      album: CONFIG.album,
      genre: CONFIG.genre,
      duration: CONFIG.duration,
      year: CONFIG.year
    }
  }
  
  const metadataUri = await umi.uploader.uploadJson(metadata)
  console.log('✅ Audio metadata created and uploaded')
  
  return metadataUri
}

async function mintAudioNFT(umi, metadataUri) {
  console.log('🎧 Minting audio NFT...')
  
  // Create fresh UMI to prevent blockhash expiry (important for large audio files)
  const freshUmi = createUmi(NETWORKS[CONFIG.network].solana)
    .use(irysUploader({ address: NETWORKS[CONFIG.network].irys }))
    .use(mplCore())
    .use(keypairIdentity(umi.identity))
  
  const asset = generateSigner(freshUmi)
  
  const result = await create(freshUmi, {
    asset,
    name: CONFIG.trackName,
    uri: metadataUri,
  }).sendAndConfirm(freshUmi)
  
  const signature = base58.deserialize(result.signature)[0]
  
  console.log('🎉 Audio NFT minted successfully!')
  console.log(`📦 NFT Address: ${asset.publicKey.toString()}`)
  console.log(`🔗 Transaction: https://explorer.solana.com/tx/${signature}${CONFIG.network === 'devnet' ? '?cluster=devnet' : ''}`)
  
  return {
    nftAddress: asset.publicKey.toString(),
    transactionSignature: signature
  }
}

async function main() {
  console.log('🎵 Starting Audio NFT Minting Example')
  console.log('====================================')
  
  // Validate files exist
  const requiredFiles = [
    { path: CONFIG.audioPath, name: 'Audio file' },
    { path: CONFIG.coverPath, name: 'Cover image' }
  ]
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file.path)) {
      console.error(`❌ ${file.name} not found: ${file.path}`)
      console.log('💡 Make sure both audio and cover files are in the assets/ folder')
      return
    }
  }
  
  try {
    // Initialize
    const umi = await initializeUmi()
    
    // Upload files
    const { audioUri, coverUri } = await uploadAudioAndCover(umi)
    
    // Create metadata
    const metadataUri = await createAudioMetadata(umi, audioUri, coverUri)
    
    // Mint NFT
    const result = await mintAudioNFT(umi, metadataUri)
    
    console.log('\n🎶 Audio NFT created successfully!')
    console.log('Your music is now immortalized on the blockchain! 🚀')
    
  } catch (error) {
    console.error('\n💥 Minting failed:', error.message)
    console.log('\n🔧 Audio NFT troubleshooting tips:')
    console.log('- Large audio files may take longer to upload')
    console.log('- Ensure sufficient SOL for storage costs')
    console.log('- Try compressing audio if upload fails')
    console.log('- Use devnet for testing first')
  }
}

main().catch(console.error)
