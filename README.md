# solana-nft-minting-toolkit
Personal toolkit for minting NFTs on Solana using Metaplex Core and Irys - Web3 learning project
Solana NFT Minting via Metaplex Core
Personal learning project exploring Solana NFT creation using Metaplex Core, Irys (Arweave), and various media types.

 Quick Start
bash# Install dependencies
npm install

# Generate Solana keypair (first time only)
node scripts/generate-keypair.js

# Upload and mint NFT
npm run mint-image
npm run mint-audio
npm run mint-mixed
📁 Project Structure
.
├── scripts/
│   ├── generate-keypair.js
│   ├── mint-image.js
│   ├── mint-audio.js
│   ├── mint-mixed.js
│   └── upload-only.js
├── examples/
│   ├── image-nft.js
│   ├── audio-nft.js
│   └── mixed-media-nft.js
├── assets/
│   └── (your media files here)
├── docs/
│   ├── SETUP.md
│   ├── TROUBLESHOOTING.md
│   └── API_REFERENCE.md
├── package.json
├── README.md
└── .gitignore

 Technology Stack

Blockchain: Solana (Mainnet/Devnet)
NFT Standard: Metaplex Core
Storage: Irys (Arweave gateway)
Language: Node.js (ES modules)

 Features
 Implemented

 Image NFT minting
 Audio NFT minting
 Mixed media NFT (image + audio + HTML)
 Mainnet & Devnet support
 Automatic metadata generation
 Error handling & retry logic

 In Progress

 Batch minting
 Custom metadata templates
 Gas optimization

 NFT Types Supported
1. Image NFTs
Simple image-based NFTs with custom metadata and descriptions.
2. Audio NFTs
Music/audio files with cover art and rich metadata support.
3. Mixed Media NFTs
Combination of images, audio, and HTML content in a single NFT.
🔧 Configuration
Environment Setup
javascript// Mainnet
const umi = createUmi('https://api.mainnet-beta.solana.com')
  .use(irysUploader({ address: 'https://uploader.irys.xyz' }))

// Devnet  
const umi = createUmi('https://api.devnet.solana.com')
  .use(irysUploader({ address: 'https://devnet.irys.xyz' }))
Key Generation

Solana keypairs stored in solana-keypair.json
EVM keypairs for Irys payments (if needed)
Automatic wallet generation scripts included

 Key Learnings
Technical Insights

Version Compatibility: Metaplex tool versions can conflict - use force install when needed
Upload Process: Two-step process (Irys upload → Solana mint)
Blockhash Issues: Large files may need fresh UMI instances to prevent blockhash expiry
Wallet Display: Phantom doesn't support Core-based mixed media NFTs fully

Cost Optimization

Use Devnet for testing (free SOL from faucets)
Irys mainnet costs real SOL for storage
Consider file size vs storage costs

Metadata Best Practices

Include proper MIME types for all files
Use descriptive names and attributes
External URLs for additional functionality

 Useful Resources

Metaplex Core UI - View your NFTs
Solana Explorer - Transaction verification
Sol Faucet - Devnet SOL for testing
Irys Testnet Faucet - Test tokens

 Example Usage
javascript// Basic image NFT
const imageUri = await uploadFile(umi, './image.jpg', 'My Image', 'image/jpeg')
await mintNft(umi, imageUri, 'My First NFT', 'image/jpeg')

// Audio NFT with cover
const audioUri = await uploadFile(umi, './song.mp3', 'My Song', 'audio/mpeg')
const coverUri = await uploadFile(umi, './cover.jpg', 'Cover Art', 'image/jpeg') 
await mintMusicNft(umi, audioUri, coverUri, 'My Music NFT')
 Known Limitations

Wallet Compatibility: Some wallets don't display Core NFTs properly
Mixed Media: Complex NFTs may not render correctly in all viewers
File Size: Large audio files can cause transaction timeouts
Network Costs: Mainnet operations require real SOL

Contributing
This is a personal learning project, but feedback and suggestions are welcome!
📄 License
MIT License - Feel free to learn from and adapt this code.
