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

const uploadFile = async (filePath, name, mime) => {
  const file = fs.readFileSync(path.join(filePath))
  const umiFile = createGenericFile(file, name, {
    tags: [{ name: 'Content-Type', value: mime }],
  })
  const [uri] = await umi.uploader.upload([umiFile])
  console.log(`📤 Uploaded ${name}: ${uri}`)
  return uri
}

const mintMixedMediaNft = async () => {
  console.log('🚀 Uploading all mixed media assets...')
  
  // File paths - customize these
  const audioPath = './assets/audio/love-track.mp3'
  const coverPath = './assets/images/cover.jpg'
  const htmlPath = './assets/other/love-letter.html'
  
  // Check if all files exist
  const files = [
    { path: audioPath, name: 'Audio file' },
    { path: coverPath, name: 'Cover image' },
    { path: htmlPath, name: 'HTML content' }
  ]
  
  for (const file of files) {
    if (!fs.existsSync(file.path)) {
      console.error(`❌ ${file.name} not found: ${file.path}`)
      console.log('Please ensure all required files are in the assets/ folder')
      return
    }
  }
  
  // Upload all assets
  const audioUri = await uploadFile(audioPath, 'love-track.mp3', 'audio/mpeg')
  const coverUri = await uploadFile(coverPath, 'cover.jpg', 'image/jpeg')
  const htmlUri = await uploadFile(htmlPath, 'love-letter.html', 'text/html')

  const metadata = {
    name: 'Love Letter 💌 with Music',
    description: `A mixed media NFT containing:
    
🎵 Personal audio track
🖼️ Custom cover art  
📝 Interactive HTML love letter

This represents the fusion of technology and emotion - a digital keepsake that combines multiple forms of expression into a single, permanent blockchain artifact.`,
    image: coverUri,
    external_url: htmlUri,        // Click to view HTML content
    animation_url: audioUri,      // Audio playback
    attributes: [
      { trait_type: 'Type', value: 'Mixed Media' },
      { trait_type: 'Audio', value: 'MP3' },
      { trait_type: 'Visual', value: 'JPEG + HTML' },
      { trait_type: 'Components', value: '3' }
    ],
    properties: {
      files: [
        { uri: coverUri, type: 'image/jpeg' },
        { uri: audioUri, type: 'audio/mpeg' },
        { uri: htmlUri, type: 'text/html' }
      ],
      category: 'mixed',
    }
  }

  const metadataUri = await umi.uploader.uploadJson(metadata)
  const asset = generateSigner(umi)
  
  // Create fresh UMI instance to prevent blockhash expiry
  const freshUmi = createUmi('https://api.mainnet-beta.solana.com')
    .use(irysUploader({ address: 'https://uploader.irys.xyz' }))
    .use(mplCore())
    .use(keypairIdentity(signer))
  
  console.log('🎭 Minting mixed media NFT...')
  const { signature } = await create(freshUmi, {
    asset,
    name: metadata.name,
    uri: metadataUri,
  }).sendAndConfirm(freshUmi)

  console.log('\n🎉 Mixed Media NFT Created!')
  console.log(`🔗 TX: https://explorer.solana.com/tx/${base58.deserialize(signature)[0]}`)
  console.log(`🖼️ NFT Address: ${asset.publicKey.toString()}`)
  console.log(`\n📱 View on Metaplex Core UI: https://core.metaplex.com/explorer`)
}

const run = async () => {
  try {
    console.log('✅ Starting Mixed Media NFT Minting...')
    await mintMixedMediaNft()
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\n💡 Tips:')
    console.log('- Ensure all files exist in assets/ folders')
    console.log('- Check your SOL balance for gas fees')
    console.log('- Large files may need multiple attempts')
  }
}

run()
