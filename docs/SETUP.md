markdown# Setup Guide

## Prerequisites

- Node.js 16+ installed
- Basic understanding of Solana and NFTs
- SOL tokens for mainnet operations (or use devnet for free testing)

## Installation

1. **Clone this repository**
```bash
git clone <your-repo-url>
cd solana-nft-minting-toolkit

Install dependencies

bashnpm install

Generate Solana keypair

bashnpm run setup
This creates solana-keypair.json with your wallet credentials.
Configuration
Network Selection
For Testing (Recommended first):

Use Devnet in your scripts
Get free SOL from Sol Faucet
Test Irys uploads with Irys Testnet Faucet

For Production:

Switch to Mainnet in your scripts
Ensure you have real SOL for gas fees
Irys uploads cost real SOL on mainnet

File Structure
your-project/
├── assets/               # Put your media files here
│   ├── images/
│   ├── audio/
│   └── other/
├── scripts/             # Executable scripts
└── examples/            # Reference implementations
Environment Variables (Optional)
Create .env file for sensitive data:
bashSOLANA_PRIVATE_KEY=your_private_key_array
IRYS_PRIVATE_KEY=your_eth_private_key
Quick Start Commands
bash# Generate wallet (first time only)
npm run setup

# Upload and mint different NFT types
npm run mint-image    # Image NFT
npm run mint-audio    # Audio NFT with cover
npm run mint-mixed    # Mixed media NFT
npm run upload-only   # Just upload files
Troubleshooting
Common Issues

Version Conflicts
bashnpm install --force

Insufficient Balance

Check SOL balance in your wallet
Use devnet for testing first


Blockhash Expired

Large files may timeout
Use fresh UMI instances as shown in examples


Upload Failures

Check internet connection
Verify file paths are correct
Ensure files aren't corrupted



Network Issues

Devnet: Sometimes slow, be patient
Mainnet: More reliable but costs real SOL
Irys: Occasionally has outages, try again later

Security Notes

Never commit solana-keypair.json to public repos
Use .gitignore to exclude sensitive files
Consider using environment variables for production

Next Steps

Run a test image mint on devnet
Verify your NFT on Metaplex Core UI
Check transaction on Solana Explorer
Try audio and mixed media examples
