// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract ExpenseReport is Ownable, AccessControl, Pausable {
    
    // Define roles
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant CONTRACTOR_ROLE = keccak256("CONTRACTOR_ROLE");

    // Structure for a report
    struct Report {
        string ipfsHash;
        string reportHash;         // SHA-256 hash of the report
        string metadata;           // Additional metadata
        bool approved;             // Approval status
        string rejectionReason;    // Reason for rejection, if any
        address submittedBy;       // Address of the contractor who submitted the report
        address auditedBy;         // Address of the auditor who approved/rejected the report
        uint256 projectId;         // ID of the associated project
        uint256 approvalTimestamp; // Timestamp of approval
        uint256 rejectionTimestamp; // Timestamp of rejection
    }

    // Mappings and state variables
    mapping(uint => Report) public reports;
    mapping(address => bool) public registeredContractors;
    mapping(bytes32 => address[]) private roleMembers; // Track members for each role
    uint public reportCount;

    // Events
    event ReportSubmitted(uint indexed reportId, address indexed contractor);
    event ReportApproved(uint indexed reportId, address indexed auditor);
    event ReportRejected(uint indexed reportId, string reason, address indexed rejectedBy);
    event AdminRoleTransferred(address indexed previousAdmin, address indexed newAdmin);
    event AuditorAdded(address indexed user);
    event AuditorRevoked(address indexed user);
    event ContractorRegistered(address indexed contractor);
    event ContractorDeregistered(address indexed contractor);

    // Constructor
    constructor() Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // Assign the deployer as the default admin
    }

    // Function Modifiers
    modifier onlyAuditor() {
        require(hasRole(AUDITOR_ROLE, msg.sender), "Caller is not an auditor");
        _;
    }

    // Submit report function
    function submitReport(string memory ipfsHash, uint256 projectId, string memory reportHash, string memory metadata) 
        public onlyRole(CONTRACTOR_ROLE) 
    {
        require(registeredContractors[msg.sender], "Caller is not a registered contractor");
        require(projectId > 0, "Project ID must be greater than zero");
        require(bytes(reportHash).length > 0, "Report hash cannot be empty");
        require(bytes(metadata).length > 0, "Metadata cannot be empty");

        reportCount++;
        reports[reportCount] = Report(ipfsHash, reportHash, metadata, false, "", msg.sender, address(0), projectId, 0, 0);
        emit ReportSubmitted(reportCount, msg.sender);
    }

    // Approve report function
    function approveReport(uint reportId) public onlyAuditor whenNotPaused {
        require(reportId > 0 && reportId <= reportCount, "Invalid report ID");
        require(!reports[reportId].approved, "Report is already approved");
        require(bytes(reports[reportId].rejectionReason).length == 0, "Report has been rejected");

        reports[reportId].approved = true;
        reports[reportId].auditedBy = msg.sender;
        reports[reportId].approvalTimestamp = block.timestamp;
        emit ReportApproved(reportId, msg.sender);
    }

    // Reject report function
    function rejectReport(uint reportId, string memory reason) public onlyAuditor whenNotPaused {
        require(reportId > 0 && reportId <= reportCount, "Invalid report ID");
        require(!reports[reportId].approved, "Report is already approved");
        require(bytes(reports[reportId].rejectionReason).length == 0, "Report has been rejected");

        reports[reportId].rejectionReason = reason;
        reports[reportId].auditedBy = msg.sender;
        reports[reportId].rejectionTimestamp = block.timestamp;
        emit ReportRejected(reportId, reason, msg.sender);
    }

    // Register contractor function
    function registerContractor(address user) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!registeredContractors[user], "Contractor is already registered");
        registeredContractors[user] = true;
        grantRole(CONTRACTOR_ROLE, user);
        roleMembers[CONTRACTOR_ROLE].push(user); // Track contractor in roleMembers
        emit ContractorRegistered(user);
    }

    // Deregister contractor function
    function deregisterContractor(address user) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(registeredContractors[user], "Contractor is not registered");
        registeredContractors[user] = false;
        revokeRole(CONTRACTOR_ROLE, user);

        // Remove the contractor from the roleMembers array
        for (uint256 i = 0; i < roleMembers[CONTRACTOR_ROLE].length; i++) {
            if (roleMembers[CONTRACTOR_ROLE][i] == user) {
                roleMembers[CONTRACTOR_ROLE][i] = roleMembers[CONTRACTOR_ROLE][roleMembers[CONTRACTOR_ROLE].length - 1];
                roleMembers[CONTRACTOR_ROLE].pop(); // Remove the last element
                break;
            }
        }

        emit ContractorDeregistered(user);
    }

    // Pause contract function
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
        emit Paused(msg.sender); // Use inherited event
    }

    // Unpause contract function
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
        emit Unpaused(msg.sender); // Use inherited event
    }

    // Get report details function
    function getReportDetails(uint reportId) public view returns (Report memory) {
        require(reportId > 0 && reportId <= reportCount, "Invalid report ID");
        return reports[reportId];
    }

    // Get the addresses with a specific role
    function getAddressesWithRole(bytes32 role) public view returns (address[] memory) {
        return roleMembers[role];
    }
}
