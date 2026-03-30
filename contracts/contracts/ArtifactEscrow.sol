// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArtifactEscrow
 * @dev Secures funds for physical antique shipments. 
 * Buyer deposits ETH. Funds are locked. Released to Seller upon delivery confirmation.
 */
contract ArtifactEscrow {
    
    enum EscrowStatus { AWAITING_DEPOSIT, FUNDED, SHIPPED, COMPLETED, DISPUTED, REFUNDED }

    struct Escrow {
        string listingId;
        address buyer;
        address seller;
        uint256 amount;
        EscrowStatus status;
        uint256 createdAt;
    }

    mapping(uint256 => Escrow) public escrows;
    uint256 public nextEscrowId;
    address public admin;

    event EscrowCreated(uint256 indexed escrowId, string listingId, address buyer, address seller, uint256 amount);
    event FundsDeposited(uint256 indexed escrowId, address indexed buyer, uint256 amount);
    event StatusChanged(uint256 indexed escrowId, EscrowStatus newStatus);
    event FundsReleased(uint256 indexed escrowId, address indexed seller, uint256 amount);
    event FundsRefunded(uint256 indexed escrowId, address indexed buyer, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    constructor() {
        admin = msg.sender;
        nextEscrowId = 1;
    }

    /**
     * @dev Initialize a new escrow agreement
     */
    function createEscrow(string memory listingId, address buyer, address seller, uint256 amount) external onlyAdmin returns (uint256) {
        uint256 escrowId = nextEscrowId++;
        
        escrows[escrowId] = Escrow({
            listingId: listingId,
            buyer: buyer,
            seller: seller,
            amount: amount,
            status: EscrowStatus.AWAITING_DEPOSIT,
            createdAt: block.timestamp
        });

        emit EscrowCreated(escrowId, listingId, buyer, seller, amount);
        return escrowId;
    }

    /**
     * @dev Buyer deposits ETH into the contract
     */
    function depositFunds(uint256 escrowId) external payable {
        Escrow storage e = escrows[escrowId];
        require(msg.sender == e.buyer, "Only buyer can deposit");
        require(e.status == EscrowStatus.AWAITING_DEPOSIT, "Invalid status");
        require(msg.value == e.amount, "Incorrect deposit amount");

        e.status = EscrowStatus.FUNDED;
        
        emit FundsDeposited(escrowId, msg.sender, msg.value);
        emit StatusChanged(escrowId, EscrowStatus.FUNDED);
    }

    /**
     * @dev Seller marks item as shipped
     */
    function markShipped(uint256 escrowId) external {
        Escrow storage e = escrows[escrowId];
        require(msg.sender == e.seller, "Only seller can mark shipped");
        require(e.status == EscrowStatus.FUNDED, "Must be funded first");

        e.status = EscrowStatus.SHIPPED;
        emit StatusChanged(escrowId, EscrowStatus.SHIPPED);
    }

    /**
     * @dev Buyer confirms receipt. Funds released to Seller.
     */
    function confirmDeliveryAndRelease(uint256 escrowId) external {
        Escrow storage e = escrows[escrowId];
        require(msg.sender == e.buyer || msg.sender == admin, "Only buyer or admin");
        require(e.status == EscrowStatus.SHIPPED || e.status == EscrowStatus.FUNDED, "Invalid status");

        e.status = EscrowStatus.COMPLETED;
        
        // Transfer funds
        (bool success, ) = payable(e.seller).call{value: e.amount}("");
        require(success, "Transfer failed");

        emit FundsReleased(escrowId, e.seller, e.amount);
        emit StatusChanged(escrowId, EscrowStatus.COMPLETED);
    }

    /**
     * @dev Move to Disputed state
     */
    function raiseDispute(uint256 escrowId) external {
        Escrow storage e = escrows[escrowId];
        require(msg.sender == e.buyer || msg.sender == e.seller, "Only parties can dispute");
        require(e.status == EscrowStatus.FUNDED || e.status == EscrowStatus.SHIPPED, "Cannot dispute now");

        e.status = EscrowStatus.DISPUTED;
        emit StatusChanged(escrowId, EscrowStatus.DISPUTED);
    }

    /**
     * @dev Admin resolves dispute in favor of buyer
     */
    function refundBuyer(uint256 escrowId) external onlyAdmin {
        Escrow storage e = escrows[escrowId];
        require(e.status == EscrowStatus.DISPUTED || e.status == EscrowStatus.FUNDED, "Invalid status");

        e.status = EscrowStatus.REFUNDED;
        
        (bool success, ) = payable(e.buyer).call{value: e.amount}("");
        require(success, "Refund failed");

        emit FundsRefunded(escrowId, e.buyer, e.amount);
        emit StatusChanged(escrowId, EscrowStatus.REFUNDED);
    }
}
