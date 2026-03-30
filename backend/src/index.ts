import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import http from 'http'
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)

// Socket.io for Real-Time Bidding & Negotiation Chat
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
})

// Middleware
app.use(cors())
app.use(helmet())
app.use(express.json())

// Healthcheck Route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'AntiquaChain API' })
})

// API Routes Stubs
app.use('/api/listings', (req, res) => res.json({ msg: 'Listings endpoint active' }))
app.use('/api/orders', (req, res) => res.json({ msg: 'Orders endpoint active' }))
app.use('/api/auth', (req, res) => res.json({ msg: 'Auth endpoint active' }))
app.use('/api/ai/verify', (req, res) => res.json({ score: 95, msg: 'Mock AI Verification result' })) // AI Feature Mock

// In-memory store for auction bids
// Maps listingId to an array of bids
interface Bid {
  amount: number;
  bidder: string;
  timestamp: string;
}
const auctionBids: Record<string, Bid[]> = {};

// Real-Time Socket Events
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  // Join listing room for live auction updates
  socket.on('join-auction', (listingId) => {
    socket.join(`auction:${listingId}`)
    console.log(`Joined auction room: ${listingId}`)
    
    // Send current auction state to the newly joined client
    const bids = auctionBids[listingId] || [];
    const currentBid = bids.length > 0 ? bids[bids.length - 1].amount : null;
    socket.emit('auction-state', {
      currentBid,
      bidCount: bids.length,
      history: bids
    });
  })

  // Handle live bid placement
  socket.on('place-bid', (data) => {
    const listingId = data.listingId;
    const newAmount = parseFloat(data.amount);
    
    if (!auctionBids[listingId]) {
      auctionBids[listingId] = [];
    }
    
    const bids = auctionBids[listingId];
    const currentHighest = bids.length > 0 ? bids[bids.length - 1].amount : 0;
    
    // Basic validation
    if (newAmount > currentHighest) {
      const bidData: Bid = {
        amount: newAmount,
        bidder: data.bidderId,
        timestamp: new Date().toISOString()
      };
      
      bids.push(bidData);
      
      // Broadcast new bid to all clients in the auction room
      io.to(`auction:${listingId}`).emit('new-bid', {
        amount: newAmount,
        bidder: data.bidderId,
        timestamp: bidData.timestamp,
        bidCount: bids.length
      });
    } else {
      socket.emit('bid-error', { message: 'Bid must be higher than the current bid.' });
    }
  })

  // Negotiation Chat
  socket.on('join-chat', (conversationId) => {
    socket.join(`chat:${conversationId}`)
  })

  socket.on('send-message', (data) => {
    io.to(`chat:${data.conversationId}`).emit('receive-message', data)
  })

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)
  })
})

const PORT = process.env.PORT || 4000

server.listen(PORT, () => {
  console.log(`🚀 AntiquaChain Backend running on http://localhost:${PORT}`)
  console.log(`🔌 Real-Time Socket.io Server Active`)
})
