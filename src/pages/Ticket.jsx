import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Wallet, Ticket as TicketIcon, Calendar, MapPin, User, QrCode, Download, AlertCircle, Loader, Eye, DollarSign } from 'lucide-react';

const AVALANCHE_MAINNET_PARAMS = {
  chainId: '0xA86A',
  chainName: 'Avalanche Mainnet C-Chain',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18
  },
  rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://snowtrace.io/']
};

// Replace with your actual contract address and ABI
const CONTRACT_ADDRESS = "0x256ff3b9d3df415a05ba42beb5f186c28e103b2a";

const Ticket = () => {
  // UI States
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Wallet & Contract States
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Ticket States
  const [userTickets, setUserTickets] = useState([]);

  useEffect(() => {
    setIsVisible(true);
    checkWalletConnection();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  useEffect(() => {
    if (isWalletConnected) {
      fetchUserTickets();
    }
  }, [isWalletConnected, walletAddress]);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setIsWalletConnected(false);
      setWalletAddress('');
      setUserTickets([]);
    } else {
      setWalletAddress(accounts[0]);
    }
  };

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  const fetchUserTickets = async () => {
    try {
      setIsLoading(true);
      
      // Check if user has minted tickets (stored in localStorage)
      const mintedTickets = localStorage.getItem(`mintedTickets_${walletAddress}`);
      const parsedMintedTickets = mintedTickets ? JSON.parse(mintedTickets) : [];

      // Mock images for tickets
      const mockImages = [
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1571263346811-c0a0c72c8ccb?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop"
      ];

      // Base tickets (always available for demo)
      const demoTickets = [
        {
          tokenId: "1",
          eventName: "EventVax Summit 2025",
          eventDate: "March 15, 2025",
          eventTime: "2:00 PM - 10:00 PM",
          venue: "Convention Center, New York",
          address: "123 Convention Ave, New York, NY 10001",
          ticketType: "VIP Access",
          seatNumber: "VIP-A12",
          price: "0.08 AVAX",
          qrCode: "QR123456789",
          status: "Valid",
          description: "Premium access to all VIP areas, networking sessions, and exclusive content.",
          image: mockImages[0],
          mintDate: "2024-12-15T10:30:00Z",
          owner: walletAddress
        },
        {
          tokenId: "2",
          eventName: "Web3 Developer Conference",
          eventDate: "April 22, 2025",
          eventTime: "9:00 AM - 6:00 PM",
          venue: "Tech Hub, San Francisco",
          address: "456 Tech Street, San Francisco, CA 94102",
          ticketType: "General Admission",
          seatNumber: "GA-205",
          price: "0.05 AVAX",
          qrCode: "QR987654321",
          status: "Valid",
          description: "Access to all general sessions, workshops, and networking areas.",
          image: mockImages[1],
          mintDate: "2024-12-10T14:15:00Z",
          owner: walletAddress
        }
      ];

      // Add minted tickets to demo tickets
      const allTickets = [...demoTickets, ...parsedMintedTickets.map((ticket, index) => ({
        ...ticket,
        tokenId: `minted_${index + 3}`,
        image: mockImages[index % mockImages.length],
        owner: walletAddress,
        mintDate: ticket.mintDate || new Date().toISOString()
      }))];

      setUserTickets(allTickets);
      if (allTickets.length > 0 && !selectedTicket) {
        setSelectedTicket(allTickets[0]);
      }

    } catch (error) {
      console.error("Error fetching tickets:", error);
      setError("Failed to fetch your tickets. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setError("Please install MetaMask to connect your wallet!");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsWalletConnected(true);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setError("Failed to connect wallet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResellTicket = () => {
    // Store the selected ticket data for the resell page
    if (selectedTicket) {
      localStorage.setItem('resellTicketData', JSON.stringify(selectedTicket));
      window.location.href = '/resell';
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTicketTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'vip access':
        return 'from-purple-600 to-pink-600';
      case 'speaker pass':
        return 'from-blue-600 to-cyan-600';
      case 'general admission':
        return 'from-green-600 to-emerald-600';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  const generateQRCode = (ticket) => {
    const qrData = `${ticket.eventName}|${ticket.tokenId}|${ticket.seatNumber}|${walletAddress}`;
    return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='%23fff'/><text x='100' y='100' text-anchor='middle' font-size='12' fill='%23000'>QR: ${ticket.qrCode}</text></svg>`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 300}px`,
              height: `${Math.random() * 300}px`,
              background: 'radial-gradient(circle, rgba(147,51,234,0.3) 0%, rgba(0,0,0,0) 70%)',
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <main className="relative pt-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Title Section */}
          <div className={`text-center mb-16 transition-all duration-1000 
            ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
            <h1 className="text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                My Event Tickets
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              View and manage your event tickets. Each ticket is securely stored on the blockchain as an NFT.
            </p>
          </div>

          {!isWalletConnected ? (
            <div className="text-center">
              <div className="mb-8 p-8 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/30">
                <TicketIcon className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
                <p className="text-gray-400 mb-6">
                  Connect your wallet to view your ticket collection
                </p>
                <button
                  onClick={connectWallet}
                  disabled={isLoading}
                  className="group relative px-6 py-3 rounded-xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 
                    group-hover:from-purple-500 group-hover:to-blue-500 transition-colors duration-300" />
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Wallet className="w-5 h-5" />}
                    <span>{isLoading ? "Connecting..." : "Connect Wallet"}</span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Wallet Info */}
              <div className="mb-8">
                <div className="flex items-center justify-between p-6 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <div className="flex items-center space-x-4">
                    <User className="w-6 h-6 text-purple-400" />
                    <div>
                      <div className="text-sm text-gray-400">Connected Wallet</div>
                      <div className="font-mono text-lg">{formatAddress(walletAddress)}</div>
                      <div className="text-xs text-gray-500">Network: Avalanche C-Chain</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Total Tickets</div>
                    <div className="text-3xl font-bold text-purple-400">{userTickets.length}</div>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <Loader className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-400" />
                  <p className="text-gray-400">Loading your tickets...</p>
                </div>
              ) : userTickets.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Ticket List - Left Sidebar */}
                  <div className="lg:col-span-1">
                    <h3 className="text-xl font-bold mb-4 text-gray-200 flex items-center">
                      <TicketIcon className="w-5 h-5 mr-2" />
                      Your Tickets ({userTickets.length})
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {userTickets.map((ticket) => (
                        <div
                          key={ticket.tokenId}
                          onClick={() => setSelectedTicket(ticket)}
                          className={`group p-4 rounded-xl border cursor-pointer transition-all duration-300 
                            ${selectedTicket?.tokenId === ticket.tokenId
                              ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                              : 'border-gray-600 bg-gray-700/30 hover:border-purple-400/50 hover:bg-gray-600/40'
                            }`}
                        >
                          <div className="flex items-start space-x-3">
                            <img 
                              src={ticket.image} 
                              alt={ticket.eventName}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className={`px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getTicketTypeColor(ticket.ticketType)} text-white`}>
                                  {ticket.ticketType}
                                </div>
                                <span className="text-xs text-gray-400">#{ticket.tokenId}</span>
                              </div>
                              <h4 className="font-semibold text-white mb-1 truncate">{ticket.eventName}</h4>
                              <p className="text-sm text-gray-400">{ticket.eventDate}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-green-400 flex items-center">
                                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1" />
                                  {ticket.status}
                                </span>
                                <span className="text-xs text-purple-400">{ticket.seatNumber}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ticket Detail - Main Content */}
                  <div className="lg:col-span-3">
                    {selectedTicket && (
                      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 overflow-hidden">
                        {/* Ticket Header with Image */}
                        <div className="relative h-64 overflow-hidden">
                          <img
                            src={selectedTicket.image}
                            alt={selectedTicket.eventName}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute bottom-6 left-6 right-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h2 className="text-3xl font-bold text-white mb-2">{selectedTicket.eventName}</h2>
                                <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${getTicketTypeColor(selectedTicket.ticketType)} text-white`}>
                                  {selectedTicket.ticketType}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-300">Token ID</div>
                                <div className="text-xl font-mono text-purple-400">#{selectedTicket.tokenId}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-8">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Event Details */}
                            <div className="lg:col-span-2 space-y-6">
                              {/* Date & Time */}
                              <div className="flex items-start space-x-4 p-4 bg-gray-800/50 rounded-xl">
                                <Calendar className="w-6 h-6 text-purple-400 mt-1" />
                                <div>
                                  <h3 className="font-semibold text-white mb-1">Date & Time</h3>
                                  <p className="text-gray-300">{selectedTicket.eventDate}</p>
                                  <p className="text-sm text-gray-400">{selectedTicket.eventTime}</p>
                                </div>
                              </div>

                              {/* Location */}
                              <div className="flex items-start space-x-4 p-4 bg-gray-800/50 rounded-xl">
                                <MapPin className="w-6 h-6 text-purple-400 mt-1" />
                                <div>
                                  <h3 className="font-semibold text-white mb-1">Location</h3>
                                  <p className="text-gray-300">{selectedTicket.venue}</p>
                                  <p className="text-sm text-gray-400">{selectedTicket.address}</p>
                                </div>
                              </div>

                              {/* Ticket Info */}
                              <div className="flex items-start space-x-4 p-4 bg-gray-800/50 rounded-xl">
                                <TicketIcon className="w-6 h-6 text-purple-400 mt-1" />
                                <div>
                                  <h3 className="font-semibold text-white mb-1">Ticket Details</h3>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-400">Seat:</span>
                                      <span className="text-gray-300 ml-2">{selectedTicket.seatNumber}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Price:</span>
                                      <span className="text-gray-300 ml-2">{selectedTicket.price}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Status:</span>
                                      <span className="text-green-400 ml-2">{selectedTicket.status}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Minted:</span>
                                      <span className="text-gray-300 ml-2">{formatDate(selectedTicket.mintDate)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Owner Info */}
                              <div className="flex items-start space-x-4 p-4 bg-gray-800/50 rounded-xl">
                                <User className="w-6 h-6 text-purple-400 mt-1" />
                                <div className="flex-1">
                                  <h3 className="font-semibold text-white mb-1">Owner Information</h3>
                                  <div className="text-sm space-y-1">
                                    <div>
                                      <span className="text-gray-400">Wallet Address:</span>
                                      <span className="text-purple-400 ml-2 font-mono">{selectedTicket.owner}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Network:</span>
                                      <span className="text-gray-300 ml-2">Avalanche C-Chain</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <p className="text-gray-400 text-sm">{selectedTicket.description}</p>
                            </div>

                            {/* QR Code & Actions */}
                            <div className="lg:col-span-1 space-y-6">
                              {/* QR Code */}
                              <div className="bg-gray-800/50 rounded-xl p-6 text-center">
                                <h3 className="font-semibold text-white mb-4 flex items-center justify-center">
                                  <QrCode className="w-5 h-5 mr-2" />
                                  Entry QR Code
                                </h3>
                                <div className="bg-white p-4 rounded-xl mb-4 inline-block">
                                  <img
                                    src={generateQRCode(selectedTicket)}
                                    alt="QR Code"
                                    className="w-32 h-32"
                                  />
                                </div>
                                <div className="text-xs text-gray-500 font-mono">{selectedTicket.qrCode}</div>
                              </div>

                              {/* Actions */}
                              <div className="space-y-3">
                                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-3 px-6 rounded-xl transition-colors duration-300 flex items-center justify-center">
                                  <Download className="w-5 h-5 mr-2" />
                                  Download Ticket
                                </button>
                                <button 
                                  onClick={handleResellTicket}
                                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white py-3 px-6 rounded-xl transition-colors duration-300 flex items-center justify-center"
                                >
                                  <DollarSign className="w-5 h-5 mr-2" />
                                  Resell Ticket
                                </button>
                                <button className="w-full bg-green-700 hover:bg-green-600 text-white py-3 px-6 rounded-xl transition-colors duration-300 flex items-center justify-center">
                                  <Eye className="w-5 h-5 mr-2" />
                                  View on Explorer
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <TicketIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-bold mb-2 text-gray-400">No Tickets Found</h3>
                  <p className="text-gray-500 mb-6">
                    You don't have any tickets yet. Mint your first ticket!
                  </p>
                  <button
                    onClick={() => window.location.href = '/mint'}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl transition-colors duration-300"
                  >
                    Mint Ticket
                  </button>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
              <div className="flex items-center text-red-400">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Ticket;

