// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArtifactProvenance
 * @dev Tracks ownership history, authenticity verification, and metadata for physical artifacts.
 * Acts as an immutable registry for Antique Authenticity Certificates.
 */
contract ArtifactProvenance {
    
    struct OwnershipRecord {
        address from;
        address to;
        uint256 timestamp;
        string eventType; // "MINTED", "TRANSFERRED", "VERIFIED"
        string note;
    }

    struct Artifact {
        string metadataURI; // IPFS URI containing images, era, details
        address currentOwner;
        uint256 authenticityScore;
        bool isVerified;
        bool exists;
    }

    // AI Verification oracle address
    address public admin;

    mapping(string => Artifact) public artifacts;
    mapping(string => OwnershipRecord[]) public history;
    
    event ArtifactRegistered(string indexed artifactId, address indexed owner, string metadataURI);
    event OwnershipTransferred(string indexed artifactId, address indexed from, address indexed to);
    event ArtifactVerified(string indexed artifactId, uint256 score);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /**
     * @dev Register a new artifact on-chain
     */
    function registerArtifact(string memory artifactId, string memory metadataURI, address initialOwner) external onlyAdmin {
        require(!artifacts[artifactId].exists, "Artifact already registered");
        
        artifacts[artifactId] = Artifact({
            metadataURI: metadataURI,
            currentOwner: initialOwner,
            authenticityScore: 0,
            isVerified: false,
            exists: true
        });

        // Record minting event
        history[artifactId].push(OwnershipRecord({
            from: address(0),
            to: initialOwner,
            timestamp: block.timestamp,
            eventType: "MINTED",
            note: "Initial registration on AntiquaChain"
        }));

        emit ArtifactRegistered(artifactId, initialOwner, metadataURI);
    }

    /**
     * @dev Transfer ownership securely
     */
    function transferOwnership(string memory artifactId, address newOwner) external {
        Artifact storage artifact = artifacts[artifactId];
        require(artifact.exists, "Artifact does not exist");
        
        // Escrow contract can also trigger transfers if authorized
        require(msg.sender == artifact.currentOwner || msg.sender == admin, "Not authorized to transfer");
        require(newOwner != address(0), "Cannot transfer to zero address");

        address previousOwner = artifact.currentOwner;
        artifact.currentOwner = newOwner;

        history[artifactId].push(OwnershipRecord({
            from: previousOwner,
            to: newOwner,
            timestamp: block.timestamp,
            eventType: "TRANSFERRED",
            note: "Standard transfer"
        }));

        emit OwnershipTransferred(artifactId, previousOwner, newOwner);
    }

    /**
     * @dev Oracle/Admin marks an item as AI Authenticated
     */
    function verifyArtifact(string memory artifactId, uint256 score, string memory reportHash) external onlyAdmin {
        require(artifacts[artifactId].exists, "Artifact does not exist");
        require(score <= 100, "Score max is 100");

        artifacts[artifactId].isVerified = true;
        artifacts[artifactId].authenticityScore = score;

        history[artifactId].push(OwnershipRecord({
            from: address(0),
            to: address(0),  // Verification event, no transfer
            timestamp: block.timestamp,
            eventType: "VERIFIED",
            note: reportHash // IPFS hash to the AI report card
        }));

        emit ArtifactVerified(artifactId, score);
    }

    /**
     * @dev Read full provenance
     */
    function getProvenanceHistory(string memory artifactId) external view returns (OwnershipRecord[] memory) {
        require(artifacts[artifactId].exists, "Artifact does not exist");
        return history[artifactId];
    }
}
