# Troubleshooting Guide

## Common Errors and Solutions

### 🔑 Wallet and Key Issues

#### `Error: solana-keypair.json not found`
**Solution:**
```bash
npm run setup
This will generate a new keypair file.
Error: Invalid private key format
Cause: Corrupted or incorrectly formatted keypair file
Solution:

Delete solana-keypair.json
Run npm run setup to generate a new one
Ensure the file contains an array of numbers, not a string

💰 Balance and Payment Issues
Error: Insufficient funds
For Devnet:

Visit Sol Faucet
Enter your wallet address (shown when running scripts)
Request free SOL

For Mainnet:

Transfer SOL to your wallet address
Minimum ~0.01 SOL needed for transactions
Irys uploads cost additional SOL based on file size

Error: Transaction fee calculation failed
Solution:

Wait a few seconds and try again
Network congestion can cause temporary issues
Switch to devnet for testing

📁 File and Path Issues
Error: File not found
Solution:

Check file path in your script
Ensure files are in the correct assets/ subdirectories:
assets/
├── images/     # .jpg, .png files
├── audio/      # .mp3, .wav files
└── other/      # .html, .pdf files

Use relative paths from project root

Error: Unsupported file type
Solution:

Check MIME type in upload functions
Supported types: JPEG, PNG, MP3, WAV, HTML, PDF
Add custom MIME types in upload-only.js if needed

🌐 Network and Upload Issues
Error: Irys upload failed
Possible causes:

Network issues: Check internet connection
File too large: Try smaller files first
Irys service down: Check Irys status
Insufficient balance: Ensure you have enough SOL

Solutions:
bash# Retry with smaller file
# Check Irys service status
# Switch to devnet Irys: https://devnet.irys.xyz
Error: Blockhash expired
Cause: Large file uploads take too long
Solution:
javascript// Create fresh UMI instance before minting
const freshUmi = createUmi('https://api.mainnet-beta.solana.com')
  .use(irysUploader({ address: 'https://uploader.irys.xyz' }))
  .use(mplCore())
  .use(keypairIdentity(signer))
🔧 Package and Version Issues
Error: Module not found
Solution:
bashnpm install --force
# or
npm ci
Error: Version conflicts
Solution:
bashrm -rf node_modules package-lock.json
npm install --force
Error: ES Module issues
Ensure your package.json has:
json{
  "type": "module"
}
💎 NFT Display Issues
NFT not showing in wallet
Possible causes:

Wallet doesn't support Core NFTs: Try Phantom or Solflare
Network sync delay: Wait 5-10 minutes
Wrong network: Ensure wallet is on correct network (mainnet/devnet)

Solution:

Check NFT on Metaplex Core UI
Use NFT address from transaction logs
Switch wallet to correct network

Mixed media NFT not displaying properly
Known limitation:

Some wallets don't fully support mixed media Core NFTs
Use Metaplex Core UI for full functionality
Consider using traditional Metaplex standard for better compatibility

🚨 Emergency Recovery
Lost wallet access
Prevention:

Always backup solana-keypair.json
Store private key securely offline

If already lost:

NFTs are tied to the private key
No recovery possible without backup
Generate new wallet and start over

Transaction stuck/failed
Check transaction status:

Copy transaction hash from logs
Visit Solana Explorer
Search for transaction hash
Check status and error details

Getting Help
Debug Information to Collect
When reporting issues, include:

Error message (full text)
Node.js version: node --version
Network used (mainnet/devnet)
File type and size
Transaction hash (if available)

Useful Commands
bash# Check Node.js version
node --version

# Check wallet balance (install Solana CLI)
solana balance <your-wallet-address>

# View transaction details
# Use Solana Explorer with transaction hash

# Test file upload only
npm run upload-only
Resources

Solana Documentation
Metaplex Documentation
Irys Documentation
GitHub Issues

Still Need Help?

Check GitHub Issues
Create new issue with debug information
Join Solana Discord for community support
