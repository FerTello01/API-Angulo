// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ImpactCertificateRegistry
 * @notice On-chain registry for corporate impact certifications on Gravity.
 * @dev Optimized for Gravity EVM (L1/L2). Only the authorized relayer wallet
 *      (operational backend) may emit certificates. Companies are identified
 *      by corporate tax ID (RFC) rather than wallet addresses.
 */
contract ImpactCertificateRegistry {
    // -------------------------------------------------------------------------
    // Types
    // -------------------------------------------------------------------------

    struct Certificate {
        string companyTaxId;
        string impactCategory;
        uint256 amount;
        string ipfsEvidence;
        uint256 timestamp;
    }

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    address public owner;
    address public relayer;

    /// @notice Certificates indexed by a deterministic bytes32 hash.
    mapping(bytes32 => Certificate) private _certificates;

    /// @notice Fast existence check to prevent duplicate emissions.
    mapping(bytes32 => bool) public certificateExists;

    /// @notice Secondary index: taxId → list of certificate hashes.
    mapping(string => bytes32[]) private _certificatesByTaxId;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event CertificateEmitted(
        bytes32 indexed certificateHash,
        string indexed companyTaxId,
        string impactCategory,
        uint256 amount,
        string ipfsEvidence,
        uint256 timestamp
    );

    event RelayerUpdated(address indexed previousRelayer, address indexed newRelayer);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    error Unauthorized();
    error CertificateAlreadyExists(bytes32 certificateHash);
    error CertificateNotFound(bytes32 certificateHash);
    error InvalidInput(string field);

    // -------------------------------------------------------------------------
    // Modifiers
    // -------------------------------------------------------------------------

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyRelayer() {
        if (msg.sender != relayer) revert Unauthorized();
        _;
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    /**
     * @param _relayer Operational backend wallet authorized to emit certificates.
     */
    constructor(address _relayer) {
        if (_relayer == address(0)) revert InvalidInput("relayer");
        owner = msg.sender;
        relayer = _relayer;
    }

    // -------------------------------------------------------------------------
    // Admin
    // -------------------------------------------------------------------------

    function setRelayer(address _relayer) external onlyOwner {
        if (_relayer == address(0)) revert InvalidInput("relayer");
        address previous = relayer;
        relayer = _relayer;
        emit RelayerUpdated(previous, _relayer);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidInput("newOwner");
        address previous = owner;
        owner = newOwner;
        emit OwnershipTransferred(previous, newOwner);
    }

    // -------------------------------------------------------------------------
    // Core
    // -------------------------------------------------------------------------

    /**
     * @notice Emit a new impact certificate. Callable only by the relayer.
     * @param certificateHash Deterministic hash (keccak256) computed off-chain.
     * @param companyTaxId    Corporate tax identifier (e.g. RFC).
     * @param impactCategory  Category of measurable impact.
     * @param amount          Quantified impact amount (base units, off-chain defined).
     * @param ipfsEvidence    IPFS CID / URI pointing to supporting evidence.
     */
    function emitCertificate(
        bytes32 certificateHash,
        string calldata companyTaxId,
        string calldata impactCategory,
        uint256 amount,
        string calldata ipfsEvidence
    ) external onlyRelayer {
        if (certificateExists[certificateHash]) {
            revert CertificateAlreadyExists(certificateHash);
        }
        if (bytes(companyTaxId).length == 0) revert InvalidInput("companyTaxId");
        if (bytes(impactCategory).length == 0) revert InvalidInput("impactCategory");
        if (bytes(ipfsEvidence).length == 0) revert InvalidInput("ipfsEvidence");

        uint256 issuedAt = block.timestamp;

        _certificates[certificateHash] = Certificate({
            companyTaxId: companyTaxId,
            impactCategory: impactCategory,
            amount: amount,
            ipfsEvidence: ipfsEvidence,
            timestamp: issuedAt
        });

        certificateExists[certificateHash] = true;
        _certificatesByTaxId[companyTaxId].push(certificateHash);

        emit CertificateEmitted(
            certificateHash,
            companyTaxId,
            impactCategory,
            amount,
            ipfsEvidence,
            issuedAt
        );
    }

    // -------------------------------------------------------------------------
    // Views
    // -------------------------------------------------------------------------

    function getCertificate(bytes32 certificateHash)
        external
        view
        returns (Certificate memory)
    {
        if (!certificateExists[certificateHash]) {
            revert CertificateNotFound(certificateHash);
        }
        return _certificates[certificateHash];
    }

    function getCertificatesByTaxId(string calldata companyTaxId)
        external
        view
        returns (bytes32[] memory)
    {
        return _certificatesByTaxId[companyTaxId];
    }

    function totalCertificatesForTaxId(string calldata companyTaxId)
        external
        view
        returns (uint256)
    {
        return _certificatesByTaxId[companyTaxId].length;
    }
}
