// upload-only.js - Upload files to Arweave without minting NFT
import {
  createGenericFile,
  keypairIdentity,
} from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys'
import fs from 'fs'
import path from 'path'

// ✅ Load Solana private key
const secret = JSON.parse(fs.readFileSync('./solana-keypair.json', 'utf8'))
const umi = createUmi('https://api.mainnet-beta.solana.com')
const signer = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret))
umi
    .use(irysUploader({ address: 'https://uploader.irys.xyz' }))
    .use(keypairIdentity(signer))

// ✅ Upload any file type
const uploadFile = async (filePath, customName = null, customMime = null) => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`)
      return null
    }
    
    const file = fs.readFileSync(path.join(filePath))
    const fileName = customName || path.basename(filePath)
    
    // Auto-detect MIME type if not provided
    let mimeType = customMime
    if (!mimeType) {
      const ext = path.extname(filePath).toLowerCase()
      const mimeMap = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg', 
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.html': 'text/html',
        '.txt': 'text/plain',
        '.json': 'application/json',
        '.pdf': 'application/pdf'
      }
      mimeType = mimeMap[ext] || 'application/octet-stream'
    }
    
    const genericFile = createGenericFile(file, fileName, {
      tags: [{ name: 'Content-Type', value: mimeType }],
    })
    
    console.log(`📤 Uploading ${fileName} (${mimeType})...`)
    const [uri] = await umi.uploader.upload([genericFile])
    
    console.log(`✅ Upload successful!`)
    console.log(`📦 Arweave URL: ${uri}`)
    console.log(`🌐 Gateway URL: https://arweave.net/${uri.split('/').pop()}`)
    
    return uri
    
  } catch (error) {
    console.error(`❌ Upload failed for ${filePath}:`, error.message)
    return null
  }
}

// ✅ Upload multiple files
const uploadMultipleFiles = async (filePaths) => {
  const results = []
  
  for (const filePath of filePaths) {
    const uri = await uploadFile(filePath)
    if (uri) {
      results.push({ file: filePath, uri })
    }
    
    // Small delay between uploads
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  return results
}

const run = async () => {
  try {
    console.log('✅ Starting file upload to Arweave...')
    console.log(`🔑 Using wallet: ${umi.identity.publicKey.toString()}`)
    
    // Example usage - customize these file paths
    const filesToUpload = [
      './assets/images/sample.jpg',
      './assets/audio/sample.mp3',
      // './assets/other/document.pdf',
      // Add more files as needed
    ]
    
    // Filter existing files
    const existingFiles = filesToUpload.filter(file => fs.existsSync(file))
    const missingFiles = filesToUpload.filter(file => !fs.existsSync(file))
    
    if (missingFiles.length > 0) {
      console.log('\n⚠️  Missing files (will be skipped):')
      missingFiles.forEach(file => console.log(`   ${file}`))
    }
    
    if (existingFiles.length === 0) {
      console.log('\n❌ No files found to upload!')
      console.log('💡 Add your files to the assets/ folder and update the file paths in this script')
      return
    }
    
    console.log(`\n📋 Found ${existingFiles.length} files to upload`)
    
    // Upload all existing files
    const results = await uploadMultipleFiles(existingFiles)
    
    console.log('\n📊 Upload Summary:')
    console.log(`✅ Successful: ${results.length}`)
    console.log(`❌ Failed: ${existingFiles.length - results.length}`)
    
    if (results.length > 0) {
      console.log('\n🔗 Uploaded Files:')
      results.forEach(({ file, uri }) => {
        console.log(`   ${path.basename(file)}: ${uri}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  run()
}

// Export for use in other scripts
export { uploadFile, uploadMultipleFiles }
