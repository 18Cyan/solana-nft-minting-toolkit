// mint-audio.js - Mint audio NFT with cover art
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

// ✅ Load Solana private key
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

  console.log(`📦 Uploaded ${name} to Arweave`)
  return uris[0]
}

const mintAudioNft = async (umi, audioUri, coverUri, name, description) => {
  const metadata = {
    name,
    description,
    image: coverUri,             // Cover art as main image
    animation_url: audioUri,     // Audio file for playback
    external_url: audioUri,      // External link to audio
    attributes: [
      { trait_type: 'Type', value: 'Audio NFT' },
      { trait_type: 'Format', value: 'MP3' }
    ],
    properties: {
      files: [
        { uri: audioUri, type: 'audio/mpeg' },
        { uri: coverUri, type: 'image/jpeg' },
      ],
      category: 'audio',
    },
  }

  const metadataUri = await umi.uploader.uploadJson(metadata)
  const asset = generateSigner(umi)

  // Create fresh UMI to prevent blockhash expiry for large files
  const freshUmi = createUmi('https://api.mainnet-beta.solana.com')
    .use(irysUploader({ address: 'https://uploader.irys.xyz' }))
    .use(mplCore())
    .use(keypairIdentity(signer))

  console.log('🎵 Minting Audio NFT...')
  const { signature } = await create(freshUmi, {
    asset,
    name,
    uri: metadataUri,
  }).sendAndConfirm(freshUmi)

  console.log('🎉 Audio NFT Created!')
  console.log(`🔗 Transaction: https://explorer.solana.com/tx/${base58.deserialize(signature)[0]}`)
  console.log(`📦 NFT Address: ${asset.publicKey.toString()}`)
}

const run = async () => {
  try {
    console.log('✅ Starting Audio NFT Minting...')
    
    const audioPath = './assets/audio/sample.mp3'
    const coverPath = './assets/images/cover.jpg'
    
    // Check if files exist
    if (!fs.existsSync(audioPath)) {
      console.error(`❌ Audio file not found: ${audioPath}`)
      return
    }
    if (!fs.existsSync(coverPath)) {
      console.error(`❌ Cover image not found: ${coverPath}`)
      return
    }
    
    console.log('📤 Uploading audio file...')
    const audioUri = await uploadFile(umi, audioPath, 'audio.mp3', 'audio/mpeg')
    
    console.log('📤 Uploading cover image...')
    const coverUri = await uploadFile(umi, coverPath, 'cover.jpg', 'image/jpeg')
    
    await mintAudioNft(
      umi, 
      audioUri, 
      coverUri, 
      'My Music NFT',
      'A beautiful piece of music stored on the blockchain'
    )
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

run()
