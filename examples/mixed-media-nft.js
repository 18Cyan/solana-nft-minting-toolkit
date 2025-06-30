// mixed-media-nft.js - Complete example of mixed media NFT (audio + image + HTML)
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
 * Example: Mint a mixed media NFT with multiple file types
 * 
 * This example demonstrates:
 * - Multiple file type handling (audio + image + HTML)
 * - Complex metadata structures
 * - Interactive content integration
 * - Advanced NFT composition
 */

const CONFIG = {
  network: 'devnet', // or 'mainnet'
  
  // File paths - ensure these files exist in your assets folder
  files: {
    audio: './assets/audio/love-track.mp3',
    cover: './assets/images/love-cover.jpg', 
    html: './assets/other/love-letter.html'
  },
  
  // NFT metadata
  nftName: 'Digital Love Letter Collection',
  description: `💌 A unique mixed media NFT containing multiple forms of expression:

🎵 **Personal Audio Track** - Original composition with emotional depth
🖼️ **Custom Cover Art** - Hand-crafted visual representation  
📝 **Interactive HTML Letter** - A personal message that unfolds digitally
🔗 **Blockchain Permanence** - Forever stored on Arweave and Solana

This represents the convergence of technology and human emotion - a digital keepsake that transcends traditional boundaries between art, music, and literature.

Perfect for:
- Digital art collectors
- Music enthusiasts  
- Love letter archivists
- Web3 experience explorers`,

  // Advanced attributes
  attributes: [
    { trait_type: 'Type', value: 'Mixed Media' },
    { trait_type: 'Components', value: '3' },
    { trait_type: 'Audio Format', value: 'MP3' },
    { trait_type: 'Visual Format', value: 'JPEG + HTML' },
    { trait_type: 'Interactivity', value: 'High' },
    { trait_type: 'Emotional Value', value: 'Maximum' },
    { trait_type: 'Rarity', value: 'One of One' },
    { trait_type: 'Year Created', value: '2025' }
  ],
  
  // Collection info
  collection: {
    name: 'Personal Digital Artifacts',
    family: 'Love Letters'
  }
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

async function validateFiles() {
  console.log('📋 Validating required files...')
  
  const fileChecks = [
    { path: CONFIG.files.audio, type: 'Audio file', icon: '🎵' },
    { path: CONFIG.files.cover, type: 'Cover image', icon: '🖼️' },
    { path: CONFIG.files.html, type: 'HTML content', icon: '📝' }
  ]
  
  let allFilesExist = true
  
  for (const file of fileChecks) {
    if (fs.existsSync(file.path)) {
      const stats = fs.statSync(file.path)
      const sizeKB = Math.round(stats.size / 1024)
      console.log(`✅ ${file.icon} ${file.type}: ${file.path} (${sizeKB} KB)`)
    } else {
      console.error(`❌ ${file.icon} ${file.type} not found: ${file.path}`)
      allFilesExist = false
    }
  }
  
  if (!allFilesExist) {
    console.log('\n💡 Setup instructions:')
    console.log('1. Create these folders in your project: assets/audio/, assets/images/, assets/other/')
    console.log('2. Add your files to the appropriate folders')
    console.log('3. Update CONFIG.files paths if using different filenames')
    throw new Error('Missing required files')
  }
  
  return true
}

async function uploadFile(umi, filePath, displayName, mimeType) {
  const fileName = path.basename(filePath)
  const stats = fs.statSync(filePath)
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)
  
  console.log(`📤 Uploading ${displayName} (${sizeMB} MB)...`)
  
  const file = fs.readFileSync(filePath)
  const umiFile = createGenericFile(file, fileName, {
    tags: [
      { name: 'Content-Type', value: mimeType },
      { name: 'App-Name', value: 'Mixed-Media-NFT' }
    ],
  })
  
  const [uri] = await umi.uploader.upload([umiFile])
  
  console.log(`✅ ${displayName} uploaded successfully`)
  console.log(`   🌐 URI: ${uri}`)
  
  return uri
}

async function uploadAllFiles(umi) {
  console.log('🚀 Starting multi-file upload process...')
  
  try {
    // Upload in order of file size (smallest first)
    const coverUri = await uploadFile(
      umi, 
      CONFIG.files.cover, 
      'Cover Image', 
      'image/jpeg'
    )
    
    const htmlUri = await uploadFile(
      umi, 
      CONFIG.files.html, 
      'HTML Letter', 
      'text/html'
    )
    
    const audioUri = await uploadFile(
      umi, 
      CONFIG.files.audio, 
      'Audio Track', 
      'audio/mpeg'
    )
    
    console.log('✅ All files uploaded to Arweave successfully!')
    
    return { audioUri, coverUri, htmlUri }
    
  } catch (error) {
    console.error('❌ File upload failed:', error.message)
    throw error
  }
}

async function createMixedMediaMetadata(umi, { audioUri, coverUri, htmlUri }) {
  console.log('🎭 Creating mixed media metadata...')
  
  const metadata = {
    name: CONFIG.nftName,
    description: CONFIG.description,
    
    // Primary display elements
    image: coverUri,              // Main visual (shows in wallets)
    animation_url: htmlUri,       // Interactive content (HTML letter)
    external_url: htmlUri,        // Click-through destination
    
    // Rich attributes
    attributes: CONFIG.attributes,
    
    // Advanced properties
    properties: {
      files: [
        {
          uri: coverUri,
          type: 'image/jpeg',
          cdn: false,
          category: 'cover'
        },
        {
          uri: audioUri,
          type: 'audio/mpeg', 
          cdn: false,
          category: 'audio'
        },
        {
          uri: htmlUri,
          type: 'text/html',
          cdn: false,
          category: 'interactive'
        }
      ],
      category: 'mixed',
      creators: [
        {
          address: umi.identity.publicKey.toString(),
          verified: true,
          share: 100
        }
      ]
    },
    
    // Mixed media specific metadata
    media: {
      cover_image: coverUri,
      audio_track: audioUri,
      interactive_content: htmlUri,
      total_components: 3
    },
    
    // Collection information
    collection: CONFIG.collection,
    
    // Additional metadata for enhanced discovery
    tags: ['mixed-media', 'audio', 'interactive', 'love-letter', 'digital-art'],
    
    // Technical specifications
    technical: {
      standard: 'Metaplex Core',
      storage: 'Arweave via Irys',
      blockchain: 'Solana'
    }
  }
  
  const metadataUri = await umi.uploader.uploadJson(metadata)
  
  console.log('✅ Mixed media metadata created and uploaded')
  console.log(`   📄 Metadata URI: ${metadataUri}`)
  
  return metadataUri
}

async function mintMixedMediaNFT(umi, metadataUri) {
  console.log('🎪 Minting mixed media NFT...')
  
  // Create completely fresh UMI to prevent any blockhash issues
  const freshUmi = createUmi(NETWORKS[CONFIG.network].solana)
    .use(irysUploader({ address: NETWORKS[CONFIG.network].irys }))
    .use(mplCore())
    .use(keypairIdentity(umi.identity))
  
  const asset = generateSigner(freshUmi)
  
  console.log('⚡ Submitting transaction to Solana...')
  
  const result = await create(freshUmi, {
    asset,
    name: CONFIG.nftName,
    uri: metadataUri,
  }).sendAndConfirm(freshUmi, {
    confirm: { commitment: 'confirmed' }
  })
  
  const signature = base58.deserialize(result.signature)[0]
  const explorerUrl = `https://explorer.solana.com/tx/${signature}${CONFIG.network === 'devnet' ? '?cluster=devnet' : ''}`
  const metaplexUrl = `https://core.metaplex.com/explorer/${asset.publicKey.toString()}${CONFIG.network === 'devnet' ? '?env=devnet' : ''}`
  
  console.log('\n🎉 Mixed Media NFT Created Successfully!')
  console.log('=======================================')
  console.log(`📦 NFT Address: ${asset.publicKey.toString()}`)
  console.log(`🔗 Transaction: ${explorerUrl}`)
  console.log(`👁️  View on Metaplex: ${metaplexUrl}`)
  console.log('\n🎯 Your mixed media NFT is now live!')
  console.log('   🖼️  Visual: Cover image displays in wallets')
  console.log('   🎵 Audio: Embedded in metadata for compatible players')  
  console.log('   📝 Interactive: HTML content accessible via external_url')
  
  return {
    nftAddress: asset.publicKey.toString(),
    transactionSignature: signature,
    explorerUrl,
    metaplexUrl
  }
}

async function main() {
  console.log('🎭 Starting Mixed Media NFT Minting Example')
  console.log('==========================================')
  console.log('Creating a unique NFT with audio, image, and HTML content...\n')
  
  try {
    // Validate all required files exist
    await validateFiles()
    
    // Initialize blockchain connection
    const umi = await initializeUmi()
    
    // Upload all files to Arweave
    const uploadedFiles = await uploadAllFiles(umi)
    
    // Create comprehensive metadata
    const metadataUri = await createMixedMediaMetadata(umi, uploadedFiles)
    
    // Mint the mixed media NFT
    const result = await mintMixedMediaNFT(umi, metadataUri)
    
    console.log('\n✨ Mixed media NFT creation completed!')
    console.log('This NFT showcases the full potential of blockchain-based digital art! 🚀')
    
  } catch (error) {
    console.error('\n💥 Mixed media minting failed:', error.message)
    console.log('\n🔧 Troubleshooting for mixed media NFTs:')
    console.log('- Ensure all three file types are present')
    console.log('- Large files may require multiple attempts')
    console.log('- Check SOL balance for storage costs')
    console.log('- HTML files should be self-contained (no external dependencies)')
    console.log('- Try devnet first for testing')
    console.log('- See docs/TROUBLESHOOTING.md for detailed help')
  }
}

main().catch(console.error)
